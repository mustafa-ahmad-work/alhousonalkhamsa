/**
 * selectionStore.test.ts
 * Tests the Zustand selectionStore — the Spaced Repetition engine and task management.
 * Uses the store's pure logic functions, not AsyncStorage, by resetting state manually.
 */

// ─── Mocks ────────────────────────────────────────────────────────────────────
import { useSelectionStore } from '../store/selectionStore';
import { todayISO, addDays } from '../utils/helpers';
import { MemorizationStrength } from '../types';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../data/quranMeta', () => ({
  getSurahById: (id: number) => ({
    id, nameAr: 'الفاتحة', startPage: 1, endPage: 1, ayahCount: 7,
  }),
  SURAHS: [],
}));

// Helper to get a fresh store state for each test
const getStore = () => useSelectionStore.getState();

beforeEach(() => {
  // Reset store to clean slate before each test
  useSelectionStore.setState({
    taskSelections: [],
    pageProgress: [],
    isLoaded: true,
  });
});

// ─── SECTION 1: Task Selection CRUD ──────────────────────────────────────────
describe('addTaskSelection', () => {
  it('adds a task selection to an empty store', () => {
    getStore().addTaskSelection('memorization', [
      { id: 'r1', type: 'page', start: 10, end: 12 },
    ]);
    const selections = getStore().taskSelections;
    expect(selections).toHaveLength(1);
    expect(selections[0].module).toBe('memorization');
    expect(selections[0].isCompleted).toBe(false);
    expect(selections[0].timesCompleted).toBe(0);
  });

  it('can add multiple selections for different modules', () => {
    getStore().addTaskSelection('memorization', [{ id: 'r1', type: 'page', start: 1, end: 1 }]);
    getStore().addTaskSelection('review_short', [{ id: 'r2', type: 'page', start: 2, end: 3 }]);
    expect(getStore().taskSelections).toHaveLength(2);
  });
});

describe('completeTaskSelection', () => {
  it('marks a task as completed and increments timesCompleted', () => {
    getStore().addTaskSelection('memorization', [{ id: 'r1', type: 'page', start: 1, end: 2 }]);
    const task = getStore().taskSelections[0];

    getStore().completeTaskSelection(task.id);
    const updated = getStore().taskSelections[0];

    expect(updated.isCompleted).toBe(true);
    expect(updated.timesCompleted).toBe(1);
    expect(updated.completedAt).toBeDefined();
    expect(updated.lastUsed).toBe(todayISO());
  });

  it('increments timesCompleted each time completed', () => {
    getStore().addTaskSelection('memorization', [{ id: 'r1', type: 'page', start: 1, end: 1 }]);
    const id = getStore().taskSelections[0].id;

    getStore().completeTaskSelection(id);
    getStore().completeTaskSelection(id);
    expect(getStore().taskSelections[0].timesCompleted).toBe(2);
  });
});

describe('removeTaskSelection', () => {
  it('removes a task by id', () => {
    getStore().addTaskSelection('memorization', [{ id: 'r1', type: 'page', start: 1, end: 1 }]);
    const id = getStore().taskSelections[0].id;

    getStore().removeTaskSelection(id);
    expect(getStore().taskSelections).toHaveLength(0);
  });

  it('only removes the matching task', () => {
    getStore().addTaskSelection('memorization', [{ id: 'r1', type: 'page', start: 1, end: 1 }]);
    getStore().addTaskSelection('listening', [{ id: 'r2', type: 'page', start: 2, end: 2 }]);
    const firstId = getStore().taskSelections[0].id;

    getStore().removeTaskSelection(firstId);
    expect(getStore().taskSelections).toHaveLength(1);
    expect(getStore().taskSelections[0].module).toBe('listening');
  });
});

describe('clearModuleSelections', () => {
  it('clears all selections for a specific module', () => {
    getStore().addTaskSelection('memorization', [{ id: 'r1', type: 'page', start: 1, end: 1 }]);
    getStore().addTaskSelection('memorization', [{ id: 'r2', type: 'page', start: 2, end: 2 }]);
    getStore().addTaskSelection('listening', [{ id: 'r3', type: 'page', start: 3, end: 3 }]);

    getStore().clearModuleSelections('memorization');

    const remaining = getStore().taskSelections;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].module).toBe('listening');
  });
});

// ─── SECTION 2: Selectors ─────────────────────────────────────────────────────
describe('getModuleSelections', () => {
  it('returns only selections for the requested module', () => {
    getStore().addTaskSelection('memorization', [{ id: 'r1', type: 'page', start: 1, end: 1 }]);
    getStore().addTaskSelection('listening', [{ id: 'r2', type: 'page', start: 2, end: 2 }]);

    const memSel = getStore().getModuleSelections('memorization');
    expect(memSel).toHaveLength(1);
    expect(memSel[0].module).toBe('memorization');
  });

  it('returns empty array if no selections for module', () => {
    expect(getStore().getModuleSelections('review_long')).toHaveLength(0);
  });
});

describe('getModuleStats', () => {
  it('returns correct stats after completing tasks', () => {
    getStore().addTaskSelection('memorization', [{ id: 'r1', type: 'page', start: 1, end: 1 }]);
    getStore().addTaskSelection('memorization', [{ id: 'r2', type: 'page', start: 2, end: 2 }]);
    const id = getStore().taskSelections[0].id;
    getStore().completeTaskSelection(id);

    const stats = getStore().getModuleStats('memorization');
    expect(stats.totalSelections).toBe(2);
    expect(stats.completedCount).toBe(1);
    expect(stats.lastActivity).toBe(todayISO());
  });
});

// ─── SECTION 3: Page Progress (Spaced Repetition) ────────────────────────────
describe('markPagesMemorized', () => {
  it('creates new page entries when pages are not yet tracked', () => {
    getStore().markPagesMemorized([10, 11, 12]);
    const pages = getStore().pageProgress;
    expect(pages).toHaveLength(3);
    expect(pages.every((p) => p.memorized)).toBe(true);
    expect(pages.every((p) => p.strength === 1)).toBe(true);
  });

  it('sets nextReviewDate to tomorrow (strength=1 → 1 day)', () => {
    const today = todayISO();
    const tomorrow = addDays(today, 1);
    getStore().markPagesMemorized([20]);
    expect(getStore().pageProgress[0].nextReviewDate).toBe(tomorrow);
  });

  it('updates existing page entries rather than duplicating', () => {
    // Pre-set a page as not memorized
    useSelectionStore.setState({
      pageProgress: [{
        pageNumber: 5, memorized: false, strength: 1, lastReviewed: '', reviewCount: 0, nextReviewDate: '',
      }],
      taskSelections: [],
      isLoaded: true,
    });
    getStore().markPagesMemorized([5]);
    const pages = getStore().pageProgress;
    expect(pages).toHaveLength(1); // No duplicate created
    expect(pages[0].memorized).toBe(true);
  });
});

describe('reviewPage', () => {
  beforeEach(() => {
    // Set up a memorized page at strength 2
    useSelectionStore.setState({
      pageProgress: [{
        pageNumber: 7,
        memorized: true,
        strength: 2 as MemorizationStrength,
        lastReviewed: addDays(todayISO(), -2),
        reviewCount: 1,
        nextReviewDate: todayISO(),
      }],
      taskSelections: [],
      isLoaded: true,
    });
  });

  it('increases strength by 1 on pass', () => {
    getStore().reviewPage(7, true);
    expect(getStore().pageProgress[0].strength).toBe(3);
  });

  it('sets next review date further out on pass (strength 2→3 = 7 days)', () => {
    const today = todayISO();
    getStore().reviewPage(7, true);
    const expected = addDays(today, 7); // strength=3 → 7 days
    expect(getStore().pageProgress[0].nextReviewDate).toBe(expected);
  });

  it('decreases strength by 1 on fail', () => {
    getStore().reviewPage(7, false);
    expect(getStore().pageProgress[0].strength).toBe(1); // 2-1=1
  });

  it('increments reviewCount on every review', () => {
    getStore().reviewPage(7, true);
    expect(getStore().pageProgress[0].reviewCount).toBe(2); // was 1
  });
});

describe('getPagesDueForReview', () => {
  it('returns pages whose nextReviewDate is today or past', () => {
    const today = todayISO();
    const yesterday = addDays(today, -1);
    const tomorrow = addDays(today, 1);

    useSelectionStore.setState({
      pageProgress: [
        { pageNumber: 1, memorized: true, strength: 1, lastReviewed: '', reviewCount: 0, nextReviewDate: yesterday },
        { pageNumber: 2, memorized: true, strength: 2, lastReviewed: '', reviewCount: 0, nextReviewDate: today },
        { pageNumber: 3, memorized: true, strength: 3, lastReviewed: '', reviewCount: 0, nextReviewDate: tomorrow },
        { pageNumber: 4, memorized: false, strength: 1, lastReviewed: '', reviewCount: 0, nextReviewDate: yesterday }, // not memorized
      ],
      taskSelections: [],
      isLoaded: true,
    });

    const due = getStore().getPagesDueForReview();
    expect(due).toHaveLength(2);
    expect(due.map((p) => p.pageNumber)).toContain(1);
    expect(due.map((p) => p.pageNumber)).toContain(2);
    // tomorrow and unmemorized should NOT appear
    expect(due.map((p) => p.pageNumber)).not.toContain(3);
    expect(due.map((p) => p.pageNumber)).not.toContain(4);
  });

  it('sorts due pages by strength (weakest first)', () => {
    const today = todayISO();
    useSelectionStore.setState({
      pageProgress: [
        { pageNumber: 10, memorized: true, strength: 3, lastReviewed: '', reviewCount: 0, nextReviewDate: today },
        { pageNumber: 11, memorized: true, strength: 1, lastReviewed: '', reviewCount: 0, nextReviewDate: today },
        { pageNumber: 12, memorized: true, strength: 2, lastReviewed: '', reviewCount: 0, nextReviewDate: today },
      ],
      taskSelections: [],
      isLoaded: true,
    });

    const due = getStore().getPagesDueForReview();
    expect(due[0].strength).toBe(1); // weakest first
    expect(due[1].strength).toBe(2);
    expect(due[2].strength).toBe(3);
  });
});

describe('getStrengthDistribution', () => {
  it('counts memorized pages by strength level', () => {
    useSelectionStore.setState({
      pageProgress: [
        { pageNumber: 1, memorized: true, strength: 1, lastReviewed: '', reviewCount: 0, nextReviewDate: '' },
        { pageNumber: 2, memorized: true, strength: 1, lastReviewed: '', reviewCount: 0, nextReviewDate: '' },
        { pageNumber: 3, memorized: true, strength: 3, lastReviewed: '', reviewCount: 0, nextReviewDate: '' },
        { pageNumber: 4, memorized: false, strength: 1, lastReviewed: '', reviewCount: 0, nextReviewDate: '' }, // not memorized, shouldn't count
      ],
      taskSelections: [],
      isLoaded: true,
    });

    const dist = getStore().getStrengthDistribution();
    expect(dist[1]).toBe(2); // two pages at strength 1
    expect(dist[2]).toBe(0);
    expect(dist[3]).toBe(1);
    expect(dist[4]).toBe(0);
    expect(dist[5]).toBe(0);
  });
});
