'use client';

import { useEffect, useRef, useState } from 'react';
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
  const [isMounted, setIsMounted] = useState(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // 클라이언트 마운트 확인
  useEffect(() => {
    setIsMounted(true);
    if (containerRef.current) {
      gsap.set(containerRef.current, { opacity: 1 });
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || !isMounted) return;

    // 첫 로드 시에는 애니메이션 없이 표시
    if (prevPathnameRef.current === null) {
      prevPathnameRef.current = pathname;
      gsap.set(containerRef.current, { opacity: 1 });
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
        // 애니메이션 없이 즉시 표시
        gsap.set(containerRef.current, { opacity: 1 });
        return;
      }

      // 다른 페이지로 이동하는 경우에만 애니메이션 실행
      timelineRef.current = gsap.timeline();

      // 부드러운 페이드 아웃
      timelineRef.current.to(containerRef.current, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.out',
      });

      // 부드러운 페이드 인
      timelineRef.current.set(containerRef.current, { opacity: 0 });
      timelineRef.current.to(containerRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.in',
      });

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

  // 서버 사이드와 클라이언트 초기 렌더링 모두 opacity 1로 시작하여 하이드레이션 오류 방지
  return (
    <div ref={containerRef} style={{ opacity: 1 }}>
      {children}
    </div>
  );
}

