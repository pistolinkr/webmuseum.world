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
  
  // Extract the last segment of the pathname to determine the mode
  // Path format: /exhibition/[id]/[mode]
  let currentMode: ViewMode = 'story';
  if (pathname) {
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    
    if (lastSegment === 'gallery') {
      currentMode = 'gallery';
    } else if (lastSegment === 'space') {
      currentMode = 'space';
    }
    // Default to 'story' if lastSegment is 'story' or anything else
  }

  return (
    <>
      <Header />
      {children}
      <ModeSwitcher exhibitionId={exhibitionId} currentMode={currentMode} />
    </>
  );
}

