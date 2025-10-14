// src/db.ts
// Database utility functions for Vibes polling app
// Handles all Firestore operations for questions, responses, and user context

import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// ============================================================================
// QUESTIONS
// ============================================================================

// Question types supported by the app
export type QuestionType = 'single' | 'rating' | 'numeric' | 'date';

// Base question structure
export interface Question {
  text: string;
  type: QuestionType;
  createdBy: string;  // User UID who created the question
  createdAt: any;     // Firestore server timestamp
  options?: string[]; // For 'single' type questions
  min?: number;       // For 'rating' and 'numeric' types
  max?: number;       // For 'rating' and 'numeric' types
}

/**
 * Creates a new question in Firestore
 */
export async function createQuestion(
  uid: string,
  payload: Omit<Question, 'createdBy' | 'createdAt'>
): Promise<string> {
  if (!payload.text || payload.text.trim().length === 0) {
    throw new Error('Question text is required');
  }

  if (payload.type === 'single') {
    if (!payload.options || payload.options.length === 0) {
      throw new Error('Options are required for single choice questions');
    }
  }

  if (payload.type === 'rating' || payload.type === 'numeric') {
    if (payload.min === undefined || payload.max === undefined) {
      throw new Error('Min and max values are required for rating/numeric questions');
    }
    if (payload.min >= payload.max) {
      throw new Error('Max value must be greater than min value');
    }
  }

  const question: Question = {
    text: payload.text.trim(),
    type: payload.type,
    createdBy: uid,
    createdAt: serverTimestamp(),
    ...(payload.options && { options: payload.options }),
    ...(payload.min !== undefined && { min: payload.min }),
    ...(payload.max !== undefined && { max: payload.max })
  };

  const docRef = await addDoc(collection(db, 'questions'), question);
  console.log('[db] ✅ Question created:', docRef.id);
  return docRef.id;
}

// ============================================================================
// USER CONTEXT & ONBOARDING
// ============================================================================

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
