import { initializeApp, getApp, getApps } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  memoryLocalCache,
  getFirestore,
} from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import { Platform } from "react-native";

// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAEhjR-i1xcoWrd71ZFjDrJlXRR4iUmN7s",
  authDomain: "husoon-app.firebaseapp.com",
  projectId: "husoon-app",
  storageBucket: "husoon-app.firebasestorage.app",
  messagingSenderId: "2076143721",
  appId: "1:2076143721:web:c75bdde444e5948464b2f8",
  measurementId: "G-BS97Q7W49H",
};

// Initialize App only if not already initialized
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore safely
const getDb = () => {
  const firestoreApp = app;
  try {
    // Attempt to initialize with our custom settings
    return initializeFirestore(firestoreApp, {
      localCache:
        Platform.OS === "web"
          ? persistentLocalCache({
              tabManager: persistentMultipleTabManager(),
            })
          : memoryLocalCache(),
    });
  } catch (err: any) {
    // If it's already initialized, return the existing instance
    if (err.code === "failed-precondition" || err.message?.includes("already been called")) {
      return getFirestore(firestoreApp);
    }
    throw err;
  }
};

export const db = getDb();

// Initialize Analytics (Web only, fails gracefully on native if not configured)
export const analyticsPromise = isSupported().then((supported) => {
  if (supported) return getAnalytics(app);
  return null;
});


