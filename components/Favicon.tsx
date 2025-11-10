'use client';

import { useEffect } from 'react';

export default function Favicon() {
  useEffect(() => {
    const updateFavicon = () => {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      // Dark mode: use white icon, Light mode: use dark icon
      const faviconUrl = isDarkMode ? '/icon-white.png' : '/icon-dark.png';
      
      // Find all existing favicon links
      const favicons = document.querySelectorAll("link[rel='icon'], link[rel='shortcut icon']");
      
      favicons.forEach((favicon) => {
        const link = favicon as HTMLLinkElement;
        link.href = faviconUrl;
      });

      // If no favicon exists, create one
      if (favicons.length === 0) {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.href = faviconUrl;
        document.head.appendChild(link);
      }
    };

    // Initial update
    updateFavicon();

    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => updateFavicon();
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return null;
}

