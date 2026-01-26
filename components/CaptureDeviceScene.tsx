import React, { useRef, Suspense, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Configure Draco decoder for compressed GLB models
useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

let captureVisible = false;

// Capture device scene for the capture section
// Shows phone on left with VOISe note UI, watch on right with animated waveform

// Item configuration - appears as transcription highlights end
interface CaptureItem {
  id: number;
  text: string;
  icon: string;
  color: string;
  bgColor: string;
  highlighted: boolean;
  showButtons: boolean;
}

const CAPTURE_ITEMS: CaptureItem[] = [
  { id: 1, text: 'Dinner 8pm Friday', icon: '📅', color: '#dc2626', bgColor: '#fef2f2', highlighted: false, showButtons: false },
  { id: 2, text: 'Buy groceries', icon: '✓', color: '#059669', bgColor: '#ecfdf5', highlighted: false, showButtons: false },
  { id: 3, text: 'Call Mom tomorrow', icon: '📞', color: '#2563eb', bgColor: '#eff6ff', highlighted: false, showButtons: false },
];

function ResponsiveCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    const aspect = size.width / size.height;
    const baseZ = 2.2;

    if (aspect < 0.8) {
      camera.position.z = baseZ + (0.8 - aspect) * 2;
    } else if (aspect < 1.2) {
      camera.position.z = baseZ + (1.2 - aspect) * 0.5;
    } else {
      camera.position.z = baseZ;
    }
    camera.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

function CaptureSceneContent() {
  const phoneRef = useRef<THREE.Group>(null);
  const watchRef = useRef<THREE.Group>(null);

  // Load Models
  const phone = useGLTF('/3d_models/iphone_16_pro_max.glb');
  const watch = useGLTF('/3d_models/Apple Watch 8 Ultra.glb');

  // Canvas refs for screen textures
  const phoneCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const phoneTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const watchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const watchTextureRef = useRef<THREE.CanvasTexture | null>(null);

  // Helper to draw rounded rectangle
  const roundRect = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }, []);

  // Draw VOIS logo
  const drawVoisLogo = useCallback((ctx: CanvasRenderingContext2D, centerX: number, centerY: number, size: number, color: string = '#1a1a1a') => {
    const barWidth = size * 0.18;
    const barGap = size * 0.12;
    const shortHeight = size * 0.5;
    const tallHeight = size * 0.85;
    const radius = barWidth / 2;

    ctx.fillStyle = color;

    const leftX = centerX - barWidth - barGap - barWidth / 2;
    roundRect(ctx, leftX, centerY - shortHeight / 2, barWidth, shortHeight, radius);
    ctx.fill();

    roundRect(ctx, centerX - barWidth / 2, centerY - tallHeight / 2, barWidth, tallHeight, radius);
    ctx.fill();

    roundRect(ctx, centerX + barGap + barWidth / 2, centerY - shortHeight / 2, barWidth, shortHeight, radius);
    ctx.fill();
  }, [roundRect]);

  // Draw simple lock screen for phone
  const drawPhoneLockScreen = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Dark blue gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#0a1628');
    bgGradient.addColorStop(0.5, '#0d1f3c');
    bgGradient.addColorStop(1, '#061220');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Time
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = `250 ${height * 0.14}px -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('03:56', width / 2, height * 0.22);

    // Recording widget (red pulsing)
    const widgetY = height * 0.72;
    const widgetSize = width * 0.16;

    ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
    ctx.beginPath();
    ctx.arc(width / 2, widgetY, widgetSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(width / 2, widgetY, widgetSize * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Home indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    roundRect(ctx, width * 0.35, height * 0.965, width * 0.3, height * 0.006, 3);
    ctx.fill();
  }, [roundRect]);

  // Draw simple watch screen
  const drawWatchScreen = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Time
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${width * 0.34}px -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('03', width * 0.32, height * 0.4);
    ctx.fillText('59', width * 0.68, height * 0.4);

    // Recording complication
    const bottomY = height * 0.72;
    const compR = width * 0.12;

    ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
    ctx.beginPath();
    ctx.arc(width * 0.2, bottomY, compR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(width * 0.2, bottomY, compR * 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.font = `600 ${width * 0.04}px -apple-system`;
    ctx.fillText('REC', width * 0.2, height * 0.88);
  }, []);

  // Set up screen textures
  useEffect(() => {
    const phoneCanvas = document.createElement('canvas');
    phoneCanvas.width = 512;
    phoneCanvas.height = 1024;
    phoneCanvasRef.current = phoneCanvas;

    const watchCanvas = document.createElement('canvas');
    watchCanvas.width = 328;
    watchCanvas.height = 392;
    watchCanvasRef.current = watchCanvas;

    // Draw initial content
    const phoneCtx = phoneCanvas.getContext('2d');
    const watchCtx = watchCanvas.getContext('2d');
    if (phoneCtx) drawPhoneLockScreen(phoneCtx, phoneCanvas.width, phoneCanvas.height);
    if (watchCtx) drawWatchScreen(watchCtx, watchCanvas.width, watchCanvas.height);

    // Apply to phone - screen and add glossiness to body
    phone.scene.traverse((child: any) => {
      if (child.isMesh) {
        const isScreen = child.name === 'Cube014_screen001_0' || child.material?.name === 'screen001';

        if (isScreen) {
          const geometry = child.geometry.clone();
          child.geometry = geometry;

          const pos = geometry.attributes.position.array;
          let minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
          for (let i = 0; i < pos.length; i += 3) {
            minY = Math.min(minY, pos[i + 1]);
            maxY = Math.max(maxY, pos[i + 1]);
            minZ = Math.min(minZ, pos[i + 2]);
            maxZ = Math.max(maxZ, pos[i + 2]);
          }

          const vertCount = pos.length / 3;
          const newUV = new Float32Array(vertCount * 2);
          for (let i = 0; i < vertCount; i++) {
            const y = pos[i * 3 + 1];
            const z = pos[i * 3 + 2];
            newUV[i * 2] = 1 - (y - minY) / (maxY - minY);
            newUV[i * 2 + 1] = 1 - (z - minZ) / (maxZ - minZ);
          }
          geometry.setAttribute('uv', new THREE.BufferAttribute(newUV, 2));

          const texture = new THREE.CanvasTexture(phoneCanvas);
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.flipY = false;
          phoneTextureRef.current = texture;

          child.material = new THREE.MeshBasicMaterial({
            map: texture,
            toneMapped: false,
            side: THREE.DoubleSide,
          });
        }
        // Keep original materials for body/frame (no else clause)
      }
    });

    // Apply to watch - screen and add glossiness to body
    // After optimization, meshes may be joined - need to check material arrays too
    watch.scene.traverse((child: any) => {
      if (child.isMesh) {
        // Check multiple ways to identify the screen mesh
        const meshNameMatch = child.name === 'Cube004_4' || child.name === 'Cube.004_4' || child.name.includes('004_4');

        const materials = Array.isArray(child.material) ? child.material : [child.material];
        const screenMaterialIndex = materials.findIndex((m: any) => m?.name === 'Material.004');
        const materialMatch = screenMaterialIndex !== -1;

        const isScreen = meshNameMatch || materialMatch;

        if (isScreen) {
          const texture = new THREE.CanvasTexture(watchCanvas);
          texture.flipY = false;
          texture.colorSpace = THREE.SRGBColorSpace;
          watchTextureRef.current = texture;

          const newScreenMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            toneMapped: false,
            side: THREE.DoubleSide,
          });

          // Replace only the screen material in the array, or the whole material if single
          if (Array.isArray(child.material)) {
            child.material[screenMaterialIndex] = newScreenMaterial;
          } else {
            child.material = newScreenMaterial;
          }
        }
        // Keep original materials for body/frame (no else clause)
      }
    });

    return () => {
      phoneTextureRef.current?.dispose();
      watchTextureRef.current?.dispose();
    };
  }, [phone, watch, drawPhoneLockScreen, drawWatchScreen]);

  // Subtle floating animation
  const timeRef = useRef(0);
  useFrame((state, delta) => {
    if (!captureVisible) return;
    state.invalidate();
    timeRef.current += delta;
    const time = timeRef.current;

    if (phoneRef.current) {
      phoneRef.current.position.y = -0.1 + Math.sin(time * 0.8) * 0.02;
      phoneRef.current.rotation.y = Math.PI / 2 + 0.15 + Math.cos(time * 0.6) * 0.02;
    }

    if (watchRef.current) {
      watchRef.current.position.y = -0.1 + Math.sin(time * 0.9 + 1) * 0.02;
      watchRef.current.rotation.y = -0.1 + Math.cos(time * 0.7 + 1) * 0.02;
    }
  });

  return (
    <>
      {/* Phone on left */}
      <group ref={phoneRef} scale={0.28} position={[-0.55, -0.1, 0.3]} rotation={[0, Math.PI / 2 + 0.15, 0]}>
        <primitive object={phone.scene} />
      </group>

      {/* Watch on right */}
      <group ref={watchRef} scale={0.13} position={[0.45, -0.1, 0.3]} rotation={[0, -0.1, 0]}>
        <primitive object={watch.scene} />
      </group>
    </>
  );
}

export const CaptureDeviceScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        captureVisible = entry.isIntersecting;
      },
      { rootMargin: '100px' }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <Canvas
        frameloop="demand"
        camera={{ position: [0, 0, 2.2], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
      >
        <ambientLight intensity={2} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        <directionalLight position={[-5, 5, 5]} intensity={1.5} />
        <directionalLight position={[0, 0, 5]} intensity={1.5} />

        <Suspense fallback={null}>
          <ResponsiveCamera />
          <CaptureSceneContent />
          <Environment preset="studio" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default CaptureDeviceScene;
