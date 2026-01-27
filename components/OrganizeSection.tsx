import React, { useRef, Suspense, useEffect, useState, useCallback } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useIsMobile } from '../hooks/useIsMobile';

// Draco decoder needed for macbook_pro.glb (keyboard) and iphone model
useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

// Module-level shared state
const scrollState = {
  lidProgress: 0,
  smoothLidProgress: 0,
  mouseX: 0,
  mouseY: 0,
  isVisible: false,
};

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function piecewise(t: number, points: [number, number][]): number {
  if (t <= points[0][0]) return points[0][1];
  if (t >= points[points.length - 1][0]) return points[points.length - 1][1];
  for (let i = 0; i < points.length - 1; i++) {
    if (t <= points[i + 1][0]) {
      const frac = (t - points[i][0]) / (points[i + 1][0] - points[i][0]);
      return points[i][1] + (points[i + 1][1] - points[i][1]) * frac;
    }
  }
  return points[points.length - 1][1];
}

// Reusable drag hook for individual device dragging
function useDrag() {
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragDeltaX = useRef(0);
  const dragDeltaY = useRef(0);
  const smoothDragX = useRef(0);
  const smoothDragY = useRef(0);

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      dragDeltaX.current = (e.clientX - dragStartX.current) / window.innerWidth;
      dragDeltaY.current = (e.clientY - dragStartY.current) / window.innerHeight;
    };
    const handleUp = () => {
      isDragging.current = false;
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, []);

  const onPointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    isDragging.current = true;
    dragStartX.current = e.nativeEvent.clientX;
    dragStartY.current = e.nativeEvent.clientY;
    dragDeltaX.current = 0;
    dragDeltaY.current = 0;
  }, []);

  // Call this in useFrame to get smoothed drag offsets
  const updateDrag = () => {
    if (isDragging.current) {
      smoothDragX.current += (dragDeltaX.current - smoothDragX.current) * 0.1;
      smoothDragY.current += (dragDeltaY.current - smoothDragY.current) * 0.1;
    } else {
      smoothDragX.current += (0 - smoothDragX.current) * 0.03;
      smoothDragY.current += (0 - smoothDragY.current) * 0.03;
      dragDeltaX.current *= 0.95;
      dragDeltaY.current *= 0.95;
    }
    return {
      posX: smoothDragX.current * 0.6,
      posY: -smoothDragY.current * 0.6,
      rotX: smoothDragY.current * 0.7,
      rotY: smoothDragX.current * 0.9,
    };
  };

  return { onPointerDown, updateDrag };
}

function ResponsiveCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    const aspect = size.width / size.height;
    const baseZ = 3.2;

    if (aspect < 0.8) {
      camera.position.z = baseZ + (0.8 - aspect) * 3.0;
    } else if (aspect < 1.2) {
      camera.position.z = baseZ + (1.2 - aspect) * 0.6;
    } else {
      camera.position.z = baseZ;
    }
    camera.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

const _xAxis = new THREE.Vector3(1, 0, 0);

// ─── MacBook (independent floating + lid animation + individual drag) ─────────

function MacBookDevice() {
  const macGltf = useGLTF('/3d_models/mac.glb');
  const kbGltf = useGLTF('/3d_models/macbook_pro.glb');

  const [scene] = useState(() => {
    const s = macGltf.scene.clone(true);

    const kbSource = kbGltf.scene.getObjectByName('Keyboard');
    if (kbSource) {
      const kb = kbSource.clone(true);
      kb.scale.set(7.5, 7.5, 7.5);
      kb.position.set(0, 0.1, -5);

      const blackMat = new THREE.MeshStandardMaterial({
        color: '#0a0a0a',
        metalness: 0,
        roughness: 0.85,
        envMapIntensity: 0.05,
      });
      kb.traverse((child: any) => {
        if (child.isMesh) {
          if (Array.isArray(child.material)) {
            child.material = child.material.map(() => blackMat);
          } else {
            child.material = blackMat;
          }
        }
      });
      s.add(kb);
    }

    return s;
  });

  const groupRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Object3D | null>(null);
  const smoothMouseX = useRef(0);
  const smoothMouseY = useRef(0);
  const { onPointerDown, updateDrag } = useDrag();

  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.name === 'screen') {
        screenRef.current = child;
        child.quaternion.setFromAxisAngle(_xAxis, Math.PI);
      }

      if (child.isMesh) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat: any) => {
          if (!mat) return;
          if (mat.name === 'aluminium') {
            mat.color.set('#b8b8bd');
            mat.metalness = 0.85;
            mat.roughness = 0.28;
            mat.envMapIntensity = 0.6;
          }
          if (mat.name === 'blackmatte') {
            mat.color.set('#0a0a0a');
            mat.roughness = 0.9;
            mat.envMapIntensity = 0.1;
          }
        });
      }
    });

    // MacBook screen texture — flipY=true to fix upside-down image
    const loader = new THREE.TextureLoader();
    loader.load('/Photos/macbook-screen.webp', (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.flipY = true;
      scene.traverse((child: any) => {
        if (!child.isMesh) return;
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat: any, idx: number) => {
          if (mat?.name === 'matte') {
            const screenMat = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
            if (Array.isArray(child.material)) {
              child.material[idx] = screenMat;
            } else {
              child.material = screenMat;
            }
          }
        });
      });
    });
  }, [scene]);

  useFrame((state) => {
    if (!scrollState.isVisible) return;
    state.invalidate();
    const time = state.clock.elapsedTime;

    scrollState.smoothLidProgress += (scrollState.lidProgress - scrollState.smoothLidProgress) * 0.12;
    const p = scrollState.smoothLidProgress;

    // Lid animation — opens as section scrolls through viewport
    const lidFraction = piecewise(p, [
      [0, 0], [0.1, 0.2], [0.3, 0.8], [0.45, 1.0], [1.0, 1.0],
    ]);
    const lidEased = easeInOutCubic(lidFraction);

    if (screenRef.current) {
      const closedAngle = Math.PI;
      const openAngle = 70 * (Math.PI / 180);
      const currentAngle = closedAngle + (openAngle - closedAngle) * lidEased;
      screenRef.current.quaternion.setFromAxisAngle(_xAxis, currentAngle);
    }

    if (!groupRef.current) return;

    const drag = updateDrag();

    smoothMouseX.current += (scrollState.mouseX - smoothMouseX.current) * 0.03;
    smoothMouseY.current += (scrollState.mouseY - smoothMouseY.current) * 0.03;
    const mX = smoothMouseX.current * 0.12;
    const mY = smoothMouseY.current * 0.08;

    const ambientY = Math.sin(time * 0.7) * 0.012;
    const ambientX = Math.cos(time * 0.5) * 0.006;

    groupRef.current.position.x = 0.3 + ambientX - mX + drag.posX;
    groupRef.current.position.y = -0.6 + ambientY - mY + drag.posY;
    groupRef.current.position.z = 0;

    groupRef.current.rotation.x = 0.3 + Math.sin(time * 0.4) * 0.015 - mY * 0.3 + drag.rotX;
    groupRef.current.rotation.y = Math.cos(time * 0.6) * 0.015 + mX * 0.3 + drag.rotY;
    groupRef.current.rotation.z = 0;
  });

  return (
    <group ref={groupRef} onPointerDown={onPointerDown}>
      <primitive object={scene} scale={0.04} />
    </group>
  );
}

// ─── Phone (independent floating + scroll-driven rotation + individual drag) ──

function PhoneDevice() {
  const phoneGltf = useGLTF('/3d_models/iphone_16_pro_max.glb');
  const [scene] = useState(() => phoneGltf.scene.clone(true));
  const groupRef = useRef<THREE.Group>(null);
  const smoothMouseX = useRef(0);
  const smoothMouseY = useRef(0);
  const { onPointerDown, updateDrag } = useDrag();

  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat: any) => {
          if (!mat) return;
          if (mat.name === 'metalframe.002') {
            mat.color.set('#2a2a2e');
            mat.metalness = 0.9;
            mat.roughness = 0.3;
            mat.envMapIntensity = 0.5;
          }
        });
      }
    });

    // Phone screen texture
    // The model's built-in UVs are broken — recalculate from vertex positions
    // (same approach used by the hero DeviceScene)
    const loader = new THREE.TextureLoader();
    loader.load(
      '/Photos/IMG_3495%202.PNG',
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.flipY = false;

        scene.traverse((child: any) => {
          if (!child.isMesh) return;
          // Match screen mesh — dots stripped from names by GLTFLoader
          const nameMatch = child.name.toLowerCase().includes('screen');
          const matMatch = child.material?.name === 'screen001' || child.material?.name === 'screen.001';

          if (nameMatch || matMatch) {
            // Clone geometry and fix UVs from vertex positions
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
              newUV[i * 2] = 1 - (y - minY) / (maxY - minY);       // U = 1-Y (flipped)
              newUV[i * 2 + 1] = 1 - (z - minZ) / (maxZ - minZ);   // V = 1-Z (flipped)
            }
            geometry.setAttribute('uv', new THREE.BufferAttribute(newUV, 2));

            child.material = new THREE.MeshBasicMaterial({
              map: texture,
              toneMapped: false,
              side: THREE.DoubleSide,
            });
          }
        });
      },
      undefined,
      (err) => {
        console.error('Phone screen texture failed to load:', err);
      }
    );
  }, [scene]);

  useFrame((state) => {
    if (!scrollState.isVisible) return;
    state.invalidate();
    const time = state.clock.elapsedTime;

    // Read smoothed scroll progress (already updated by MacBook's useFrame)
    const p = scrollState.smoothLidProgress;

    // Phone Y rotation: starts showing back, rotates to show screen
    const phoneRotY = piecewise(p, [
      [0, -Math.PI / 2],      // back facing camera
      [0.05, -Math.PI / 2],   // still showing back during entry
      [0.2, 0],               // sideways (halfway through turn)
      [0.4, Math.PI / 2],     // screen fully facing camera
      [1.0, Math.PI / 2],     // stays facing
    ]);

    if (!groupRef.current) return;

    const drag = updateDrag();

    smoothMouseX.current += (scrollState.mouseX - smoothMouseX.current) * 0.05;
    smoothMouseY.current += (scrollState.mouseY - smoothMouseY.current) * 0.05;
    const mX = smoothMouseX.current * 0.08;
    const mY = smoothMouseY.current * 0.06;

    const ambientY = Math.sin(time * 0.9 + 1.5) * 0.018;
    const ambientX = Math.cos(time * 0.65 + 2.0) * 0.01;

    groupRef.current.position.x = -0.65 + ambientX - mX + drag.posX;
    groupRef.current.position.y = -0.05 + ambientY - mY + drag.posY;
    groupRef.current.position.z = 0.1;

    groupRef.current.rotation.x = Math.sin(time * 0.55 + 1.0) * 0.02 - mY * 0.2 + drag.rotX;
    groupRef.current.rotation.y = phoneRotY + 0.15 + Math.cos(time * 0.75 + 1.5) * 0.02 + mX * 0.2 + drag.rotY;
    groupRef.current.rotation.z = 0;
  });

  return (
    <group ref={groupRef} onPointerDown={onPointerDown}>
      <primitive object={scene} scale={0.45} />
    </group>
  );
}

// ─── Canvas & Section ─────────────────────────────────────────────────────────

function OrganizeCanvas() {
  return (
    <Canvas
      frameloop="demand"
      camera={{ position: [0, 0.5, 3.2], fov: 40 }}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 4]} intensity={0.8} />
      <directionalLight position={[-3, 3, 2]} intensity={0.3} />

      <Suspense fallback={null}>
        <ResponsiveCamera />
        <MacBookDevice />
        <PhoneDevice />
        <Environment preset="studio" environmentIntensity={0.5} />
      </Suspense>
    </Canvas>
  );
}

const OrganizeSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const isMobile = useIsMobile();

  // Track section as it scrolls through the viewport (enter → leave)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        scrollState.isVisible = entry.isIntersecting;
        if (entry.isIntersecting) {
          setIsActive(true);
        }
      },
      { rootMargin: '200px' }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    scrollState.lidProgress = progress;
  });

  useEffect(() => {
    let mouseRAF: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (mouseRAF) return;
      mouseRAF = requestAnimationFrame(() => {
        scrollState.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        scrollState.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        mouseRAF = null;
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseRAF) cancelAnimationFrame(mouseRAF);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        height: isMobile ? '60vh' : '100vh',
        position: 'relative',
        zIndex: 1,
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        marginTop: isMobile ? '-30vh' : '-60vh',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Headline — scrolls naturally with the section */}
      <h2
        style={{
          position: 'relative',
          zIndex: 30,
          pointerEvents: 'none',
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: 'clamp(2rem, 5vw, 4.5rem)',
          color: '#0f172a',
          lineHeight: 1.1,
          fontWeight: 400,
          textAlign: 'center',
          padding: isMobile ? '10vh 2rem 0' : '22vh 2rem 0',
          margin: 0,
        }}
      >
        Organize at the speed of AI.
      </h2>

      {/* Mobile fallback text (no 3D) */}
      {isMobile && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 2rem',
          }}
        >
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '1.125rem',
              color: '#64748b',
              textAlign: 'center',
              maxWidth: '400px',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Your voice notes become structured tasks, events, and ideas — organized by AI in real time.
          </p>
        </div>
      )}

      {/* 3D Canvas — desktop only */}
      {!isMobile && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
          }}
        >
          {isActive && <OrganizeCanvas />}
        </div>
      )}
    </div>
  );
};

export default OrganizeSection;
