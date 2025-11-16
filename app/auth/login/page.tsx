'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';
import { GlowingStarsBackground } from '@/components/ui/glowing-stars';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, loading, isMagicLink, signInWithMagicLink } = useAuth();
  const [processingMagicLink, setProcessingMagicLink] = useState(false);

  useEffect(() => {
    if (!loading && currentUser) {
      // If already logged in, redirect to account page
      router.push('/account');
    }
  }, [currentUser, loading, router]);

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

  if (loading || processingMagicLink) {
    return (
      <main className="auth-page">
        <div className="auth-page__container">
          <div className="auth-page__loading">
            {processingMagicLink ? 'Signing you in...' : 'Loading...'}
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
              onSuccess={() => {
                router.push('/account');
              }}
              onSwitchToSignUp={() => {
                router.push('/auth/signup');
              }}
            />
          </div>

          <div className="auth-page__footer">
            <p>
              Don't have an account?{' '}
              <Link href="/auth/signup" className="auth-page__link">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

