'use client';

import { useEffect } from 'react';

/**
 * 전역 테마 초기화 컴포넌트
 * 페이지 로드 시 localStorage에서 테마 설정을 읽어서 즉시 적용
 * 다른 컴포넌트보다 먼저 실행되어야 함
 */
export default function ThemeInitializer() {
  useEffect(() => {
    // 클라이언트에서만 실행
    if (typeof window === 'undefined') return;

    const applyTheme = () => {
      const theme = localStorage.getItem('theme');
      
      if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      } else if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        // System theme 또는 설정 없음
        document.documentElement.removeAttribute('data-theme');
      }
    };

    // 즉시 적용 (다른 컴포넌트보다 먼저)
    applyTheme();

    // 테마 변경 이벤트 리스너
    const handleThemeChange = () => {
      applyTheme();
    };

    window.addEventListener('themechange', handleThemeChange);
    window.addEventListener('storage', handleThemeChange);

    return () => {
      window.removeEventListener('themechange', handleThemeChange);
      window.removeEventListener('storage', handleThemeChange);
    };
  }, []);

  return null;
}

