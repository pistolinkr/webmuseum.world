'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User } from '@/types';
import { getUser, createUser, updateUser } from '@/lib/firestore';

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
  // Email code authentication
  sendEmailCode: (email: string) => Promise<void>;
  signUpWithEmailCode: (email: string, code: string) => Promise<void>;
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

  // Load user data from Firestore when auth state changes
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    // Handle redirect result (for social login)
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        handleSocialSignIn(result.user);
      }
    }).catch((error) => {
      console.error('Error handling redirect result:', error);
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Load user data from Firestore
        try {
          const userDoc = await getUser(user.uid);
          if (userDoc) {
            setUserData(userDoc);
          } else {
            // Create user document if it doesn't exist (for social login)
            await handleSocialSignIn(user);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

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
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }

    try {
      const provider = new GoogleAuthProvider();
      // Use popup for better UX
      const result = await signInWithPopup(auth, provider);
      await handleSocialSignIn(result.user);
    } catch (error: any) {
      // If popup is blocked, try redirect
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
      } else {
        throw error;
      }
    }
  };

  // Sign in with Microsoft
  const signInWithMicrosoft = async () => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }

    try {
      const provider = new OAuthProvider('microsoft.com');
      // Use popup for better UX
      const result = await signInWithPopup(auth, provider);
      await handleSocialSignIn(result.user);
    } catch (error: any) {
      // If popup is blocked, try redirect
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        const provider = new OAuthProvider('microsoft.com');
        await signInWithRedirect(auth, provider);
      } else {
        throw error;
      }
    }
  };

  // Sign in with Apple
  const signInWithApple = async () => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }

    try {
      const provider = new OAuthProvider('apple.com');
      // Use popup for better UX
      const result = await signInWithPopup(auth, provider);
      await handleSocialSignIn(result.user);
    } catch (error: any) {
      // If popup is blocked, try redirect
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        const provider = new OAuthProvider('apple.com');
        await signInWithRedirect(auth, provider);
      } else {
        throw error;
      }
    }
  };

  // Sign in with GitHub
  const signInWithGitHub = async () => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }

    try {
      const provider = new GithubAuthProvider();
      // Use popup for better UX
      const result = await signInWithPopup(auth, provider);
      await handleSocialSignIn(result.user);
    } catch (error: any) {
      // If popup is blocked, try redirect
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        const provider = new GithubAuthProvider();
        await signInWithRedirect(auth, provider);
      } else {
        throw error;
      }
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
    const response = await fetch('/api/auth/email/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send verification code');
    }
  };

  // Sign up with email code
  const signUpWithEmailCode = async (email: string, code: string) => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }

    // First verify the code
    const verifyResponse = await fetch('/api/auth/email/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    if (!verifyResponse.ok) {
      const error = await verifyResponse.json();
      throw new Error(error.error || 'Failed to verify code');
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
    
    // Update Firestore user document
    await updateUser(currentUser.uid, updates);
    
    // Update Firebase Auth profile if displayName or photoURL changed
    if (updates.displayName || updates.avatarUrl) {
      await updateProfile(currentUser, {
        displayName: updates.displayName || currentUser.displayName || undefined,
        photoURL: updates.avatarUrl || currentUser.photoURL || undefined,
      });
    }
    
    // Reload user data
    const updatedUser = await getUser(currentUser.uid);
    if (updatedUser) {
      setUserData(updatedUser);
    }
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
    sendEmailCode,
    signUpWithEmailCode,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

