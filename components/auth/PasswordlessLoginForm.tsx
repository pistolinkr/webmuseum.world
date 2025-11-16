'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface PasswordlessLoginFormProps {
  onSuccess?: () => void;
  onSwitchToPassword?: () => void; // For switching to signup
}

export default function PasswordlessLoginForm({ onSuccess, onSwitchToPassword }: PasswordlessLoginFormProps) {
  const router = useRouter();
  const { sendMagicLink, signInWithMagicLink, isMagicLink, signInWithPasskey, isPasskeySupported } = useAuth();
  
  const [email, setEmail] = useState('');
  const [mode, setMode] = useState<'email' | 'passkey'>('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleMagicLinkSignIn = async (email: string, emailLink: string) => {
    setLoading(true);
    setError('');
    
    try {
      await signInWithMagicLink(email, emailLink);
      onSuccess?.();
      router.push('/account');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with magic link');
    } finally {
      setLoading(false);
    }
  };

  // Check if we're handling a magic link on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    const emailLink = window.location.href;
    
    if (emailParam && isMagicLink(emailLink)) {
      handleMagicLinkSignIn(emailParam, emailLink);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await sendMagicLink(email);
      setEmailSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeySignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithPasskey(email || undefined);
      onSuccess?.();
      router.push('/account');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with passkey');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="auth-form">
        <div className="auth-form__success">
          <p><strong>Check your email!</strong></p>
          <p>We've sent you a sign-in link. Click the link in the email to sign in.</p>
          <p className="auth-form__success-hint">
            The link will expire in 1 hour. Make sure to check your spam folder if you don't see it.
          </p>
          <button
            type="button"
            onClick={() => {
              setEmailSent(false);
              setEmail('');
            }}
            className="auth-form__button auth-form__button--secondary"
          >
            Send another link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-form">
      <div className="auth-form__tabs">
        <button
          type="button"
          className={`auth-form__tab ${mode === 'email' ? 'auth-form__tab--active' : ''}`}
          onClick={() => setMode('email')}
        >
          Email Link
        </button>
        {isPasskeySupported() && (
          <button
            type="button"
            className={`auth-form__tab ${mode === 'passkey' ? 'auth-form__tab--active' : ''}`}
            onClick={() => setMode('passkey')}
          >
            Passkey
          </button>
        )}
      </div>

      {error && (
        <div className="auth-form__error" role="alert">
          {error}
        </div>
      )}

      {mode === 'email' ? (
        <form onSubmit={handleEmailSubmit}>
          <div className="auth-form__field">
            <label htmlFor="email-passwordless" className="auth-form__label">
              Email
            </label>
            <input
              id="email-passwordless"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-form__input"
              placeholder="your@email.com"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-form__button"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>
      ) : (
        <div>
          <div className="auth-form__field">
            <label htmlFor="email-passkey" className="auth-form__label">
              Email (Optional)
            </label>
            <input
              id="email-passkey"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-form__input"
              placeholder="your@email.com (optional)"
              disabled={loading}
            />
            <p className="auth-form__hint">
              If you have multiple accounts, enter your email to help identify the correct passkey.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePasskeySignIn}
            disabled={loading}
            className="auth-form__button"
          >
            {loading ? 'Authenticating...' : 'Sign in with Passkey'}
          </button>

          <p className="auth-form__hint">
            Use your device's biometric authentication (Face ID, Touch ID, Windows Hello) or security key.
          </p>
        </div>
      )}
    </div>
  );
}

