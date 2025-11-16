'use client';

import { motion, AnimatePresence, Transition } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import React from 'react';

interface TextLoopProps {
  children: React.ReactNode[];
  className?: string;
  interval?: number;
  transition?: Transition;
  variants?: {
    initial?: Record<string, any>;
    animate?: Record<string, any>;
    exit?: Record<string, any>;
  };
}

export function TextLoop({
  children,
  className = '',
  interval = 2000,
  transition = {
    type: 'spring' as const,
    stiffness: 900,
    damping: 80,
    mass: 10,
  },
  variants = {
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
  },
}: TextLoopProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLSpanElement>(null);
  const [maxWidth, setMaxWidth] = useState<number | undefined>(undefined);

  // Calculate max width of all children to prevent layout shift
  useEffect(() => {
    if (!containerRef.current || children.length <= 1) return;

    const tempContainer = document.createElement('span');
    tempContainer.style.position = 'absolute';
    tempContainer.style.visibility = 'hidden';
    tempContainer.style.whiteSpace = 'nowrap';
    tempContainer.style.fontSize = 'inherit';
    tempContainer.style.fontWeight = 'inherit';
    tempContainer.style.fontFamily = 'inherit';
    tempContainer.className = className;
    document.body.appendChild(tempContainer);

    let max = 0;
    children.forEach((child) => {
      let text = '';
      if (typeof child === 'string') {
        text = child;
      } else if (child && typeof child === 'object' && 'props' in child) {
        const childProps = (child as any).props;
        if (typeof childProps?.children === 'string') {
          text = childProps.children;
        } else if (React.isValidElement(child)) {
          // Extract text from React element
          const element = child as React.ReactElement;
          if (typeof element.props?.children === 'string') {
            text = element.props.children;
          }
        }
      }
      
      if (text) {
        tempContainer.textContent = text;
        const width = tempContainer.offsetWidth;
        if (width > max) max = width;
      }
    });

    document.body.removeChild(tempContainer);
    if (max > 0) {
      setMaxWidth(max);
    }
  }, [children, className]);

  useEffect(() => {
    if (children.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % children.length);
    }, interval);

    return () => clearInterval(timer);
  }, [children.length, interval]);

  const defaultVariants = {
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
  };

  const mergedVariants = {
    initial: { ...defaultVariants.initial, ...variants.initial },
    animate: { ...defaultVariants.animate, ...variants.animate },
    exit: { ...defaultVariants.exit, ...variants.exit },
  };

  return (
    <span
      ref={containerRef}
      className={className}
      style={{
        display: 'inline-block',
        perspective: '1000px',
        minWidth: maxWidth ? `${maxWidth}px` : 'fit-content',
        textAlign: 'left',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={mergedVariants}
          transition={transition}
          style={{
            display: 'inline-block',
            transformStyle: 'preserve-3d',
            whiteSpace: 'nowrap',
          }}
        >
          {children[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

