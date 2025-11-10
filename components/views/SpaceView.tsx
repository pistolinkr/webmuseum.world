'use client';

import { Suspense } from 'react';
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
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
      <Canvas>
        <Suspense fallback={null}>
          <ExhibitionSpace artworks={artworks} />
        </Suspense>
      </Canvas>
    </div>
  );
}

