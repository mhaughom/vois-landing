import React, { useRef, Suspense, useEffect, useState, useCallback } from 'react';
import { useScroll, useTransform, useMotionValueEvent, motion } from 'framer-motion';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useIsMobile } from '../hooks/useIsMobile';
import { OrganizeCarouselRenderer } from '../lib/organizeCarousel';

// ─── 3D shared state ───────────────────────────────────────────────────────────

useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

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
    const handleUp = () => { isDragging.current = false; };
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
    if (aspect < 0.8) camera.position.z = baseZ + (0.8 - aspect) * 3.0;
    else if (aspect < 1.2) camera.position.z = baseZ + (1.2 - aspect) * 0.6;
    else camera.position.z = baseZ;
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

const _xAxis = new THREE.Vector3(1, 0, 0);

// ─── SCREEN_VIEWS (shared between desktop 3D and mobile carousel labels) ───────

const SCREEN_VIEWS = [
  { name: 'Calendar',   id: 'calendar', phoneImage: '/Photos/IMG_3495%202.PNG', macImage: '/Photos/macbook-screen.webp', color: '#3b82f6' },
  { name: 'Tasks',      id: 'tasks',    phoneImage: '/Photos/phone-tasks.png',   macImage: '/Photos/mac-tasks.png',       color: '#10b981' },
  { name: 'Journal',    id: 'journal',  phoneImage: '/Photos/phone-journal.png', macImage: '/Photos/mac-journal.png',     color: '#f59e0b' },
  { name: 'To-do List', id: 'todo',     phoneImage: '/Photos/phone-todo.png',    macImage: '/Photos/mac-todo.png',        color: '#a855f7' },
];

// ─── MacBook 3D device ────────────────────────────────────────────────────────

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
      const blackMat = new THREE.MeshStandardMaterial({ color: '#0a0a0a', metalness: 0, roughness: 0.85, envMapIntensity: 0.05 });
      kb.traverse((child: any) => {
        if (child.isMesh) {
          child.material = Array.isArray(child.material) ? child.material.map(() => blackMat) : blackMat;
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
          if (mat.name === 'aluminium') { mat.color.set('#b8b8bd'); mat.metalness = 0.85; mat.roughness = 0.28; mat.envMapIntensity = 0.6; }
          if (mat.name === 'blackmatte') { mat.color.set('#0a0a0a'); mat.roughness = 0.9; mat.envMapIntensity = 0.1; }
        });
      }
    });

    if (!carouselRef.current) {
      const macViews = views.map(v => ({ name: v.name, imagePath: v.macImage }));
      carouselRef.current = new OrganizeCarouselRenderer(3024, 1964, macViews);
      const canvas = carouselRef.current.getCanvas();
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.flipY = true;
      textureRef.current = texture;

      scene.traverse((child: any) => {
        if (!child.isMesh) return;
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat: any, idx: number) => {
          if (mat?.name === 'matte') {
            const screenMat = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
            if (Array.isArray(child.material)) child.material[idx] = screenMat;
            else child.material = screenMat;
          }
        });
      });

      carouselRef.current.setOnUpdate(() => {
        if (textureRef.current) textureRef.current.needsUpdate = true;
      });
    }
  }, [scene, views]);

  useEffect(() => {
    if (carouselRef.current) carouselRef.current.goToView(currentViewIndex);
  }, [currentViewIndex]);

  useFrame((state) => {
    if (!scrollState.isVisible) return;
    state.invalidate();
    const time = state.clock.elapsedTime;
    if (carouselRef.current) carouselRef.current.tick();

    scrollState.smoothLidProgress += (scrollState.lidProgress - scrollState.smoothLidProgress) * 0.12;
    const p = scrollState.smoothLidProgress;
    const lidFraction = piecewise(p, [[0,0],[0.15,0],[0.3,0.4],[0.5,0.85],[0.6,1.0],[1.0,1.0]]);
    const lidEased = easeInOutCubic(lidFraction);

    if (screenRef.current) {
      const closedAngle = Math.PI;
      const openAngle = 70 * (Math.PI / 180);
      screenRef.current.quaternion.setFromAxisAngle(_xAxis, closedAngle + (openAngle - closedAngle) * lidEased);
    }

    if (!groupRef.current) return;
    const drag = updateDrag();
    smoothMouseX.current += (scrollState.mouseX - smoothMouseX.current) * 0.025;
    smoothMouseY.current += (scrollState.mouseY - smoothMouseY.current) * 0.025;
    const mX = smoothMouseX.current * 0.15;
    const mY = smoothMouseY.current * 0.10;
    const ambientY = Math.sin(time * 0.7) * 0.012;
    const ambientX = Math.cos(time * 0.5) * 0.006;
    groupRef.current.position.set(0.3 + ambientX - mX + drag.posX, -0.85 + ambientY - mY + drag.posY, 0);
    groupRef.current.rotation.x = 0.3 + Math.sin(time * 0.4) * 0.015 - mY * 0.35 + drag.rotX;
    groupRef.current.rotation.y = Math.cos(time * 0.6) * 0.015 + mX * 0.35 + drag.rotY;
    groupRef.current.rotation.z = 0;
  });

  return <group ref={groupRef} onPointerDown={onPointerDown}><primitive object={scene} scale={0.04} /></group>;
}

// ─── Phone 3D device ──────────────────────────────────────────────────────────

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
          if (mat.name === 'metalframe.002') { mat.color.set('#2a2a2e'); mat.metalness = 0.9; mat.roughness = 0.3; mat.envMapIntensity = 0.5; }
        });
      }
    });

    if (!carouselRef.current) {
      const phoneViews = views.map(v => ({ name: v.name, imagePath: v.phoneImage }));
      carouselRef.current = new OrganizeCarouselRenderer(1320, 2868, phoneViews);
      const canvas = carouselRef.current.getCanvas();
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.flipY = false;
      textureRef.current = texture;

      scene.traverse((child: any) => {
        if (!child.isMesh) return;
        const nameMatch = child.name.toLowerCase().includes('screen');
        const matMatch = child.material?.name === 'screen001' || child.material?.name === 'screen.001';
        if (nameMatch || matMatch) {
          const geometry = child.geometry.clone();
          child.geometry = geometry;
          const pos = geometry.attributes.position.array;
          let minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
          for (let i = 0; i < pos.length; i += 3) {
            minY = Math.min(minY, pos[i + 1]); maxY = Math.max(maxY, pos[i + 1]);
            minZ = Math.min(minZ, pos[i + 2]); maxZ = Math.max(maxZ, pos[i + 2]);
          }
          const vertCount = pos.length / 3;
          const newUV = new Float32Array(vertCount * 2);
          for (let i = 0; i < vertCount; i++) {
            newUV[i * 2]     = 1 - (pos[i * 3 + 1] - minY) / (maxY - minY);
            newUV[i * 2 + 1] = 1 - (pos[i * 3 + 2] - minZ) / (maxZ - minZ);
          }
          geometry.setAttribute('uv', new THREE.BufferAttribute(newUV, 2));
          child.material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false, side: THREE.DoubleSide });
        }
      });

      carouselRef.current.setOnUpdate(() => {
        if (textureRef.current) textureRef.current.needsUpdate = true;
      });
    }
  }, [scene, views]);

  useEffect(() => {
    if (carouselRef.current) carouselRef.current.goToView(currentViewIndex);
  }, [currentViewIndex]);

  useFrame((state) => {
    if (!scrollState.isVisible) return;
    state.invalidate();
    const time = state.clock.elapsedTime;
    if (carouselRef.current) carouselRef.current.tick();

    const p = scrollState.smoothLidProgress;
    const phoneRotY = piecewise(p, [[0,-Math.PI/2],[0.1,-Math.PI/2],[0.3,0],[0.5,Math.PI/2],[1.0,Math.PI/2]]);

    if (!groupRef.current) return;
    const drag = updateDrag();
    smoothMouseX.current += (scrollState.mouseX - smoothMouseX.current) * 0.07;
    smoothMouseY.current += (scrollState.mouseY - smoothMouseY.current) * 0.07;
    const mX = smoothMouseX.current * 0.12;
    const mY = smoothMouseY.current * 0.09;
    const ambientY = Math.sin(time * 0.9 + 1.5) * 0.018;
    const ambientX = Math.cos(time * 0.65 + 2.0) * 0.01;
    groupRef.current.position.set(-0.65 + ambientX - mX + drag.posX, -0.3 + ambientY - mY + drag.posY, 0.1);
    groupRef.current.rotation.x = Math.sin(time * 0.55 + 1.0) * 0.02 - mY * 0.25 + drag.rotX;
    groupRef.current.rotation.y = phoneRotY + 0.15 + Math.cos(time * 0.75 + 1.5) * 0.02 + mX * 0.25 + drag.rotY;
    groupRef.current.rotation.z = 0;
  });

  return <group ref={groupRef} onPointerDown={onPointerDown}><primitive object={scene} scale={0.55} /></group>;
}

function OrganizeCanvasWrapper({ currentViewIndex }: { currentViewIndex: number }) {
  return (
    <Canvas
      frameloop="demand"
      camera={{ position: [0, 0.5, 3.2], fov: 40 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 4]} intensity={0.8} />
      <directionalLight position={[-3, 3, 2]} intensity={0.3} />
      <Suspense fallback={null}>
        <ResponsiveCamera />
        <MacBookDevice currentViewIndex={currentViewIndex} views={SCREEN_VIEWS} />
        <PhoneDevice currentViewIndex={currentViewIndex} views={SCREEN_VIEWS} />
        <Environment preset="studio" environmentIntensity={0.5} />
      </Suspense>
    </Canvas>
  );
}

// ─── Desktop section (3D + animated colour blobs) ─────────────────────────────

function OrganizeSectionDesktop() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [previousViewIndex, setPreviousViewIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end start'] });

  useEffect(() => {
    if (!isAutoScrolling) return;
    const interval = setInterval(() => {
      setCurrentViewIndex((prev) => (prev + 1) % SCREEN_VIEWS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isAutoScrolling]);

  useEffect(() => {
    return () => { setPreviousViewIndex(currentViewIndex); };
  }, [currentViewIndex]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        scrollState.isVisible = entry.isIntersecting;
        if (entry.isIntersecting) setIsActive(true);
      },
      { rootMargin: '200px' }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
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
        height: '100vh',
        position: 'relative',
        zIndex: 1,
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        marginTop: '-80vh',
        overflow: 'hidden',
        backgroundColor: 'transparent',
      }}
    >
      {/* Outgoing colour blob */}
      <motion.div
        key={`blob-out-${previousViewIndex}`}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0, x: previousViewIndex < currentViewIndex ? -300 : 300 }}
        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          position: 'absolute', inset: 0, zIndex: 5,
          pointerEvents: 'none', filter: 'blur(60px)',
          background: `radial-gradient(ellipse 1600px 700px at 50% 60%, ${SCREEN_VIEWS[previousViewIndex].color}80, ${SCREEN_VIEWS[previousViewIndex].color}20 50%, transparent 75%)`,
        }}
      />

      {/* Incoming colour blob */}
      <motion.div
        key={`blob-in-${currentViewIndex}`}
        initial={{ opacity: 0, x: previousViewIndex < currentViewIndex ? 300 : -300 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          position: 'absolute', inset: 0, zIndex: 5,
          pointerEvents: 'none', filter: 'blur(60px)',
          background: `radial-gradient(ellipse 1600px 700px at 50% 60%, ${SCREEN_VIEWS[currentViewIndex].color}80, ${SCREEN_VIEWS[currentViewIndex].color}20 50%, transparent 75%)`,
        }}
      />

      {/* Headline */}
      <div style={{ position: 'relative', zIndex: 30, pointerEvents: 'none', textAlign: 'center', padding: '14vh 2rem 0' }}>
        <h2
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 'clamp(2rem, 5vw, 4.5rem)',
            color: '#0f172a', lineHeight: 1.1, fontWeight: 400, margin: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 'clamp(0.75rem, 2vw, 1.5rem)',
          }}
        >
          <span style={{ fontSize: 'clamp(1.5rem, 3.5vw, 3rem)', color: '#64748b', fontWeight: 400 }}>2</span>
          Organize at the speed of AI.
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(1.05rem, 2vw, 1.35rem)', color: '#64748b', margin: '4px auto 0', maxWidth: '540px', lineHeight: 1.7 }}>
          AI <span style={{ color: '#dc2626', backgroundColor: 'white', padding: '0 4px', borderRadius: '4px', fontWeight: 500 }}>automatically sorts</span> your voice notes into the right databases and extracts the most valuable information.
        </p>

        {/* View name + arrows */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', pointerEvents: 'auto' }}>
          <button
            onClick={() => { setIsAutoScrolling(false); setCurrentViewIndex((prev) => (prev - 1 + SCREEN_VIEWS.length) % SCREEN_VIEWS.length); }}
            style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid rgba(148,163,184,0.2)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease', backdropFilter: 'blur(8px)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,1)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M12 16L6 10L12 4" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.125rem', color: '#64748b', fontWeight: 500, margin: 0, minWidth: '120px', textAlign: 'center' }}>
            {SCREEN_VIEWS[currentViewIndex].name}
          </p>

          <button
            onClick={() => { setIsAutoScrolling(false); setCurrentViewIndex((prev) => (prev + 1) % SCREEN_VIEWS.length); }}
            style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid rgba(148,163,184,0.2)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease', backdropFilter: 'blur(8px)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,1)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M8 4L14 10L8 16" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 3D canvas */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
        {isActive && <OrganizeCanvasWrapper currentViewIndex={currentViewIndex} />}
      </div>
    </div>
  );
}

// ─── Mobile section (phone carousel) ──────────────────────────────────────────

const APPS = SCREEN_VIEWS.map(v => ({ label: v.name, image: v.phoneImage, color: v.color }));
const PHONE_W_MOB = 198;
const PHONE_H_MOB = 408;
const GAP         = 28;

interface PhoneProps { label: string; image: string; color: string; }

function PhoneMockup({ label, image, color }: PhoneProps) {
  const pad = 3;
  return (
    <div style={{ width: PHONE_W_MOB, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
      <div
        style={{
          width: PHONE_W_MOB, height: PHONE_H_MOB,
          background: 'linear-gradient(145deg, #1e1e22, #111114)',
          borderRadius: '40px', padding: `${pad}px`, position: 'relative',
          boxShadow: [`0 60px 140px rgba(0,0,0,0.30)`,`0 20px 40px rgba(0,0,0,0.18)`,`0 0 0 1px rgba(255,255,255,0.07)`,`0 0 60px ${color}1a`].join(', '),
        }}
      >
        <div style={{ width: '100%', height: '100%', borderRadius: `${40 - pad}px`, overflow: 'hidden', background: '#000' }}>
          <img src={image} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
        </div>
        <div style={{ position: 'absolute', top: `${pad + 10}px`, left: '50%', transform: 'translateX(-50%)', width: '68px', height: '18px', background: '#111114', borderRadius: '10px', zIndex: 10 }} />
        {[{ top: '20%', height: '26px' }, { top: '31%', height: '48px' }, { top: '43%', height: '48px' }].map((btn, i) => (
          <div key={i} style={{ position: 'absolute', left: '-3px', top: btn.top, width: '3px', height: btn.height, background: '#2c2c30', borderRadius: '2px 0 0 2px' }} />
        ))}
        <div style={{ position: 'absolute', right: '-3px', top: '34%', width: '3px', height: '62px', background: '#2c2c30', borderRadius: '0 2px 2px 0' }} />
      </div>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: '#64748b', fontWeight: 500, margin: 0, letterSpacing: '0.025em' }}>{label}</p>
    </div>
  );
}

function OrganizeSectionMobile() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const numPhones        = APPS.length;
  const totalTranslation = -(numPhones - 1) * (PHONE_W_MOB + GAP);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end start'] });
  const x = useTransform(scrollYProgress, [0.03, 0.82], [0, totalTranslation]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const normalized = Math.max(0, Math.min(1, (v - 0.03) / 0.79));
    setActiveIndex(Math.min(numPhones - 1, Math.max(0, Math.round(normalized * (numPhones - 1)))));
  });

  return (
    <div ref={containerRef} style={{ height: '350vh', position: 'relative', width: '100vw', marginLeft: 'calc(-50vw + 50%)', zIndex: 1 }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        {/* Colour blob */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', filter: 'blur(110px)', background: `radial-gradient(ellipse 1200px 480px at 50% 72%, ${APPS[activeIndex].color}12, transparent 68%)`, transition: 'background 0.9s ease' }} />

        {/* Headline */}
        <div style={{ position: 'relative', zIndex: 20, textAlign: 'center', marginBottom: '32px', padding: '0 2rem' }}>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(2rem, 5vw, 4.5rem)', color: '#0f172a', lineHeight: 1.1, fontWeight: 400, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(0.75rem, 2vw, 1.5rem)' }}>
            <span style={{ fontSize: 'clamp(1.5rem, 3.5vw, 3rem)', color: '#64748b', fontWeight: 400 }}>2</span>
            Organize at the speed of AI.
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(1.05rem, 2vw, 1.25rem)', color: '#94a3b8', margin: '4px auto 0', maxWidth: '440px', lineHeight: 1.7 }}>
            AI <span style={{ color: '#dc2626', backgroundColor: 'white', padding: '0 4px', borderRadius: '4px', fontWeight: 500 }}>automatically sorts</span> your voice notes into the right databases and extracts the most valuable information.
          </p>
        </div>

        {/* Phone strip */}
        <div style={{ position: 'relative', zIndex: 10, width: '100%', overflow: 'visible' }}>
          <motion.div style={{ display: 'flex', alignItems: 'flex-start', gap: GAP, x, paddingLeft: `calc(50vw - ${PHONE_W_MOB / 2}px)`, willChange: 'transform' }}>
            {APPS.map((app, i) => <PhoneMockup key={i} label={app.label} image={app.image} color={app.color} />)}
            <div style={{ width: `calc(50vw - ${PHONE_W_MOB / 2}px)`, flexShrink: 0 }} />
          </motion.div>
        </div>

        {/* Progress dots */}
        <div style={{ position: 'absolute', bottom: '36px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 20, alignItems: 'center' }}>
          {APPS.map((_, i) => (
            <motion.div key={i} animate={{ width: i === activeIndex ? 24 : 8, backgroundColor: i === activeIndex ? APPS[activeIndex].color : 'rgba(0,0,0,0.15)' }} transition={{ duration: 0.35, ease: 'easeInOut' }} style={{ height: 8, borderRadius: 4 }} />
          ))}
        </div>

        {/* Scroll hint */}
        <motion.div animate={{ opacity: activeIndex === 0 ? 0.7 : 0 }} transition={{ duration: 0.4 }} style={{ position: 'absolute', bottom: '28px', right: '24px', zIndex: 20, display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', pointerEvents: 'none' }}>
          <span>scroll to explore</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

const OrganizeSection: React.FC = () => {
  const isMobile = useIsMobile();
  return isMobile ? <OrganizeSectionMobile /> : <OrganizeSectionDesktop />;
};

export default OrganizeSection;
