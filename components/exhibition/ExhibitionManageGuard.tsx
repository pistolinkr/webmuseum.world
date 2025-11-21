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

    // Check both ownerId (new) and userId (legacy) for backward compatibility
    const ownerId = exhibition.ownerId || exhibition.userId;
    if (ownerId !== currentUser.uid) {
      router.push(`/exhibition/${exhibition.id}`);
      return;
    }
  }, [currentUser, loading, exhibition.ownerId, exhibition.userId, exhibition.id, router]);

  if (loading) {
    return (
      <main className="exhibition-manage-page">
        <div className="exhibition-manage-page__container">
          <div className="exhibition-manage-page__loading">Loading...</div>
        </div>
      </main>
    );
  }

  // Check both ownerId (new) and userId (legacy) for backward compatibility
  const ownerId = exhibition.ownerId || exhibition.userId;
  if (!currentUser || ownerId !== currentUser.uid) {
    return null;
  }

  return <>{children}</>;
}

