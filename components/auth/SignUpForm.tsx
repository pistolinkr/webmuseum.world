'use client';

import SocialSignUpForm from './SocialSignUpForm';

interface SignUpFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export default function SignUpForm({ onSuccess, onSwitchToLogin }: SignUpFormProps) {
  return (
    <SocialSignUpForm
      onSuccess={onSuccess}
      onSwitchToLogin={onSwitchToLogin}
    />
  );
}

