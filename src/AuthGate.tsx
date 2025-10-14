// src/AuthGate.tsx
// Authentication gatekeeper component for Vibes
// This component handles all user authentication including Google OAuth and email/password
// Only renders the main app content when user is successfully authenticated

import { useEffect, useState } from "react";
import { auth, googleProvider } from "./firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getRedirectResult,
  signInWithRedirect,
  type User,
  type AuthError,
} from "firebase/auth";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  // Authentication state management
  const [user, setUser] = useState<User | null>(null);           // Current logged-in user
  const [loading, setLoading] = useState(true);                  // Initial auth state loading
  const [isSigningIn, setIsSigningIn] = useState(false);         // Loading state for sign-in attempts

  // Email/password form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Error handling with user-friendly messages
  const [error, setError] = useState<string | null>(null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  // Firebase Auth State Observer
  // This effect runs once when component mounts and listens for authentication changes
  // onAuthStateChanged automatically fires when user signs in/out/refreshes page
  useEffect(() => {
    console.log("[AuthGate] 🔄 Setting up auth state listener...");

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("[AuthGate] 👤 Auth state changed:", firebaseUser?.uid ? `User ${firebaseUser.uid}` : "No user");

      // Update our React state with the current user
      setUser(firebaseUser);

      // Stop showing loading spinner now that we know the auth state
      setLoading(false);

      // Clear any previous errors when auth state changes
      setError(null);
    });

    // Cleanup function: stop listening when component unmounts
    return () => {
      console.log("[AuthGate] 🛑 Cleaning up auth listener");
      unsubscribe();
    };
  }, []); // Empty dependency array = run once on mount

  // Handle Google OAuth Redirect Results
  // If user comes back from Google OAuth redirect, this processes the result
  useEffect(() => {
    console.log("[AuthGate] 🔍 Checking for OAuth redirect result...");

    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("[AuthGate] ✅ OAuth redirect successful:", result.user.email);
        }
      })
      .catch((error) => {
        console.warn("[AuthGate] ⚠️ OAuth redirect error:", error.message);
        setError(getErrorMessage(error));
      });
  }, []); // Run once on mount to check for redirect results

  // Convert Firebase auth errors into user-friendly messages
  // Firebase errors can be cryptic, so we translate them into plain English
  const getErrorMessage = (error: AuthError | any): string => {
    const code = error?.code || '';

    // Log detailed error information for debugging
    console.error("[AuthGate] 🔍 Detailed error info:", {
      code: error?.code,
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      fullError: error
    });

    // Chrome/Browser security errors
    if (code === 'auth/internal-error') {
      return 'Browser security restriction. Try using a different browser or incognito mode.';
    }
    if (code === 'auth/cors-unsupported') {
      return 'Browser security policy blocking authentication. Try a different browser.';
    }
    if (code === 'auth/unauthorized-domain') {
      return 'This domain is not authorized for authentication. Contact support.';
    }

    // Google OAuth specific errors
    if (code === 'auth/popup-closed-by-user') {
      return 'Sign-in was cancelled. Please try again.';
    }
    if (code === 'auth/popup-blocked') {
      return 'Pop-up was blocked by your browser. Please allow pop-ups and try again.';
    }
    if (code === 'auth/cancelled-popup-request') {
      return 'Sign-in was cancelled. Please try again.';
    }

    // Email/password errors
    if (code === 'auth/user-not-found') {
      return 'No account found with this email. We\'ll create a new account for you.';
    }
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      return 'Incorrect password. Please try again.';
    }
    if (code === 'auth/email-already-in-use') {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (code === 'auth/weak-password') {
      return 'Password should be at least 6 characters long.';
    }
    if (code === 'auth/invalid-email') {
      return 'Please enter a valid email address.';
    }

    // Network and general errors
    if (code === 'auth/network-request-failed') {
      return 'Network error. Please check your internet connection and try again.';
    }
    if (code === 'auth/too-many-requests') {
      return 'Too many failed attempts. Please wait a moment and try again.';
    }

    // Development/localhost specific errors
    if (error?.message?.includes('localhost') || error?.message?.includes('insecure')) {
      return 'Localhost security restriction. Authentication should work on production domain.';
    }

    // Fallback with more detailed info for debugging
    const fallbackMessage = error?.message || 'Something went wrong. Please try again.';

    // In development, show more details
    if (window.location.hostname === 'localhost') {
      return `${fallbackMessage} (Debug: ${code})`;
    }

    return fallbackMessage;
  };

  // Google OAuth Sign-In (Popup Method)
  // Opens a pop-up window for Google sign-in - works well on desktop
  const handleGoogleSignInPopup = async () => {
    setIsSigningIn(true);
    setError(null);

    try {
      console.log("[AuthGate] 🚀 Starting Google sign-in (popup)...");

      const result = await signInWithPopup(auth, googleProvider);

      console.log("[AuthGate] ✅ Google sign-in successful:", result.user.email);
      console.log("[AuthGate] 👤 User profile:", {
        name: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL
      });

    } catch (error: any) {
      console.error("[AuthGate] ❌ Google sign-in failed:", error);
      setError(getErrorMessage(error));
    } finally {
      setIsSigningIn(false);
    }
  };

  // Google OAuth Sign-In (Redirect Method)
  // Redirects to Google sign-in page - better for mobile devices
  const handleGoogleSignInRedirect = async () => {
    setIsSigningIn(true);
    setError(null);

    try {
      console.log("[AuthGate] 🔄 Starting Google sign-in (redirect)...");

      // This will redirect the page to Google's sign-in
      // User will come back to our app after signing in
      await signInWithRedirect(auth, googleProvider);

    } catch (error: any) {
      console.error("[AuthGate] ❌ Google redirect failed:", error);
      setError(getErrorMessage(error));
      setIsSigningIn(false);
    }
    // Note: don't set setIsSigningIn(false) here since page will redirect
  };

  // Email/Password Authentication
  // Handles both sign-in and account creation in one function
  const handleEmailPasswordAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSigningIn(true);
    setError(null);

    try {
      console.log("[AuthGate] 📧 Attempting email/password authentication...");
      console.log("[AuthGate] 🌐 Environment:", {
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        userAgent: navigator.userAgent
      });

      // First, try to sign in with existing account
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("[AuthGate] ✅ Email sign-in successful:", result.user.email);

    } catch (signInError: any) {
      console.log("[AuthGate] 🔄 Sign-in failed, trying account creation...");

      // Check for Chrome localhost issues and provide helpful guidance
      if (signInError.code === 'auth/internal-error' && window.location.hostname === 'localhost') {
        console.warn("[AuthGate] 🚨 Chrome localhost security restriction detected");
        setError('Chrome blocks localhost authentication. Try: (1) Use different browser, (2) Use incognito mode, or (3) Wait for production deployment.');
        setIsSigningIn(false);
        setIsCreatingAccount(false);
        return;
      }

      // Firebase now uses 'auth/invalid-credential' for both user-not-found and wrong-password
      // So we'll try creating an account for invalid-credential errors too
      if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
        try {
          setIsCreatingAccount(true);
          console.log("[AuthGate] 🆕 Attempting to create new account...");
          const createResult = await createUserWithEmailAndPassword(auth, email, password);
          console.log("[AuthGate] ✅ Account creation successful:", createResult.user.email);

        } catch (createError: any) {
          console.error("[AuthGate] ❌ Account creation failed:", createError);

          // Check for Chrome localhost issues in account creation too
          if (createError.code === 'auth/internal-error' && window.location.hostname === 'localhost') {
            console.warn("[AuthGate] 🚨 Chrome localhost security restriction in account creation");
            setError('Chrome blocks localhost authentication. This will work on the production domain.');
            setIsSigningIn(false);
            setIsCreatingAccount(false);
            return;
          }

          // If account creation fails because email already exists,
          // it means the original sign-in failed due to wrong password
          if (createError.code === 'auth/email-already-in-use') {
            setError('Incorrect password. Please try again.');
          } else {
            setError(getErrorMessage(createError));
          }
        }
      } else {
        // Sign-in failed for other reasons (invalid email format, network, etc.)
        console.error("[AuthGate] ❌ Email sign-in failed:", signInError);
        setError(getErrorMessage(signInError));
      }
    } finally {
      setIsSigningIn(false);
      setIsCreatingAccount(false);
    }
  };

  // Clear form and errors when user starts typing
  const clearErrorOnInput = () => {
    if (error) setError(null);
  };

  // Loading Screen - shown while checking authentication state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '18px',
            color: '#64748b',
            marginBottom: '12px'
          }}>
            ✨ Loading Vibes...
          </div>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #e2e8f0',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }} />
        </div>
      </div>
    );
  }

  // Sign-In Screen - shown when no user is authenticated
  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 8px 0'
            }}>
              ✨ Vibes
            </h1>
            <p style={{
              color: '#6b7280',
              margin: 0,
              fontSize: '14px'
            }}>
              Sign in to create polls and gauge the vibe
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              color: '#991b1b',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* Google Sign-In Buttons */}
          <div style={{ marginBottom: '24px' }}>
            <button
              onClick={handleGoogleSignInPopup}
              disabled={isSigningIn}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                background: 'white',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isSigningIn ? 'not-allowed' : 'pointer',
                opacity: isSigningIn ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                if (!isSigningIn) {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.background = '#f9fafb';
                }
              }}
              onMouseOut={(e) => {
                if (!isSigningIn) {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.background = 'white';
                }
              }}
            >
              🔵 Continue with Google {isSigningIn ? '(popup)...' : '(popup)'}
            </button>

            <button
              onClick={handleGoogleSignInRedirect}
              disabled={isSigningIn}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                background: 'white',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isSigningIn ? 'not-allowed' : 'pointer',
                opacity: isSigningIn ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                if (!isSigningIn) {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.background = '#f9fafb';
                }
              }}
              onMouseOut={(e) => {
                if (!isSigningIn) {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.background = 'white';
                }
              }}
            >
              📱 Continue with Google (mobile)
            </button>
          </div>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '24px 0'
          }}>
            <div style={{
              flex: 1,
              height: '1px',
              background: '#e5e7eb'
            }} />
            <span style={{
              padding: '0 16px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              or
            </span>
            <div style={{
              flex: 1,
              height: '1px',
              background: '#e5e7eb'
            }} />
          </div>

          {/* Email/Password Form */}
          <div style={{ marginBottom: '24px' }}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearErrorOnInput();
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleEmailPasswordAuth()}
              disabled={isSigningIn}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              autoComplete="email"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearErrorOnInput();
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleEmailPasswordAuth()}
              disabled={isSigningIn}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              autoComplete="current-password"
            />

            <button
              onClick={handleEmailPasswordAuth}
              disabled={isSigningIn || !email.trim() || !password.trim()}
              style={{
                width: '100%',
                padding: '12px',
                background: isSigningIn || !email.trim() || !password.trim()
                  ? '#9ca3af'
                  : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isSigningIn || !email.trim() || !password.trim()
                  ? 'not-allowed'
                  : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {isSigningIn
                ? (isCreatingAccount ? '🔄 Creating account...' : '🔄 Signing in...')
                : '🔑 Sign in / Create account'
              }
            </button>
          </div>

          {/* Help Text */}
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            textAlign: 'center',
            margin: 0,
            lineHeight: '1.4'
          }}>
            New users will automatically get an account created.
            <br />
            All data is securely stored with Firebase.
            {window.location.hostname === 'localhost' && (
              <>
                <br />
                <span style={{ color: '#d97706', fontWeight: '500' }}>
                  ⚠️ Email auth may have Chrome localhost restrictions. Google popup works perfectly!
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    );
  }

  // Authenticated App Shell - shown when user is signed in
  // This renders the main app content inside a clean layout with user info
  return (
    <div>
      {/* Clean header with user info and sign-out button */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        background: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
        fontSize: "14px"
      }}>
        <div style={{ color: "#64748b" }}>
          Welcome back, <strong style={{ color: "#1e293b" }}>
            {user.displayName || user.email || "User"}
          </strong>
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt="Profile"
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                marginLeft: "8px",
                verticalAlign: "middle"
              }}
            />
          )}
        </div>
        <button
          className="btn"
          onClick={() => {
            console.log("[AuthGate] 👋 User signing out...");
            signOut(auth);
          }}
          style={{
            padding: "6px 12px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "12px",
            cursor: "pointer"
          }}
        >
          Sign out
        </button>
      </div>

      {/* Main app content goes here */}
      {children}
    </div>
  );
}
