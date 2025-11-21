'use client';

import { usePathname } from 'next/navigation';
import LandingHeader from './LandingHeader';

const HIDDEN_ROUTES = new Set([
  '/auth/login',
  '/auth/signup',
  '/privacy',
]);

// Check if current path is an exhibition page
function isExhibitionPage(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname.startsWith('/exhibition/');
}

export default function LandingHeaderWrapper() {
  const pathname = usePathname();
  const isExhibition = isExhibitionPage(pathname);

  if (pathname && HIDDEN_ROUTES.has(pathname)) {
    return null;
  }

  return <LandingHeader isExhibitionPage={isExhibition} />;
}

