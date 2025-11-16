"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const GlowingStarsBackground = ({
  className,
  ...rest
}: {
  className?: string;
}) => {
  const [mouseEnter, setMouseEnter] = useState(false);

  return (
    <div
      onMouseEnter={() => setMouseEnter(true)}
      onMouseLeave={() => setMouseEnter(false)}
      className={cn("glowing-stars-background", className)}
      {...rest}
    >
      <CardPattern mouseEnter={mouseEnter} />
    </div>
  );
};

export const GlowingStarsTitle = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <h2 className={cn("glowing-stars-title", className)}>
      {children}
    </h2>
  );
};

export const GlowingStarsDescription = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <p className={cn("glowing-stars-description", className)}>{children}</p>
  );
};

const CardPattern = ({ mouseEnter }: { mouseEnter: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
  const [starPositions, setStarPositions] = useState<Array<{ x: number; y: number; opacity: number }>>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    const stars: Array<{ x: number; y: number; opacity: number }> = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }
    setStarPositions(stars);
  }, [dimensions]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      <svg
        className="absolute inset-0 h-full w-full"
        width={dimensions.width}
        height={dimensions.height}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="star-gradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.8)" stopOpacity="1" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {starPositions.map((star, i) => (
          <motion.circle
            key={i}
            cx={star.x}
            cy={star.y}
            r={mouseEnter ? 2 : 1}
            fill="url(#star-gradient)"
            initial={{ opacity: star.opacity }}
            animate={{
              opacity: mouseEnter
                ? [star.opacity, star.opacity * 1.5, star.opacity]
                : star.opacity,
              scale: mouseEnter ? [1, 1.2, 1] : 1,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </div>
  );
};

