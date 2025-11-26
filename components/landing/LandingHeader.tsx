'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { TextRoll } from '@/components/core/text-roll';
import { useAuth } from '@/contexts/AuthContext';

interface LandingHeaderProps {
  isExhibitionPage?: boolean;
}

export default function LandingHeader({ isExhibitionPage = false }: LandingHeaderProps = {}) {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false); // Always start with false for SSR consistency
  const [mounted, setMounted] = useState(false);
  const [scrollOpacity, setScrollOpacity] = useState(0);
  const { currentUser, userData, signOut, loading } = useAuth();

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

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const headerHeight = 64; // 4rem = 64px

    const handleScroll = () => {
      try {
        const scrollY = window.scrollY;
        // 스크롤이 헤더 높이만큼 내려가면 opacity가 0에서 1로 변경
        const opacity = Math.min(scrollY / headerHeight, 1);
        setScrollOpacity(opacity);

        // CSS 변수로 스크롤 opacity 전달
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty('--header-scroll-opacity', opacity.toString());
        }
      } catch (e) {
        console.warn('Error handling scroll:', e);
      }
    };

    handleScroll(); // 초기값 설정

    // Safely add scroll listener
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      // Safely cleanup
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="landing-header"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100, // Ensure it's above the exhibition header (1000)
        transform: 'none',
      }}
    >
      <div className={`landing-header__container${!currentUser && !loading ? ' landing-header__container--guest' : ''}${isExhibitionPage ? ' landing-header__container--exhibition' : ''}`}>
        <Link href="/" className="landing-header__logo" prefetch={true}>
          <Image
            src={mounted && isDarkMode ? '/logo/dark.png' : '/logo/white.png'}
            alt="Web Museum"
            width={24}
            height={24}
            style={{ objectFit: 'contain' }}
            priority
            className="landing-header__logo-image"
            key={mounted && isDarkMode ? 'dark-theme' : 'light-theme'}
            suppressHydrationWarning
          />
          <TextRoll className="landing-header__logo-text" immediate>
            Web Museum
          </TextRoll>
        </Link>
        <nav className="landing-header__nav">
          <Link
            href="/discover"
            className={`landing-header__nav-link${pathname === '/discover' ? ' landing-header__nav-link--active' : ''}`}
            prefetch={true}
          >
            Discover
          </Link>
          <Link
            href="/artist"
            className={`landing-header__nav-link${pathname === '/artist' || pathname?.startsWith('/artist/') ? ' landing-header__nav-link--active' : ''}`}
            prefetch={true}
          >
            Artists
          </Link>
          <Link
            href="/explore"
            className={`landing-header__nav-link${pathname === '/explore' ? ' landing-header__nav-link--active' : ''}`}
            prefetch={true}
          >
            Explore
          </Link>
        </nav>

        <div className="landing-header__auth">
          {loading ? (
            <span className="landing-header__auth-loading">Loading...</span>
          ) : currentUser ? (
            <div className="landing-header__user-menu">
              <Link
                href="/account"
                className="landing-header__user-link"
                prefetch={true}
              >
                <span className="landing-header__user-text">
                  {userData?.displayName || userData?.name || currentUser.email}
                </span>
                {userData?.avatarUrl ? (
                  <img
                    src={userData.avatarUrl}
                    alt={userData?.displayName || userData?.name || 'User'}
                    className="landing-header__user-icon"
                  />
                ) : (
                  <div className="landing-header__user-icon landing-header__user-icon--placeholder">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"/>
                      <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="currentColor"/>
                    </svg>
                  </div>
                )}
              </Link>
            </div>
          ) : (
            <div className="landing-header__auth-buttons">
              <Link
                href="/auth/login"
                className="landing-header__auth-button landing-header__auth-button--login"
                prefetch={true}
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="landing-header__auth-button landing-header__auth-button--signup"
                prefetch={true}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}

