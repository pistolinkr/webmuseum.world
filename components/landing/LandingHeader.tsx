'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { TextRoll } from '@/components/core/text-roll';
import { useAuth } from '@/contexts/AuthContext';

export default function LandingHeader() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scrollOpacity, setScrollOpacity] = useState(0);
  const { currentUser, userData, signOut, loading } = useAuth();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const headerHeight = 64; // 4rem = 64px
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // 스크롤이 헤더 높이만큼 내려가면 opacity가 0에서 1로 변경
      const opacity = Math.min(scrollY / headerHeight, 1);
      setScrollOpacity(opacity);
    };

    handleScroll(); // 초기값 설정
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="landing-header"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        transform: 'none',
        backgroundColor: isDarkMode 
          ? `rgba(17, 17, 17, ${scrollOpacity * 0.8})`
          : `rgba(255, 255, 255, ${scrollOpacity * 0.8})`,
        borderBottomColor: isDarkMode
          ? `rgba(229, 231, 235, ${scrollOpacity * 0.2})`
          : `rgba(229, 231, 235, ${scrollOpacity})`,
      }}
    >
      <div className="landing-header__container">
        <Link href="/" className="landing-header__logo" prefetch={true}>
          <Image
            src={isDarkMode ? '/icon-white.png' : '/icon-dark.png'}
            alt="Web Museum"
            width={24}
            height={24}
            style={{ objectFit: 'contain' }}
            priority
            className="landing-header__logo-image"
          />
          <TextRoll className="landing-header__logo-text" immediate>
            Web Museum
          </TextRoll>
        </Link>
        <nav className="landing-header__nav">
          <Link href="/exhibition" className="landing-header__nav-link" prefetch={true}>
            Exhibitions
          </Link>
          <Link href="/artist" className="landing-header__nav-link" prefetch={true}>
            Artists
          </Link>
          <Link href="/explore" className="landing-header__nav-link" prefetch={true}>
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
                {userData?.displayName || userData?.name || currentUser.email}
              </Link>
              <button
                onClick={() => signOut()}
                className="landing-header__sign-out"
              >
                Sign Out
              </button>
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

