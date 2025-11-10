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
        const faviconUrl = isDarkMode ? '/icon-white.png' : '/icon-dark.png';
        
        const timestamp = new Date().getTime();
        const urlWithCache = `${faviconUrl}?v=${timestamp}`;
        
        const existingFavicons = document.querySelectorAll(
          "link[rel='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']"
        );
        existingFavicons.forEach((favicon) => favicon.remove());

        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.href = urlWithCache;
        document.head.appendChild(link);

        const appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        appleLink.href = urlWithCache;
        document.head.appendChild(appleLink);

        const tempLink = document.createElement('link');
        tempLink.rel = 'icon';
        tempLink.href = 'data:,';
        document.head.appendChild(tempLink);
        setTimeout(() => tempLink.remove(), 100);
      };

      updateFaviconSafari();

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateFaviconSafari();

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
