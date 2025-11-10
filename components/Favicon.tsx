'use client';

import { useEffect } from 'react';

export default function Favicon() {
  useEffect(() => {
    const updateFavicon = () => {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const favicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      
      if (favicon) {
        favicon.href = isDarkMode ? '/icon-dark.png' : '/icon.png';
      } else {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = isDarkMode ? '/icon-dark.png' : '/icon.png';
        document.head.appendChild(link);
      }
    };

    updateFavicon();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => updateFavicon();
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return null;
}

