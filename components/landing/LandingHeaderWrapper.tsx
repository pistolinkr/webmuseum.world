'use client';

import { usePathname } from 'next/navigation';
import LandingHeader from './LandingHeader';

export default function LandingHeaderWrapper() {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  if (!isLandingPage) {
    return null;
  }

  return <LandingHeader />;
}

