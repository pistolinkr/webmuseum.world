'use client';

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions as cloudFunctions } from '@/lib/firebase';
import { User } from '@/types';
import { getUser, createUser, updateUser } from '@/lib/firestore';
import { registerPasskey as registerPasskeyWebAuthn, authenticateWithPasskey, isWebAuthnSupported } from '@/lib/webauthn';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  // Social authentication
  signInWithGoogle: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  // Email authentication
  sendMagicLink: (email: string) => Promise<void>;
  signInWithMagicLink: (email: string, emailLink: string) => Promise<void>;
  isMagicLink: (emailLink: string) => boolean;
  checkEmailExists: (email: string) => Promise<boolean>;
  // Email code authentication
  sendEmailCode: (email: string) => Promise<void>;
  signUpWithEmailCode: (email: string, code: string) => Promise<void>;
  // Passkey authentication
  registerPasskey: (deviceName?: string) => Promise<void>;
  signInWithPasskey: (email?: string) => Promise<void>;
  isPasskeySupported: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const loadedUserIdRef = useRef<string | null>(null);

  // Load user data from Firestore when auth state changes
  useEffect(() => {
    if (!auth) {
      console.warn('⚠️ Firebase Auth is not initialized');
      setLoading(false);
      setInitialized(true);
      return;
    }

    // Check current auth state immediately (synchronous check) - this is fast!
    const currentAuthUser = auth.currentUser;
    if (currentAuthUser && !initialized) {
      // If user is already authenticated, set user immediately to reduce loading time
      setCurrentUser(currentAuthUser);
      setLoading(false); // Set loading to false immediately - don't wait for Firestore
      setInitialized(true);
      loadedUserIdRef.current = currentAuthUser.uid;
      
      // Load user data in background (non-blocking)
      getUser(currentAuthUser.uid)
        .then((userDoc) => {
          if (userDoc) {
            console.log('✅ User data loaded:', userDoc);
            setUserData(userDoc);
          } else {
            console.warn('⚠️ User document not found in Firestore, will be created on first update');
            // Create a minimal userData object from Firebase Auth
            setUserData({
              id: currentAuthUser.uid,
              email: currentAuthUser.email || '',
              name: currentAuthUser.displayName || undefined,
              displayName: currentAuthUser.displayName || undefined,
              avatarUrl: currentAuthUser.photoURL || undefined,
            });
          }
        })
        .catch((error) => {
          console.error('Error loading user data:', error);
          // Even if loading fails, create minimal userData from Auth
          setUserData({
            id: currentAuthUser.uid,
            email: currentAuthUser.email || '',
            name: currentAuthUser.displayName || undefined,
            displayName: currentAuthUser.displayName || undefined,
            avatarUrl: currentAuthUser.photoURL || undefined,
          });
        });
    } else if (!currentAuthUser && !initialized) {
      // No user, set loading to false immediately
      setLoading(false);
      setInitialized(true);
    }

    // Set a shorter timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (!initialized) {
        console.warn('⚠️ Auth loading timeout - setting loading to false');
        setLoading(false);
        setInitialized(true);
      }
    }, 1500); // Reduced to 1.5 seconds

    // Handle redirect result (for social login) - don't block initial render
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          handleSocialSignIn(result.user);
        }
      })
      .catch((error) => {
        console.error('Error handling redirect result:', error);
      });

    let isMounted = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!isMounted) return;
        
        try {
          setCurrentUser(user);
          
          if (user) {
            // Only load user data if we haven't loaded it yet or if user changed
            if (loadedUserIdRef.current !== user.uid) {
              try {
                const userDoc = await getUser(user.uid);
                if (userDoc) {
                  setUserData(userDoc);
                  loadedUserIdRef.current = user.uid;
                } else {
                  // Create user document if it doesn't exist (for social login)
                  await handleSocialSignIn(user);
                  loadedUserIdRef.current = user.uid;
                }
              } catch (error) {
                console.error('Error loading user data:', error);
              }
            }
          } else {
            setUserData(null);
            loadedUserIdRef.current = null;
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error);
        } finally {
          if (isMounted) {
            setLoading(false);
            setInitialized(true);
            clearTimeout(loadingTimeout);
          }
        }
      },
      (error) => {
        console.error('❌ Auth state change error:', error);
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
          clearTimeout(loadingTimeout);
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, [initialized]);

  // Helper function to handle social sign-in and create user document
  const handleSocialSignIn = async (user: FirebaseUser) => {
    try {
      const userDoc = await getUser(user.uid);
      if (!userDoc) {
        // Create user document in Firestore
        const newUser: Omit<User, 'id'> = {
          email: user.email || '',
          name: user.displayName || undefined,
          displayName: user.displayName || undefined,
          avatarUrl: user.photoURL || undefined,
          createdExhibitions: [],
          createdArtworks: [],
          bookmarkedExhibitions: [],
        };
        const userId = await createUser(newUser);
        if (userId) {
          const createdUser = await getUser(userId);
          if (createdUser) {
            setUserData(createdUser);
          }
        }
      } else {
        setUserData(userDoc);
      }
    } catch (error) {
      console.error('Error handling social sign-in:', error);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    // Wait for auth to be initialized (with retries)
    let retries = 0;
    const maxRetries = 10;
    while (!auth && retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }
    
    if (!auth) {
      const error = new Error('Firebase Auth is not initialized. Please check your Firebase configuration and refresh the page.');
      console.error('❌ Google Sign In Error: Firebase Auth not initialized after', maxRetries, 'retries');
      throw error;
    }

    try {
      const provider = new GoogleAuthProvider();
      console.log('🔵 Starting Google sign-in with popup...');
      console.log('🔵 Auth instance:', auth ? 'available' : 'missing');
      console.log('🔵 Auth app:', auth?.app?.name || 'unknown');
      console.log('🔵 Current URL:', typeof window !== 'undefined' ? window.location.href : 'N/A');
      
      // Note: We'll let Firebase handle popup blocking detection
      // If popup fails, we'll catch the error and fallback to redirect
      
      // Use popup for better UX
      console.log('🔵 Calling signInWithPopup...');
      const result = await signInWithPopup(auth, provider);
      console.log('✅ Google popup successful, handling sign-in...');
      await handleSocialSignIn(result.user);
    } catch (error: any) {
      console.error('❌ Google Sign In Error:', error);
      console.error('❌ Error Code:', error?.code);
      console.error('❌ Error Message:', error?.message);
      console.error('❌ Error Stack:', error?.stack);
      
      // Don't show error for user cancellation
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        console.log('ℹ️ User closed the popup');
        return; // Silently return, don't show error
      }
      
      // If popup is blocked, try redirect
      if (error.code === 'auth/popup-blocked') {
        console.log('🔄 Popup blocked, trying redirect...');
        try {
          const provider = new GoogleAuthProvider();
          await signInWithRedirect(auth, provider);
          return; // Redirect will navigate away, so don't throw error
        } catch (redirectError: any) {
          console.error('❌ Redirect also failed:', redirectError);
          throw new Error('Popup was blocked and redirect failed. Please allow popups for this site or try again.');
        }
      }
      
      // Handle network errors
      if (error.code === 'auth/network-request-failed') {
        console.error('❌ Network error during sign-in');
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      // Handle auth domain mismatch
      if (error.code === 'auth/unauthorized-domain') {
        console.error('❌ Unauthorized domain');
        throw new Error('This domain is not authorized. Please contact support.');
      }
      
      // Re-throw with more context
      const enhancedError = new Error(error.message || 'Failed to sign in with Google. Please try again.');
      (enhancedError as any).code = error.code;
      throw enhancedError;
    }
  };

  // Sign in with Microsoft
  const signInWithMicrosoft = async () => {
    // Wait for auth to be initialized (with retries)
    let retries = 0;
    const maxRetries = 10;
    while (!auth && retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }
    
    if (!auth) {
      throw new Error('Firebase Auth is not initialized. Please check your Firebase configuration and refresh the page.');
    }

    try {
      const provider = new OAuthProvider('microsoft.com');
      console.log('🔵 Starting Microsoft sign-in with popup...');
      // Use popup for better UX
      const result = await signInWithPopup(auth, provider);
      console.log('✅ Microsoft popup successful, handling sign-in...');
      await handleSocialSignIn(result.user);
    } catch (error: any) {
      console.error('❌ Microsoft Sign In Error:', error);
      console.error('❌ Error Code:', error?.code);
      console.error('❌ Error Message:', error?.message);
      
      // Don't show error for user cancellation
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        console.log('ℹ️ User closed the popup');
        return;
      }
      
      // If popup is blocked, try redirect
      if (error.code === 'auth/popup-blocked') {
        console.log('🔄 Popup blocked, trying redirect...');
        try {
          const provider = new OAuthProvider('microsoft.com');
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectError: any) {
          console.error('❌ Redirect also failed:', redirectError);
          throw new Error('Popup was blocked and redirect failed. Please allow popups for this site.');
        }
      }
      
      // Handle network errors
      if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      throw error;
    }
  };

  // Sign in with Apple
  const signInWithApple = async () => {
    // Wait for auth to be initialized (with retries)
    let retries = 0;
    const maxRetries = 10;
    while (!auth && retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }
    
    if (!auth) {
      throw new Error('Firebase Auth is not initialized. Please check your Firebase configuration and refresh the page.');
    }

    try {
      const provider = new OAuthProvider('apple.com');
      console.log('🔵 Starting Apple sign-in with popup...');
      // Use popup for better UX
      const result = await signInWithPopup(auth, provider);
      console.log('✅ Apple popup successful, handling sign-in...');
      await handleSocialSignIn(result.user);
    } catch (error: any) {
      console.error('❌ Apple Sign In Error:', error);
      console.error('❌ Error Code:', error?.code);
      console.error('❌ Error Message:', error?.message);
      
      // Don't show error for user cancellation
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        console.log('ℹ️ User closed the popup');
        return;
      }
      
      // If popup is blocked, try redirect
      if (error.code === 'auth/popup-blocked') {
        console.log('🔄 Popup blocked, trying redirect...');
        try {
          const provider = new OAuthProvider('apple.com');
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectError: any) {
          console.error('❌ Redirect also failed:', redirectError);
          throw new Error('Popup was blocked and redirect failed. Please allow popups for this site.');
        }
      }
      
      // Handle network errors
      if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      throw error;
    }
  };

  // Sign in with GitHub
  const signInWithGitHub = async () => {
    // Wait for auth to be initialized (with retries)
    let retries = 0;
    const maxRetries = 10;
    while (!auth && retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }
    
    if (!auth) {
      throw new Error('Firebase Auth is not initialized. Please check your Firebase configuration and refresh the page.');
    }

    try {
      const provider = new GithubAuthProvider();
      console.log('🔵 Starting GitHub sign-in with popup...');
      // Use popup for better UX
      const result = await signInWithPopup(auth, provider);
      console.log('✅ GitHub popup successful, handling sign-in...');
      await handleSocialSignIn(result.user);
    } catch (error: any) {
      console.error('❌ GitHub Sign In Error:', error);
      console.error('❌ Error Code:', error?.code);
      console.error('❌ Error Message:', error?.message);
      
      // Don't show error for user cancellation
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        console.log('ℹ️ User closed the popup');
        return;
      }
      
      // If popup is blocked, try redirect
      if (error.code === 'auth/popup-blocked') {
        console.log('🔄 Popup blocked, trying redirect...');
        try {
          const provider = new GithubAuthProvider();
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectError: any) {
          console.error('❌ Redirect also failed:', redirectError);
          throw new Error('Popup was blocked and redirect failed. Please allow popups for this site.');
        }
      }
      
      // Handle network errors
      if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      throw error;
    }
  };

  // Send magic link to email
  const sendMagicLink = async (email: string) => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    
    const actionCodeSettings = {
      url: `${window.location.origin}/auth/login?email=${encodeURIComponent(email)}`,
      handleCodeInApp: true,
    };
    
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email.toLowerCase());
      return methods.length > 0;
    } catch (err) {
      console.error('Error checking sign-in methods for email', err);
      throw err;
    }
  };

  // Sign in with magic link
  const signInWithMagicLink = async (email: string, emailLink: string) => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    
    const userCredential = await signInWithEmailLink(auth, email, emailLink);
    
    // Create user document if it doesn't exist
    if (userCredential.user) {
      await handleSocialSignIn(userCredential.user);
    }
  };

  // Check if current link is a magic link
  const isMagicLink = (emailLink: string): boolean => {
    if (!auth) return false;
    return isSignInWithEmailLink(auth, emailLink);
  };

  // Send email verification code
  const sendEmailCode = async (email: string) => {
    if (!cloudFunctions) {
      throw new Error('Firebase Functions is not initialized');
    }
    const callable = httpsCallable(cloudFunctions, 'sendVerificationCode');
    const result = await callable({ email: email.toLowerCase().trim() });
    const data = result.data as { success?: boolean };
    if (!data?.success) {
      throw new Error('Failed to send verification code');
    }
  };

  // Sign up with email code
  const signUpWithEmailCode = async (email: string, code: string) => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }

    if (!cloudFunctions) {
      throw new Error('Firebase Functions is not initialized');
    }

    // First verify the code via Cloud Function
    try {
      const verifyCallable = httpsCallable(cloudFunctions, 'verifyEmailCode');
      const verifyResult = await verifyCallable({ email: email.toLowerCase().trim(), code: code.toUpperCase().trim() });
      const verifyData = verifyResult.data as { success?: boolean };
      if (!verifyData?.success) {
        throw new Error('Failed to verify code');
      }
    } catch (error: any) {
      const message = error?.message || 'Failed to verify code';
      throw new Error(message);
    }

    // Code is verified, now create account
    // Generate a random password (user won't need to remember it)
    const randomPassword = Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16) + 'A1!';
    
    try {
      // Create account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.toLowerCase(),
        randomPassword
      );

      // Create user document in Firestore
      await handleSocialSignIn(userCredential.user);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        // Account already exists, try to sign in
        try {
          const signInCredential = await signInWithEmailAndPassword(
            auth,
            email.toLowerCase(),
            randomPassword
          );
          await handleSocialSignIn(signInCredential.user);
        } catch (signInError: any) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
      } else {
        throw error;
      }
    }
  };

  const signOut = async () => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    await firebaseSignOut(auth);
    setUserData(null);
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!currentUser || !auth) {
      throw new Error('User not authenticated');
    }
    
    console.log('updateUserProfile: Starting update for user', currentUser.uid);
    console.log('updateUserProfile: Updates to apply', updates);
    
    // Update Firestore user document
    // updateUser now throws on error, so we don't need to check return value
    await updateUser(currentUser.uid, updates);
    console.log('updateUserProfile: Firestore update completed successfully');
    
    // Update Firebase Auth profile if displayName or photoURL changed
    const shouldUpdateAuthProfile = Boolean(updates.displayName || updates.avatarUrl);
    if (shouldUpdateAuthProfile) {
      const isOnline = typeof navigator === 'undefined' ? true : navigator.onLine;
      if (!isOnline) {
        console.warn('updateUserProfile: Skipping Firebase Auth profile update because device is offline');
      } else {
        console.log('updateUserProfile: Updating Firebase Auth profile');
        try {
          const profilePromise = updateProfile(currentUser, {
            displayName: updates.displayName || currentUser.displayName || undefined,
            photoURL: updates.avatarUrl || currentUser.photoURL || undefined,
          });
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Firebase Auth profile update timed out')), 8000);
          });
          await Promise.race([profilePromise, timeoutPromise]);
          console.log('updateUserProfile: Firebase Auth profile updated');
        } catch (error: any) {
          console.error('updateUserProfile: Error updating Auth profile', error);
          // Don't throw - Firestore update succeeded, Auth update is secondary
        }
      }
    }
    
    // Update userData optimistically with the updates we just applied
    // This ensures UI updates immediately even if getUser fails (e.g., offline)
    console.log('updateUserProfile: Updating userData optimistically');
    if (userData) {
      const updatedUserData = {
        ...userData,
        ...updates,
      };
      console.log('updateUserProfile: UserData updated optimistically', updatedUserData);
      setUserData(updatedUserData);
    } else {
      // If userData doesn't exist, create it from currentUser + updates
      const newUserData: User = {
        id: currentUser.uid,
        email: currentUser.email || '',
        ...updates,
        name: updates.displayName || currentUser.displayName || undefined,
        displayName: updates.displayName || currentUser.displayName || undefined,
        avatarUrl: updates.avatarUrl || currentUser.photoURL || undefined,
      };
      console.log('updateUserProfile: Created new userData', newUserData);
      setUserData(newUserData);
    }
    
    // Try to reload from Firestore in background (non-blocking)
    console.log('updateUserProfile: Reloading user data from Firestore (background)');
    getUser(currentUser.uid)
      .then((updatedUser) => {
        if (updatedUser) {
          console.log('updateUserProfile: User data reloaded from Firestore', updatedUser);
          setUserData(updatedUser);
        } else {
          console.warn('updateUserProfile: User data not found in Firestore, using optimistic update');
        }
      })
      .catch((error: any) => {
        console.warn('updateUserProfile: Error reloading user data (non-critical)', error);
        // Don't throw - we already updated userData optimistically
      });
    
    console.log('updateUserProfile: Update completed successfully');
  };

  // Register a new passkey
  const registerPasskey = async (deviceName?: string) => {
    if (!currentUser || !userData) {
      throw new Error('User not authenticated');
    }

    if (!isWebAuthnSupported()) {
      throw new Error('WebAuthn/Passkeys are not supported in this browser');
    }

    try {
      // Register passkey using WebAuthn
      const credential = await registerPasskeyWebAuthn(
        currentUser.uid,
        currentUser.email || '',
        userData.displayName || userData.name || currentUser.email || 'User',
        deviceName
      );

      // Save passkey to Firestore via API
      const response = await fetch('/api/auth/passkey/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.uid,
          credential,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to register passkey');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to register passkey');
    }
  };

  // Sign in with passkey
  const signInWithPasskey = async (email?: string) => {
    if (!isWebAuthnSupported()) {
      throw new Error('WebAuthn/Passkeys are not supported in this browser');
    }

    try {
      // Get challenge from server
      const challengeResponse = await fetch('/api/auth/passkey/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!challengeResponse.ok) {
        const error = await challengeResponse.json();
        throw new Error(error.error || 'Failed to get challenge');
      }

      const { challenge } = await challengeResponse.json();

      // Authenticate with passkey
      const assertion = await authenticateWithPasskey(challenge);

      // Verify with server
      const verifyResponse = await fetch('/api/auth/passkey/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assertion),
      });

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        throw new Error(error.error || 'Failed to verify passkey');
      }

      const { userId } = await verifyResponse.json();

      // Get user and sign in (you may need to implement a custom token flow)
      // For now, we'll reload the page to trigger auth state change
      // In production, you'd want to create a custom token and sign in with it
      window.location.reload();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in with passkey');
    }
  };

  // Check if passkeys are supported
  const isPasskeySupported = (): boolean => {
    return isWebAuthnSupported();
  };

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    signOut,
    updateUserProfile,
    signInWithGoogle,
    signInWithMicrosoft,
    signInWithApple,
    signInWithGitHub,
    sendMagicLink,
    signInWithMagicLink,
    isMagicLink,
    checkEmailExists,
    sendEmailCode,
    signUpWithEmailCode,
    registerPasskey,
    signInWithPasskey,
    isPasskeySupported,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

