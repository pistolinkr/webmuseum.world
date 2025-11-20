"use client";

import React, { useEffect, useRef } from "react";
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

interface DottedGlowBackgroundProps {
  className?: string;
  opacity?: number;
  gap?: number;
  radius?: number;
  colorLightVar?: string;
  glowColorLightVar?: string;
  colorDarkVar?: string;
  glowColorDarkVar?: string;
  backgroundOpacity?: number;
  speedMin?: number;
  speedMax?: number;
  speedScale?: number;
}

export function DottedGlowBackground({
  className,
  opacity = 0.5,
  gap = 10,
  radius = 1.6,
  colorLightVar = "--color-neutral-500",
  glowColorLightVar = "--color-neutral-600",
  colorDarkVar = "--color-neutral-500",
  glowColorDarkVar = "--color-sky-800",
  backgroundOpacity = 0,
  speedMin = 0.3,
  speedMax = 1.6,
  speedScale = 1,
}: DottedGlowBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const container = canvas.parentElement;
    if (!container) return;

    const resizeCanvas = () => {
      try {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      } catch (e) {
        console.warn('Error resizing canvas:', e);
      }
    };

    resizeCanvas();
    
    // Safely add resize listener
    if (typeof window !== 'undefined') {
      window.addEventListener("resize", resizeCanvas);
    }

    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const colorVar = isDark ? colorDarkVar : colorLightVar;
    const glowColorVar = isDark ? glowColorDarkVar : glowColorLightVar;

    const getComputedColor = (varName: string) => {
      try {
        if (typeof document === 'undefined') return "#6B7280";
        const value = getComputedStyle(document.documentElement)
          .getPropertyValue(varName)
          .trim();
        return value || "#6B7280";
      } catch (e) {
        console.warn('Error getting computed color:', e);
        return "#6B7280";
      }
    };

    const color = getComputedColor(colorVar);
    const glowColor = getComputedColor(glowColorVar);

    const dots: Array<{
      x: number;
      y: number;
      speed: number;
      opacity: number;
    }> = [];

    const cols = Math.floor(canvas.width / gap);
    const rows = Math.floor(canvas.height / gap);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        dots.push({
          x: col * gap + gap / 2,
          y: row * gap + gap / 2,
          speed: speedMin + Math.random() * (speedMax - speedMin),
          opacity: Math.random() * opacity,
        });
      }
    }

    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;

      dots.forEach((dot) => {
        const pulse = Math.sin(time * dot.speed * speedScale) * 0.5 + 0.5;
        const currentOpacity = dot.opacity * pulse * opacity;

        ctx.globalAlpha = currentOpacity;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        if (currentOpacity > 0.3) {
          const gradient = ctx.createRadialGradient(
            dot.x,
            dot.y,
            radius,
            dot.x,
            dot.y,
            radius * 3
          );
          gradient.addColorStop(0, glowColor);
          gradient.addColorStop(1, "transparent");
          ctx.fillStyle = glowColor;
          ctx.globalAlpha = currentOpacity * 0.3;
          ctx.fillRect(dot.x - radius * 3, dot.y - radius * 3, radius * 6, radius * 6);
          ctx.fillStyle = color;
        }
      });

      ctx.globalAlpha = 1;
      time += 0.01;
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      // Safely cleanup
      if (typeof window !== 'undefined') {
        window.removeEventListener("resize", resizeCanvas);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
  }, [
    opacity,
    gap,
    radius,
    colorLightVar,
    glowColorLightVar,
    colorDarkVar,
    glowColorDarkVar,
    backgroundOpacity,
    speedMin,
    speedMax,
    speedScale,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{ opacity: backgroundOpacity === 0 ? 1 : backgroundOpacity }}
    />
  );
}

