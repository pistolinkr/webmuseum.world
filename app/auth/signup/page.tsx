'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import SignUpForm from '@/components/auth/SignUpForm';
import Link from 'next/link';
import { GlowingStarsBackground } from '@/components/ui/glowing-stars';
import Image from 'next/image';

function SignUpContent() {
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

  const handleSignUpSuccess = () => {
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
          <div className="auth-page__loading">Loading...</div>
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
            <h1 className="auth-page__title">Create Account</h1>
            <p className="auth-page__subtitle">
              Start building your virtual museum today.
            </p>
          </div>

          <div className="auth-page__form-wrapper">
            <SignUpForm
              onSuccess={handleSignUpSuccess}
              onSwitchToLogin={() => {
                const redirectTo = searchParams.get('redirect');
                const loginUrl = redirectTo 
                  ? `/auth/login?redirect=${encodeURIComponent(redirectTo)}`
                  : '/auth/login';
                router.push(loginUrl);
              }}
            />
          </div>

          <div className="auth-page__footer">
            <p>
              Already have an account?{' '}
              <Link 
                href={searchParams.get('redirect') 
                  ? `/auth/login?redirect=${encodeURIComponent(searchParams.get('redirect')!)}`
                  : '/auth/login'} 
                className="auth-page__link"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <main className="auth-page">
        <div className="auth-page__container">
          <div className="auth-page__loading">Loading...</div>
        </div>
      </main>
    }>
      <SignUpContent />
    </Suspense>
  );
}

