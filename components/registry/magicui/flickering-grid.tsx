'use client';

import { useEffect, useRef } from 'react';

interface FlickeringGridProps {
  className?: string;
  squareSize?: number;
  gridGap?: number;
  color?: string;
  maxOpacity?: number;
  flickerChance?: number;
  height?: number;
  width?: number;
}

export function FlickeringGrid({
  className = '',
  squareSize = 4,
  gridGap = 6,
  color = '#6B7280',
  maxOpacity = 0.5,
  flickerChance = 0.1,
  height = 800,
  width = 800,
}: FlickeringGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const cols = Math.floor(width / (squareSize + gridGap));
    const rows = Math.floor(height / (squareSize + gridGap));
    const squares: Array<{ x: number; y: number; opacity: number }> = [];

    // Initialize squares
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        squares.push({
          x: col * (squareSize + gridGap),
          y: row * (squareSize + gridGap),
          opacity: Math.random() * maxOpacity,
        });
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;

      squares.forEach((square) => {
        // Random flicker
        if (Math.random() < flickerChance) {
          square.opacity = Math.random() * maxOpacity;
        }

        ctx.globalAlpha = square.opacity;
        ctx.fillRect(square.x, square.y, squareSize, squareSize);
      });

      ctx.globalAlpha = 1;
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [squareSize, gridGap, color, maxOpacity, flickerChance, height, width]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block' }}
    />
  );
}

