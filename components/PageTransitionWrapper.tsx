'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';

interface PageTransitionWrapperProps {
  children: React.ReactNode;
}

// 같은 전시 내 모드 전환인지 확인하는 함수
function isSameExhibitionModeTransition(prevPath: string, currentPath: string): boolean {
  // 전시 페이지 경로 패턴: /exhibition/[id]/[mode]
  const prevMatch = prevPath.match(/^\/exhibition\/([^/]+)\/(story|gallery|space)$/);
  const currentMatch = currentPath.match(/^\/exhibition\/([^/]+)\/(story|gallery|space)$/);
  
  // 둘 다 전시 페이지이고 같은 전시 ID인 경우
  if (prevMatch && currentMatch) {
    return prevMatch[1] === currentMatch[1];
  }
  
  return false;
}

export default function PageTransitionWrapper({ children }: PageTransitionWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 첫 로드 시에는 애니메이션 없이 표시
    if (prevPathnameRef.current === null) {
      prevPathnameRef.current = pathname;
      gsap.set(containerRef.current, { opacity: 1 });
      return;
    }

    // 경로가 변경된 경우
    if (prevPathnameRef.current !== pathname) {
      // 같은 전시 내 모드 전환인 경우 애니메이션 건너뛰기
      if (isSameExhibitionModeTransition(prevPathnameRef.current, pathname)) {
        prevPathnameRef.current = pathname;
        // 애니메이션 없이 즉시 표시
        gsap.set(containerRef.current, { opacity: 1 });
        return;
      }

      // 다른 페이지로 이동하는 경우에만 애니메이션 실행
      const tl = gsap.timeline();

      // 부드러운 페이드 아웃
      tl.to(containerRef.current, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.out',
      });

      // 부드러운 페이드 인
      tl.set(containerRef.current, { opacity: 0 });
      tl.to(containerRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.in',
      });

      prevPathnameRef.current = pathname;
    }
  }, [pathname]);

  return (
    <div ref={containerRef} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

