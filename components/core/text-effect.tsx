'use client';

import { motion, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';

type TextEffectPreset = 'blur' | 'fade' | 'slide' | 'scale';

interface TextEffectProps {
  children: string;
  per?: 'word' | 'char' | 'line';
  as?: keyof JSX.IntrinsicElements;
  preset?: TextEffectPreset;
  className?: string;
  delay?: number;
}

const presetVariants = {
  blur: {
    initial: { opacity: 0, filter: 'blur(10px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  slide: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
  },
};

export function TextEffect({
  children,
  per = 'word',
  as: Component = 'span',
  preset = 'blur',
  className = '',
  delay = 0,
}: TextEffectProps) {
  const variant = presetVariants[preset];
  
  // Split text based on 'per' prop
  const splitText = () => {
    if (per === 'word') {
      return children.split(' ');
    } else if (per === 'char') {
      return children.split('');
    } else {
      return [children];
    }
  };

  const parts = splitText();
  const ComponentTag = Component as any;

  return (
    <ComponentTag className={className} style={{ display: 'inline-block' }}>
      {parts.map((part, index) => {
        // Skip empty strings (spaces)
        if (part.trim() === '' && per === 'char') {
          return <span key={index}> </span>;
        }

        return (
          <motion.span
            key={index}
            initial={variant.initial}
            animate={variant.animate}
            transition={{
              duration: 0.5,
              delay: delay + index * 0.05,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={{ display: 'inline-block' }}
          >
            {part}
            {per === 'word' && index < parts.length - 1 && '\u00A0'}
          </motion.span>
        );
      })}
    </ComponentTag>
  );
}

