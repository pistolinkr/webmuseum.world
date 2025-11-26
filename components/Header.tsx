'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false); // Always start with false for SSR consistency
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mark as mounted to avoid hydration mismatch
    setMounted(true);
    
    const getTheme = () => {
      const theme = localStorage.getItem('theme');
      if (theme === 'light') return false;
      if (theme === 'dark') return true;
      // System theme
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    };

    setIsDarkMode(getTheme());

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const theme = localStorage.getItem('theme');
      if (theme === 'system' || !theme) {
        setIsDarkMode(mediaQuery.matches);
      }
    };

    // Listen for theme changes from settings
    const handleStorageChange = () => {
      setIsDarkMode(getTheme());
    };

    mediaQuery.addEventListener('change', handleChange);
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom theme change event
    const handleThemeChange = () => {
      setIsDarkMode(getTheme());
    };
    window.addEventListener('themechange', handleThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themechange', handleThemeChange);
    };
  }, []);

  return (
    <header
      className="exhibition-header"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        borderBottom: 'none',
        boxShadow: 'none',
        margin: 0,
      }}
    >
      <div className="exhibition-header__container">
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
        <Image
          src={mounted && isDarkMode ? '/logo/dark.png' : '/logo/white.png'}
          alt="Web Museum"
          width={24}
          height={24}
          style={{ objectFit: 'contain' }}
          priority
          key={mounted && isDarkMode ? 'dark-theme' : 'light-theme'}
          suppressHydrationWarning
        />
        <h1 style={{ fontSize: '1rem', fontWeight: 400, letterSpacing: '0.05em', color: 'var(--text-primary)', margin: 0 }}>
          Web Museum
        </h1>
      </Link>
        <Link 
          href="/" 
          className="header__back-home"
          prefetch={true}
        >
          ← Back to Home
        </Link>
      </div>
    </header>
  );
}

