import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { getMushafEdition } from "../data/mushafEditions";
import {
  AppState,
  DailyProgress,
  FORTRESSES,
  FortressId,
  MemorizationStrength,
  PageProgress,
  PlanDirection,
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
import { NotificationService } from "./NotificationService";
// Storage Key ──────────────────────────────────────────
const STORAGE_KEY = "husoon_app_state";

// ─── Initial State ────────────────────────────────────────
const DEFAULT_INITIAL_STATE: AppState = {
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
  isLoaded: false,
  taskSelections: [],
  globalStats: {
    totalUsers: 0,
    totalTasks: 0,
    totalPages: 0,
    totalLaunches: 0,
    totalPageViews: 0,
  },
  settings: {
    hapticsEnabled: false,
    reviewStrategy: "spaced",
    notifications: {
      enabled: true,
      recitationEnabled: true,
      recitationTime: "08:00",
      listeningEnabled: true,
      listeningTime: "10:00",
      weeklyPrepEnabled: true,
      weeklyPrepTime: "18:00",
      nightlyPrepEnabled: true,
      nightlyPrepTime: "22:00",
      dailyPrepEnabled: true,
      dailyPrepTime: "05:45",
      memorizationEnabled: true,
      memorizationTime: "06:00",
      reviewEnabled: true,
      reviewTime: "16:00",
    },
    showDailyProgressOnDashboard: true,
    memorizationTimerMinutes: 15,
    preparationTimerMinutes: 15,
    reviewTimerMinutes: 15,
    recitationTimerMinutes: 20,
    listeningTimerMinutes: 15,
    memorizationMethod: "standard",
    chunksPerPage: 1,
    mushafEdition: "madani_604",
    planMode: "daily",
    activeDaysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Every day by default for Daily Plan
  },
};

const getInitialState = (): AppState =>
  JSON.parse(JSON.stringify(DEFAULT_INITIAL_STATE));
const initialState = getInitialState();

// ─── Action Types ─────────────────────────────────────────
type Action =
  | { type: "LOAD_STATE"; payload: Partial<AppState> }
  | {
      type: "COMPLETE_ONBOARDING";
      payload: {
        user: Omit<User, "id" | "createdAt" | "title" | "totalXP">;
        pageNumbers: number[];
        label: string;
        direction: "forward" | "backward";
        alreadyMemorizedSurahIds?: number[];
        settings?: {
          planMode: "daily" | "weekly";
          activeDaysOfWeek: number[];
          mushafEdition: string;
          reviewStrategy: "spaced" | "random" | "recency";
        };
      };
    }
  | { type: "TOGGLE_FORTRESS"; payload: { fortressId: FortressId } }
  | { type: "MARK_PAGES_MEMORIZED"; payload: { pages: number[] } }
  | { type: "REVIEW_PAGE" ; payload: { pageNumber: number; passed: boolean } }
  | { type: "RESET" }
  | { type: "UPDATE_USER"; payload: Partial<User> }
  | { type: "UPDATE_SETTINGS"; payload: Partial<AppState["settings"]> }
  | { type: "UPDATE_GLOBAL_STATS"; payload: any }
  | {
      type: "SET_FORTRESS_COMPLETED";
      payload: { fortressId: FortressId; completed: boolean };
    }
  | { type: "COMPLETE_ALL_TODAY" }
  | {
      type: "REGENERATE_PLAN";
      payload: {
        pageNumbers: number[];
        label: string;
        direction: PlanDirection;
      };
    };

// ─── Reducer ──────────────────────────────────────────────
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOAD_STATE": {
      let plan = (action.payload as any).plan;
      if (plan && !plan.targetPages) {
        const pageNumbers = [];
        const start = plan.startPage || 1;
        const end = plan.endPage || 604;
        const min = Math.min(start, end);
        const max = Math.max(start, end);
        for (let p = min; p <= max; p++) pageNumbers.push(p);

        plan = generatePlan(
          pageNumbers,
          plan.pagesPerDay || 1,
          "خطة سابقة",
          plan.direction || "forward",
        );
      }
      const mergedSettings = {
        ...DEFAULT_INITIAL_STATE.settings,
        ...(action.payload.settings || {}),
      };

      // Ensure the nested notifications object is correctly merged too
      if (action.payload.settings?.notifications) {
        mergedSettings.notifications = {
          ...DEFAULT_INITIAL_STATE.settings.notifications,
          ...action.payload.settings.notifications,
        };
      }

      // Check if streak was broken since last session
      let updatedStreak = action.payload.streak || state.streak;
      if (updatedStreak.lastActiveDate) {
        const rawStreak = calculateStreak(
          updatedStreak.currentStreak,
          updatedStreak.longestStreak,
          updatedStreak.lastActiveDate,
          false,
        );
        updatedStreak = {
          currentStreak: rawStreak.current,
          longestStreak: rawStreak.longest,
          lastActiveDate: rawStreak.lastActiveDate,
        };
      }

      return {
        ...state,
        ...action.payload,
        plan: plan || null,
        settings: mergedSettings,
        streak: updatedStreak,
        isLoaded: true,
      };
    }

    case "COMPLETE_ONBOARDING": {
      const cleanState = getInitialState();
      const {
        user: userData,
        pageNumbers,
        label,
        direction,
        alreadyMemorizedSurahIds,
      } = action.payload;
      const editionId =
        (cleanState.settings.mushafEdition as string) ?? "madani_604";
      const editionData = getMushafEdition(editionId as any);
      const plan = generatePlan(
        pageNumbers,
        userData.dailyPages,
        label,
        direction,
        editionData.surahPages,
      );
      (plan as any).mushafEditionId = editionId;
      (plan as any).planMode =
        action.payload.settings?.planMode ??
        cleanState.settings.planMode ??
        "daily";
      (plan as any).activeDaysOfWeek = action.payload.settings
        ?.activeDaysOfWeek ??
        cleanState.settings.activeDaysOfWeek ?? [0, 1, 2, 3, 4, 5, 6];

      // Identify pages for already memorized surahs
      const alreadyMemorizedPagesSet = new Set<number>();
      if (alreadyMemorizedSurahIds && alreadyMemorizedSurahIds.length > 0) {
        alreadyMemorizedSurahIds.forEach((surahId) => {
          const range = editionData.surahPages[surahId];
          if (range) {
            for (let p = range[0]; p <= range[1]; p++) {
              alreadyMemorizedPagesSet.add(p);
            }
          }
        });
      }

      const today = todayISO();

      // Build initial page progress for all pages
      const pageProgress: PageProgress[] = [];
      for (let p = 1; p <= editionData.totalPages; p++) {
        const isMemorized = alreadyMemorizedPagesSet.has(p);
        pageProgress.push({
          pageNumber: p,
          memorized: isMemorized,
          // If already memorized, start with "Solid" strength (4)
          strength: isMemorized ? 4 : 1,
          lastReviewed: isMemorized ? today : "",
          reviewCount: isMemorized ? 3 : 0, // Assume they've reviewed it before if they know it
          nextReviewDate: isMemorized ? getNextReviewDate(4, today) : "",
        });
      }

      const user: User = {
        id: Date.now().toString(),
        name: userData.name,
        level: userData.level,
        goal: label,
        dailyPages: userData.dailyPages,
        createdAt: todayISO(),
        title: "مبتدئ",
        totalXP: 0,
      };

      // Create today's progress
      const todayProgress: DailyProgress = createEmptyDailyProgress();

      return {
        ...cleanState,
        user,
        plan,
        pageProgress,
        dailyProgress: [todayProgress],
        settings: {
          ...cleanState.settings,
          planMode:
            action.payload.settings?.planMode ?? cleanState.settings.planMode,
          activeDaysOfWeek:
            action.payload.settings?.activeDaysOfWeek ??
            cleanState.settings.activeDaysOfWeek,
        },
        isOnboarded: true,
        isLoaded: true,
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
      const isCompleted = todayProg
        ? (todayProg as Record<string, unknown>)[field]
        : false;

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

    case "SET_FORTRESS_COMPLETED": {
      const { fortressId, completed } = action.payload;
      const today = todayISO();
      const fortress = FORTRESSES.find((f) => f.id === fortressId);
      const xpReward = fortress?.xpReward ?? 0;

      const existingIndex = state.dailyProgress.findIndex(
        (p) => p.date === today,
      );
      let updatedProgress: DailyProgress[];

      if (existingIndex === -1 && completed) {
        const newProgress = createEmptyDailyProgress();
        (newProgress as Record<string, any>)[fortressToField(fortressId)] =
          true;
        newProgress.xpEarned = xpReward;
        updatedProgress = [...state.dailyProgress, newProgress];
      } else if (existingIndex !== -1) {
        updatedProgress = state.dailyProgress.map((p, i) => {
          if (i !== existingIndex) return p;
          const field = fortressToField(fortressId);
          const wasCompleted = (p as Record<string, any>)[field];
          if (wasCompleted === completed) return p;

          const newXP = completed
            ? p.xpEarned + xpReward
            : p.xpEarned - xpReward;
          return { ...p, [field]: completed, xpEarned: Math.max(0, newXP) };
        });
      } else {
        return state;
      }

      const totalXP = updatedProgress.reduce((sum, p) => sum + p.xpEarned, 0);
      const newTitle = getTitleFromXP(totalXP);
      const todayProg = updatedProgress.find((p) => p.date === today);

      const completion = todayProg ? getDailyCompletionPercent(todayProg) : 0;
      const allDone = completion >= 1.0;
      const rawStreak = calculateStreak(
        state.streak.currentStreak,
        state.streak.longestStreak,
        state.streak.lastActiveDate,
        allDone,
      );

      return {
        ...state,
        dailyProgress: updatedProgress,
        streak: {
          currentStreak: rawStreak.current,
          longestStreak: rawStreak.longest,
          lastActiveDate: rawStreak.lastActiveDate,
        },
        user: state.user
          ? { ...state.user, totalXP, title: newTitle as any }
          : state.user,
      };
    }

    case "COMPLETE_ALL_TODAY": {
      const today = todayISO();
      const fortressIds: FortressId[] = [
        "recitation",
        "listening",
        "preparation",
        "memorization",
        "review",
      ];
      let newState = state;
      fortressIds.forEach((id) => {
        newState = appReducer(newState, {
          type: "SET_FORTRESS_COMPLETED",
          payload: { fortressId: id, completed: true },
        });
      });
      return newState;
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

      // Advance plan currentPageIndex
      let updatedPlan = state.plan;
      if (state.plan) {
        const newIndex = state.plan.currentPageIndex + pages.length;
        updatedPlan = {
          ...state.plan,
          currentPageIndex: Math.min(newIndex, state.plan.targetPages.length),
        };
      }

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



    case "UPDATE_USER": {
      if (!state.user) return state;
      const newUser = { ...state.user, ...action.payload };

      // If dailyPages changed, regenerate the plan
      let newPlan = state.plan;
      if (action.payload.dailyPages !== undefined && state.plan) {
        newPlan = { ...state.plan, pagesPerDay: action.payload.dailyPages };
        newPlan.totalDays = Math.ceil(
          newPlan.targetPages.length / newPlan.pagesPerDay,
        );
      }

      return {
        ...state,
        user: newUser,
        plan: newPlan,
      };
    }

    case "UPDATE_SETTINGS": {
      const newSettings = { ...state.settings, ...action.payload };
      // REMOVED: scheduleFortressReminders from reducer to prevent side effects and loops
      // if (action.payload.notifications) {
      //   NotificationService.scheduleFortressReminders(newSettings.notifications);
      // }
      return {
        ...state,
        settings: newSettings,
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

    case "REGENERATE_PLAN": {
      const { pageNumbers, label, direction } = action.payload;
      const pagesPerDay = state.user?.dailyPages ?? 1;
      const editionId = (state.settings as any).mushafEdition ?? "madani_604";
      const editionData = getMushafEdition(editionId as any);
      const newPlan = generatePlan(
        pageNumbers,
        pagesPerDay,
        label,
        direction,
        editionData.surahPages,
      );
      (newPlan as any).mushafEditionId = editionId;
      (newPlan as any).planMode = (state.settings as any).planMode ?? "daily";
      (newPlan as any).activeDaysOfWeek = (state.settings as any)
        .activeDaysOfWeek ?? [0, 1, 2, 3, 4];

      // Ensure pageProgress covers all pages up to editionData.totalPages
      let newPageProgress = [...state.pageProgress];
      for (let p = 1; p <= editionData.totalPages; p++) {
        if (!newPageProgress.find((pg) => pg.pageNumber === p)) {
          newPageProgress.push({
            pageNumber: p,
            memorized: false,
            strength: 1,
            lastReviewed: "",
            reviewCount: 0,
            nextReviewDate: "",
          });
        }
      }

      return {
        ...state,
        plan: newPlan,
        pageProgress: newPageProgress,
      };
    }

    case "RESET": {
      console.log("[AppStore] Resetting to initial state...");
      const clean = getInitialState();
      return {
        ...clean,
        isLoaded: true,
        isOnboarded: false,
        user: null,
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

  const loadState = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        console.log("[AppStore] State loaded from storage");
        const parsed = JSON.parse(stored) as Partial<AppState>;
        dispatch({ type: "LOAD_STATE", payload: parsed });
      } else {
        console.log("[AppStore] No stored state found");
        dispatch({ type: "LOAD_STATE", payload: {} });
      }
    } catch (e) {
      console.warn("[AppStore] Failed to load state:", e);
      dispatch({ type: "LOAD_STATE", payload: {} });
    }
  };

  const saveState = async (s: AppState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch (e) {
      console.warn("[AppStore] Failed to save state:", e);
    }
  };

  // Load state from storage on mount
  useEffect(() => {
    loadState();
    NotificationService.registerForPushNotificationsAsync();
  }, []);

  // Persist state on every change
  useEffect(() => {
    if (state.isLoaded) {
      if (state.isOnboarded) {
        saveState(state);
      } else if (!state.isOnboarded && state.user === null) {
        // Clear storage on RESET
        AsyncStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [state]);

  // When onboarding completes for the first time, clear any stale notification
  // hash so scheduleFortressReminders() always runs a fresh reschedule.
  // This prevents the situation where the hash from a previous install / reset
  // matches the new settings and the service skips scheduling entirely.
  const prevOnboardedRef = React.useRef(state.isOnboarded);
  useEffect(() => {
    const wasOnboarded = prevOnboardedRef.current;
    prevOnboardedRef.current = state.isOnboarded;
    if (!wasOnboarded && state.isOnboarded) {
      // Transitioned: not-onboarded → onboarded.
      // Clear stored hash so the scheduling effect below always runs a full
      // reschedule on the very first launch after onboarding.
      NotificationService.clearSavedHash();
    }
  }, [state.isOnboarded]);

  // Schedule / update notifications whenever notification settings change.
  //
  // Design:
  // • Only fires after the app is fully loaded AND the user is onboarded.
  //   This prevents any scheduling during the onboarding wizard.
  // • Debounced 800 ms to coalesce rapid successive Redux dispatches
  //   (e.g., applying a template that updates 7 time fields at once).
  // • The service uses a persistent AsyncStorage hash — if the settings
  //   haven't changed since the last run it exits immediately (no-op).
  // • Uses expo-notifications SchedulableTriggerInputTypes.DAILY trigger,
  //   which schedules for the next upcoming occurrence of the specified
  //   hour:minute WITHOUT firing an immediate catch-up notification.
  //   No scheduling-lock mechanism is required.
  useEffect(() => {
    if (!state.isLoaded || !state.isOnboarded) return;

    const timer = setTimeout(() => {
      NotificationService.scheduleFortressReminders(
        state.settings.notifications,
      );
    }, 800);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.isLoaded,
    state.isOnboarded,
    // Only re-run when the notification sub-tree actually changes.
    // Serialising here avoids triggering on unrelated state mutations.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(state.settings.notifications),
  ]);

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
    const { targetPages, currentPageIndex, pagesPerDay } = state.plan;
    return targetPages.slice(currentPageIndex, currentPageIndex + pagesPerDay);
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
