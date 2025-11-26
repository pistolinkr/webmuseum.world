'use client';

import { useEffect } from 'react';

export default function Favicon() {
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined' || typeof document === 'undefined' || !document.head) {
      return;
    }

    // 시스템 테마 감지 설정
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateFavicon = () => {
      // 클라이언트 사이드 체크
      if (typeof window === 'undefined' || typeof document === 'undefined' || !document.head) {
        return;
      }

      const isDarkMode = mediaQuery.matches;
      // 다크 모드 → 라이트 로고 (icon-white.png)
      // 라이트 모드 → 다크 로고 (icon-dark.png)
      const faviconUrl = isDarkMode ? '/icon-white.png' : '/icon-dark.png';
      
      // 캐시 버스터 추가로 강제 업데이트
      const urlWithCache = `${faviconUrl}?v=${Date.now()}`;

      // 기존 파비콘 링크 제거
      const existingLinks = document.head.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
      existingLinks.forEach(link => link.remove());

      // 새로운 파비콘 링크 생성 및 추가
      const createLink = (rel: string) => {
        const link = document.createElement('link');
        link.rel = rel;
        link.href = urlWithCache;
        if (rel === 'icon' || rel === 'shortcut icon') {
          link.type = 'image/png';
        }
        document.head.appendChild(link);
      };

      createLink('icon');
      createLink('shortcut icon');
      createLink('apple-touch-icon');
    };

    // 시스템 테마 변경 감지 리스너 등록
    const handleChange = () => {
      // 클라이언트 사이드에서만 실행
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
      }
      setTimeout(() => updateFavicon(), 0);
    };
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    // 초기 파비콘 설정 (클라이언트 사이드에서만 실행)
    const timeoutId = setTimeout(() => {
      if (typeof window !== 'undefined' && typeof document !== 'undefined' && document.head) {
        updateFavicon();
      }
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return null;
}
