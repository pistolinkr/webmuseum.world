'use client';

import { useState } from 'react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  if (!isOpen) return null;

  return (
    <div className="auth-modal" onClick={onClose}>
      <div className="auth-modal__content" onClick={(e) => e.stopPropagation()}>
        <button
          className="auth-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        {mode === 'login' ? (
          <LoginForm
            onSuccess={onClose}
            onSwitchToSignUp={() => setMode('signup')}
          />
        ) : (
          <SignUpForm
            onSuccess={onClose}
            onSwitchToLogin={() => setMode('login')}
          />
        )}
      </div>
    </div>
  );
}

