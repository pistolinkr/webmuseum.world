'use client';

import { useEffect } from 'react';

export default function Favicon() {
  useEffect(() => {
    // 클라이언트에서만 실행
    if (typeof window === 'undefined') return;
    
    const getTheme = () => {
      const theme = localStorage.getItem('theme');
      if (theme === 'light') return false;
      if (theme === 'dark') return true;
      // System theme - check prefers-color-scheme
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    };

    const DYNAMIC_ATTR = 'data-dynamic-favicon';

    const ensureLink = (rel: string, type?: string) => {
      if (typeof document === 'undefined' || !document.head) return null;
      const selector = `link[${DYNAMIC_ATTR}="${rel}"]`;
      let link = document.head.querySelector(selector) as HTMLLinkElement | null;

      if (!link) {
        link = document.createElement('link');
        link.setAttribute(DYNAMIC_ATTR, rel);
        link.rel = rel;
        if (type) {
          link.type = type;
        }
        document.head.appendChild(link);
      }

      return link;
    };

      const updateFavicon = () => {
      try {
        const isDarkMode = getTheme();
        // 라이트 테마: 다크 로고 (icon-dark.png), 다크 테마: 화이트 로고 (icon-white.png)
        // 라이트 테마 (isDarkMode = false) → icon-dark.png
        // 다크 테마 (isDarkMode = true) → icon-white.png
        const faviconUrl = isDarkMode ? '/icon-white.png' : '/icon-dark.png';
        
        console.log('🔄 Favicon update:', { 
          isDarkMode, 
          faviconUrl, 
          theme: localStorage.getItem('theme'),
          systemTheme: window.matchMedia('(prefers-color-scheme: dark)').matches
        });

        // 타임스탬프로 캐시 버스터 추가
        const timestamp = Date.now();
        const urlWithCache = `${faviconUrl}?v=${timestamp}`;
        
        // document.head가 존재하는지 확인
        if (!document.head) {
          console.warn('⚠️ document.head is not available');
          return;
        }

        // 필요한 링크를 보장하고 href 업데이트
        const iconLink = ensureLink('icon', 'image/png');
        const shortcutLink = ensureLink('shortcut icon', 'image/png');
        const appleLink = ensureLink('apple-touch-icon');

        if (iconLink) iconLink.href = urlWithCache;
        if (shortcutLink) shortcutLink.href = urlWithCache;
        if (appleLink) appleLink.href = urlWithCache;

        console.log('✅ Favicon updated to:', faviconUrl, 'for theme:', isDarkMode ? 'dark' : 'light');
      } catch (error) {
        console.error('❌ Error updating favicon:', error);
        }
      };

    // 초기 실행 - 약간의 지연을 두어 DOM이 완전히 로드된 후 실행
    const initialTimeout = setTimeout(() => {
      updateFavicon();
    }, 100);

    // 시스템 테마 변경 감지
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      const theme = localStorage.getItem('theme');
      // 시스템 테마이거나 설정이 없을 때만 반응
      if (theme === 'system' || !theme) {
        console.log('🔄 System theme changed, updating favicon');
        // 약간의 지연을 두어 테마가 완전히 적용된 후 업데이트
        setTimeout(() => updateFavicon(), 100);
      }
    };

    // 설정에서 테마 변경 감지
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        console.log('🔄 Theme changed in storage, updating favicon');
        setTimeout(() => updateFavicon(), 100);
      }
    };

    // 커스텀 테마 변경 이벤트 감지
    const handleThemeChange = () => {
      console.log('🔄 Theme change event received, updating favicon');
      setTimeout(() => updateFavicon(), 100);
    };

    // 이벤트 리스너 등록
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      mediaQuery.addListener(handleSystemThemeChange);
    }
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themechange', handleThemeChange);

    // 주기적으로 확인 (시스템 테마가 변경되었을 때 감지)
    const intervalId = setInterval(() => {
      try {
        const theme = localStorage.getItem('theme');
        // 모든 테마 설정에서 확인
        const isDarkMode = getTheme();
        const expectedFavicon = isDarkMode ? '/icon-white.png' : '/icon-dark.png';
        const currentFavicon = document.querySelector(`link[${DYNAMIC_ATTR}="icon"]`) as HTMLLinkElement;
        
        // 현재 파비콘이 예상과 다른지 확인
        if (!currentFavicon || !currentFavicon.href.includes(expectedFavicon.split('/').pop() || '')) {
          console.log('🔄 Favicon mismatch detected, updating', {
            current: currentFavicon?.href,
            expected: expectedFavicon,
            isDarkMode,
            theme
          });
          updateFavicon();
        }
      } catch (error) {
        console.error('❌ Error in favicon check interval:', error);
      }
    }, 2000); // 2초마다 확인

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else {
        mediaQuery.removeListener(handleSystemThemeChange);
      }
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themechange', handleThemeChange);
    };
  }, []);

  return null;
}
