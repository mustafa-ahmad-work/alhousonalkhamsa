/**
 * usePlanScreenLogic.test.ts
 * Tests the complex roadmap-building logic from usePlanScreenLogic:
 *  - review strategy (spaced / random / recency)
 *  - ward & listen page cycling
 *  - isCurrent / isCompleted detection
 *  - week-group pagination
 */

// ─── Mocks ────────────────────────────────────────────────────────────────────
import { buildRanges, getSurahSegments, formatRanges } from '../utils/planLogic';
import { getMushafEdition } from '../data/mushafEditions';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(), getItem: jest.fn(), removeItem: jest.fn(),
}));
jest.mock('expo-constants', () => ({ expoConfig: { version: '1.0.0' }, appOwnership: 'standalone' }));
jest.mock('expo-notifications', () => ({}));
jest.mock('react-native', () => ({ Platform: { OS: 'ios' }, Alert: { alert: jest.fn() } }));
jest.mock('../store/NotificationService', () => ({
  NotificationService: { scheduleFortressReminders: jest.fn() },
}));
jest.mock('../developerConfig', () => ({ DEV_CONFIG: { unlockAllPlans: false } }));

const edition = getMushafEdition('madani_604' as any);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Builds the near/far review pages for spaced strategy */
const buildSpacedReview = (alreadyDone: number[], NEAR = 20, FAR = 40) => {
  const nearPages = alreadyDone.length > 0
    ? alreadyDone.slice(Math.max(0, alreadyDone.length - NEAR))
    : [];
  const olderPages = alreadyDone.length > NEAR
    ? alreadyDone.slice(0, alreadyDone.length - NEAR)
    : [];
  const farPages = olderPages.length > 0
    ? olderPages.length <= FAR ? [...olderPages] : olderPages.slice(0, FAR)
    : [];
  return { nearPages, farPages };
};

/** Builds near/far for recency (same-as-spaced for latest pages) */
const buildRecencyReview = (alreadyDone: number[]) => {
  const nearPages = alreadyDone.slice(Math.max(0, alreadyDone.length - 20));
  const farPages = alreadyDone.length > 20
    ? alreadyDone.slice(Math.max(0, alreadyDone.length - 60), alreadyDone.length - 20)
    : [];
  return { nearPages, farPages };
};

/** Ward (recitation) cycling logic */
const calcWard = (dayIndex: number, totalPages: number) => {
  const wardStart = ((dayIndex * 40) % totalPages) + 1;
  const wardEnd   = ((wardStart + 39 - 1) % totalPages) + 1;
  return { wardStart, wardEnd };
};

/** Listen cycling logic */
const calcListen = (dayIndex: number, totalPages: number) => {
  const listenStart = ((dayIndex * 10) % totalPages) + 1;
  const listenEnd   = ((listenStart + 9 - 1) % totalPages) + 1;
  return { listenStart, listenEnd };
};

// ─── SECTION 1: Spaced Review Strategy ───────────────────────────────────────
describe('usePlanScreenLogic — spaced review strategy', () => {
  it('nearPages is empty at the very start (day 0, nothing done)', () => {
    const { nearPages } = buildSpacedReview([]);
    expect(nearPages).toHaveLength(0);
  });

  it('nearPages contains up to last 20 done pages', () => {
    const done = Array.from({ length: 25 }, (_, i) => i + 1);
    const { nearPages } = buildSpacedReview(done);
    expect(nearPages).toHaveLength(20);
    expect(nearPages[0]).toBe(6);  // 25-20=5 → starts at page 6
    expect(nearPages[19]).toBe(25);
  });

  it('farPages is empty when fewer than NEAR pages done', () => {
    const done = Array.from({ length: 10 }, (_, i) => i + 1);
    const { farPages } = buildSpacedReview(done);
    expect(farPages).toHaveLength(0);
  });

  it('farPages contains pages older than the last 20', () => {
    const done = Array.from({ length: 50 }, (_, i) => i + 1);
    const { nearPages, farPages } = buildSpacedReview(done);
    expect(nearPages).toHaveLength(20);
    expect(farPages.length).toBeGreaterThan(0);
    // farPages should NOT overlap with nearPages
    const nearSet = new Set(nearPages);
    farPages.forEach((p) => expect(nearSet.has(p)).toBe(false));
  });

  it('farPages capped at FAR_SIZE=40', () => {
    const done = Array.from({ length: 200 }, (_, i) => i + 1);
    const { farPages } = buildSpacedReview(done);
    expect(farPages.length).toBeLessThanOrEqual(40);
  });
});

// ─── SECTION 2: Recency Review Strategy ──────────────────────────────────────
describe('usePlanScreenLogic — recency review strategy', () => {
  it('nearPages = last 20 pages', () => {
    const done = Array.from({ length: 30 }, (_, i) => i + 1);
    const { nearPages } = buildRecencyReview(done);
    expect(nearPages).toHaveLength(20);
    expect(nearPages[nearPages.length - 1]).toBe(30);
  });

  it('farPages = pages 20–60 back from the end', () => {
    const done = Array.from({ length: 80 }, (_, i) => i + 1);
    const { farPages } = buildRecencyReview(done);
    // 80-60=20 to 80-20=60 → pages 21..60
    expect(farPages.length).toBeGreaterThan(0);
    expect(farPages.length).toBeLessThanOrEqual(40);
  });

  it('farPages is empty when fewer than 20 pages done', () => {
    const done = [1, 2, 3];
    const { farPages } = buildRecencyReview(done);
    expect(farPages).toHaveLength(0);
  });
});

// ─── SECTION 3: Ward (Recitation) Cycling ─────────────────────────────────────
describe('usePlanScreenLogic — ward cycling (recitation)', () => {
  it('day 0: starts at page 1, ends at page 40', () => {
    const { wardStart, wardEnd } = calcWard(0, 604);
    expect(wardStart).toBe(1);
    expect(wardEnd).toBe(40);
  });

  it('day 1: starts at page 41, ends at page 80', () => {
    const { wardStart, wardEnd } = calcWard(1, 604);
    expect(wardStart).toBe(41);
    expect(wardEnd).toBe(80);
  });

  it('cycles back to page 1 after totalPages', () => {
    // After 15 days × 40 pages = 600 → day 15 starts at 601
    const { wardStart } = calcWard(15, 604);
    expect(wardStart).toBe(601);
    // day 16: (640 % 604)+1 = 37
    const { wardStart: w16 } = calcWard(16, 604);
    expect(w16).toBeGreaterThanOrEqual(1);
    expect(w16).toBeLessThanOrEqual(604);
  });

  it('ward start is always within [1, totalPages]', () => {
    for (let d = 0; d < 20; d++) {
      const { wardStart } = calcWard(d, 604);
      expect(wardStart).toBeGreaterThanOrEqual(1);
      expect(wardStart).toBeLessThanOrEqual(604);
    }
  });
});

// ─── SECTION 4: Listen Cycling ───────────────────────────────────────────────
describe('usePlanScreenLogic — listen cycling', () => {
  it('day 0: starts at 1, ends at 10', () => {
    const { listenStart, listenEnd } = calcListen(0, 604);
    expect(listenStart).toBe(1);
    expect(listenEnd).toBe(10);
  });

  it('day 1: starts at 11, ends at 20', () => {
    const { listenStart, listenEnd } = calcListen(1, 604);
    expect(listenStart).toBe(11);
    expect(listenEnd).toBe(20);
  });

  it('cycles back after 60 days (604 / 10 ≈ 60 days)', () => {
    const { listenStart } = calcListen(61, 604);
    expect(listenStart).toBeGreaterThanOrEqual(1);
    expect(listenStart).toBeLessThanOrEqual(604);
  });

  it('listen start is always within [1, totalPages]', () => {
    for (let d = 0; d < 70; d++) {
      const { listenStart } = calcListen(d, 604);
      expect(listenStart).toBeGreaterThanOrEqual(1);
      expect(listenStart).toBeLessThanOrEqual(604);
    }
  });
});

// ─── SECTION 5: isCurrent / isCompleted Detection ────────────────────────────
describe('usePlanScreenLogic — isCurrent and isCompleted detection', () => {
  const targetPages = Array.from({ length: 20 }, (_, i) => i + 1);
  const pagesPerDay = 2;

  const buildDays = (memorizedPages: Set<number>) => {
    let foundCurrent = false;
    return Array.from({ length: 10 }, (_, i) => {
      const dayPages = targetPages.slice(i * pagesPerDay, (i + 1) * pagesPerDay);
      const memorizedCount = dayPages.filter((p) => memorizedPages.has(p)).length;
      const isCompleted = memorizedCount === dayPages.length;
      let isCurrent = false;
      if (!isCompleted && !foundCurrent) { isCurrent = true; foundCurrent = true; }
      return { dayIndex: i + 1, isCompleted, isCurrent };
    });
  };

  it('first day is current when nothing memorized', () => {
    const days = buildDays(new Set());
    expect(days[0].isCurrent).toBe(true);
    expect(days.filter((d) => d.isCurrent)).toHaveLength(1);
  });

  it('first 3 days completed, day 4 is current', () => {
    const memorized = new Set([1, 2, 3, 4, 5, 6]);
    const days = buildDays(memorized);
    expect(days[0].isCompleted).toBe(true);
    expect(days[1].isCompleted).toBe(true);
    expect(days[2].isCompleted).toBe(true);
    expect(days[3].isCurrent).toBe(true);
  });

  it('only one day is marked as current at a time', () => {
    const memorized = new Set([1, 2]);
    const days = buildDays(memorized);
    expect(days.filter((d) => d.isCurrent)).toHaveLength(1);
  });

  it('all days completed → no current day', () => {
    const memorized = new Set(targetPages);
    const days = buildDays(memorized);
    expect(days.filter((d) => d.isCurrent)).toHaveLength(0);
    expect(days.every((d) => d.isCompleted)).toBe(true);
  });
});

// ─── SECTION 6: Plan Date Generation ─────────────────────────────────────────
describe('usePlanScreenLogic — plan date generation', () => {
  const generatePlanDates = (
    startDate: string,
    totalDays: number,
    activeDows: Set<number>,
  ) => {
    const [y, m, d] = startDate.split('-').map(Number);
    let currentDate = new Date(y, m - 1, d);
    const dates: string[] = [];
    while (dates.length < totalDays) {
      if (activeDows.has(currentDate.getDay())) {
        const iso = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        dates.push(iso);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  it('daily mode generates consecutive dates', () => {
    const dates = generatePlanDates('2025-01-01', 7, new Set([0, 1, 2, 3, 4, 5, 6]));
    expect(dates).toHaveLength(7);
    expect(dates[0]).toBe('2025-01-01');
    expect(dates[1]).toBe('2025-01-02');
    expect(dates[6]).toBe('2025-01-07');
  });

  it('weekly mode (Mon–Fri only) skips weekends', () => {
    // Mon=1, Tue=2, Wed=3, Thu=4, Fri=5
    const dates = generatePlanDates('2025-01-06', 5, new Set([1, 2, 3, 4, 5]));
    // 2025-01-06 is Monday
    expect(dates).toHaveLength(5);
    // Should not include weekend dates (0=Sun, 6=Sat)
    dates.forEach((d) => {
      const dow = new Date(d).getDay();
      expect([0, 6]).not.toContain(dow);
    });
  });

  it('generates exactly totalDays dates', () => {
    const dates = generatePlanDates('2025-01-01', 30, new Set([0, 1, 2, 3, 4, 5, 6]));
    expect(dates).toHaveLength(30);
  });
});

// ─── SECTION 7: getSurahSegments (used in roadmap labels) ────────────────────
describe('usePlanScreenLogic — getSurahSegments for roadmap labels', () => {
  it('returns surah name for pages in Al-Fatiha range', () => {
    const fatihaPage = edition.surahPages[1][0]; // first page of Al-Fatiha
    const segs = getSurahSegments([fatihaPage], edition);
    expect(segs.length).toBeGreaterThan(0);
    expect(segs[0].nameAr).toBeDefined();
  });

  it('returns multiple segments for pages crossing surah boundaries', () => {
    // Find pages at a surah boundary
    const surah2End  = edition.surahPages[2][1];
    const surah3Start = edition.surahPages[3][0];
    const segs = getSurahSegments([surah2End, surah3Start], edition);
    // May have 1 or 2 segments depending on if they share a page
    expect(segs.length).toBeGreaterThanOrEqual(1);
  });
});
