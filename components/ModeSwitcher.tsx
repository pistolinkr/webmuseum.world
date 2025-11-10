'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ViewMode } from '@/types';

interface ModeSwitcherProps {
  exhibitionId: string;
  currentMode: ViewMode;
}

export default function ModeSwitcher({ exhibitionId, currentMode }: ModeSwitcherProps) {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial dark mode preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const modes: { label: string; mode: ViewMode; path: string }[] = [
    { label: 'View through story', mode: 'story', path: `/exhibition/${exhibitionId}/story` },
    { label: 'View in gallery', mode: 'gallery', path: `/exhibition/${exhibitionId}/gallery` },
    { label: 'View in space', mode: 'space', path: `/exhibition/${exhibitionId}/space` },
  ];

  const handleModeChange = (mode: ViewMode, path: string) => {
    router.push(path);
  };

  // 색상 설정: 화이트 모드 = 어두운 회색, 다크 모드 = 밝은 회색
  const inactiveColor = isDarkMode ? '#999' : '#666';

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        padding: '1.5rem',
        zIndex: 1000,
        gap: '1rem',
      }}
    >
      {modes.map(({ label, mode, path }) => (
        <button
          key={mode}
          onClick={() => handleModeChange(mode, path)}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: currentMode === mode ? '#000' : 'transparent',
            color: currentMode === mode ? '#fff' : inactiveColor,
            cursor: 'pointer',
            fontSize: '0.875rem',
            transition: 'all 0.3s ease',
          }}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

