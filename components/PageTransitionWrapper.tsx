'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';

interface PageTransitionWrapperProps {
  children: React.ReactNode;
}

// 네비게이션 페이지들 (Discover, Artist, Explore)
const NAV_PAGES = ['/discover', '/artist', '/explore'];

// 네비게이션 페이지 순서 정의
const NAV_ORDER: Record<string, number> = {
  '/discover': 0,
  '/artist': 1,
  '/explore': 2,
};

// 네비게이션 페이지인지 확인
function isNavPage(path: string): boolean {
  return NAV_PAGES.includes(path) || path.startsWith('/artist/');
}

// 네비게이션 페이지의 순서 가져오기
function getNavOrder(path: string): number | null {
  if (path === '/discover') return 0;
  if (path === '/explore') return 2;
  if (path === '/artist' || path.startsWith('/artist/')) return 1;
  return null;
}

// 하단에서 등장하는 페이지들 (Sign in, Sign up, Privacy, My account)
function isBottomSlidePage(path: string): boolean {
  return (
    path === '/auth/login' ||
    path === '/auth/signup' ||
    path === '/privacy' ||
    path === '/account'
  );
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
      gsap.set(containerRef.current, { opacity: 1, x: 0, y: 0 });
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || !isMounted) return;

    // 첫 로드 시에는 애니메이션 없이 표시
    if (prevPathnameRef.current === null) {
      prevPathnameRef.current = pathname;
      gsap.set(containerRef.current, { opacity: 1, x: 0, y: 0 });
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
        gsap.set(containerRef.current, { opacity: 1, x: 0, y: 0 });
        return;
      }

      const prevIsNav = isNavPage(prevPathnameRef.current);
      const currentIsNav = isNavPage(pathname);
      const prevIsBottom = isBottomSlidePage(prevPathnameRef.current);
      const currentIsBottom = isBottomSlidePage(pathname);

      // 하단에서 등장하는 페이지들 (Sign in, Sign up, Privacy, My account)
      if (currentIsBottom) {
        gsap.set(containerRef.current, { y: '100%', opacity: 1, x: 0 });
        
        timelineRef.current = gsap.timeline({
          onComplete: () => {
            if (containerRef.current) {
              gsap.set(containerRef.current, { y: 0 });
            }
          }
        });

        timelineRef.current.to(containerRef.current, {
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
        });
      }
      // 하단 슬라이드 페이지에서 다른 페이지로 이동하는 경우
      else if (prevIsBottom && !currentIsBottom) {
        // 일반 페이드 전환 사용
        timelineRef.current = gsap.timeline({
          onComplete: () => {
            if (containerRef.current) {
              gsap.set(containerRef.current, { opacity: 1, x: 0, y: 0 });
            }
          }
        });

        timelineRef.current.to(containerRef.current, {
          opacity: 0,
          duration: 0.25,
          ease: 'power2.out',
        });
      }
      // 네비게이션 페이지 간 이동
      else if (prevIsNav && currentIsNav) {
        const prevOrder = getNavOrder(prevPathnameRef.current);
        const currentOrder = getNavOrder(pathname);
        
        // 순서가 있는 경우 (discover, artist, explore)
        if (prevOrder !== null && currentOrder !== null) {
          // 앞으로 이동 (discover → artist → explore): 오른쪽에서 등장
          if (currentOrder > prevOrder) {
            // 예: discover(0) → artist(1) → explore(2)
            gsap.set(containerRef.current, { x: '100%', opacity: 1, y: 0 });
            
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
          }
          // 뒤로 이동 (explore → artist → discover, artist → discover): 왼쪽에서 등장
          else if (currentOrder < prevOrder) {
            // 예: explore(2) → artist(1) → discover(0), artist(1) → discover(0)
            gsap.set(containerRef.current, { x: '-100%', opacity: 1, y: 0 });
            
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
          }
          // 같은 순서 (artist → artist/123 등): 기본 오른쪽 슬라이드
          else {
            gsap.set(containerRef.current, { x: '100%', opacity: 1, y: 0 });
            
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
          }
        }
        // 순서를 알 수 없는 경우: 기본 오른쪽 슬라이드
        else {
          gsap.set(containerRef.current, { x: '100%', opacity: 1, y: 0 });
          
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
        }
      }
      // 다른 페이지에서 네비게이션 페이지로 이동 (방향 고려)
      else if (!prevIsNav && currentIsNav) {
        // 다른 페이지에서 네비게이션 페이지로 올 때는 항상 오른쪽에서 등장
        gsap.set(containerRef.current, { x: '100%', opacity: 1, y: 0 });
        
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
      }
      // 랜딩에서 네비게이션 페이지로 이동
      else if (prevPathnameRef.current === '/' && currentIsNav) {
        gsap.set(containerRef.current, { x: '100%', opacity: 1, y: 0 });
        
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
      }
      // 다른 페이지 전환: 페이드 아웃만 (진입은 페이드 없이)
      else {
        timelineRef.current = gsap.timeline({
          onComplete: () => {
            if (containerRef.current) {
              gsap.set(containerRef.current, { opacity: 1, x: 0, y: 0 });
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
        width: '100%',
        overflow: 'hidden'
      }}
    >
      {children}
    </div>
  );
}

