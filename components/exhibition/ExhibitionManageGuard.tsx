'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Exhibition } from '@/types';

interface ExhibitionManageGuardProps {
  exhibition: Exhibition;
  children: React.ReactNode;
}

export default function ExhibitionManageGuard({ exhibition, children }: ExhibitionManageGuardProps) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!currentUser) {
      router.push('/');
      return;
    }

    if (exhibition.userId !== currentUser.uid) {
      router.push(`/exhibition/${exhibition.id}`);
      return;
    }
  }, [currentUser, loading, exhibition.userId, router]);

  if (loading) {
    return (
      <main className="exhibition-manage-page">
        <div className="exhibition-manage-page__container">
          <div className="exhibition-manage-page__loading">Loading...</div>
        </div>
      </main>
    );
  }

  if (!currentUser || exhibition.userId !== currentUser.uid) {
    return null;
  }

  return <>{children}</>;
}

