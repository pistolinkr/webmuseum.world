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
  // Ensure children is always an array and has valid length
  const validChildren = Array.isArray(children) && children.length > 0 ? children : [];
  const safeChildren = validChildren.length > 0 ? validChildren : [''];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLSpanElement>(null);
  const [maxWidth, setMaxWidth] = useState<number | undefined>(undefined);
  
  // Ensure currentIndex is always within bounds
  const safeCurrentIndex = Math.max(0, Math.min(currentIndex, safeChildren.length - 1));

  // Calculate max width of all children to prevent layout shift
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    if (!containerRef.current || safeChildren.length <= 1) {
      setMaxWidth(undefined);
      return;
    }

    // Initialize max outside the if block to ensure it's always defined
    let max = 0;

    try {
      const tempContainer = document.createElement('span');
      tempContainer.style.position = 'absolute';
      tempContainer.style.visibility = 'hidden';
      tempContainer.style.whiteSpace = 'nowrap';
      tempContainer.style.fontSize = 'inherit';
      tempContainer.style.fontWeight = 'inherit';
      tempContainer.style.fontFamily = 'inherit';
      tempContainer.className = className;

      // Only proceed if document.body is available
      if (document.body) {
        document.body.appendChild(tempContainer);

        safeChildren.forEach((child) => {
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

        // Safely remove the temporary container
        try {
          if (tempContainer.parentNode && document.body.contains(tempContainer)) {
            document.body.removeChild(tempContainer);
          }
        } catch (e) {
          // Element may have been removed by React or other code
          console.warn('Could not remove temp container:', e);
        }
      }
    } catch (error) {
      // If anything goes wrong, just set maxWidth to undefined
      console.warn('Error calculating max width:', error);
      max = 0;
    }

    // Set maxWidth only if max is greater than 0
    if (max > 0) {
      setMaxWidth(max);
    } else {
      setMaxWidth(undefined);
    }
  }, [safeChildren, className]);

  useEffect(() => {
    if (safeChildren.length <= 1) {
      setCurrentIndex(0);
      return;
    }

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % safeChildren.length;
        return Math.max(0, Math.min(next, safeChildren.length - 1));
      });
    }, interval);

    return () => clearInterval(timer);
  }, [safeChildren.length, interval]);

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
          {safeChildren[safeCurrentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

