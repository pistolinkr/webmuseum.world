'use client';

import { usePathname } from 'next/navigation';
import LandingHeader from './LandingHeader';

const HIDDEN_ROUTES = new Set([
  '/auth/login',
  '/auth/signup',
]);

export default function LandingHeaderWrapper() {
  const pathname = usePathname();

  if (pathname && HIDDEN_ROUTES.has(pathname)) {
    return null;
  }

  return <LandingHeader />;
}

