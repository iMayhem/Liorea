// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore, initializeFirestore, memoryLocalCache, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "neet-trackr",
  "appId": "1:657513182560:web:81487fc9446bd95960da05",
  "storageBucket": "neet-trackr.firebasestorage.app",
  "apiKey": "AIzaSyCu29Nfa-Hu0iLWNRHgYJV8FPU8__tlymo",
  "authDomain": "neet-trackr.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "657513182560"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Conditionally initialize Firestore with persistence
const db = typeof window !== 'undefined'
  ? initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    })
  : initializeFirestore(app, {
      localCache: memoryLocalCache()
  });

export { app, db };
