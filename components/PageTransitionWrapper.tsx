'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';

interface PageTransitionWrapperProps {
  children: React.ReactNode;
}

// 네비게이션 페이지들 (Discover, Artist, Explore)
const NAV_PAGES = ['/discover', '/artist', '/explore'];

// 네비게이션 페이지인지 확인
function isNavPage(path: string): boolean {
  return NAV_PAGES.includes(path) || path.startsWith('/artist/');
}

// 같은 전시 내 모드 전환인지 확인하는 함수
function isSameExhibitionModeTransition(prevPath: string, currentPath: string): boolean {
  const prevMatch = prevPath.match(/^\/exhibition\/([^/]+)\/(story|gallery|space)$/);
  const currentMatch = currentPath.match(/^\/exhibition\/([^/]+)\/(story|gallery|space)$/);
  
  if (prevMatch && currentMatch) {
    return prevMatch[1] === currentMatch[1];
  }
  
  return false;
}

export default function PageTransitionWrapper({ children }: PageTransitionWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // 클라이언트 마운트 확인
  useEffect(() => {
    setIsMounted(true);
    if (containerRef.current) {
      gsap.set(containerRef.current, { opacity: 1, x: 0 });
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || !isMounted) return;

    // 첫 로드 시에는 애니메이션 없이 표시
    if (prevPathnameRef.current === null) {
      prevPathnameRef.current = pathname;
      gsap.set(containerRef.current, { opacity: 1, x: 0 });
      return;
    }

    // 경로가 변경된 경우
    if (prevPathnameRef.current !== pathname) {
      // 이전 애니메이션 정리
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }

      // 같은 전시 내 모드 전환인 경우 애니메이션 건너뛰기
      if (isSameExhibitionModeTransition(prevPathnameRef.current, pathname)) {
        prevPathnameRef.current = pathname;
        gsap.set(containerRef.current, { opacity: 1, x: 0 });
        return;
      }

      const prevIsNav = isNavPage(prevPathnameRef.current);
      const currentIsNav = isNavPage(pathname);
      const isFromLanding = prevPathnameRef.current === '/';
      const isToNav = currentIsNav && (prevIsNav || isFromLanding);

      if (isToNav) {
        // 네비게이션 페이지 간 이동 또는 랜딩에서 네비게이션 페이지로 이동
        // 새 페이지를 오른쪽에서 슬라이드 인
        gsap.set(containerRef.current, { x: '100%', opacity: 1 });
        
        timelineRef.current = gsap.timeline({
          onComplete: () => {
            if (containerRef.current) {
              gsap.set(containerRef.current, { x: 0 });
            }
          }
        });

        timelineRef.current.to(containerRef.current, {
          x: 0,
          duration: 0.4,
          ease: 'power2.out',
        });
      } else {
        // 다른 페이지 전환: 페이드 아웃만 (진입은 페이드 없이)
        timelineRef.current = gsap.timeline({
          onComplete: () => {
            if (containerRef.current) {
              gsap.set(containerRef.current, { opacity: 1, x: 0 });
            }
          }
        });

        timelineRef.current.to(containerRef.current, {
          opacity: 0,
          duration: 0.25,
          ease: 'power2.out',
        });
      }

      prevPathnameRef.current = pathname;
    }

    // Cleanup: 언마운트 시 애니메이션 정리
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
    };
  }, [pathname, isMounted]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        opacity: 1, 
        x: 0,
        width: '100%',
        overflow: 'hidden'
      }}
    >
      {children}
    </div>
  );
}

