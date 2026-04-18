import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:
    import.meta.env?.VITE_FIREBASE_API_KEY ||
    "AIzaSyCfZVIT1xmFOaPWiejFt5HOHaQxKK4LFmo",
  authDomain:
    import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN ||
    "my-potfolio-web.firebaseapp.com",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "my-potfolio-web",
  storageBucket:
    import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET ||
    "my-potfolio-web.firebasestorage.app",
  messagingSenderId:
    import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    "351872066119",
  appId:
    import.meta.env?.VITE_FIREBASE_APP_ID ||
    "1:351872066119:web:0e50f489a8984b1fabc762",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const firebaseConfigResolved = firebaseConfig;
