'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Exhibition } from '@/types';

interface EmptyExhibitionStateProps {
  exhibition: Exhibition;
}

export default function EmptyExhibitionState({ exhibition }: EmptyExhibitionStateProps) {
  const router = useRouter();
  const { currentUser } = useAuth();
  
  // Check if current user owns this exhibition
  const isOwner = currentUser && (exhibition.ownerId === currentUser.uid || exhibition.userId === currentUser.uid);

  if (!isOwner) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '2rem', opacity: 0.5 }}>🖼️</div>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 300, color: 'var(--text-primary)' }}>
          No artworks yet
        </h2>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', maxWidth: '600px' }}>
          This exhibition doesn&apos;t have any artworks yet. Check back later!
        </p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      textAlign: 'center',
    }}>
      <div style={{ 
        maxWidth: '600px',
        width: '100%',
      }}>
        <div style={{ fontSize: '5rem', marginBottom: '2rem', opacity: 0.8 }}>✨</div>
        <h2 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '1rem', 
          fontWeight: 300, 
          color: 'var(--text-primary)',
          lineHeight: 1.2
        }}>
          Your exhibition is ready!
        </h2>
        <p style={{ 
          fontSize: '1.25rem', 
          color: 'var(--text-secondary)', 
          marginBottom: '3rem',
          lineHeight: 1.6
        }}>
          Start showcasing your art by adding your first artwork to this exhibition.
        </p>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          alignItems: 'center',
        }}>
          <Link
            href={`/exhibition/${exhibition.id}/manage`}
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-md)',
              fontSize: '1.125rem',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            + Add Your First Artwork
          </Link>
          
          <Link
            href={`/exhibition/${exhibition.id}`}
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              textDecoration: 'none',
              opacity: 0.7,
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.7';
            }}
          >
            View Exhibition Overview
          </Link>
        </div>
      </div>
    </div>
  );
}

