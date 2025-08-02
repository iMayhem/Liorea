// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

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
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled
      // in one tab at a time.
      console.warn('Firebase persistence failed: failed-precondition. Multiple tabs open?');
    } else if (err.code == 'unimplemented') {
      // The current browser does not support all of the
      // features required to enable persistence
       console.warn('Firebase persistence failed: unimplemented. Browser not supported?');
    }
  });


export { app, db };
