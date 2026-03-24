import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import {
  AppState,
  DailyProgress,
  FORTRESSES,
  FortressId,
  GOAL_PAGE_RANGES,
  MemorizationStrength,
  PageProgress,
  StreakData,
  User,
} from "../types";
import {
  calculateStreak,
  generatePlan,
  getDailyCompletionPercent,
  getNextReviewDate,
  getPagesDueForReview,
  getTitleFromXP,
  strengthAfterReview,
  todayISO,
} from "../utils/helpers";
import { StatisticsService } from "./StatisticsService";
// Storage Key ──────────────────────────────────────────
const STORAGE_KEY = "husoon_app_state";

// ─── Initial State ────────────────────────────────────────
const initialState: AppState = {
  user: null,
  plan: null,
  dailyProgress: [],
  pageProgress: [],
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: "",
  },
  isOnboarded: false,
  themeMode: "light",
  taskSelections: [],
  globalStats: {
    totalUsers: 0,
    totalTasks: 0,
    totalPages: 0,
    totalLaunches: 0,
    totalPageViews: 0,
  },
};

// ─── Action Types ─────────────────────────────────────────
type Action =
  | { type: "LOAD_STATE"; payload: Partial<AppState> }
  | {
      type: "COMPLETE_ONBOARDING";
      payload: {
        user: Omit<User, "id" | "createdAt" | "title" | "totalXP">;
        goal: string;
      };
    }
  | { type: "TOGGLE_FORTRESS"; payload: { fortressId: FortressId } }
  | { type: "MARK_PAGES_MEMORIZED"; payload: { pages: number[] } }
  | { type: "REVIEW_PAGE"; payload: { pageNumber: number; passed: boolean } }
  | { type: "TOGGLE_THEME" }
  | { type: "RESET" }
  | { type: "UPDATE_USER"; payload: Partial<User> }
  | { type: "UPDATE_GLOBAL_STATS"; payload: any };

// ─── Reducer ──────────────────────────────────────────────
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOAD_STATE": {
      return { ...state, ...action.payload };
    }

    case "COMPLETE_ONBOARDING": {
      const { user: userData, goal } = action.payload;
      const range = GOAL_PAGE_RANGES[goal] ?? { start: 1, end: 604 };
      const plan = generatePlan(range.start, range.end, userData.dailyPages);

      // Build initial page progress for all pages
      const pageProgress: PageProgress[] = [];
      for (let p = range.start; p <= range.end; p++) {
        pageProgress.push({
          pageNumber: p,
          memorized: false,
          strength: 1,
          lastReviewed: "",
          reviewCount: 0,
          nextReviewDate: "",
        });
      }

      const user: User = {
        id: Date.now().toString(),
        name: userData.name,
        level: userData.level,
        goal,
        dailyPages: userData.dailyPages,
        createdAt: todayISO(),
        title: "مبتدئ",
        totalXP: 0,
      };

      // Create today's progress
      const todayProgress: DailyProgress = createEmptyDailyProgress();

      // Track new user in Firebase (Only once)
      StatisticsService.trackNewUser();
 
      return {
        ...state,
        user,
        plan,
        pageProgress,
        dailyProgress: [todayProgress],
        isOnboarded: true,
      };
    }

    case "TOGGLE_FORTRESS": {
      const { fortressId } = action.payload;
      const today = todayISO();
      const fortress = FORTRESSES.find((f) => f.id === fortressId);
      const xpReward = fortress?.xpReward ?? 0;

      const existingIndex = state.dailyProgress.findIndex(
        (p) => p.date === today,
      );

      let updatedProgress: DailyProgress[];

      if (existingIndex === -1) {
        const newProgress = createEmptyDailyProgress();
        (newProgress as Record<string, unknown>)[fortressToField(fortressId)] =
          true;
        newProgress.xpEarned = xpReward;
        updatedProgress = [...state.dailyProgress, newProgress];
      } else {
        updatedProgress = state.dailyProgress.map((p, i) => {
          if (i !== existingIndex) return p;
          const field = fortressToField(fortressId);
          const wasCompleted = (p as Record<string, unknown>)[field] as boolean;
          const newXP = wasCompleted
            ? p.xpEarned - xpReward
            : p.xpEarned + xpReward;
          return {
            ...p,
            [field]: !wasCompleted,
            xpEarned: Math.max(0, newXP),
          };
        });
      }

      const totalXP = updatedProgress.reduce((sum, p) => sum + p.xpEarned, 0);
      const newTitle = getTitleFromXP(totalXP);
 
      const field = fortressToField(fortressId);
      const todayProg = updatedProgress.find((p) => p.date === today);
      const isCompleted = todayProg ? (todayProg as Record<string, unknown>)[field] : false;
      
      if (isCompleted) {
        StatisticsService.trackTaskCompletion();
      }

      // Update streak
      const completion = todayProg ? getDailyCompletionPercent(todayProg) : 0;
      const allDone = completion >= 1.0;
      const rawStreak = calculateStreak(
        state.streak.currentStreak,
        state.streak.longestStreak,
        state.streak.lastActiveDate,
        allDone,
      );
      const updatedStreak: StreakData = {
        currentStreak: rawStreak.current,
        longestStreak: rawStreak.longest,
        lastActiveDate: rawStreak.lastActiveDate,
      };

      return {
        ...state,
        dailyProgress: updatedProgress,
        streak: updatedStreak,
        user: state.user
          ? { ...state.user, totalXP, title: newTitle as User["title"] }
          : state.user,
      };
    }

    case "MARK_PAGES_MEMORIZED": {
      const { pages } = action.payload;
      const today = todayISO();

      const updatedPageProgress = state.pageProgress.map((p) => {
        if (!pages.includes(p.pageNumber)) return p;
        return {
          ...p,
          memorized: true,
          strength: 1 as MemorizationStrength,
          lastReviewed: today,
          nextReviewDate: getNextReviewDate(1, today),
        };
      });

      // Advance plan currentPage
      const lastMemorized = Math.max(...pages);
      const updatedPlan = state.plan
        ? { ...state.plan, currentPage: lastMemorized + 1 }
        : state.plan;

      // Track memorized pages in Firebase
      StatisticsService.trackPageMemorized(pages.length);

      return {
        ...state,
        pageProgress: updatedPageProgress,
        plan: updatedPlan,
      };
    }

    case "REVIEW_PAGE": {
      const { pageNumber, passed } = action.payload;
      const today = todayISO();

      const updatedPageProgress = state.pageProgress.map((p) => {
        if (p.pageNumber !== pageNumber) return p;
        const newStrength = strengthAfterReview(p.strength, passed);
        return {
          ...p,
          strength: newStrength,
          lastReviewed: today,
          reviewCount: p.reviewCount + 1,
          nextReviewDate: getNextReviewDate(newStrength, today),
        };
      });

      return { ...state, pageProgress: updatedPageProgress };
    }

    case "TOGGLE_THEME": {
      const newMode = state.themeMode === "dark" ? "light" : "dark";
      return { ...state, themeMode: newMode };
    }

    case "RESET": {
      return initialState;
    }

    case "UPDATE_USER": {
      if (!state.user) return state;
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    }
 
    case "UPDATE_GLOBAL_STATS": {
      return {
        ...state,
        globalStats: {
          ...state.globalStats,
          ...action.payload,
        },
      };
    }

    default:
      return state;
  }
}

// ─── Helpers ──────────────────────────────────────────────
function createEmptyDailyProgress(): DailyProgress {
  return {
    date: todayISO(),
    recitation: false,
    listening: false,
    preparation: false,
    memorization: false,
    shortReview: false,
    longReview: false,
    xpEarned: 0,
  };
}

function fortressToField(id: FortressId): keyof DailyProgress {
  const map: Record<FortressId, keyof DailyProgress> = {
    recitation: "recitation",
    listening: "listening",
    preparation: "preparation",
    memorization: "memorization",
    review: "shortReview",
  };
  return map[id];
}

// ─── Context ──────────────────────────────────────────────
type AppContextType = {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // Selectors
  getTodayProgress: () => DailyProgress | null;
  getPagesDue: () => PageProgress[];
  getMemorizedPages: () => PageProgress[];
  getCurrentPagesForMemorization: () => number[];
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────
export function AppProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(appReducer, initialState);
 
  // Listen to Global Stats when onboarded
  useEffect(() => {
    if (state.isOnboarded) {
      const unsub = StatisticsService.subscribeToStats((stats) => {
        dispatch({ type: "UPDATE_GLOBAL_STATS", payload: stats });
      });
      return unsub;
    }
  }, [state.isOnboarded]);

  // Load state from storage on mount
  useEffect(() => {
    loadState();
    StatisticsService.trackAppLaunch();
  }, []);

  // Persist state on every change
  useEffect(() => {
    if (state.isOnboarded) {
      saveState(state);
    }
  }, [state]);

  // Apply theme on change (handled by components using useTheme)
  // No longer mutating global Colors object

  const loadState = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AppState>;
        dispatch({ type: "LOAD_STATE", payload: parsed });
      }
    } catch (e) {
      console.warn("[AppStore] Failed to load state:", e);
    }
  };

  const saveState = async (s: AppState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch (e) {
      console.warn("[AppStore] Failed to save state:", e);
    }
  };

  const getTodayProgress = useCallback((): DailyProgress | null => {
    const today = todayISO();
    return state.dailyProgress.find((p) => p.date === today) ?? null;
  }, [state.dailyProgress]);

  const getPagesDue = useCallback((): PageProgress[] => {
    return getPagesDueForReview(state.pageProgress);
  }, [state.pageProgress]);

  const getMemorizedPages = useCallback((): PageProgress[] => {
    return state.pageProgress.filter((p) => p.memorized);
  }, [state.pageProgress]);

  const getCurrentPagesForMemorization = useCallback((): number[] => {
    if (!state.plan) return [];
    const { currentPage, pagesPerDay, endPage } = state.plan;
    const pages: number[] = [];
    for (
      let p = currentPage;
      p < currentPage + pagesPerDay && p <= endPage;
      p++
    ) {
      pages.push(p);
    }
    return pages;
  }, [state.plan]);

  const contextValue: AppContextType = {
    state,
    dispatch,
    getTodayProgress,
    getPagesDue,
    getMemorizedPages,
    getCurrentPagesForMemorization,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────
export function useAppStore(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppStore must be used within AppProvider");
  }
  return ctx;
}
