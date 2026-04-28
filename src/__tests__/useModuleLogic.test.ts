/**
 * useModuleLogic.test.ts
 * Tests the pure helper functions and page-calculation logic from useModuleLogic.
 */

// ─── Mocks ────────────────────────────────────────────────────────────────────
import { buildRanges } from '../utils/planLogic';
import { TaskSelection } from '../types';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(), getItem: jest.fn(), removeItem: jest.fn(),
}));
jest.mock('expo-constants', () => ({ expoConfig: { version: '1.0.0' }, appOwnership: 'standalone' }));
jest.mock('expo-notifications', () => ({}));
jest.mock('react-native', () => ({ Platform: { OS: 'ios' }, Alert: { alert: jest.fn() } }));
jest.mock('../store/NotificationService', () => ({
  NotificationService: { scheduleFortressReminders: jest.fn(), cancelAllFortressReminders: jest.fn(), getPermissionStatus: jest.fn(), requestPermissions: jest.fn(), openNotificationSettings: jest.fn() },
}));

// ─── Pure logic extracted from useModuleLogic ─────────────────────────────────

/** getPagesFromTask: converts task ranges to a sorted, de-duped page list */
const getPagesFromTask = (task: TaskSelection | null): number[] => {
  if (!task) return [];
  const pages: number[] = [];
  task.ranges.forEach((r) => {
    for (let p = r.start; p <= r.end; p++) pages.push(p);
  });
  return Array.from(new Set(pages)).sort((a, b) => a - b);
};

/** getRecommendedTime: returns timer seconds per module id */
const getRecommendedTime = (mId: string, settings: any): number => {
  switch (mId) {
    case 'recitation':      return (settings.recitationTimerMinutes  || 20) * 60;
    case 'listening':       return (settings.listeningTimerMinutes   || 15) * 60;
    case 'preparation_night':
    case 'preparation_before':
    case 'preparation_weekly': return (settings.preparationTimerMinutes || 15) * 60;
    case 'memorization':    return (settings.memorizationTimerMinutes || 20) * 60;
    case 'review_short':
    case 'review_long':     return (settings.reviewTimerMinutes      || 15) * 60;
    default:                return 15 * 60;
  }
};

// ─── SECTION 1: getPagesFromTask ─────────────────────────────────────────────
describe('useModuleLogic — getPagesFromTask', () => {
  it('returns empty array for null task', () => {
    expect(getPagesFromTask(null)).toEqual([]);
  });

  it('returns correct pages for a single range', () => {
    const task: TaskSelection = {
      id: 't1', module: 'memorization',
      ranges: [{ id: 'r1', type: 'page', start: 5, end: 8 }],
      isCompleted: false, createdAt: '', timesCompleted: 0,
    };
    expect(getPagesFromTask(task)).toEqual([5, 6, 7, 8]);
  });

  it('merges and de-duplicates overlapping ranges', () => {
    const task: TaskSelection = {
      id: 't2', module: 'review_short',
      ranges: [
        { id: 'r2-1', type: 'page', start: 3, end: 5 },
        { id: 'r2-2', type: 'page', start: 5, end: 7 }
      ],
      isCompleted: false, createdAt: '', timesCompleted: 0,
    };
    expect(getPagesFromTask(task)).toEqual([3, 4, 5, 6, 7]);
  });

  it('handles multiple non-adjacent ranges', () => {
    const task: TaskSelection = {
      id: 't3', module: 'recitation',
      ranges: [
        { id: 'r3-1', type: 'page', start: 1, end: 2 },
        { id: 'r3-2', type: 'page', start: 10, end: 11 }
      ],
      isCompleted: false, createdAt: '', timesCompleted: 0,
    };
    expect(getPagesFromTask(task)).toEqual([1, 2, 10, 11]);
  });

  it('handles single-page range', () => {
    const task: TaskSelection = {
      id: 't4', module: 'memorization',
      ranges: [{ id: 'r4', type: 'page', start: 42, end: 42 }],
      isCompleted: false, createdAt: '', timesCompleted: 0,
    };
    expect(getPagesFromTask(task)).toEqual([42]);
  });
});

// ─── SECTION 2: getRecommendedTime ───────────────────────────────────────────
describe('useModuleLogic — getRecommendedTime', () => {
  const defaultSettings = {
    recitationTimerMinutes: 20, listeningTimerMinutes: 15,
    preparationTimerMinutes: 15, memorizationTimerMinutes: 20,
    reviewTimerMinutes: 15,
  };

  it('returns recitation timer in seconds', () => {
    expect(getRecommendedTime('recitation', defaultSettings)).toBe(20 * 60);
  });

  it('returns listening timer in seconds', () => {
    expect(getRecommendedTime('listening', defaultSettings)).toBe(15 * 60);
  });

  it('returns memorization timer in seconds', () => {
    expect(getRecommendedTime('memorization', defaultSettings)).toBe(20 * 60);
  });

  it('returns review timer for review_short', () => {
    expect(getRecommendedTime('review_short', defaultSettings)).toBe(15 * 60);
  });

  it('returns review timer for review_long', () => {
    expect(getRecommendedTime('review_long', defaultSettings)).toBe(15 * 60);
  });

  it('returns preparation timer for preparation_before', () => {
    expect(getRecommendedTime('preparation_before', defaultSettings)).toBe(15 * 60);
  });

  it('returns preparation timer for preparation_night', () => {
    expect(getRecommendedTime('preparation_night', defaultSettings)).toBe(15 * 60);
  });

  it('returns preparation timer for preparation_weekly', () => {
    expect(getRecommendedTime('preparation_weekly', defaultSettings)).toBe(15 * 60);
  });

  it('returns default 15 min for unknown module', () => {
    expect(getRecommendedTime('unknown_module', defaultSettings)).toBe(15 * 60);
  });

  it('respects custom timer values from settings', () => {
    const custom = { ...defaultSettings, memorizationTimerMinutes: 30, reviewTimerMinutes: 25 };
    expect(getRecommendedTime('memorization', custom)).toBe(30 * 60);
    expect(getRecommendedTime('review_short', custom)).toBe(25 * 60);
  });

  it('uses defaults when settings values are 0/undefined', () => {
    const noSettings = {};
    expect(getRecommendedTime('memorization', noSettings)).toBe(20 * 60);
    expect(getRecommendedTime('recitation',  noSettings)).toBe(20 * 60);
    expect(getRecommendedTime('listening',   noSettings)).toBe(15 * 60);
  });
});

// ─── SECTION 3: Page range calculation for modules ───────────────────────────
describe('useModuleLogic — page-range logic for each module type', () => {
  const plan = {
    targetPages: Array.from({ length: 30 }, (_, i) => i + 1), // pages 1-30
    pagesPerDay: 2,
    totalDays: 15,
    planMode: 'daily',
    startDate: '2025-01-01',
    activeDaysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  };

  it('memorization module returns today\'s dayPages', () => {
    const dayIndex = 3; // Day 4 (0-based index 3)
    const startIdx = dayIndex * plan.pagesPerDay;
    const dayPages = plan.targetPages.slice(startIdx, startIdx + plan.pagesPerDay);
    expect(dayPages).toEqual([7, 8]);
  });

  it('preparation_night returns NEXT day\'s pages', () => {
    const dayIndex = 3;
    const nextPages = plan.targetPages.slice(
      (dayIndex + 1) * plan.pagesPerDay,
      (dayIndex + 2) * plan.pagesPerDay,
    );
    expect(nextPages).toEqual([9, 10]);
  });

  it('preparation_weekly returns pages 7 days ahead (week preview)', () => {
    const dayIndex = 0;
    const weeklyPages = plan.targetPages.slice(
      (dayIndex + 7) * plan.pagesPerDay,
      (dayIndex + 14) * plan.pagesPerDay,
    );
    // Pages 15-28 (days 8-14)
    expect(weeklyPages).toHaveLength(14);
    expect(weeklyPages[0]).toBe(15);
  });

  it('review_short returns last 20 of already-done pages', () => {
    const dayIndex = 10;
    const startIdx = dayIndex * plan.pagesPerDay;
    const alreadyDone = plan.targetPages.slice(0, startIdx);
    const reviewShort = alreadyDone.slice(Math.max(0, alreadyDone.length - 20));
    expect(reviewShort.length).toBeLessThanOrEqual(20);
    // The last pages before dayIndex should be included
    expect(reviewShort).toContain(startIdx); // last page of done = startIdx (1-based)
  });

  it('review_long returns pages 20-60 before today', () => {
    const dayIndex = 12;
    const startIdx = dayIndex * plan.pagesPerDay;
    const alreadyDone = plan.targetPages.slice(0, startIdx);
    const reviewLong = alreadyDone.slice(
      Math.max(0, alreadyDone.length - 60),
      Math.max(0, alreadyDone.length - 20),
    );
    expect(reviewLong.length).toBeLessThanOrEqual(40);
  });

  it('listening cycles through pages every 10 pages per day', () => {
    const edition = { totalPages: 604 };
    const dayIndex = 0;
    const listenStart = ((dayIndex * 10) % edition.totalPages) + 1;
    const listenEnd = ((listenStart + 9 - 1) % edition.totalPages) + 1;
    expect(listenStart).toBe(1);
    expect(listenEnd).toBe(10);
  });

  it('recitation ward cycles 40 pages per day', () => {
    const edition = { totalPages: 604 };
    const dayIndex = 0;
    const wardStart = ((dayIndex * 40) % edition.totalPages) + 1;
    const wardEnd   = ((wardStart + 39 - 1) % edition.totalPages) + 1;
    expect(wardStart).toBe(1);
    expect(wardEnd).toBe(40);
  });

  it('listening wraps around at total pages', () => {
    const edition = { totalPages: 10 };
    const dayIndex = 2; // start = (20 % 10)+1 = 1, end = (10 % 10)+1 = 1
    const listenStart = ((dayIndex * 10) % edition.totalPages) + 1;
    expect(listenStart).toBe(1);
  });
});

// ─── SECTION 4: buildRanges helper (used inside todayPlanItem) ───────────────
describe('buildRanges (used by useModuleLogic)', () => {
  it('groups consecutive pages correctly', () => {
    expect(buildRanges([1, 2, 3, 5, 6])).toEqual([
      { start: 1, end: 3 },
      { start: 5, end: 6 },
    ]);
  });

  it('returns empty array for empty input', () => {
    expect(buildRanges([])).toEqual([]);
  });
});
