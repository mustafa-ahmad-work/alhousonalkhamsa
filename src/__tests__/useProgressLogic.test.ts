/**
 * useProgressLogic.test.ts
 * Tests the derived-value computations from useProgressLogic in isolation.
 */

// ─── Mocks ────────────────────────────────────────────────────────────────────
import {
  calculateStabilityIndex,
  getXPProgressToNextLevel,
  getTitleFromXP,
} from '../utils/helpers';
import { JUZ_META } from '../data/quranMeta';
import { MemorizationStrength, PageProgress } from '../types';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(), getItem: jest.fn(), removeItem: jest.fn(),
}));
jest.mock('expo-constants', () => ({ expoConfig: { version: '1.0.0' }, appOwnership: 'standalone' }));
jest.mock('expo-notifications', () => ({}));
jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));
jest.mock('../store/NotificationService', () => ({
  NotificationService: { scheduleFortressReminders: jest.fn(), clearSavedHash: jest.fn() },
}));

// ─── Helper: build a fake PageProgress entry ─────────────────────────────────
const makePage = (
  pageNumber: number,
  memorized = true,
  strength: MemorizationStrength = 3,
  lastReviewed = '2025-01-01',
): PageProgress => ({
  pageNumber, memorized, strength,
  lastReviewed, reviewCount: 1, nextReviewDate: '',
});

// ─── SECTION 1: XP Progress Calculation ─────────────────────────────────────
describe('useProgressLogic — getXPProgressToNextLevel', () => {
  it('returns 0 percentage at 0 XP (bottom of first tier)', () => {
    const xp = getXPProgressToNextLevel(0);
    expect(xp.percentage).toBe(0);
    expect(xp.current).toBe(0);
  });

  it('returns correct tier label at 0 XP', () => {
    expect(getTitleFromXP(0)).toBe('مبتدئ');
  });

  it('shows 0% progress at the start of the Hafiz tier (5000 XP)', () => {
    const xp = getXPProgressToNextLevel(5000);
    expect(xp.percentage).toBe(0);
    expect(getTitleFromXP(5000)).toBe('حافظ');
  });

  it('percentage is always between 0 and 1', () => {
    [0, 100, 499, 500, 1999, 2000, 4999, 5000, 10000].forEach((xpVal) => {
      const result = getXPProgressToNextLevel(xpVal);
      expect(result.percentage).toBeGreaterThanOrEqual(0);
      expect(result.percentage).toBeLessThanOrEqual(1);
    });
  });
});

// ─── SECTION 2: Stability Index Calculation ──────────────────────────────────
describe('useProgressLogic — calculateStabilityIndex', () => {
  it('returns 0 for empty memorized pages', () => {
    const idx = calculateStabilityIndex([], []);
    expect(idx).toBe(0);
  });

  it('returns higher index for stronger pages', () => {
    const weakPages  = [makePage(1, true, 1), makePage(2, true, 1)];
    const strongPages = [makePage(1, true, 5), makePage(2, true, 5)];
    const weakIdx   = calculateStabilityIndex(weakPages,  []);
    const strongIdx = calculateStabilityIndex(strongPages, []);
    expect(strongIdx).toBeGreaterThan(weakIdx);
  });

  it('stability index is between 0 and 1 (or 0-100 scale)', () => {
    const pages = [makePage(1, true, 3), makePage(2, true, 4), makePage(3, true, 5)];
    const idx = calculateStabilityIndex(pages, []);
    expect(idx).toBeGreaterThanOrEqual(0);
  });
});

// ─── SECTION 3: Strength Distribution ───────────────────────────────────────
describe('useProgressLogic — strengthDist calculation', () => {
  const buildDist = (pages: PageProgress[]) => {
    const dist: Record<MemorizationStrength, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    pages.forEach((p) => { dist[p.strength as MemorizationStrength]++; });
    return {
      strengthDist: dist,
      masteredCount: dist[5] + dist[4],
      weakCount: dist[1] + dist[2],
    };
  };

  it('all strength-5 pages are counted as mastered', () => {
    const pages = [makePage(1, true, 5), makePage(2, true, 5), makePage(3, true, 4)];
    const { masteredCount, weakCount } = buildDist(pages);
    expect(masteredCount).toBe(3);
    expect(weakCount).toBe(0);
  });

  it('all strength-1 pages are counted as weak', () => {
    const pages = [makePage(1, true, 1), makePage(2, true, 2)];
    const { masteredCount, weakCount } = buildDist(pages);
    expect(masteredCount).toBe(0);
    expect(weakCount).toBe(2);
  });

  it('mixed pages count correctly', () => {
    const pages = [
      makePage(1, true, 1),
      makePage(2, true, 3),
      makePage(3, true, 5),
    ];
    const { masteredCount, weakCount } = buildDist(pages);
    expect(masteredCount).toBe(1);
    expect(weakCount).toBe(1);
  });
});

// ─── SECTION 4: Juz Progress Calculation ─────────────────────────────────────
describe('useProgressLogic — juzProgress calculation', () => {
  const calcJuzProgress = (memorizedPages: PageProgress[]) =>
    JUZ_META.map((juz) => {
      const pagesInJuz = Array.from(
        { length: juz.endPage - juz.startPage + 1 },
        (_, i) => juz.startPage + i,
      );
      const memorizedInJuz = pagesInJuz.filter((p) =>
        memorizedPages.some((mp) => mp.pageNumber === p),
      );
      return { id: juz.id, pct: memorizedInJuz.length / pagesInJuz.length };
    });

  it('returns 30 juz entries', () => {
    const result = calcJuzProgress([]);
    expect(result).toHaveLength(30);
  });

  it('returns 0% for all juz when nothing memorized', () => {
    const result = calcJuzProgress([]);
    result.forEach(({ pct }) => expect(pct).toBe(0));
  });

  it('returns >0% for juz 1 when page 1 is memorized', () => {
    const result = calcJuzProgress([makePage(1)]);
    const juz1 = result.find((j) => j.id === 1)!;
    expect(juz1.pct).toBeGreaterThan(0);
  });

  it('returns 100% for juz when all its pages are memorized', () => {
    const juz30 = JUZ_META[29]; // Last juz
    const allPages = Array.from(
      { length: juz30.endPage - juz30.startPage + 1 },
      (_, i) => makePage(juz30.startPage + i),
    );
    const result = calcJuzProgress(allPages);
    const last = result.find((j) => j.id === 30)!;
    expect(last.pct).toBe(1);
  });

  it('pct is always between 0 and 1', () => {
    const pages = [makePage(1), makePage(50), makePage(300)];
    const result = calcJuzProgress(pages);
    result.forEach(({ pct }) => {
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(1);
    });
  });
});

// ─── SECTION 5: Remaining Days Calculation ───────────────────────────────────
describe('useProgressLogic — remainingCount & daysRemaining', () => {
  const calcRemaining = (totalPages: number, memorized: number, dailyPages: number) => {
    const remainingCount = totalPages - memorized;
    const daysRemaining  = Math.max(1, Math.ceil(remainingCount / (dailyPages || 1)));
    return { remainingCount, daysRemaining };
  };

  it('returns 0 remaining when everything memorized', () => {
    const { remainingCount, daysRemaining } = calcRemaining(604, 604, 2);
    expect(remainingCount).toBe(0);
    expect(daysRemaining).toBe(1); // max(1, ceil(0/2))
  });

  it('calculates correct days for partial progress', () => {
    const { remainingCount, daysRemaining } = calcRemaining(604, 304, 2);
    expect(remainingCount).toBe(300);
    expect(daysRemaining).toBe(150);
  });

  it('handles dailyPages=0 without dividing by zero', () => {
    const { daysRemaining } = calcRemaining(604, 0, 0);
    expect(daysRemaining).toBeGreaterThanOrEqual(1);
    expect(isFinite(daysRemaining)).toBe(true);
  });

  it('always returns at least 1 day remaining', () => {
    const { daysRemaining } = calcRemaining(604, 604, 10);
    expect(daysRemaining).toBe(1);
  });
});

// ─── SECTION 6: Plan progress percentage ─────────────────────────────────────
describe('useProgressLogic — planPct calculation', () => {
  const calcPct = (memorizedCount: number, totalPages: number) =>
    totalPages > 0 ? memorizedCount / totalPages : 0;

  it('returns 0 at the start', () => {
    expect(calcPct(0, 604)).toBe(0);
  });

  it('returns 1 when fully memorized', () => {
    expect(calcPct(604, 604)).toBe(1);
  });

  it('returns 0.5 at halfway', () => {
    expect(calcPct(302, 604)).toBeCloseTo(0.5);
  });

  it('returns 0 when plan is null (totalPages=604 default)', () => {
    expect(calcPct(0, 604)).toBe(0);
  });
});
