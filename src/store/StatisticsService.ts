import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  onSnapshot 
} from "firebase/firestore";
import { logEvent } from "firebase/analytics";
import { db, analyticsPromise } from "../firebase";

const STATS_DOC_ID = "main_stats";

/**
 * Utility to log event to Analytics safely
 */
async function logToAnalytics(name: string, params?: any) {
  try {
    const analytics = await analyticsPromise;
    if (analytics) {
      logEvent(analytics, name, params);
    }
  } catch (e) {
    // Analytics failure is non-breaking
  }
}

export const StatisticsService = {
  /**
   * Tracks a new user registration/onboarding complete
   */
  async trackNewUser() {
    try {
      // 1. Private Analytics (Firebase Console)
      logToAnalytics('sign_up', { method: 'onboarding' });

      // 2. Global Public Stat (Firestore) - Visible to users
      const statsRef = doc(db, "global_stats", STATS_DOC_ID);
      await updateDoc(statsRef, {
        totalUsers: increment(1)
      }).catch(async (err) => {
        if (err.code === 'not-found') {
          await setDoc(statsRef, { 
            totalUsers: 1, 
            totalTasks: 0, 
            totalPages: 0
          }, { merge: true });
        }
      });
    } catch (e) {
      console.warn("[Stats] Failed to track user:", e);
    }
  },

  /**
   * Track every time the app is opened (Private - Console only)
   */
  async trackAppLaunch() {
    logToAnalytics('app_open');
    // Also track in Firestore if you want to see it in Database tab, but hidden from UI
    try {
      const statsRef = doc(db, "global_stats", "private_metrics");
      await setDoc(statsRef, {
        totalLaunches: increment(1),
        lastUpdated: new Date().toISOString()
      }, { merge: true });
    } catch (e) {}
  },

  /**
   * Track screen/page views (Private - Console only)
   */
  async trackPageView(pageName: string) {
    logToAnalytics('page_view', { page_path: pageName });
    // Also track in private Firestore doc
    try {
      const statsRef = doc(db, "global_stats", "private_metrics");
      await setDoc(statsRef, {
        totalPageViews: increment(1)
      }, { merge: true });
    } catch (e) {}
  },

  /**
   * Increment total tasks completed across all users (Public - Shown in App)
   */
  async trackTaskCompletion() {
    try {
      const statsRef = doc(db, "global_stats", STATS_DOC_ID);
      await updateDoc(statsRef, {
        totalTasks: increment(1)
      });
      logToAnalytics('task_completed');
    } catch (e) {
      console.warn("[Stats] Failed to track task:", e);
    }
  },

  /**
   * Track when pages are successfully memorized (Public - Shown in App)
   */
  async trackPageMemorized(count: number) {
    try {
      const statsRef = doc(db, "global_stats", STATS_DOC_ID);
      await updateDoc(statsRef, {
        totalPages: increment(count)
      });
      logToAnalytics('pages_memorized', { count });
    } catch (e) {
      // Silently fail
    }
  },

  /**
   * Real-time listener for global stats (Public stats only)
   */
  subscribeToStats(callback: (stats: any) => void) {
    const statsRef = doc(db, "global_stats", STATS_DOC_ID);
    return onSnapshot(statsRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data());
      }
    });
  }
};
