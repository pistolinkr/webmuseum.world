'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import SmoothCorner from '@/components/ui/SmoothCorner';
import { TextEffect } from '@/components/core/text-effect';
import { GlowingStarsBackground } from '@/components/ui/glowing-stars';
import { TextLoop } from '@/components/core/text-loop';
import ShimmerButton from '@/components/registry/magicui/shimmer-button';

export default function LandingHero() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const handleScroll = () => {
      try {
        if (sectionRef.current) {
          const rect = sectionRef.current.getBoundingClientRect();
          const sectionTop = rect.top + window.scrollY;
          const currentScroll = window.scrollY;
          
          // 섹션의 시작 위치를 기준으로 스크롤 거리 계산
          const scrollDistance = Math.max(0, currentScroll - sectionTop);
          setScrollY(scrollDistance);
        } else {
          setScrollY(window.scrollY);
        }
      } catch (e) {
        console.warn('Error handling scroll:', e);
      }
    };

    handleScroll(); // 초기값 설정
    
    // Safely add scroll listener
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      // Safely cleanup
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // 스크롤 속도를 80%로 설정 (0.8)
  const scrollSpeed = 0.8;
  const translateY = scrollY * scrollSpeed;

  return (
    <section ref={sectionRef} className="landing-hero">
      <GlowingStarsBackground className="landing-hero__stars-background" />
      <div 
        ref={containerRef}
        className="landing-hero__container"
        style={{
          transform: `translate3d(0, ${-translateY}px, 0)`,
          willChange: 'transform',
        }}
      >
        <div className="landing-hero__title-wrapper">
          <TextEffect
            per="word"
            as="h1"
            preset="blur"
            className="landing-hero__title"
            delay={0.1}
          >
            A new way to experience art online
          </TextEffect>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut', delay: 0.2 }}
          className="landing-hero__subtitle inline-flex whitespace-pre-wrap"
        >
          Build your museum for{' '}
          <TextLoop
            className="overflow-y-clip"
            interval={5000}
            transition={{
              type: 'spring',
              stiffness: 900,
              damping: 80,
              mass: 10,
            }}
            variants={{
              initial: {
                y: 20,
                rotateX: 90,
                opacity: 0,
                filter: 'blur(4px)',
              },
              animate: {
                y: 0,
                rotateX: 0,
                opacity: 1,
                filter: 'blur(0px)',
              },
              exit: {
                y: -20,
                rotateX: -90,
                opacity: 0,
                filter: 'blur(4px)',
              },
            }}
          >
            <span>Artwork</span>
            <span>Music</span>
            <span>Design</span>
            <span>Science</span>
            <span>Engineering</span>
            <span>Architecture</span>
            <span>History</span>
            <span>Literature</span>
            <span>Philosophy</span>
            <span>Religion</span>
            <span>Mathematics</span>
            <span>Physics</span>
            <span>Chemistry</span>
            <span>Biology</span>
            <span>Geology</span>
            <span>Anthropology</span>
            <span>Economics</span>
            <span>Political Science</span>
            <span>Sociology</span>
            <span>Psychology</span>
            <span>Linguistics</span>
            <span>Art History</span>
            <span>Musicology</span>
            <span>Dance</span>
            <span>Theater</span>
            <span>Film</span>
            <span>Television</span>
            <span>Radio</span>
            <span>Internet</span>
            <span>Computer Science</span>
            <span>Information Technology</span>
            <span>Cybersecurity</span>
            <span>Data Science</span>
            <span>Artificial Intelligence</span>
            <span>Machine Learning</span>
            <span>Robotics</span>
            <span>Genetic Engineering</span>
            <span>Nanotechnology</span>
            <span>Renewable Energy</span>
            <span>Sustainable Development</span>
            <span>Environmental Science</span>
            <span>Climate Change</span>
            <span>Space Exploration</span>
            <span>Astronomy</span>
          </TextLoop>
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut', delay: 0.3 }}
        >
          <ShimmerButton 
            className="shadow-2xl"
            onClick={() => router.push('/discover')}
          >
            <span className="text-center text-sm leading-none font-medium tracking-tight whitespace-pre-wrap text-white lg:text-lg dark:from-white dark:to-slate-900/10">
              Explore exhibitions
            </span>
          </ShimmerButton>
        </motion.div>
      </div>
    </section>
  );
}

