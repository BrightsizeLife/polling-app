// src/db.ts
// Database helper functions for Firestore operations

import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// Type definition for user context data
export interface UserContext {
  age?: number | null;
  city?: string | null;
}

/**
 * Save user context data to Firestore
 */
export async function saveContext(uid: string, data: UserContext): Promise<void> {
  const contextRef = doc(db, "context", uid);
  await setDoc(contextRef, data, { merge: true });
  console.log("[db] ✅ Context saved successfully for user:", uid);
}

/**
 * Mark user's onboarding as complete
 */
export async function markOnboardingDone(uid: string): Promise<void> {
  const metaRef = doc(db, "users", uid, "meta", "main");
  await setDoc(metaRef, { onboardingDone: true }, { merge: true });
  console.log("[db] ✅ Onboarding marked complete for user:", uid);
}
