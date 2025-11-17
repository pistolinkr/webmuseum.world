'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SocialSignUpFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

type EmailStep = 'initial' | 'email-input' | 'code-input';

export default function SocialSignUpForm({ onSuccess, onSwitchToLogin }: SocialSignUpFormProps) {
  const { signInWithGoogle, signInWithMicrosoft, signInWithApple, signInWithGitHub, sendEmailCode, signUpWithEmailCode } = useAuth();
  const [error, setError] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<'google' | 'microsoft' | 'apple' | 'github' | 'email' | 'apply' | 'signup' | null>(null);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [emailStep, setEmailStep] = useState<EmailStep>('initial');

  const handleGoogleSignUp = async () => {
    setError((prev) => ({ ...prev, google: false }));
    setLoading('google');
    
    try {
      console.log('🔵 Google sign-up initiated...');
      await signInWithGoogle();
      console.log('✅ Google sign-up successful');
      onSuccess?.();
    } catch (err: any) {
      console.error('❌ Google sign-up failed:', err);
      console.error('❌ Error code:', err?.code);
      console.error('❌ Error message:', err?.message);
      
      // Don't show error if user cancelled or popup was closed
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        console.log('ℹ️ User cancelled sign-up');
        setLoading(null);
        return;
      }
      
      // Don't show error if redirecting (popup blocked)
      if (err?.code === 'auth/popup-blocked') {
        console.log('ℹ️ Popup blocked, redirecting...');
        return;
      }
      
      setError((prev) => ({ ...prev, google: true }));
      setTimeout(() => {
        setError((prev) => ({ ...prev, google: false }));
      }, 5000);
    } finally {
      setLoading(null);
    }
  };

  const handleMicrosoftSignUp = async () => {
    setError((prev) => ({ ...prev, microsoft: false }));
    setLoading('microsoft');
    
    try {
      console.log('🔵 Microsoft sign-up initiated...');
      await signInWithMicrosoft();
      console.log('✅ Microsoft sign-up successful');
      onSuccess?.();
    } catch (err: any) {
      console.error('❌ Microsoft sign-up failed:', err);
      
      // Don't show error if user cancelled or popup was closed
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        console.log('ℹ️ User cancelled sign-up');
        setLoading(null);
        return;
      }
      
      // Don't show error if redirecting (popup blocked)
      if (err?.code === 'auth/popup-blocked') {
        console.log('ℹ️ Popup blocked, redirecting...');
        return;
      }
      
      setError((prev) => ({ ...prev, microsoft: true }));
      setTimeout(() => {
        setError((prev) => ({ ...prev, microsoft: false }));
      }, 5000);
    } finally {
      setLoading(null);
    }
  };

  const handleAppleSignUp = async () => {
    setError((prev) => ({ ...prev, apple: false }));
    setLoading('apple');
    
    try {
      console.log('🔵 Apple sign-up initiated...');
      await signInWithApple();
      console.log('✅ Apple sign-up successful');
      onSuccess?.();
    } catch (err: any) {
      console.error('❌ Apple sign-up failed:', err);
      
      // Don't show error if user cancelled or popup was closed
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        console.log('ℹ️ User cancelled sign-up');
        setLoading(null);
        return;
      }
      
      // Don't show error if redirecting (popup blocked)
      if (err?.code === 'auth/popup-blocked') {
        console.log('ℹ️ Popup blocked, redirecting...');
        return;
      }
      
      setError((prev) => ({ ...prev, apple: true }));
      setTimeout(() => {
        setError((prev) => ({ ...prev, apple: false }));
      }, 5000);
    } finally {
      setLoading(null);
    }
  };

  const handleGitHubSignUp = async () => {
    setError((prev) => ({ ...prev, github: false }));
    setLoading('github');
    
    try {
      console.log('🔵 GitHub sign-up initiated...');
      await signInWithGitHub();
      console.log('✅ GitHub sign-up successful');
      onSuccess?.();
    } catch (err: any) {
      console.error('❌ GitHub sign-up failed:', err);
      
      // Don't show error if user cancelled or popup was closed
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        console.log('ℹ️ User cancelled sign-up');
        setLoading(null);
        return;
      }
      
      // Don't show error if redirecting (popup blocked)
      if (err?.code === 'auth/popup-blocked') {
        console.log('ℹ️ Popup blocked, redirecting...');
        return;
      }
      
      setError((prev) => ({ ...prev, github: true }));
      setTimeout(() => {
        setError((prev) => ({ ...prev, github: false }));
      }, 5000);
    } finally {
      setLoading(null);
    }
  };

  const handleContinueWithEmail = () => {
    setError({});
    setEmailStep('email-input');
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setError((prev) => ({ ...prev, apply: false }));
    setLoading('apply');
    
    try {
      await sendEmailCode(email);
      setEmailStep('code-input');
    } catch (err: any) {
      setError((prev) => ({ ...prev, apply: true }));
      setTimeout(() => {
        setError((prev) => ({ ...prev, apply: false }));
      }, 5000);
    } finally {
      setLoading(null);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError((prev) => ({ ...prev, signup: false }));
    setLoading('signup');
    
    try {
      await signUpWithEmailCode(email, code);
      onSuccess?.();
    } catch (err: any) {
      setError((prev) => ({ ...prev, signup: true }));
      setTimeout(() => {
        setError((prev) => ({ ...prev, signup: false }));
      }, 5000);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="auth-form">
      <div className="auth-form__social-buttons">
        <button
          type="button"
          onClick={handleMicrosoftSignUp}
          disabled={!!loading}
          className={`auth-form__social-button ${error.microsoft ? 'auth-form__social-button--error' : ''}`}
        >
          <svg className="auth-form__social-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#F25022" d="M1 1h10v10H1z"/>
            <path fill="#00A4EF" d="M13 1h10v10H13z"/>
            <path fill="#7FBA00" d="M1 13h10v10H1z"/>
            <path fill="#FFB900" d="M13 13h10v10H13z"/>
          </svg>
          {error.microsoft 
            ? 'Authentication Failed, please try again.' 
            : loading === 'microsoft' 
            ? 'Signing up...' 
            : 'Continue with Microsoft'}
        </button>

        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={!!loading}
          className={`auth-form__social-button ${error.google ? 'auth-form__social-button--error' : ''}`}
        >
          <svg className="auth-form__social-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {error.google 
            ? 'Authentication Failed, please try again.' 
            : loading === 'google' 
            ? 'Signing up...' 
            : 'Continue with Google'}
        </button>

        <button
          type="button"
          onClick={handleGitHubSignUp}
          disabled={!!loading}
          className={`auth-form__social-button ${error.github ? 'auth-form__social-button--error' : ''}`}
        >
          <svg className="auth-form__social-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          {error.github 
            ? 'Authentication Failed, please try again.' 
            : loading === 'github' 
            ? 'Signing up...' 
            : 'Continue with GitHub'}
        </button>

        <button
          type="button"
          onClick={handleAppleSignUp}
          disabled={!!loading}
          className={`auth-form__social-button ${error.apple ? 'auth-form__social-button--error' : ''}`}
        >
          <svg className="auth-form__social-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          {error.apple 
            ? 'Authentication Failed, please try again.' 
            : loading === 'apple' 
            ? 'Signing up...' 
            : 'Continue with Apple'}
        </button>

        {emailStep === 'initial' && (
          <button
            type="button"
            onClick={handleContinueWithEmail}
            disabled={!!loading}
            className="auth-form__social-button"
          >
            <svg className="auth-form__social-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Continue with Email
          </button>
        )}

        {/* Email section */}
        {emailStep === 'email-input' && (
          <form onSubmit={handleApply} className="auth-form__email-row">
            <div className="auth-form__field" style={{ flex: 1 }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-form__input"
                placeholder="your@email.com"
                disabled={!!loading}
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={!!loading}
              className={`auth-form__email-icon-button ${error.apply ? 'auth-form__email-icon-button--error' : ''}`}
              title={error.apply ? 'Authentication Failed, please try again.' : loading === 'apply' ? 'Sending...' : 'Apply'}
            >
              <svg className="auth-form__social-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </button>
          </form>
        )}

        {emailStep === 'code-input' && (
          <form onSubmit={handleSignUp} className="auth-form__email-row">
            <div className="auth-form__field" style={{ flex: 1, position: 'relative' }}>
              <p className="auth-form__code-hint">
                Code sent to <strong>{email}</strong>
              </p>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                required
                className="auth-form__input"
                placeholder="Enter 4-digit code"
                maxLength={4}
                disabled={!!loading}
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={!!loading || code.length !== 4}
              className={`auth-form__email-icon-button ${error.signup ? 'auth-form__email-icon-button--error' : ''}`}
              title={error.signup ? 'Authentication Failed, please try again.' : loading === 'signup' ? 'Signing up...' : 'Sign up'}
            >
              <svg className="auth-form__social-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
