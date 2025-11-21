'use client';

import { usePathname } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import LandingHeader from './LandingHeader';

const HIDDEN_ROUTES = new Set([
  '/auth/login',
  '/auth/signup',
  '/privacy',
]);

export default function LandingHeaderWrapper() {
  const pathname = usePathname();

  // Hide on auth routes and exhibition routes
  const shouldHide = pathname && (
    HIDDEN_ROUTES.has(pathname) ||
    pathname.startsWith('/exhibition/')
  );

  return (
    <AnimatePresence mode="wait">
      {!shouldHide && <LandingHeader key="landing-header" />}
    </AnimatePresence>
  );
}

