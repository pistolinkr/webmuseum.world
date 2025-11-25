'use client';

import { useEffect } from 'react';

export default function Favicon() {
  useEffect(() => {
    if (typeof window === 'undefined' || !document.head) return;

    const updateFavicon = () => {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      // 다크 모드 → 라이트 로고 (icon-white.png)
      // 라이트 모드 → 다크 로고 (icon-dark.png)
      const faviconUrl = isDarkMode ? '/icon-white.png' : '/icon-dark.png';

      const ensureLink = (rel: string) => {
        let link = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
        if (!link) {
          link = document.createElement('link');
          link.rel = rel;
          document.head.appendChild(link);
        }
        return link;
      };

      const iconLink = ensureLink('icon');
      const shortcutLink = ensureLink('shortcut icon');
      const appleLink = ensureLink('apple-touch-icon');

      iconLink.href = faviconUrl;
      shortcutLink.href = faviconUrl;
      appleLink.href = faviconUrl;
    };

    // 초기 설정
    updateFavicon();

    // 시스템 테마 변경 감지
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => updateFavicon();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return null;
}
