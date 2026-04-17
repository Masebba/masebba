import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { enableIndexedDbPersistence, getFirestore } from 'firebase/firestore';

function readEnv(name: string): string {
  const value = import.meta.env?.[name as keyof ImportMetaEnv];
  if (!value || typeof value !== 'string') {
    throw new Error(`Missing required Firebase environment variable: ${name}`);
  }
  return value;
}

const firebaseConfig = {
  apiKey: readEnv('VITE_FIREBASE_API_KEY'),
  authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: readEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: readEnv('VITE_FIREBASE_APP_ID'),
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

void enableIndexedDbPersistence(db).catch(() => {
  // Best-effort cache only. Multi-tab/incognito restrictions are expected on some browsers.
});
