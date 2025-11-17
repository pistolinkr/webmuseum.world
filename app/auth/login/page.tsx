'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';
import { GlowingStarsBackground } from '@/components/ui/glowing-stars';
import Image from 'next/image';

function MagicLinkHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading, isMagicLink, signInWithMagicLink } = useAuth();
  const [processingMagicLink, setProcessingMagicLink] = useState(false);

  // Handle magic link authentication
  useEffect(() => {
    if (typeof window === 'undefined' || loading) return;

    const emailLink = window.location.href;
    if (isMagicLink(emailLink)) {
      const emailParam = searchParams.get('email');
      if (emailParam) {
        setProcessingMagicLink(true);
        signInWithMagicLink(emailParam, emailLink)
          .then(() => {
            router.push('/account');
          })
          .catch((error) => {
            console.error('Magic link sign-in error:', error);
            setProcessingMagicLink(false);
          });
      }
    }
  }, [searchParams, loading, isMagicLink, signInWithMagicLink, router]);

  if (processingMagicLink) {
    return (
      <div className="auth-page__loading">
        Signing you in...
      </div>
    );
  }

  return null;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    if (!loading && currentUser) {
      // Get redirect URL from query params or default to account page
      const redirectTo = searchParams.get('redirect') || '/account';
      router.push(redirectTo);
    }
  }, [currentUser, loading, router, searchParams]);

  const handleLoginSuccess = () => {
    // Get redirect URL from query params or default to account page
    const redirectTo = searchParams.get('redirect') || '/account';
    // Small delay to ensure auth state is updated
    setTimeout(() => {
      router.push(redirectTo);
    }, 100);
  };

  if (loading) {
    return (
      <main className="auth-page">
        <div className="auth-page__container">
          <div className="auth-page__loading">
            Loading...
          </div>
        </div>
      </main>
    );
  }

  if (currentUser) {
    return null; // Will redirect
  }

  return (
    <main className="auth-page">
      <GlowingStarsBackground className="auth-page__background" />
      <div className="auth-page__container">
        <Suspense fallback={<div className="auth-page__loading">Loading...</div>}>
          <MagicLinkHandler />
        </Suspense>
        <div className="auth-page__content">
          <div className="auth-page__header">
            <Link href="/" className="auth-page__logo">
              <Image
                src="/icon-white.png"
                alt="Web Museum"
                width={24}
                height={24}
                priority
              />
              <span className="auth-page__logo-text">Web Museum</span>
            </Link>
            <h1 className="auth-page__title">Sign In</h1>
            <p className="auth-page__subtitle">
              Sign in with your social account to continue building your museum.
            </p>
          </div>

          <div className="auth-page__form-wrapper">
            <LoginForm
              onSuccess={handleLoginSuccess}
              onSwitchToSignUp={() => {
                const redirectTo = searchParams.get('redirect');
                const signupUrl = redirectTo 
                  ? `/auth/signup?redirect=${encodeURIComponent(redirectTo)}`
                  : '/auth/signup';
                router.push(signupUrl);
              }}
            />
          </div>

          <div className="auth-page__footer">
            <p>
              Don't have an account?{' '}
              <Link 
                href={searchParams.get('redirect') 
                  ? `/auth/signup?redirect=${encodeURIComponent(searchParams.get('redirect')!)}`
                  : '/auth/signup'} 
                className="auth-page__link"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="auth-page">
        <div className="auth-page__container">
          <div className="auth-page__loading">Loading...</div>
        </div>
      </main>
    }>
      <LoginContent />
    </Suspense>
  );
}

