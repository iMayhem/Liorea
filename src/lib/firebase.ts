import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDsGYist7f2enKCGyHwBwSUw70wM_he1Ao",
  authDomain: "liorea-life.firebaseapp.com",
  databaseURL: "https://liorea-life-default-rtdb.firebaseio.com",
  projectId: "liorea-life",
  storageBucket: "liorea-life.firebasestorage.app",
  messagingSenderId: "993762401976",
  appId: "1:993762401976:web:a341527bbbb950afa2de4d",
  measurementId: "G-L0QS4KTGGX"
};

// 1. Initialize Firebase (Prevent re-initialization error in Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Realtime Database
const db = getDatabase(app);

// 3. Initialize Analytics (Only on client-side)
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
}

export { db, analytics };