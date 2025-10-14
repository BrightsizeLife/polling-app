// src/db.ts
// Database utility functions for Vibes polling app
// Handles all Firestore operations for questions and responses

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

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
 *
 * @param uid - The user ID of the question creator
 * @param payload - Question data (text, type, and type-specific fields)
 * @returns Promise with the document reference
 *
 * @example
 * // Single choice question
 * await createQuestion('user123', {
 *   text: 'What is your favorite color?',
 *   type: 'single',
 *   options: ['Red', 'Blue', 'Green']
 * });
 *
 * @example
 * // Rating question
 * await createQuestion('user123', {
 *   text: 'How would you rate this movie?',
 *   type: 'rating',
 *   min: 1,
 *   max: 5
 * });
 */
export async function createQuestion(
  uid: string,
  payload: Omit<Question, 'createdBy' | 'createdAt'>
): Promise<string> {
  // Validate that text is provided
  if (!payload.text || payload.text.trim().length === 0) {
    throw new Error('Question text is required');
  }

  // Validate type-specific requirements
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

  // Build the question document
  const question: Question = {
    text: payload.text.trim(),
    type: payload.type,
    createdBy: uid,
    createdAt: serverTimestamp(),
    ...(payload.options && { options: payload.options }),
    ...(payload.min !== undefined && { min: payload.min }),
    ...(payload.max !== undefined && { max: payload.max })
  };

  // Add to Firestore /questions collection
  const docRef = await addDoc(collection(db, 'questions'), question);

  console.log('[db] ✅ Question created:', docRef.id);
  return docRef.id;
}
