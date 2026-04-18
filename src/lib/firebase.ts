import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { enableIndexedDbPersistence, getFirestore } from 'firebase/firestore';

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

declare global {
  interface Window {
    __FIREBASE_CONFIG__?: Partial<FirebaseConfig>;
  }
}

function readEnv(name: string): string {
  const value = import.meta.env?.[name as keyof ImportMetaEnv];
  return typeof value === 'string' ? value.trim() : '';
}

function readRuntimeConfig(): Partial<FirebaseConfig> {
  if (typeof window === 'undefined') return {};
  return window.__FIREBASE_CONFIG__ ?? {};
}

function buildFirebaseConfig(): FirebaseConfig | null {
  const runtime = readRuntimeConfig();
  const config = {
    apiKey: runtime.apiKey || readEnv('VITE_FIREBASE_API_KEY'),
    authDomain: runtime.authDomain || readEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: runtime.projectId || readEnv('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: runtime.storageBucket || readEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: runtime.messagingSenderId || readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: runtime.appId || readEnv('VITE_FIREBASE_APP_ID'),
  };

  const hasMinimumConfig = Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
  return hasMinimumConfig ? (config as FirebaseConfig) : null;
}

const firebaseConfig = buildFirebaseConfig();

let app: FirebaseApp;
if (firebaseConfig) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
} else {
  // Do not crash the whole app at module load time. A clear console message is safer than a blank screen.
  // The app can still render, and any Firebase-dependent feature will visibly fail only when used.
  console.error(
    'Firebase configuration is missing. Provide VITE_FIREBASE_* env vars at build time or set window.__FIREBASE_CONFIG__ before the app loads.',
  );
  app = getApps().length ? getApp() : initializeApp({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  });
}

export const isFirebaseConfigured = Boolean(firebaseConfig);
export { firebaseConfig };
export const auth = getAuth(app);
export const db = getFirestore(app);

void enableIndexedDbPersistence(db).catch(() => {
  // Best-effort cache only. Multi-tab/incognito restrictions are expected on some browsers.
});
