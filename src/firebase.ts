import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

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

export const app = initializeApp(firebaseConfig);

// Initialize Firestore with persistent cache for offline support
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// Initialize Analytics (Web only, fails gracefully on native if not configured)
export const analyticsPromise = isSupported().then((supported) => {
  if (supported) return getAnalytics(app);
  return null;
});
