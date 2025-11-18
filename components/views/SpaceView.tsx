'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';
import { Artwork } from '@/types';
import { TextureLoader } from 'three';

interface SpaceViewProps {
  artworks: Artwork[];
  exhibitionId: string;
}

function ArtworkImage({ imageUrl, onLoad, width, height }: { 
  imageUrl: string; 
  onLoad: (width: number, height: number) => void;
  width: number;
  height: number;
}) {
  const texture = useLoader(TextureLoader, imageUrl);
  const meshRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    if (texture && texture.image) {
      const imgWidth = texture.image.width;
      const imgHeight = texture.image.height;
      onLoad(imgWidth, imgHeight);
      // 텍스처 설정 - Three.js WebGL은 기본적으로 Y축이 뒤집혀있어서 flipY = true 필요
      texture.flipY = true;
      texture.needsUpdate = true;
      texture.format = THREE.RGBAFormat;
    }
  }, [texture, onLoad]);

  // 이미지 크기가 변경될 때 geometry 업데이트
  useEffect(() => {
    if (meshRef.current && width > 0 && height > 0) {
      meshRef.current.geometry.dispose();
      meshRef.current.geometry = new THREE.PlaneGeometry(width, height);
    }
  }, [width, height]);

  // 이미지가 로드되지 않았을 경우 fallback
  if (!texture || !texture.image) {
    return (
      <mesh ref={meshRef} position={[0, 0, 0.071]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
    );
  }

  return (
    <mesh ref={meshRef} position={[0, 0, 0.071]}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial 
        map={texture} 
        side={THREE.FrontSide}
        transparent={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function ArtworkFrame({ artwork, position, onArtworkClick }: { 
  artwork: Artwork;
  position: [number, number, number];
  onArtworkClick: (artworkId: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [imageAspect, setImageAspect] = useState<number | null>(null);
  const frameRef = useRef<THREE.Group>(null);
  
  // 기본 프레임 크기 (이미지 로드 전)
  const baseFrameWidth = 2.5;
  const baseFrameHeight = 2.0;
  const framePadding = 0.15;
  
  // 이미지 비율에 따라 프레임 크기 계산
  let frameWidth = baseFrameWidth;
  let frameHeight = baseFrameHeight;
  let imageWidth = baseFrameWidth - framePadding * 2;
  let imageHeight = baseFrameHeight - framePadding * 2;
  
  if (imageAspect !== null) {
    // 사용 가능한 영역 크기
    const availableWidth = baseFrameWidth - framePadding * 2;
    const availableHeight = baseFrameHeight - framePadding * 2;
    const availableAspect = availableWidth / availableHeight;
    
    // 이미지 비율에 따라 프레임 크기 결정
    if (imageAspect > availableAspect) {
      // 이미지가 가로로 더 긴 경우 - 가로를 기준으로
      frameWidth = baseFrameWidth;
      frameHeight = baseFrameWidth / imageAspect + framePadding * 2;
      imageWidth = availableWidth;
      imageHeight = availableWidth / imageAspect;
    } else {
      // 이미지가 세로로 더 긴 경우 - 세로를 기준으로
      frameHeight = baseFrameHeight;
      frameWidth = baseFrameHeight * imageAspect + framePadding * 2;
      imageWidth = availableHeight * imageAspect;
      imageHeight = availableHeight;
    }
  }

  const handleImageLoad = (width: number, height: number) => {
    const aspect = width / height;
    console.log('Setting image aspect:', aspect, 'for', artwork.title);
    setImageAspect(aspect);
  };

  // 호버 애니메이션 - 더 부드럽게
  useFrame(() => {
    if (frameRef.current) {
      const targetScale = hovered ? 1.05 : 1;
      frameRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), 0.15);
    }
  });

  return (
    <group 
      ref={frameRef}
      position={position}
      onClick={() => onArtworkClick(artwork.id)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Frame - 더 세련된 디자인 */}
      <mesh castShadow>
        <boxGeometry args={[frameWidth, frameHeight, 0.12]} />
        <meshStandardMaterial 
          color={hovered ? "#f4d03f" : "#d4af37"} 
          metalness={0.4}
          roughness={0.15}
        />
      </mesh>
      
      {/* Frame inner border */}
      <mesh position={[0, 0, 0.055]}>
        <boxGeometry args={[frameWidth - 0.05, frameHeight - 0.05, 0.02]} />
        <meshStandardMaterial color="#8b6914" />
      </mesh>
      
      {/* Mat/backing behind image */}
      <mesh position={[0, 0, 0.062]}>
        <planeGeometry args={[frameWidth - 0.1, frameHeight - 0.1]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      
      {/* Artwork Image */}
      {artwork.imageUrl ? (
        <Suspense fallback={
          <mesh position={[0, 0, 0.071]}>
            <planeGeometry args={[imageWidth, imageHeight]} />
            <meshStandardMaterial color="#e0e0e0" />
          </mesh>
        }>
          <ArtworkImage 
            key={artwork.id}
            imageUrl={artwork.imageUrl} 
            onLoad={handleImageLoad}
            width={imageWidth}
            height={imageHeight}
          />
        </Suspense>
      ) : (
        <mesh position={[0, 0, 0.071]}>
          <planeGeometry args={[imageWidth, imageHeight]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>
      )}
      
      {/* 작품 제목 (호버 시 표시) */}
      {hovered && (
        <group position={[0, -frameHeight / 2 - 0.3, 0]}>
          <mesh>
            <planeGeometry args={[frameWidth + 0.5, 0.4]} />
            <meshStandardMaterial color="#000000" opacity={0.8} transparent />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.12}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            maxWidth={frameWidth + 0.3}
          >
            {artwork.title}
          </Text>
          <Text
            position={[0, -0.15, 0.01]}
            fontSize={0.08}
            color="#cccccc"
            anchorX="center"
            anchorY="middle"
            maxWidth={frameWidth + 0.3}
          >
            {artwork.artist}
          </Text>
        </group>
      )}
    </group>
  );
}

function ExhibitionSpace({ artworks, exhibitionId, onArtworkClick }: { 
  artworks: Artwork[];
  exhibitionId: string;
  onArtworkClick: (artworkId: string) => void;
}) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.6, 5]} />
      
      {/* 조명 개선 */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-10, 8, 5]} intensity={0.6} />
      <pointLight position={[0, 3, 0]} intensity={0.5} />
      
      {/* Floor with pattern */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial 
          color="#e8e8e8" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Floor grid pattern */}
      {Array.from({ length: 20 }).map((_, i) => {
        const points = [
          new THREE.Vector3(-10 + i, 0.01, -10),
          new THREE.Vector3(-10 + i, 0.01, 10),
        ];
        return (
          <line key={`grid-x-${i}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
                array={new Float32Array([
                  points[0].x, points[0].y, points[0].z,
                  points[1].x, points[1].y, points[1].z,
                ])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#d0d0d0" opacity={0.3} transparent />
        </line>
        );
      })}
      {Array.from({ length: 20 }).map((_, i) => {
        const points = [
          new THREE.Vector3(-10, 0.01, -10 + i),
          new THREE.Vector3(10, 0.01, -10 + i),
        ];
        return (
          <line key={`grid-z-${i}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
                array={new Float32Array([
                  points[0].x, points[0].y, points[0].z,
                  points[1].x, points[1].y, points[1].z,
                ])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#d0d0d0" opacity={0.3} transparent />
        </line>
        );
      })}

      {/* Back Wall */}
      <mesh position={[0, 2.5, -10]} receiveShadow>
        <planeGeometry args={[20, 5]} />
        <meshStandardMaterial color="#f8f8f8" />
      </mesh>

      {/* Side Walls */}
      <mesh position={[-10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 5]} />
        <meshStandardMaterial color="#f8f8f8" />
      </mesh>
      <mesh position={[10, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 5]} />
        <meshStandardMaterial color="#f8f8f8" />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Artwork frames with images */}
      {artworks.map((artwork, index) => {
        const spacing = 4.5;
        const x = (index - (artworks.length - 1) / 2) * spacing;
        
        return (
          <ArtworkFrame 
            key={artwork.id}
            artwork={artwork}
            position={[x, 1.5, -9.5]}
            onArtworkClick={onArtworkClick}
          />
        );
      })}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={15}
        target={[0, 1.5, -5]}
      />
    </>
  );
}

export default function SpaceView({ artworks, exhibitionId }: SpaceViewProps) {
  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const router = useRouter();
  
  // Detect Safari browser
  const isSafari = typeof window !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  const handleArtworkClick = (artworkId: string) => {
    router.push(`/exhibition/${exhibitionId}/artwork/${artworkId}`);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0 }}>
      <Canvas
        frameloop="always"
        gl={{
          preserveDrawingBuffer: true,
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          // Safari-specific WebGL settings
          ...(isSafari && {
            failIfMajorPerformanceCaveat: false,
            desynchronized: false,
          }),
        }}
        onCreated={({ gl, scene, camera }) => {
          glRef.current = gl;
          sceneRef.current = scene;
          cameraRef.current = camera;
          
          gl.setClearColor('#000000');
          
          // Handle WebGL context loss (especially important for Safari)
          const canvas = gl.domElement;
          
          const handleContextLost = (event: Event) => {
            event.preventDefault();
            console.warn('⚠️ WebGL context lost. Attempting to restore...');
          };
          
          const handleContextRestored = () => {
            console.log('✅ WebGL context restored');
            // Re-render scene after context restoration
            if (glRef.current && sceneRef.current && cameraRef.current) {
              glRef.current.render(sceneRef.current, cameraRef.current);
            }
          };
          
          canvas.addEventListener('webglcontextlost', handleContextLost);
          canvas.addEventListener('webglcontextrestored', handleContextRestored);
          
          // Cleanup on unmount
          return () => {
            canvas.removeEventListener('webglcontextlost', handleContextLost);
            canvas.removeEventListener('webglcontextrestored', handleContextRestored);
          };
        }}
        dpr={isSafari ? [1, 1.5] : [1, 2]} // Limit DPR for Safari to prevent context loss
      >
        <Suspense fallback={null}>
          <ExhibitionSpace artworks={artworks} exhibitionId={exhibitionId} onArtworkClick={handleArtworkClick} />
        </Suspense>
      </Canvas>
    </div>
  );
}

