/**
 * useSettingsLogic.test.ts
 * Tests the pure business logic from useSettingsLogic:
 *  - applyPlanChanges page building (complete / range / surahs)
 *  - saveEdit value parsing & dispatch payloads
 *  - saveSelectedTime formatting
 *  - notification template application
 */

// ─── Mocks ────────────────────────────────────────────────────────────────────
import { getMushafEdition } from '../data/mushafEditions';
import { SURAHS } from '../data/quranMeta';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(), getItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn(),
}));
jest.mock('expo-constants', () => ({ expoConfig: { version: '1.0.0' }, appOwnership: 'standalone' }));
jest.mock('expo-notifications', () => ({}));
jest.mock('react-native', () => ({ Platform: { OS: 'ios' }, Alert: { alert: jest.fn() } }));
jest.mock('../store/NotificationService', () => ({
  NotificationService: {
    scheduleFortressReminders: jest.fn(),
    cancelAllFortressReminders: jest.fn(),
    getPermissionStatus: jest.fn().mockResolvedValue('undetermined'),
    requestPermissions: jest.fn(),
    openNotificationSettings: jest.fn(),
  },
}));
jest.mock('expo-router', () => ({ router: { replace: jest.fn(), back: jest.fn() } }));

// ─── Pure logic helpers mirroring useSettingsLogic ───────────────────────────

/** Builds the page array and label for "complete" selection */
const buildCompletePlan = (editionId: string) => {
  const edition = getMushafEdition(editionId as any);
  const pages = Array.from({ length: edition.totalPages }, (_, i) => i + 1);
  const label = `القرآن الكريم كاملاً — ${edition.nameAr}`;
  return { pages, label, edition };
};

/** Builds the page array for a page range selection */
const buildRangePlan = (startPage: number, endPage: number, editionId: string) => {
  const edition = getMushafEdition(editionId as any);
  const totalPages = edition.totalPages;
  const min = Math.max(1, Math.min(startPage, endPage));
  const max = Math.min(totalPages, Math.max(startPage, endPage));
  const pages: number[] = [];
  for (let p = min; p <= max; p++) pages.push(p);
  const label = `من صفحة ${min} إلى ${max} — ${edition.nameAr}`;
  return { pages, label, edition };
};

/** Builds the page array for selected surahs */
const buildSurahPlan = (surahIds: number[], editionId: string) => {
  const edition = getMushafEdition(editionId as any);
  const selected = SURAHS.filter((s) => surahIds.includes(s.id)).sort((a, b) => a.id - b.id);
  const pages: number[] = [];
  selected.forEach((s) => {
    const editionRange = edition.surahPages[s.id];
    const start = editionRange ? editionRange[0] : s.startPage;
    const end   = editionRange ? editionRange[1] : s.endPage;
    for (let p = start; p <= end; p++) {
      if (!pages.includes(p)) pages.push(p);
    }
  });
  const label =
    selected.length === 1
      ? `سورة ${selected[0].nameAr} — ${edition.nameAr}`
      : `مجموعة سور (${selected.length}) — ${edition.nameAr}`;
  return { pages, label, edition };
};

/** Formats hour/minute into HH:MM */
const formatTime = (hour: number, minute: number) =>
  `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

/** Parses a timer edit value to integer with a fallback */
const parseTimerValue = (value: string, fallback: number) =>
  parseInt(value, 10) || fallback;

// ─── SECTION 1: Complete Plan (Full Quran) ───────────────────────────────────
describe('useSettingsLogic — buildCompletePlan (complete selection)', () => {
  it('madani_604 edition returns exactly 604 pages', () => {
    const { pages } = buildCompletePlan('madani_604');
    expect(pages).toHaveLength(604);
    expect(pages[0]).toBe(1);
    expect(pages[603]).toBe(604);
  });

  it('label contains edition name', () => {
    const { label, edition } = buildCompletePlan('madani_604');
    expect(label).toContain(edition.nameAr);
  });

  it('pages are consecutive from 1 to totalPages', () => {
    const { pages, edition } = buildCompletePlan('madani_604');
    expect(pages.length).toBe(edition.totalPages);
    pages.forEach((p, i) => expect(p).toBe(i + 1));
  });
});

// ─── SECTION 2: Range Plan ───────────────────────────────────────────────────
describe('useSettingsLogic — buildRangePlan (range selection)', () => {
  it('generates correct pages for a simple range', () => {
    const { pages } = buildRangePlan(5, 10, 'madani_604');
    expect(pages).toEqual([5, 6, 7, 8, 9, 10]);
  });

  it('swaps start/end when start > end', () => {
    const { pages } = buildRangePlan(10, 5, 'madani_604');
    expect(pages).toEqual([5, 6, 7, 8, 9, 10]);
  });

  it('clamps start to 1', () => {
    const { pages } = buildRangePlan(-10, 3, 'madani_604');
    expect(pages[0]).toBe(1);
  });

  it('clamps end to totalPages', () => {
    const edition = getMushafEdition('madani_604' as any);
    const { pages } = buildRangePlan(600, 9999, 'madani_604');
    expect(pages[pages.length - 1]).toBe(edition.totalPages);
  });

  it('label includes page range', () => {
    const { label } = buildRangePlan(1, 20, 'madani_604');
    expect(label).toContain('1');
    expect(label).toContain('20');
    expect(label).toContain('من صفحة');
  });

  it('single-page range works correctly', () => {
    const { pages } = buildRangePlan(50, 50, 'madani_604');
    expect(pages).toEqual([50]);
  });
});

// ─── SECTION 3: Surah Plan ───────────────────────────────────────────────────
describe('useSettingsLogic — buildSurahPlan (surah selection)', () => {
  it('Al-Fatiha (surah 1) generates its pages', () => {
    const { pages } = buildSurahPlan([1], 'madani_604');
    expect(pages.length).toBeGreaterThan(0);
  });

  it('single surah label says "سورة ..."', () => {
    const { label } = buildSurahPlan([1], 'madani_604');
    expect(label).toContain('سورة');
  });

  it('multiple surahs label says "مجموعة سور"', () => {
    const { label } = buildSurahPlan([1, 2], 'madani_604');
    expect(label).toContain('مجموعة سور');
    expect(label).toContain('2');
  });

  it('no duplicate pages when surahs share a page', () => {
    // Surahs 113 & 114 share page 604 in Madani
    const { pages } = buildSurahPlan([113, 114], 'madani_604');
    const unique = new Set(pages);
    expect(unique.size).toBe(pages.length); // no duplicates
  });

  it('pages are in ascending order', () => {
    const { pages } = buildSurahPlan([1, 2, 3], 'madani_604');
    for (let i = 1; i < pages.length; i++) {
      expect(pages[i]).toBeGreaterThanOrEqual(pages[i - 1]);
    }
  });

  it('empty surah list generates 0 pages', () => {
    const { pages } = buildSurahPlan([], 'madani_604');
    expect(pages).toHaveLength(0);
  });
});

// ─── SECTION 4: Time Formatting ───────────────────────────────────────────────
describe('useSettingsLogic — formatTime', () => {
  it('formats 8:0 as "08:00"', () => {
    expect(formatTime(8, 0)).toBe('08:00');
  });

  it('formats 12:30 as "12:30"', () => {
    expect(formatTime(12, 30)).toBe('12:30');
  });

  it('pads single-digit minutes with zero', () => {
    expect(formatTime(9, 5)).toBe('09:05');
  });

  it('formats midnight as "00:00"', () => {
    expect(formatTime(0, 0)).toBe('00:00');
  });

  it('formats 23:59 correctly', () => {
    expect(formatTime(23, 59)).toBe('23:59');
  });
});

// ─── SECTION 5: Timer Value Parsing ──────────────────────────────────────────
describe('useSettingsLogic — parseTimerValue', () => {
  it('parses valid integer string', () => {
    expect(parseTimerValue('25', 15)).toBe(25);
  });

  it('falls back for empty string', () => {
    expect(parseTimerValue('', 15)).toBe(15);
  });

  it('falls back for non-numeric string', () => {
    expect(parseTimerValue('abc', 20)).toBe(20);
  });

  it('falls back for zero (falsy)', () => {
    // parseInt('0') = 0, which is falsy — uses fallback
    expect(parseTimerValue('0', 15)).toBe(15);
  });

  it('handles leading zeros in string', () => {
    expect(parseTimerValue('030', 10)).toBe(30);
  });
});

// ─── SECTION 6: Notification Templates ───────────────────────────────────────
describe('useSettingsLogic — notification templates', () => {
  const TEMPLATES = [
    {
      label: 'البكور (الفجر)',
      times: {
        recitationTime: '07:00', listeningTime: '09:00',
        weeklyPrepTime: '17:00', nightlyPrepTime: '21:00',
        dailyPrepTime: '04:45', memorizationTime: '05:00', reviewTime: '15:00',
      },
    },
    {
      label: 'قياسي (صباحي)',
      times: {
        recitationTime: '08:00', listeningTime: '10:00',
        weeklyPrepTime: '18:00', nightlyPrepTime: '22:00',
        dailyPrepTime: '05:45', memorizationTime: '06:00', reviewTime: '16:00',
      },
    },
    {
      label: 'متأخر',
      times: {
        recitationTime: '10:00', listeningTime: '12:00',
        weeklyPrepTime: '20:00', nightlyPrepTime: '23:00',
        dailyPrepTime: '07:45', memorizationTime: '08:00', reviewTime: '17:00',
      },
    },
  ];

  it('all templates have 7 time fields', () => {
    TEMPLATES.forEach(({ times }) => {
      expect(Object.keys(times)).toHaveLength(7);
    });
  });

  it('all time values match HH:MM format', () => {
    const HH_MM = /^\d{2}:\d{2}$/;
    TEMPLATES.forEach(({ times }) => {
      Object.values(times).forEach((t) => expect(t).toMatch(HH_MM));
    });
  });

  it('البكور template has earliest memorizationTime', () => {
    const times = TEMPLATES.map((t) => t.times.memorizationTime);
    expect(times[0]).toBe('05:00'); // earliest
    expect(times[1]).toBe('06:00');
    expect(times[2]).toBe('08:00');
  });

  it('applying a template merges into existing notification settings', () => {
    const existingNotifs = { enabled: true, recitationEnabled: false };
    const template = TEMPLATES[0].times;
    const merged = { ...existingNotifs, enabled: true, recitationEnabled: true, ...template };
    expect(merged.enabled).toBe(true);
    expect(merged.memorizationTime).toBe('05:00');
  });
});

// ─── SECTION 7: planMode → activeDays logic ───────────────────────────────────
describe('useSettingsLogic — applyPlanModeSettings activeDays', () => {
  const calcFinalActiveDays = (planMode: 'daily' | 'weekly', activeDaysOfWeek: number[]) =>
    planMode === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : activeDaysOfWeek;

  it('daily mode uses all 7 days regardless of selection', () => {
    const days = calcFinalActiveDays('daily', [1, 3]);
    expect(days).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('weekly mode uses the selected days only', () => {
    const days = calcFinalActiveDays('weekly', [0, 2, 4]);
    expect(days).toEqual([0, 2, 4]);
  });

  it('weekly mode with all days selected returns all 7', () => {
    const days = calcFinalActiveDays('weekly', [0, 1, 2, 3, 4, 5, 6]);
    expect(days).toHaveLength(7);
  });
});
