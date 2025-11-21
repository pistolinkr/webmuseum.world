'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

const HIDDEN_ROUTES = new Set([
  '/auth/login',
  '/auth/signup',
  '/privacy',
]);

export default function ConditionalFooter() {
  const pathname = usePathname();

  if (pathname && HIDDEN_ROUTES.has(pathname)) {
    return null;
  }

  return <Footer />;
}

