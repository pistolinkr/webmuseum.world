'use client';

import { useEffect, useRef } from 'react';
import { Artwork } from '@/types';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface StoryViewProps {
  artworks: Artwork[];
}

export default function StoryView({ artworks }: StoryViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 클라이언트에서만 실행
    if (typeof window === 'undefined') return;
    
    // 스크롤바 숨기기 (html과 body 모두에 적용)
    const html = document.documentElement;
    const body = document.body;
    
    html.classList.add('hide-scrollbar');
    body.classList.add('hide-scrollbar');
    
    // 인라인 스타일로 강제 적용 (Safari 대응)
    html.style.overflowY = 'auto';
    html.style.setProperty('scrollbar-width', 'none');
    html.style.setProperty('-ms-overflow-style', 'none');
    body.style.overflowY = 'auto';
    body.style.setProperty('scrollbar-width', 'none');
    body.style.setProperty('-ms-overflow-style', 'none');
    
    return () => {
      html.classList.remove('hide-scrollbar');
      body.classList.remove('hide-scrollbar');
      html.style.overflowY = '';
      html.style.removeProperty('scrollbar-width');
      html.style.removeProperty('-ms-overflow-style');
      body.style.overflowY = '';
      body.style.removeProperty('scrollbar-width');
      body.style.removeProperty('-ms-overflow-style');
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    // GSAP Context를 사용하여 안전한 cleanup
    const ctx = gsap.context(() => {
      const sections = containerRef.current?.querySelectorAll('.story-section');
      
      if (!sections || sections.length === 0) return;
      
      sections.forEach((section, index) => {
        gsap.fromTo(
          section,
          {
            opacity: 0,
            y: 50,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              end: 'top 20%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, containerRef); // containerRef를 scope로 지정

    return () => {
      // Safari-safe cleanup: ScrollTrigger를 먼저 kill한 후 context revert
      try {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      } catch (e) {
        // Safari 호환성: cleanup 실패 시 무시
      }
      
      try {
        ctx.revert();
      } catch (e) {
        // Safari 호환성: cleanup 실패 시 무시
      }
    };
  }, [artworks]);

  return (
    <div ref={containerRef} style={{ paddingTop: '4rem', paddingBottom: '8rem' }}>
      {artworks.map((artwork, index) => (
        <section
          key={artwork.id}
          className="story-section"
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '4rem 2rem',
          }}
        >
          <div
            style={{
              maxWidth: '800px',
              width: '100%',
            }}
          >
            <div
              style={{
                width: '100%',
                aspectRatio: '16/9',
                backgroundColor: 'var(--bg-secondary)',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: 'var(--text-tertiary)' }}>Image: {artwork.title}</span>
            </div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 300, color: 'var(--text-primary)' }}>
              {artwork.title}
            </h2>
            <p style={{ fontSize: '1.125rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              {artwork.caption}
            </p>
            <p style={{ fontSize: '1rem', lineHeight: '1.6', color: 'var(--text-tertiary)' }}>
              {artwork.description}
            </p>
            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
              {artwork.artist} {artwork.year && `• ${artwork.year}`}
            </p>
          </div>
        </section>
      ))}
    </div>
  );
}

