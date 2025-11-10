'use client';

import { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Artwork } from '@/types';

interface SpaceViewProps {
  artworks: Artwork[];
}

function ExhibitionSpace({ artworks }: { artworks: Artwork[] }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.6, 5]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 2.5, -10]}>
        <planeGeometry args={[20, 5]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Artwork frames */}
      {artworks.map((artwork, index) => {
        const spacing = 4;
        const x = (index - (artworks.length - 1) / 2) * spacing;
        
        return (
          <group key={artwork.id} position={[x, 1.5, -9.5]}>
            {/* Frame */}
            <mesh>
              <boxGeometry args={[2.5, 2, 0.1]} />
              <meshStandardMaterial color="#d4af37" />
            </mesh>
            {/* Canvas placeholder */}
            <mesh position={[0, 0, 0.06]}>
              <planeGeometry args={[2.3, 1.8]} />
              <meshStandardMaterial color="#e0e0e0" />
            </mesh>
          </group>
        );
      })}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={15}
      />
    </>
  );
}

export default function SpaceView({ artworks }: SpaceViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Safari-safe Canvas cleanup
    return () => {
      if (typeof window === 'undefined') return;
      
      try {
        const canvas = containerRef.current?.querySelector('canvas');
        if (canvas && canvas.parentNode) {
          // Safari는 이미 detach된 DOM에 removeChild를 호출하면 에러 발생
          // try-catch로 안전하게 처리
          try {
            canvas.parentNode.removeChild(canvas);
          } catch (e) {
            // Safari safe-fail fallback
            // Canvas가 이미 제거되었거나 parentNode가 없는 경우 무시
          }
        }
      } catch (error) {
        // Cleanup 실패 시 무시 (Safari 호환성)
        console.warn('Canvas cleanup warning:', error);
      }
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
      <Canvas
        frameloop="always"
        gl={{ 
          antialias: true,
          preserveDrawingBuffer: true 
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000');
        }}
      >
        <Suspense fallback={null}>
          <ExhibitionSpace artworks={artworks} />
        </Suspense>
      </Canvas>
    </div>
  );
}

