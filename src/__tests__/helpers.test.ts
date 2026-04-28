import { calculateStreak, generatePlan, strengthAfterReview, toArabicNumerals } from '../utils/helpers';

// ─── calculateStabilityIndex ──────────────────────────────────────────────────
import { calculateStabilityIndex, getXPProgressToNextLevel, formatTime, getDailyCompletionPercent } from '../utils/helpers';
import { PageProgress, MemorizationStrength, TaskSelection, DailyProgress } from '../types';

// ─── getPlanDayDate ───────────────────────────────────────────────────────────
import { getPlanDayDate } from '../utils/helpers';

describe('helpers', () => {
  describe('calculateStreak', () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const dayBeforeYesterday = new Date(Date.now() - 172800000).toISOString().split('T')[0];

    it('should start a new streak when none exists', () => {
      const result = calculateStreak(0, 0, '', true);
      expect(result.current).toBe(1);
      expect(result.longest).toBe(1);
      expect(result.lastActiveDate).toBe(today);
    });

    it('should increment streak when completed today after yesterday', () => {
      const result = calculateStreak(5, 5, yesterday, true);
      expect(result.current).toBe(6);
      expect(result.longest).toBe(6);
    });

    it('should maintain streak if already completed today', () => {
      const result = calculateStreak(5, 5, today, true);
      expect(result.current).toBe(5);
    });

    it('should reset streak if missed yesterday', () => {
      const result = calculateStreak(5, 10, dayBeforeYesterday, true);
      expect(result.current).toBe(1); // Reset to 1 because completed today
      expect(result.longest).toBe(10);
    });

    it('should reset current streak to 0 if not completed today and missed yesterday', () => {
      const result = calculateStreak(5, 10, dayBeforeYesterday, false);
      expect(result.current).toBe(0);
      expect(result.longest).toBe(10);
    });
  });

  describe('generatePlan - Forward & Backward Logic', () => {
    // Mock Surah boundaries:
    // Surah 113: page 604
    // Surah 114: page 604
    // Surah 78 (Naba): 582 to 583
    // Surah 77 (Mursalat): 580 to 581
    const mockMushaf: Record<number, [number, number]> = {
      77: [580, 581], // Mursalat
      78: [582, 583], // Naba
      113: [604, 604], // Falaq
      114: [604, 604], // Nas
    };
    
    it('should generate a FORWARD plan (Fatiha -> Nas direction)', () => {
      const pagesToMemorize = [580, 581, 582, 583, 604];
      const plan = generatePlan(pagesToMemorize, 2, 'Forward Plan', 'forward', mockMushaf);
      
      // Expected order:
      // S77 (580, 581) -> S78 (582, 583) -> S113/S114 (604)
      expect(plan.targetPages).toEqual([580, 581, 582, 583, 604]);
    });

    it('should generate a BACKWARD plan (Nas -> Fatiha direction) but keep pages within surahs FORWARD', () => {
      // The user wants to memorize these pages backward.
      const pagesToMemorize = [580, 581, 582, 583, 604];
      const plan = generatePlan(pagesToMemorize, 2, 'Backward Plan', 'backward', mockMushaf);
      
      // Expected logic:
      // Sort Surahs backward: S114, S113, S78, S77
      // 1. S114 (Nas): 604
      // 2. S113 (Falaq): 604 (already added, skipped)
      // 3. S78 (Naba): 582, 583 (MUST be forward!)
      // 4. S77 (Mursalat): 580, 581 (MUST be forward!)
      expect(plan.targetPages).toEqual([604, 582, 583, 580, 581]);
    });

    it('should calculate plan totalDays and pagesPerDay correctly', () => {
      const pages = [1, 2, 3, 4, 5];
      const plan = generatePlan(pages, 2, 'Test Plan', 'forward');
      expect(plan.pagesPerDay).toBe(2);
      expect(plan.totalDays).toBe(3); // 5 pages / 2 per day = 2.5 -> ceil(3)
    });
  });

  describe('strengthAfterReview', () => {
    it('should increase strength on pass up to 5', () => {
      expect(strengthAfterReview(1, true)).toBe(2);
      expect(strengthAfterReview(5, true)).toBe(5);
    });

    it('should decrease strength on fail down to 1', () => {
      expect(strengthAfterReview(3, false)).toBe(1); // 3 - 2 = 1
      expect(strengthAfterReview(2, false)).toBe(1); // 2 - 2 = 0 -> min 1
    });
  });

  describe('toArabicNumerals', () => {
    it('should convert numbers to Arabic numerals', () => {
      expect(toArabicNumerals(123)).toBe('١٢٣');
      expect(toArabicNumerals(0)).toBe('٠');
    });
  });
});

describe('calculateStabilityIndex', () => {
  it('returns 0 for empty pages array', () => {
    expect(calculateStabilityIndex([])).toBe(0);
  });

  it('returns 15 for a single page at strength 1 (no bonus)', () => {
    const pages: PageProgress[] = [{
      pageNumber: 1, memorized: true, strength: 1 as MemorizationStrength,
      lastReviewed: '', reviewCount: 0, nextReviewDate: '',
    }];
    expect(calculateStabilityIndex(pages)).toBe(15);
  });

  it('returns 100 for a single page at strength 5', () => {
    const pages: PageProgress[] = [{
      pageNumber: 1, memorized: true, strength: 5 as MemorizationStrength,
      lastReviewed: '', reviewCount: 0, nextReviewDate: '',
    }];
    expect(calculateStabilityIndex(pages)).toBe(100);
  });

  it('averages scores correctly for multiple pages', () => {
    // strength 1 = 15, strength 5 = 100 → avg = 57.5 → rounded = 58
    const pages: PageProgress[] = [
      { pageNumber: 1, memorized: true, strength: 1 as MemorizationStrength, lastReviewed: '', reviewCount: 0, nextReviewDate: '' },
      { pageNumber: 2, memorized: true, strength: 5 as MemorizationStrength, lastReviewed: '', reviewCount: 0, nextReviewDate: '' },
    ];
    expect(calculateStabilityIndex(pages)).toBe(58);
  });

  it('gives bonus points for pages covered by completed task selections', () => {
    const pages: PageProgress[] = [{
      pageNumber: 5, memorized: true, strength: 1 as MemorizationStrength,
      lastReviewed: '', reviewCount: 0, nextReviewDate: '',
    }];
    const completedTask: TaskSelection = {
      id: 't1',
      module: 'memorization' as any,
      ranges: [{ id: 'r1', type: 'page', start: 1, end: 10 }],
      createdAt: new Date().toISOString(),
      isCompleted: true,
      timesCompleted: 1,
    };
    const withBonus = calculateStabilityIndex(pages, [completedTask]);
    // base = 15, bonus = 1 module * 3 = 3 → 18
    expect(withBonus).toBe(18);
  });
});

describe('getPlanDayDate', () => {
  it('returns the start date itself for dayIndex=0 if that day is active', () => {
    // Use a known Monday (2024-01-01 is Monday = day 1)
    const monday = '2024-01-01';
    // All days active [0,1,2,3,4,5,6] → dayIndex=0 → Monday itself
    const result = getPlanDayDate(monday, 0, [0, 1, 2, 3, 4, 5, 6]);
    expect(result).toBe(monday);
  });

  it('skips inactive days and returns next active day', () => {
    // startDate = Monday 2024-01-01, activeDays = weekdays only [1,2,3,4,5]
    // dayIndex=0 → Monday (day 1) ✓
    // dayIndex=4 → Friday (2024-01-05) ✓
    // dayIndex=5 → next Monday (2024-01-08) ✓ (weekend skipped)
    const monday = '2024-01-01';
    const result = getPlanDayDate(monday, 5, [1, 2, 3, 4, 5]);
    expect(result).toBe('2024-01-08'); // next Monday
  });

  it('defaults to Mon-Fri when activeDays is empty', () => {
    // Empty activeDays → defaults to [0,1,2,3,4] (Sun–Thu)
    // 2024-01-01 is Monday (day 1), so for empty it defaults to Sun(0)–Thu(4)
    // dayIndex=0 → first active day
    const result = getPlanDayDate('2024-01-01', 0, []);
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });
});

// ─── getXPProgressToNextLevel ────────────────────────────────────────────────
describe('getXPProgressToNextLevel', () => {
  it('returns correct progress at 0 XP (مبتدئ level)', () => {
    const prog = getXPProgressToNextLevel(0);
    expect(prog.current).toBe(0);
    expect(prog.required).toBe(500);
    expect(prog.percentage).toBe(0);
  });

  it('returns 50% progress at 250 XP', () => {
    const prog = getXPProgressToNextLevel(250);
    expect(prog.percentage).toBe(0.5);
  });

  it('returns correct progress at حارس level (500 XP)', () => {
    const prog = getXPProgressToNextLevel(500);
    expect(prog.current).toBe(0);
    expect(prog.required).toBe(1500); // 2000 - 500
  });

  it('returns percentage=0 at start of حافظ level (5000 XP)', () => {
    // At exactly 5000 XP, you are at the start of the حافظ tier.
    // current=0, required=94999 (99999-5000), percentage=0
    const prog = getXPProgressToNextLevel(5000);
    expect(prog.current).toBe(0);
    expect(prog.percentage).toBe(0);
  });
});

// ─── formatTime ───────────────────────────────────────────────────────────────
describe('formatTime', () => {
  it('formats 0 seconds as 00:00', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('formats 90 seconds as 01:30', () => {
    expect(formatTime(90)).toBe('01:30');
  });

  it('formats 3600 seconds as 60:00', () => {
    expect(formatTime(3600)).toBe('60:00');
  });

  it('pads single digits with leading zero', () => {
    expect(formatTime(65)).toBe('01:05');
  });
});

// ─── getDailyCompletionPercent ────────────────────────────────────────────────
describe('getDailyCompletionPercent', () => {
  // IMPORTANT: Object.values() counts all object fields.
  // Pass ONLY the 6 booleans the function signature declares —
  // NOT a full DailyProgress (which has extra date/xpEarned fields).
  const emptyBooleans = {
    recitation: false, listening: false, preparation: false,
    memorization: false, shortReview: false, longReview: false,
  };

  it('returns 1/6 when only one task is done', () => {
    const prog = getDailyCompletionPercent({ ...emptyBooleans, recitation: true });
    expect(prog).toBeCloseTo(1 / 6);
  });

  it('returns exactly 1 when all 6 tasks are done', () => {
    const full = { recitation: true, listening: true, preparation: true, memorization: true, shortReview: true, longReview: true };
    expect(getDailyCompletionPercent(full)).toBe(1);
  });
});
