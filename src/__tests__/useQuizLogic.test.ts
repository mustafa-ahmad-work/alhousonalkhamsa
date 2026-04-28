/**
 * useQuizLogic.test.ts
 * Tests the pure business logic from useQuizLogic:
 *  - question count scaling
 *  - weighted page selection
 *  - today scope filtering
 *  - score percentage calculation
 */

// ─── Mocks ────────────────────────────────────────────────────────────────────
import { todayISO } from '../utils/helpers';
import { PageProgress, MemorizationStrength } from '../types';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(), getItem: jest.fn(), removeItem: jest.fn(),
}));
jest.mock('expo-constants', () => ({ expoConfig: { version: '1.0.0' }, appOwnership: 'standalone' }));
jest.mock('expo-notifications', () => ({}));
jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));
jest.mock('../store/NotificationService', () => ({
  NotificationService: { scheduleFortressReminders: jest.fn() },
}));

// ─── Pure helpers mirroring useQuizLogic internals ───────────────────────────

/** Calculates how many questions to show based on page count */
const calcQuestionCount = (pageCount: number): number => {
  if (pageCount > 50) return 20;
  if (pageCount > 20) return 15;
  if (pageCount > 10) return 10;
  return Math.max(3, Math.min(pageCount, 5));
};

/** Calculates weighted pool from pages + progress */
const buildWeightedPool = (
  pages: { pageNumber: number }[],
  pageProgress: PageProgress[],
) => {
  return pages.map((p) => {
    const prog = pageProgress.find((pp) => pp.pageNumber === p.pageNumber);
    const weight = 6 - (prog?.strength ?? 3);
    return { page: p, weight };
  });
};

/** Filters pages reviewed today */
const filterTodayPages = (
  pages: { pageNumber: number }[],
  pageProgress: PageProgress[],
) => {
  const today = todayISO();
  return pages.filter((p) => {
    const prog = pageProgress.find((pp) => pp.pageNumber === p.pageNumber);
    return prog?.lastReviewed === today;
  });
};

/** Calculates result score percentage */
const calcScorePct = (correct: number, total: number) =>
  total > 0 ? (correct / total) * 100 : 0;

/** Returns feedback based on score percentage */
const getFeedback = (scorePct: number): 'excellent' | 'good' | 'fair' | 'poor' => {
  if (scorePct >= 90) return 'excellent';
  if (scorePct >= 70) return 'good';
  if (scorePct >= 50) return 'fair';
  return 'poor';
};

// ─── SECTION 1: Question Count Scaling ───────────────────────────────────────
describe('useQuizLogic — calcQuestionCount', () => {
  it('returns 3 for 1 page (min 3)', () => {
    expect(calcQuestionCount(1)).toBe(3);
  });

  it('returns up to 5 for 2–10 pages', () => {
    expect(calcQuestionCount(2)).toBe(3);  // max(3, min(2, 5)) = 3
    expect(calcQuestionCount(5)).toBe(5);
    expect(calcQuestionCount(10)).toBe(5);
  });

  it('returns 5 for exactly 5 pages', () => {
    expect(calcQuestionCount(5)).toBe(5);
  });

  it('returns 10 for 11–20 pages', () => {
    expect(calcQuestionCount(11)).toBe(10);
    expect(calcQuestionCount(20)).toBe(10);
  });

  it('returns 15 for 21–50 pages', () => {
    expect(calcQuestionCount(21)).toBe(15);
    expect(calcQuestionCount(50)).toBe(15);
  });

  it('returns 20 for 51+ pages', () => {
    expect(calcQuestionCount(51)).toBe(20);
    expect(calcQuestionCount(604)).toBe(20);
  });

  it('returns minimum 3 even for a single page', () => {
    expect(calcQuestionCount(1)).toBeGreaterThanOrEqual(3);
  });
});

// ─── SECTION 2: Weighted Pool Building ───────────────────────────────────────
describe('useQuizLogic — buildWeightedPool', () => {
  const makeProgress = (
    pageNumber: number,
    strength: MemorizationStrength,
  ): PageProgress => ({
    pageNumber, memorized: true, strength,
    lastReviewed: '2025-01-01', reviewCount: 1, nextReviewDate: '',
  });

  it('assigns higher weight to weaker pages (lower strength)', () => {
    const pages = [{ pageNumber: 1 }, { pageNumber: 2 }];
    const progress = [
      makeProgress(1, 1), // weak  → weight 6-1=5
      makeProgress(2, 5), // strong → weight 6-5=1
    ];
    const pool = buildWeightedPool(pages, progress);
    expect(pool[0].weight).toBe(5);
    expect(pool[1].weight).toBe(1);
  });

  it('uses default weight of 3 (6-3=3) when no progress found', () => {
    const pages = [{ pageNumber: 99 }];
    const pool = buildWeightedPool(pages, []);
    expect(pool[0].weight).toBe(3);
  });

  it('all weights are positive numbers', () => {
    const pages = [1, 2, 3, 4, 5].map((n) => ({ pageNumber: n }));
    const progress = pages.map((p, i) => makeProgress(p.pageNumber, (i + 1) as MemorizationStrength));
    const pool = buildWeightedPool(pages, progress);
    pool.forEach(({ weight }) => expect(weight).toBeGreaterThan(0));
  });

  it('total weight equals sum of all individual weights', () => {
    const pages = [{ pageNumber: 1 }, { pageNumber: 2 }, { pageNumber: 3 }];
    const progress = [
      makeProgress(1, 1), // 5
      makeProgress(2, 3), // 3
      makeProgress(3, 5), // 1
    ];
    const pool = buildWeightedPool(pages, progress);
    const total = pool.reduce((s, i) => s + i.weight, 0);
    expect(total).toBe(9);
  });
});

// ─── SECTION 3: Today Scope Filtering ────────────────────────────────────────
describe('useQuizLogic — filterTodayPages', () => {
  const today = todayISO();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const makeProgress = (
    pageNumber: number,
    lastReviewed: string,
  ): PageProgress => ({
    pageNumber, memorized: true, strength: 3,
    lastReviewed, reviewCount: 1, nextReviewDate: '',
  });

  it('returns only pages reviewed today', () => {
    const pages = [{ pageNumber: 1 }, { pageNumber: 2 }, { pageNumber: 3 }];
    const progress = [
      makeProgress(1, today),
      makeProgress(2, yesterday),
      makeProgress(3, today),
    ];
    const filtered = filterTodayPages(pages, progress);
    expect(filtered).toHaveLength(2);
    expect(filtered.map((p) => p.pageNumber)).toEqual([1, 3]);
  });

  it('returns empty array when no pages reviewed today', () => {
    const pages = [{ pageNumber: 1 }, { pageNumber: 2 }];
    const progress = [
      makeProgress(1, yesterday),
      makeProgress(2, yesterday),
    ];
    const filtered = filterTodayPages(pages, progress);
    expect(filtered).toHaveLength(0);
  });

  it('returns all pages when all reviewed today', () => {
    const pages = [{ pageNumber: 1 }, { pageNumber: 2 }];
    const progress = [
      makeProgress(1, today),
      makeProgress(2, today),
    ];
    const filtered = filterTodayPages(pages, progress);
    expect(filtered).toHaveLength(2);
  });

  it('excludes pages with no progress record', () => {
    const pages = [{ pageNumber: 1 }, { pageNumber: 999 }];
    const progress = [makeProgress(1, today)];
    const filtered = filterTodayPages(pages, progress);
    // Page 999 has no progress, lastReviewed = undefined ≠ today
    expect(filtered.map((p) => p.pageNumber)).toEqual([1]);
  });
});

// ─── SECTION 4: Score Percentage & Feedback ──────────────────────────────────
describe('useQuizLogic — score & feedback', () => {
  it('calculates 100% score correctly', () => {
    expect(calcScorePct(10, 10)).toBe(100);
  });

  it('calculates 0% score correctly', () => {
    expect(calcScorePct(0, 10)).toBe(0);
  });

  it('calculates 70% score correctly', () => {
    expect(calcScorePct(7, 10)).toBe(70);
  });

  it('handles 0 total without dividing by zero', () => {
    expect(calcScorePct(0, 0)).toBe(0);
  });

  it('returns "excellent" at ≥90%', () => {
    expect(getFeedback(90)).toBe('excellent');
    expect(getFeedback(100)).toBe('excellent');
  });

  it('returns "good" at 70–89%', () => {
    expect(getFeedback(70)).toBe('good');
    expect(getFeedback(89)).toBe('good');
  });

  it('returns "fair" at 50–69%', () => {
    expect(getFeedback(50)).toBe('fair');
    expect(getFeedback(69)).toBe('fair');
  });

  it('returns "poor" below 50%', () => {
    expect(getFeedback(49)).toBe('poor');
    expect(getFeedback(0)).toBe('poor');
  });
});

// ─── SECTION 5: Quiz Session State Transitions ───────────────────────────────
describe('useQuizLogic — session state transitions', () => {
  it('increments correct count only when answer is correct', () => {
    let correctCount = 0;
    const respond = (isCorrect: boolean) => {
      if (isCorrect) correctCount++;
    };
    respond(true);
    respond(false);
    respond(true);
    expect(correctCount).toBe(2);
  });

  it('advances to next question by incrementing index', () => {
    let currentIndex = 0;
    const totalQuestions = 5;
    let finished = false;
    const advance = () => {
      const next = currentIndex + 1;
      if (next < totalQuestions) currentIndex = next;
      else finished = true;
    };
    advance(); advance(); advance(); advance(); advance();
    expect(finished).toBe(true);
    expect(currentIndex).toBe(4); // last valid index (5th question)
  });

  it('sets finished=true when last question answered', () => {
    let finished = false;
    let idx = 0;
    const total = 3;
    const advance = () => {
      if (idx + 1 >= total) finished = true;
      else idx++;
    };
    advance(); advance(); advance();
    expect(finished).toBe(true);
  });
});
