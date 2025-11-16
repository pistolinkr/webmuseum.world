'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Exhibition } from '@/types';

interface ManageLinkProps {
  exhibition: Exhibition;
}

export default function ManageLink({ exhibition }: ManageLinkProps) {
  const { currentUser } = useAuth();

  // Only show manage link if user owns this exhibition
  if (!currentUser || exhibition.userId !== currentUser.uid) {
    return null;
  }

  return (
    <Link
      href={`/exhibition/${exhibition.id}/manage`}
      className="exhibition-manage-link"
      prefetch={true}
    >
      Manage Artworks
    </Link>
  );
}

