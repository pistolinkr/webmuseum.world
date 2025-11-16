'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import SignUpForm from '@/components/auth/SignUpForm';
import Link from 'next/link';
import { GlowingStarsBackground } from '@/components/ui/glowing-stars';
import Image from 'next/image';

export default function SignUpPage() {
  const router = useRouter();
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    if (!loading && currentUser) {
      // If already logged in, redirect to account page
      router.push('/account');
    }
  }, [currentUser, loading, router]);

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
            <h1 className="auth-page__title">Create Account</h1>
            <p className="auth-page__subtitle">
              Start building your virtual museum today.
            </p>
          </div>

          <div className="auth-page__form-wrapper">
            <SignUpForm
              onSuccess={() => {
                router.push('/account');
              }}
              onSwitchToLogin={() => {
                router.push('/auth/login');
              }}
            />
          </div>

          <div className="auth-page__footer">
            <p>
              Already have an account?{' '}
              <Link href="/auth/login" className="auth-page__link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

