import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ModuleId,
  RangeSelection,
  TaskSelection,
  PageProgress,
  MemorizationStrength,
} from '../types';
import { getSurahById } from '../data/quranMeta';
import { todayISO, getNextReviewDate } from '../utils/helpers';

// ============================================================
// Selection Store — Zustand
// ============================================================

const SELECTION_STORAGE_KEY = 'husoon_selections';
const PAGE_PROGRESS_KEY = 'husoon_page_progress';

/** Generate a unique ID */
function uid(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Store State ──────────────────────────────────────────

type SelectionState = {
  /** All task selections across modules */
  taskSelections: TaskSelection[];
  /** Page-level progress for memorization/review */
  pageProgress: PageProgress[];
  /** Loading flag */
  isLoaded: boolean;
};

type SelectionActions = {
  /** Load from storage */
  loadFromStorage: () => Promise<void>;

  // ─── CRUD for Task Selections ───────────────────────
  /** Add a new task selection for a module */
  addTaskSelection: (module: ModuleId, ranges: RangeSelection[]) => void;
  /** Remove a task selection by ID */
  removeTaskSelection: (id: string) => void;
  /** Mark a task selection as completed */
  completeTaskSelection: (id: string) => void;
  /** Update ranges for a task selection */
  updateTaskRanges: (id: string, ranges: RangeSelection[]) => void;
  /** Clear all selections for a module */
  clearModuleSelections: (module: ModuleId) => void;

  // ─── Range Helpers ──────────────────────────────────
  /** Create a surah-based range */
  createSurahRange: (surahId: number, startAyah: number, endAyah: number) => RangeSelection;
  /** Create a page-based range */
  createPageRange: (startPage: number, endPage: number) => RangeSelection;

  // ─── Page Progress ─────────────────────────────────
  /** Mark pages as memorized */
  markPagesMemorized: (pages: number[]) => void;
  /** Review a page (pass/fail) */
  reviewPage: (pageNumber: number, passed: boolean) => void;
  /** Initialize page progress for a range */
  initPageProgress: (startPage: number, endPage: number) => void;
  /** Unmark pages as memorized */
  unmarkPagesMemorized: (pages: number[]) => void;
  /** Revert a page review */
  unreviewPage: (pageNumber: number) => void;

  // ─── Selectors ─────────────────────────────────────
  /** Get all selections for a specific module */
  getModuleSelections: (module: ModuleId) => TaskSelection[];
  /** Get the latest selection for a module */
  getLatestSelection: (module: ModuleId) => TaskSelection | null;
  /** Get stats for a module */
  getModuleStats: (module: ModuleId) => {
    totalSelections: number;
    completedCount: number;
    lastActivity: string | null;
  };
  /** Get pages due for review */
  getPagesDueForReview: () => PageProgress[];
  /** Get memorized pages */
  getMemorizedPages: () => PageProgress[];
  /** Get page strength distribution */
  getStrengthDistribution: () => Record<MemorizationStrength, number>;
  /** Reset the entire store */
  reset: () => void;
};

export type SelectionStore = SelectionState & SelectionActions;

// ─── Persist Helper ───────────────────────────────────────

async function persistSelections(selections: TaskSelection[]) {
  try {
    await AsyncStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(selections));
  } catch (e) {
    console.warn('[SelectionStore] persist error:', e);
  }
}

async function persistPageProgress(progress: PageProgress[]) {
  try {
    await AsyncStorage.setItem(PAGE_PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('[SelectionStore] persist page progress error:', e);
  }
}

// ─── Store Definition ─────────────────────────────────────

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  // ─── State ──────────────────────────────────────────
  taskSelections: [],
  pageProgress: [],
  isLoaded: false,

  // ─── Load ───────────────────────────────────────────
  loadFromStorage: async () => {
    try {
      const [selectionsRaw, progressRaw] = await Promise.all([
        AsyncStorage.getItem(SELECTION_STORAGE_KEY),
        AsyncStorage.getItem(PAGE_PROGRESS_KEY),
      ]);
      const taskSelections: TaskSelection[] = selectionsRaw
        ? JSON.parse(selectionsRaw)
        : [];
      const pageProgress: PageProgress[] = progressRaw
        ? JSON.parse(progressRaw)
        : [];
      set({ taskSelections, pageProgress, isLoaded: true });
    } catch (e) {
      console.warn('[SelectionStore] load error:', e);
      set({ isLoaded: true });
    }
  },

  // ─── CRUD ───────────────────────────────────────────
  addTaskSelection: (module, ranges) => {
    const newSelection: TaskSelection = {
      id: uid(),
      module,
      ranges,
      createdAt: new Date().toISOString(),
      isCompleted: false,
      timesCompleted: 0,
    };
    set((state) => {
      const updated = [...state.taskSelections, newSelection];
      persistSelections(updated);
      return { taskSelections: updated };
    });
  },

  removeTaskSelection: (id) => {
    const task = get().taskSelections.find((s) => s.id === id);
    if (task && task.isCompleted) {
      // Revert progress if it was completed
      const pages: number[] = [];
      task.ranges.forEach((r) => {
        for (let p = r.start; p <= r.end; p++) pages.push(p);
      });

      if (task.module === "memorization") {
        get().unmarkPagesMemorized(pages);
      } else if (
        task.module === "review_short" ||
        task.module === "review_long"
      ) {
        pages.forEach((p) => get().unreviewPage(p));
      }
    }

    set((state) => {
      const updated = state.taskSelections.filter((s) => s.id !== id);
      persistSelections(updated);
      return { taskSelections: updated };
    });
  },

  completeTaskSelection: (id) => {
    const today = todayISO();
    set((state) => {
      const updated = state.taskSelections.map((s) =>
        s.id === id
          ? {
              ...s,
              isCompleted: true,
              completedAt: new Date().toISOString(),
              timesCompleted: s.timesCompleted + 1,
              lastUsed: today,
            }
          : s
      );
      persistSelections(updated);
      return { taskSelections: updated };
    });
  },

  updateTaskRanges: (id, ranges) => {
    set((state) => {
      const updated = state.taskSelections.map((s) =>
        s.id === id ? { ...s, ranges } : s
      );
      persistSelections(updated);
      return { taskSelections: updated };
    });
  },

  clearModuleSelections: (module) => {
    const completedTasks = get().taskSelections.filter(
      (s) => s.module === module && s.isCompleted,
    );

    completedTasks.forEach((task) => {
      const pages: number[] = [];
      task.ranges.forEach((r) => {
        for (let p = r.start; p <= r.end; p++) pages.push(p);
      });

      if (module === "memorization") {
        get().unmarkPagesMemorized(pages);
      } else if (module === "review_short" || module.includes("review")) {
        pages.forEach((p) => get().unreviewPage(p));
      }
    });

    set((state) => {
      const updated = state.taskSelections.filter((s) => s.module !== module);
      persistSelections(updated);
      return { taskSelections: updated };
    });
  },

  // ─── Range Helpers ──────────────────────────────────
  createSurahRange: (surahId, startAyah, endAyah) => {
    const surah = getSurahById(surahId);
    return {
      id: uid(),
      type: 'surah' as const,
      start: surah?.startPage ?? 1,
      end: surah?.endPage ?? 1,
      surahId,
      startAyah,
      endAyah,
    };
  },

  createPageRange: (startPage, endPage) => ({
    id: uid(),
    type: 'page' as const,
    start: startPage,
    end: endPage,
  }),

  // ─── Page Progress ─────────────────────────────────
  markPagesMemorized: (pages) => {
    const today = todayISO();
    set((state) => {
      // For pages that exist, update them. For new pages, create entries.
      const existingPages = new Set(state.pageProgress.map((p) => p.pageNumber));
      const updated = state.pageProgress.map((p) => {
        if (!pages.includes(p.pageNumber)) return p;
        return {
          ...p,
          memorized: true,
          strength: 1 as MemorizationStrength,
          lastReviewed: today,
          nextReviewDate: getNextReviewDate(1, today),
        };
      });

      // Add new page entries for pages not yet tracked
      pages.forEach((pageNum) => {
        if (!existingPages.has(pageNum)) {
          updated.push({
            pageNumber: pageNum,
            memorized: true,
            strength: 1 as MemorizationStrength,
            lastReviewed: today,
            reviewCount: 0,
            nextReviewDate: getNextReviewDate(1, today),
          });
        }
      });

      persistPageProgress(updated);
      return { pageProgress: updated };
    });
  },

  reviewPage: (pageNumber, passed) => {
    const today = todayISO();
    set((state) => {
      const updated = state.pageProgress.map((p) => {
        if (p.pageNumber !== pageNumber) return p;
        const newStrength = passed
          ? (Math.min(5, p.strength + 1) as MemorizationStrength)
          : (Math.max(1, p.strength - 1) as MemorizationStrength);
        return {
          ...p,
          strength: newStrength,
          lastReviewed: today,
          reviewCount: p.reviewCount + 1,
          nextReviewDate: getNextReviewDate(newStrength, today),
        };
      });
      persistPageProgress(updated);
      return { pageProgress: updated };
    });
  },

  initPageProgress: (startPage, endPage) => {
    set((state) => {
      const existingPages = new Set(state.pageProgress.map((p) => p.pageNumber));
      const newEntries: PageProgress[] = [];
      for (let p = startPage; p <= endPage; p++) {
        if (!existingPages.has(p)) {
          newEntries.push({
            pageNumber: p,
            memorized: false,
            strength: 1 as MemorizationStrength,
            lastReviewed: "",
            reviewCount: 0,
            nextReviewDate: "",
          });
        }
      }
      if (newEntries.length > 0) {
        const updated = [...state.pageProgress, ...newEntries];
        persistPageProgress(updated);
        return { pageProgress: updated };
      }
      return state;
    });
  },

  unmarkPagesMemorized: (pages) => {
    set((state) => {
      const updated = state.pageProgress.map((p) => {
        if (!pages.includes(p.pageNumber)) return p;
        return {
          ...p,
          memorized: false,
          strength: 1 as MemorizationStrength,
          nextReviewDate: "",
        };
      });
      persistPageProgress(updated);
      return { pageProgress: updated };
    });
  },

  unreviewPage: (pageNumber) => {
    set((state) => {
      const updated = state.pageProgress.map((p) => {
        if (p.pageNumber !== pageNumber) return p;
        return {
          ...p,
          strength: Math.max(1, p.strength - 1) as MemorizationStrength,
          reviewCount: Math.max(0, p.reviewCount - 1),
        };
      });
      persistPageProgress(updated);
      return { pageProgress: updated };
    });
  },

  // ─── Selectors ─────────────────────────────────────
  getModuleSelections: (module) => {
    return get().taskSelections.filter((s) => s.module === module);
  },

  getLatestSelection: (module) => {
    const selections = get()
      .taskSelections.filter((s) => s.module === module)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return selections[0] ?? null;
  },

  getModuleStats: (module) => {
    const selections = get().taskSelections.filter((s) => s.module === module);
    const completedCount = selections.filter((s) => s.isCompleted).length;
    const lastUsedDates = selections
      .filter((s) => s.lastUsed)
      .map((s) => s.lastUsed!)
      .sort()
      .reverse();

    return {
      totalSelections: selections.length,
      completedCount,
      lastActivity: lastUsedDates[0] ?? null,
    };
  },

  getPagesDueForReview: () => {
    const today = todayISO();
    return get()
      .pageProgress.filter((p) => p.memorized && p.nextReviewDate && p.nextReviewDate <= today)
      .sort((a, b) => a.strength - b.strength);
  },

  getMemorizedPages: () => {
    return get().pageProgress.filter((p) => p.memorized);
  },

  getStrengthDistribution: () => {
    const dist: Record<MemorizationStrength, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    get()
      .pageProgress.filter((p) => p.memorized)
      .forEach((p) => {
        dist[p.strength]++;
      });
    return dist;
  },
  reset: () => {
    set({
      taskSelections: [],
      pageProgress: [],
      isLoaded: true,
    });
  },
}));
