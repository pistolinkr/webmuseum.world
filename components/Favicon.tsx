'use client';

import { useEffect } from 'react';

export default function Favicon() {
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    // DOM이 준비될 때까지 대기
    if (!document.head) {
      return;
    }

    let mediaQuery: MediaQueryList | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const updateFavicon = () => {
      try {
        // 클라이언트 사이드 체크
        if (typeof window === 'undefined' || typeof document === 'undefined' || !document.head) {
          return;
        }

        // 시스템 테마 확인
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        // 다크 모드 → 라이트 로고 (icon-white.png)
        // 라이트 모드 → 다크 로고 (icon-dark.png)
        const faviconUrl = isDarkMode ? '/icon-white.png' : '/icon-dark.png';
        
        // 캐시 버스터 추가로 강제 업데이트
        const urlWithCache = `${faviconUrl}?v=${Date.now()}`;

        // 기존 파비콘 링크 제거
        const existingLinks = document.head.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
        existingLinks.forEach(link => {
          try {
            link.remove();
          } catch (e) {
            // 무시
          }
        });

        // 새로운 파비콘 링크 생성 및 추가
        const createLink = (rel: string) => {
          try {
            const link = document.createElement('link');
            link.rel = rel;
            link.href = urlWithCache;
            if (rel === 'icon' || rel === 'shortcut icon') {
              link.type = 'image/png';
            }
            document.head.appendChild(link);
          } catch (e) {
            // 무시
          }
        };

        createLink('icon');
        createLink('shortcut icon');
        createLink('apple-touch-icon');
      } catch (error) {
        // 에러 발생 시 무시 (파비콘 업데이트 실패는 치명적이지 않음)
      }
    };

    // 시스템 테마 변경 감지 리스너 등록
    const handleChange = () => {
      try {
        if (typeof window !== 'undefined' && typeof document !== 'undefined' && document.head) {
          updateFavicon();
        }
      } catch (error) {
        // 무시
      }
    };

    try {
      // 시스템 테마 감지 설정
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      if (mediaQuery) {
        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', handleChange);
        } else if (mediaQuery.addListener) {
          mediaQuery.addListener(handleChange);
        }
      }

      // 초기 파비콘 설정
      timeoutId = setTimeout(() => {
        updateFavicon();
      }, 100);
    } catch (error) {
      // 초기 설정 실패 시 무시
    }

    return () => {
      try {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (mediaQuery) {
          if (mediaQuery.removeEventListener) {
            mediaQuery.removeEventListener('change', handleChange);
          } else if (mediaQuery.removeListener) {
            mediaQuery.removeListener(handleChange);
          }
        }
      } catch (error) {
        // 무시
      }
    };
  }, []);

  return null;
}
