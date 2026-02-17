import React, { useRef, Suspense, useEffect, useState, useCallback } from 'react';
import { useScroll, useMotionValueEvent, motion } from 'framer-motion';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useIsMobile } from '../hooks/useIsMobile';
import { OrganizeCarouselRenderer } from '../lib/organizeCarousel';

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

function MacBookDevice({ currentViewIndex, views }: { currentViewIndex: number; views: typeof SCREEN_VIEWS }) {
  const macGltf = useGLTF('/3d_models/mac.glb');
  const kbGltf = useGLTF('/3d_models/macbook_pro.glb');
  const carouselRef = useRef<OrganizeCarouselRenderer | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

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

    // Initialize carousel renderer
    if (!carouselRef.current) {
      console.log('[MacBook] Initializing carousel renderer');
      const macViews = views.map(v => ({ name: v.name, imagePath: v.macImage }));
      carouselRef.current = new OrganizeCarouselRenderer(3024, 1964, macViews);

      // Create texture from carousel canvas
      const canvas = carouselRef.current.getCanvas();
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.flipY = true;
      textureRef.current = texture;

      // Apply texture to screen mesh
      scene.traverse((child: any) => {
        if (!child.isMesh) return;
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat: any, idx: number) => {
          if (mat?.name === 'matte') {
            console.log('[MacBook] Found screen mesh, applying carousel texture');

            const screenMat = new THREE.MeshBasicMaterial({
              map: texture,
              toneMapped: false,
            });

            if (Array.isArray(child.material)) {
              child.material[idx] = screenMat;
            } else {
              child.material = screenMat;
            }
          }
        });
      });

      // Set up texture update callback
      carouselRef.current.setOnUpdate(() => {
        if (textureRef.current) {
          textureRef.current.needsUpdate = true;
        }
      });
    }
  }, [scene, views]);

  // Trigger carousel transition when view changes
  useEffect(() => {
    if (carouselRef.current) {
      console.log('[MacBook] Transitioning to view:', currentViewIndex);
      carouselRef.current.goToView(currentViewIndex);
    }
  }, [currentViewIndex]);

  useFrame((state) => {
    if (!scrollState.isVisible) return;
    state.invalidate();
    const time = state.clock.elapsedTime;

    // Tick carousel animation
    if (carouselRef.current) {
      carouselRef.current.tick();
    }

    scrollState.smoothLidProgress += (scrollState.lidProgress - scrollState.smoothLidProgress) * 0.12;
    const p = scrollState.smoothLidProgress;

    // Lid animation — opens with a slight delay after phone rotation
    const lidFraction = piecewise(p, [
      [0, 0], [0.15, 0], [0.3, 0.4], [0.5, 0.85], [0.6, 1.0], [1.0, 1.0],
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

    // Independent mouse tracking with slower, heavier feel for MacBook
    smoothMouseX.current += (scrollState.mouseX - smoothMouseX.current) * 0.025;
    smoothMouseY.current += (scrollState.mouseY - smoothMouseY.current) * 0.025;
    const mX = smoothMouseX.current * 0.15;
    const mY = smoothMouseY.current * 0.10;

    const ambientY = Math.sin(time * 0.7) * 0.012;
    const ambientX = Math.cos(time * 0.5) * 0.006;

    groupRef.current.position.x = 0.3 + ambientX - mX + drag.posX;
    groupRef.current.position.y = -0.85 + ambientY - mY + drag.posY;
    groupRef.current.position.z = 0;

    groupRef.current.rotation.x = 0.3 + Math.sin(time * 0.4) * 0.015 - mY * 0.35 + drag.rotX;
    groupRef.current.rotation.y = Math.cos(time * 0.6) * 0.015 + mX * 0.35 + drag.rotY;
    groupRef.current.rotation.z = 0;
  });

  return (
    <group ref={groupRef} onPointerDown={onPointerDown}>
      <primitive object={scene} scale={0.04} />
    </group>
  );
}

// ─── Phone (independent floating + scroll-driven rotation + individual drag) ──

function PhoneDevice({ currentViewIndex, views }: { currentViewIndex: number; views: typeof SCREEN_VIEWS }) {
  const phoneGltf = useGLTF('/3d_models/iphone_16_pro_max.glb');
  const [scene] = useState(() => phoneGltf.scene.clone(true));
  const groupRef = useRef<THREE.Group>(null);
  const smoothMouseX = useRef(0);
  const smoothMouseY = useRef(0);
  const { onPointerDown, updateDrag } = useDrag();
  const carouselRef = useRef<OrganizeCarouselRenderer | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

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

    // Initialize carousel renderer
    if (!carouselRef.current) {
      console.log('[Phone] Initializing carousel renderer');
      const phoneViews = views.map(v => ({ name: v.name, imagePath: v.phoneImage }));
      carouselRef.current = new OrganizeCarouselRenderer(1320, 2868, phoneViews);

      // Create texture from carousel canvas
      const canvas = carouselRef.current.getCanvas();
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.flipY = false;
      textureRef.current = texture;

      // Apply texture to screen mesh with UV mapping
      scene.traverse((child: any) => {
        if (!child.isMesh) return;
        const nameMatch = child.name.toLowerCase().includes('screen');
        const matMatch = child.material?.name === 'screen001' || child.material?.name === 'screen.001';

        if (nameMatch || matMatch) {
          console.log('[Phone] Found screen mesh, applying carousel texture');

          // Fix UVs from vertex positions
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

          child.material = new THREE.MeshBasicMaterial({
            map: texture,
            toneMapped: false,
            side: THREE.DoubleSide,
          });
        }
      });

      // Set up texture update callback
      carouselRef.current.setOnUpdate(() => {
        if (textureRef.current) {
          textureRef.current.needsUpdate = true;
        }
      });
    }
  }, [scene, views]);

  // Trigger carousel transition when view changes
  useEffect(() => {
    if (carouselRef.current) {
      console.log('[Phone] Transitioning to view:', currentViewIndex);
      carouselRef.current.goToView(currentViewIndex);
    }
  }, [currentViewIndex]);

  useFrame((state) => {
    if (!scrollState.isVisible) return;
    state.invalidate();
    const time = state.clock.elapsedTime;

    // Tick carousel animation
    if (carouselRef.current) {
      carouselRef.current.tick();
    }

    // Read smoothed scroll progress (already updated by MacBook's useFrame)
    const p = scrollState.smoothLidProgress;

    // Phone Y rotation: rotates as section becomes visible
    const phoneRotY = piecewise(p, [
      [0, -Math.PI / 2],      // back facing camera
      [0.1, -Math.PI / 2],    // still showing back during entry
      [0.3, 0],               // sideways (halfway through turn)
      [0.5, Math.PI / 2],     // screen fully facing camera
      [1.0, Math.PI / 2],     // stays facing
    ]);

    if (!groupRef.current) return;

    const drag = updateDrag();

    // Independent mouse tracking with faster, lighter feel for Phone
    smoothMouseX.current += (scrollState.mouseX - smoothMouseX.current) * 0.07;
    smoothMouseY.current += (scrollState.mouseY - smoothMouseY.current) * 0.07;
    const mX = smoothMouseX.current * 0.12;
    const mY = smoothMouseY.current * 0.09;

    const ambientY = Math.sin(time * 0.9 + 1.5) * 0.018;
    const ambientX = Math.cos(time * 0.65 + 2.0) * 0.01;

    groupRef.current.position.x = -0.65 + ambientX - mX + drag.posX;
    groupRef.current.position.y = -0.3 + ambientY - mY + drag.posY;
    groupRef.current.position.z = 0.1;

    groupRef.current.rotation.x = Math.sin(time * 0.55 + 1.0) * 0.02 - mY * 0.25 + drag.rotX;
    groupRef.current.rotation.y = phoneRotY + 0.15 + Math.cos(time * 0.75 + 1.5) * 0.02 + mX * 0.25 + drag.rotY;
    groupRef.current.rotation.z = 0;
  });

  return (
    <group ref={groupRef} onPointerDown={onPointerDown}>
      <primitive object={scene} scale={0.55} />
    </group>
  );
}

// ─── Canvas & Section ─────────────────────────────────────────────────────────

function OrganizeCanvas({ currentViewIndex }: { currentViewIndex: number }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 4]} intensity={0.8} />
      <directionalLight position={[-3, 3, 2]} intensity={0.3} />

      <Suspense fallback={null}>
        <ResponsiveCamera />
        <MacBookDevice currentViewIndex={currentViewIndex} views={SCREEN_VIEWS} />
        <PhoneDevice currentViewIndex={currentViewIndex} views={SCREEN_VIEWS} />
        <Environment preset="studio" environmentIntensity={0.5} />
      </Suspense>
    </>
  );
}

function OrganizeCanvasWrapper({ currentViewIndex }: { currentViewIndex: number }) {
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
      <OrganizeCanvas currentViewIndex={currentViewIndex} />
    </Canvas>
  );
}

// View options for cycling through different screen states
const SCREEN_VIEWS = [
  {
    name: 'Calendar',
    id: 'calendar',
    phoneImage: '/Photos/IMG_3495%202.PNG', // Current calendar view
    macImage: '/Photos/macbook-screen.webp', // Current tasks view
    color: '#3b82f6', // blue
  },
  {
    name: 'Tasks',
    id: 'tasks',
    phoneImage: '/Photos/phone-tasks.png', // Placeholder
    macImage: '/Photos/mac-tasks.png', // Placeholder
    color: '#10b981', // green
  },
  {
    name: 'Journal',
    id: 'journal',
    phoneImage: '/Photos/phone-journal.png', // Placeholder
    macImage: '/Photos/mac-journal.png', // Placeholder
    color: '#f59e0b', // yellow/amber
  },
  {
    name: 'To-do List',
    id: 'todo',
    phoneImage: '/Photos/phone-todo.png', // Placeholder
    macImage: '/Photos/mac-todo.png', // Placeholder
    color: '#a855f7', // purple
  },
];

const OrganizeSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [previousViewIndex, setPreviousViewIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const isMobile = useIsMobile();

  // Track section as it scrolls through the viewport (enter → leave)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Auto-scroll through views every 4 seconds
  useEffect(() => {
    if (!isAutoScrolling || isMobile) return;

    const interval = setInterval(() => {
      setCurrentViewIndex((prev) => {
        const next = (prev + 1) % SCREEN_VIEWS.length;
        console.log('[OrganizeSection] Auto-scrolling to view:', next, SCREEN_VIEWS[next].name);
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoScrolling, isMobile]);

  // Track previous view index for direction detection
  useEffect(() => {
    console.log('[OrganizeSection] Current view changed:', currentViewIndex, SCREEN_VIEWS[currentViewIndex].name);
    console.log('[OrganizeSection] Phone image:', SCREEN_VIEWS[currentViewIndex].phoneImage);
    console.log('[OrganizeSection] Mac image:', SCREEN_VIEWS[currentViewIndex].macImage);

    return () => {
      setPreviousViewIndex(currentViewIndex);
    };
  }, [currentViewIndex]);

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
        marginTop: isMobile ? '-40vh' : '-80vh',
        overflow: 'hidden',
        backgroundColor: 'transparent',
      }}
    >
      {/* Animated gradient blobs behind 3D models */}
      {!isMobile && (
        <>
          {/* Outgoing blob */}
          <motion.div
            key={`blob-out-${previousViewIndex}`}
            initial={{ opacity: 1 }}
            animate={{
              opacity: 0,
              x: previousViewIndex < currentViewIndex ? -300 : 300,
            }}
            transition={{
              duration: 1.2,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 5,
              pointerEvents: 'none',
              filter: 'blur(60px)',
              background: `radial-gradient(ellipse 1600px 700px at 50% 60%, ${SCREEN_VIEWS[previousViewIndex].color}80, ${SCREEN_VIEWS[previousViewIndex].color}20 50%, transparent 75%)`,
            }}
          />

          {/* Incoming blob */}
          <motion.div
            key={`blob-in-${currentViewIndex}`}
            initial={{
              opacity: 0,
              x: previousViewIndex < currentViewIndex ? 300 : -300,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 1.2,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 5,
              pointerEvents: 'none',
              filter: 'blur(60px)',
              background: `radial-gradient(ellipse 1600px 700px at 50% 60%, ${SCREEN_VIEWS[currentViewIndex].color}80, ${SCREEN_VIEWS[currentViewIndex].color}20 50%, transparent 75%)`,
            }}
          />
        </>
      )}

      {/* Headline — scrolls naturally with the section */}
      <div
        style={{
          position: 'relative',
          zIndex: 30,
          pointerEvents: 'none',
          textAlign: 'center',
          padding: isMobile ? '10vh 2rem 0' : '22vh 2rem 0',
        }}
      >
        <h2
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 'clamp(2rem, 5vw, 4.5rem)',
            color: '#0f172a',
            lineHeight: 1.1,
            fontWeight: 400,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(0.75rem, 2vw, 1.5rem)',
          }}
        >
          <span
            style={{
              fontSize: 'clamp(1.5rem, 3.5vw, 3rem)',
              color: '#64748b',
              fontWeight: 400,
            }}
          >
            2
          </span>
          Organize at the speed of AI.
        </h2>

        {/* Current view label with navigation arrows */}
        {!isMobile && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              marginTop: '1.5rem',
              pointerEvents: 'auto',
            }}
          >
            {/* Left arrow */}
            <button
              onClick={() => {
                setIsAutoScrolling(false);
                setCurrentViewIndex((prev) => (prev - 1 + SCREEN_VIEWS.length) % SCREEN_VIEWS.length);
              }}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(8px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M12 16L6 10L12 4" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* View name */}
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '1.125rem',
                color: '#64748b',
                fontWeight: 500,
                margin: 0,
                minWidth: '120px',
                textAlign: 'center',
              }}
            >
              {SCREEN_VIEWS[currentViewIndex].name}
            </p>

            {/* Right arrow */}
            <button
              onClick={() => {
                setIsAutoScrolling(false);
                setCurrentViewIndex((prev) => (prev + 1) % SCREEN_VIEWS.length);
              }}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(8px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M8 4L14 10L8 16" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </div>

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
          {isActive && <OrganizeCanvasWrapper currentViewIndex={currentViewIndex} />}
        </div>
      )}

    </div>
  );
};

export default OrganizeSection;
