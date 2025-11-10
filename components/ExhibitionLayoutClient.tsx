'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import ModeSwitcher from '@/components/ModeSwitcher';
import { ViewMode } from '@/types';

export default function ExhibitionLayoutClient({
  children,
  exhibitionId,
}: {
  children: React.ReactNode;
  exhibitionId: string;
}) {
  const pathname = usePathname();
  
  let currentMode: ViewMode = 'story';
  if (pathname?.includes('/gallery')) {
    currentMode = 'gallery';
  } else if (pathname?.includes('/space')) {
    currentMode = 'space';
  }

  return (
    <>
      <Header />
      {children}
      <ModeSwitcher exhibitionId={exhibitionId} currentMode={currentMode} />
    </>
  );
}

