'use client';

import { CSSProperties, useRef, useEffect, useState } from 'react';
import { useSmoothCorners } from '@/lib/smoothCorners';

interface SmoothCornerProps {
  radius?: number;
  className?: string;
  style?: CSSProperties;
  children: React.ReactNode;
}

/**
 * Component that applies Apple-style smooth corners to its children
 * Uses CSS clip-path for smooth, continuous corners
 */
export default function SmoothCorner({
  radius = 16,
  className = '',
  style = {},
  children,
}: SmoothCornerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [computedRadius, setComputedRadius] = useState(radius);

  useEffect(() => {
    if (!containerRef.current) return;

    // Dynamically adjust radius based on element size for better visual balance
    const element = containerRef.current;
    const rect = element.getBoundingClientRect();
    const maxRadius = Math.min(rect.width, rect.height) / 2;
    const adjustedRadius = Math.min(radius, maxRadius);
    
    setComputedRadius(adjustedRadius);
  }, [radius]);

  const smoothCornerStyles = useSmoothCorners(computedRadius);
  
  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        ...smoothCornerStyles,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

