'use client';

import SocialLoginForm from './SocialLoginForm';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToSignUp }: LoginFormProps) {
  return (
    <SocialLoginForm
      onSuccess={onSuccess}
      onSwitchToSignUp={onSwitchToSignUp}
    />
  );
}

