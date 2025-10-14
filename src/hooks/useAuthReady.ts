// src/hooks/useAuthReady.ts
// Tiny hook to prevent UI flicker while Firebase Auth initializes
// Returns true once we know if user is signed in or not

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

/**
 * Hook that returns true once Firebase Auth has finished initializing.
 *
 * This prevents UI flicker during the brief moment when auth state is unknown.
 * Use this in components that need to show different UI for authed/unauthed users.
 *
 * @returns {boolean} true when auth state is known, false while still loading
 *
 * @example
 * const authReady = useAuthReady();
 * if (!authReady) return <LoadingSpinner />;
 * return <YourComponent />;
 */
export function useAuthReady(): boolean {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    // onAuthStateChanged fires immediately with current state
    // then continues listening for changes
    const unsubscribe = onAuthStateChanged(auth, () => {
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  return authReady;
}
