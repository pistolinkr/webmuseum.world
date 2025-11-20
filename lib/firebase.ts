// Firebase configuration
// Load from environment variables
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAuth, Auth } from 'firebase/auth';
import { getFunctions, Functions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate Firebase config
const isFirebaseConfigured = 
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId;

// Initialize Firebase
let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let auth: Auth | undefined;
let functionsInstance: Functions | undefined;

if (isFirebaseConfigured) {
  try {
    if (typeof window !== 'undefined') {
      // Client-side initialization
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
        console.log('✅ Firebase: Initialized on client-side');
        console.log('📋 Firebase Config:', {
          projectId: firebaseConfig.projectId,
          authDomain: firebaseConfig.authDomain,
          apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'missing'
        });
      } else {
        app = getApps()[0];
        console.log('✅ Firebase: Using existing app instance');
      }
      db = getFirestore(app);
      storage = getStorage(app);
      auth = getAuth(app);
      functionsInstance = getFunctions(app, process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION || undefined);
      
      // Enable offline persistence for Firestore (client-side only)
      enableIndexedDbPersistence(db)
        .then(() => {
          console.log('✅ Firebase: Offline persistence enabled');
        })
        .catch((err) => {
          if (err.code === 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab at a time
            console.warn('⚠️ Firebase: Offline persistence already enabled in another tab');
          } else if (err.code === 'unimplemented') {
            // Browser doesn't support persistence
            console.warn('⚠️ Firebase: Browser does not support offline persistence');
          } else {
            console.warn('⚠️ Firebase: Failed to enable offline persistence:', err);
          }
        });
    } else {
      // Server-side initialization
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
        console.log('✅ Firebase: Initialized on server-side');
        console.log('📋 Firebase Config:', {
          projectId: firebaseConfig.projectId,
          authDomain: firebaseConfig.authDomain
        });
      } else {
        app = getApps()[0];
        console.log('✅ Firebase: Using existing app instance (server)');
      }
      if (app) {
        db = getFirestore(app);
      }
      // Storage and Auth are client-side only
    }
  } catch (error: any) {
    console.error('❌ Firebase: Initialization error:', error);
    console.error('❌ Firebase: Error details:', {
      code: error?.code,
      message: error?.message,
      stack: error?.stack
    });
  }
} else {
  console.warn('⚠️ Firebase: Configuration is incomplete. Please check your .env.local file.');
  console.warn('⚠️ Missing config:', {
    apiKey: !firebaseConfig.apiKey,
    authDomain: !firebaseConfig.authDomain,
    projectId: !firebaseConfig.projectId,
    storageBucket: !firebaseConfig.storageBucket,
    messagingSenderId: !firebaseConfig.messagingSenderId,
    appId: !firebaseConfig.appId
  });
  console.warn('⚠️ Firebase: Falling back to mock data');
}

export { app, db, storage, auth, functionsInstance as functions };





