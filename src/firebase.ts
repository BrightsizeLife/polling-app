// src/firebase.ts
// Firebase configuration and initialization for Daily Task Manager
// This file sets up Firebase Auth, Firestore, and Google OAuth provider
import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase project configuration using Vite environment variables
// These values come from your Firebase project settings
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase app and services
export const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);          // Authentication service
export const db   = getFirestore(app);     // Firestore database service

// Configure Google OAuth provider with enhanced settings
// This provider will be used for "Sign in with Google" functionality
export const googleProvider = new GoogleAuthProvider();

// Request additional Google profile information
// - profile: Basic profile info (name, picture)
// - email: User's email address (already included by default)
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Configure custom OAuth parameters for better user experience
googleProvider.setCustomParameters({
  // Show account selection every time (allows switching Google accounts)
  prompt: 'select_account',
  // Optional: Pre-fill the login hint if you have user's email
  // login_hint: 'user@example.com' (would be set dynamically)
});

// Configure authentication persistence
// This keeps users signed in even after browser refresh/restart
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn("⚠️ Auth persistence setup failed (fallback to session):", error?.message || error);
});

console.log("✅ Firebase initialized successfully");
console.log("📱 Project ID:", firebaseConfig.projectId);
console.log("🔐 Google OAuth provider configured with enhanced scopes");
