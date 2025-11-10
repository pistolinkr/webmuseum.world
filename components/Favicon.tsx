'use client';

import { useEffect } from 'react';

export default function Favicon() {
  useEffect(() => {
    // Safari 감지
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari) {
      // Safari용 로직
      const updateFaviconSafari = () => {
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        // 다크 모드: 화이트 로고, 화이트 모드: 다크 로고
        const faviconUrl = isDarkMode ? '/icon-white.png' : '/icon-dark.png';
        
        const timestamp = new Date().getTime();
        const urlWithCache = `${faviconUrl}?v=${timestamp}`;
        
        // 모든 기존 파비콘 제거
        const existingFavicons = document.querySelectorAll(
          "link[rel='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']"
        );
        existingFavicons.forEach((favicon) => favicon.remove());

        // 새로운 파비콘 추가
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.href = urlWithCache;
        document.head.appendChild(link);

        // Apple touch icon 추가
        const appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        appleLink.href = urlWithCache;
        document.head.appendChild(appleLink);

        // Safari 강제 리로드를 위한 트릭
        const tempLink = document.createElement('link');
        tempLink.rel = 'icon';
        tempLink.href = 'data:,';
        document.head.appendChild(tempLink);
        setTimeout(() => {
          tempLink.remove();
          // 다시 한 번 추가하여 확실히 업데이트
          const refreshLink = document.createElement('link');
          refreshLink.rel = 'icon';
          refreshLink.type = 'image/png';
          refreshLink.href = `${faviconUrl}?v=${Date.now()}`;
          document.head.appendChild(refreshLink);
        }, 100);
      };

      // 초기 실행
      updateFaviconSafari();

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        // Safari에서 약간의 지연을 두고 업데이트
        setTimeout(() => updateFaviconSafari(), 50);
      };

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
    } else {
      // Chrome 및 기타 브라우저용 로직
      const updateFavicon = () => {
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        // 다크 모드: 화이트 로고, 화이트 모드: 다크 로고
        const faviconUrl = isDarkMode ? '/icon-white.png' : '/icon-dark.png';
        
        const favicons = document.querySelectorAll("link[rel='icon'], link[rel='shortcut icon']");
        
        favicons.forEach((favicon) => {
          const link = favicon as HTMLLinkElement;
          link.href = faviconUrl;
        });

        if (favicons.length === 0) {
          const link = document.createElement('link');
          link.rel = 'icon';
          link.type = 'image/png';
          link.href = faviconUrl;
          document.head.appendChild(link);
        }
      };

      updateFavicon();

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateFavicon();
      mediaQuery.addEventListener('change', handleChange);

      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  return null;
}
