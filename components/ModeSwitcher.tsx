'use client';

import Link from 'next/link';
import { ViewMode } from '@/types';

interface ModeSwitcherProps {
  exhibitionId: string;
  currentMode: ViewMode;
}

export default function ModeSwitcher({ exhibitionId, currentMode }: ModeSwitcherProps) {
  const modes: { label: string; mode: ViewMode; path: string }[] = [
    { label: 'View through story', mode: 'story', path: `/exhibition/${exhibitionId}/story` },
    { label: 'View in gallery', mode: 'gallery', path: `/exhibition/${exhibitionId}/gallery` },
    { label: 'View in space', mode: 'space', path: `/exhibition/${exhibitionId}/space` },
  ];

  // 색상 설정: CSS 변수 사용
  const inactiveColor = 'var(--text-secondary)';

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0.7rem',
        zIndex: 1000,
        gap: '1rem',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      {modes.map(({ label, mode, path }) => (
        <Link
          key={mode}
          href={path}
          prefetch={true}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: currentMode === mode ? 'var(--text-primary)' : 'transparent',
            color: currentMode === mode ? 'var(--bg-primary)' : inactiveColor,
            cursor: 'pointer',
            fontSize: '0.875rem',
            transition: 'all 0.3s ease',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

