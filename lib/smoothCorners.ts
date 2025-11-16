/**
 * Apple-style smooth corner utility
 * Creates continuous, smooth corners similar to Apple's UI design
 */

export function getSmoothCornerPath(
  width: number,
  height: number,
  radius: number
): string {
  // Apple uses a continuous corner radius that adapts to the element size
  // This creates a more natural, organic feel
  const effectiveRadius = Math.min(radius, Math.min(width, height) / 2);
  
  // Control point offset for smooth curves (Apple uses ~0.55 for continuous corners)
  const controlOffset = effectiveRadius * 0.55;
  
  return `
    M ${effectiveRadius}, 0
    L ${width - effectiveRadius}, 0
    C ${width - controlOffset}, 0 ${width}, ${controlOffset} ${width}, ${effectiveRadius}
    L ${width}, ${height - effectiveRadius}
    C ${width}, ${height - controlOffset} ${width - controlOffset}, ${height} ${width - effectiveRadius}, ${height}
    L ${effectiveRadius}, ${height}
    C ${controlOffset}, ${height} 0, ${height - controlOffset} 0, ${height - effectiveRadius}
    L 0, ${effectiveRadius}
    C 0, ${controlOffset} ${controlOffset}, 0 ${effectiveRadius}, 0
    Z
  `.replace(/\s+/g, ' ').trim();
}

export function getSmoothCornerClipPath(
  radius: number,
  unit: string = 'px'
): string {
  // Using CSS clip-path with smooth corners
  // This creates a continuous corner effect similar to Apple's design
  return `inset(0 round ${radius}${unit})`;
}

/**
 * React hook for smooth corners
 * Returns style object with clip-path for smooth corners
 */
export function useSmoothCorners(radius: number) {
  return {
    clipPath: getSmoothCornerClipPath(radius),
    borderRadius: `${radius}px`, // Fallback for browsers that don't support clip-path
  };
}

