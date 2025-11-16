'use client';

import { motion, useAnimation, useInView, Variants } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface TextRollProps {
  children: string;
  className?: string;
  duration?: number;
  delay?: number;
  immediate?: boolean;
}

export function TextRoll({
  children,
  className = '',
  duration = 0.5,
  delay = 0,
  immediate = false,
}: TextRollProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '0px' });
  const controls = useAnimation();

  useEffect(() => {
    if (immediate || isInView) {
      controls.start('visible');
    }
  }, [isInView, controls, immediate]);

  const letters = children.split('');

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: duration / letters.length,
        delayChildren: delay,
      },
    },
  };

  const letterVariants: Variants = {
    hidden: {
      y: 100,
      opacity: 0,
      rotateX: -90,
    },
    visible: {
      y: 0,
      opacity: 1,
      rotateX: 0,
      transition: {
        duration: duration,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      },
    },
  };

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ display: 'inline-block', perspective: '1000px' }}
      variants={containerVariants}
      initial={immediate ? 'visible' : 'hidden'}
      animate={controls}
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          style={{
            display: 'inline-block',
            transformStyle: 'preserve-3d',
          }}
          variants={letterVariants}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.span>
  );
}

