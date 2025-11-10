'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '1rem 2rem',
        zIndex: 1000,
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderBottom: 'none',
        boxShadow: 'none',
        margin: 0,
      }}
    >
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
        <Image
          src={isDarkMode ? '/icon-white.png' : '/icon-dark.png'}
          alt="Web Museum"
          width={24}
          height={24}
          style={{ objectFit: 'contain' }}
          priority
        />
        <h1 style={{ fontSize: '1rem', fontWeight: 400, letterSpacing: '0.05em', color: 'var(--text-primary)', margin: 0 }}>
          Web Museum
        </h1>
      </Link>
    </header>
  );
}

