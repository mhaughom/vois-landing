import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Category configuration matching the buckets
const categories = [
  { id: 'events', label: 'Events', color: '#ef4444', icon: '📅', x: -20 },
  { id: 'tasks', label: 'Tasks', color: '#f97316', icon: '✓', x: -12 },
  { id: 'ideas', label: 'Ideas', color: '#eab308', icon: '💡', x: -4 },
  { id: 'health', label: 'Health', color: '#22c55e', icon: '♥', x: 4 },
  { id: 'messages', label: 'Messages', color: '#3b82f6', icon: '💬', x: 12 },
  { id: 'finance', label: 'Finance', color: '#8b5cf6', icon: '$', x: 20 },
];

// Global scroll state
const scrollState = { progress: 0, rawProgress: 0 };

// Gradient colors for the input lines (rainbow spectrum)
const gradientColors = [
  '#3b82f6', // blue
  '#8b5cf6', // purple  
  '#ec4899', // pink
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
];

// Create a wavy tube geometry from a curve
function WavyTube({ 
  curve, 
  color = '#ffffff', 
  radius = 0.15,
  animated = true,
  delay = 0,
  isGradient = false
}: { 
  curve: THREE.CubicBezierCurve3; 
  color?: string;
  radius?: number;
  animated?: boolean;
  delay?: number;
  isGradient?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Create tube geometry
  const geometry = useMemo(() => {
    const tubeGeometry = new THREE.TubeGeometry(curve, 100, radius, 16, false);
    return tubeGeometry;
  }, [curve, radius]);

  // Animated shader material for gradient effect
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        baseColor: { value: new THREE.Color(color) },
        isGradient: { value: isGradient ? 1.0 : 0.0 },
        delay: { value: delay },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 baseColor;
        uniform float isGradient;
        uniform float delay;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        vec3 rainbow(float t) {
          vec3 colors[7];
          colors[0] = vec3(0.231, 0.510, 0.965); // blue
          colors[1] = vec3(0.545, 0.235, 0.675); // purple
          colors[2] = vec3(0.925, 0.282, 0.600); // pink
          colors[3] = vec3(0.937, 0.267, 0.267); // red
          colors[4] = vec3(0.976, 0.451, 0.086); // orange
          colors[5] = vec3(0.914, 0.722, 0.031); // yellow
          colors[6] = vec3(0.133, 0.773, 0.369); // green
          
          float segment = t * 6.0;
          int idx = int(floor(segment));
          float frac = fract(segment);
          
          if (idx >= 6) return colors[6];
          if (idx < 0) return colors[0];
          
          return mix(colors[idx], colors[idx + 1], frac);
        }
        
        void main() {
          float waveTime = time * 2.0 - delay;
          
          // Create traveling wave effect
          float wave = sin(vUv.x * 20.0 - waveTime * 3.0) * 0.5 + 0.5;
          float pulse = smoothstep(0.0, 0.3, fract(vUv.x - waveTime * 0.5));
          
          vec3 finalColor;
          if (isGradient > 0.5) {
            // Rainbow gradient along the tube
            finalColor = rainbow(vUv.x + time * 0.1);
            // Add wave brightness
            finalColor *= 0.7 + wave * 0.3;
          } else {
            finalColor = baseColor;
          }
          
          // Add glow pulse
          float glow = 0.8 + pulse * 0.2;
          
          gl_FragColor = vec4(finalColor * glow, 1.0);
        }
      `,
      transparent: true,
    });
  }, [color, isGradient, delay]);

  useFrame((state) => {
    if (materialRef.current && animated) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </mesh>
  );
}

// Traveling pulse along a curve
function TravelingPulse({ 
  curve, 
  color, 
  speed = 0.3,
  delay = 0,
  size = 0.4
}: { 
  curve: THREE.CubicBezierCurve3;
  color: string;
  speed?: number;
  delay?: number;
  size?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef(delay);
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    progressRef.current += delta * speed;
    if (progressRef.current > 1) progressRef.current = 0;
    
    const point = curve.getPoint(progressRef.current);
    meshRef.current.position.copy(point);
    
    // Fade in/out at ends
    const fade = Math.sin(progressRef.current * Math.PI);
    meshRef.current.scale.setScalar(size * (0.5 + fade * 0.5));
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </mesh>
  );
}

// AI Core visualization
function AICore({ position }: { position: [number, number, number] }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.2;
    }
    
    if (innerRef.current) {
      innerRef.current.rotation.z = -t * 0.5;
    }
    
    if (glowRef.current) {
      const pulse = 0.9 + Math.sin(t * 2) * 0.1;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={position}>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <circleGeometry args={[6, 64]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.15} />
      </mesh>
      
      {/* Main ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[4, 5, 64]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Inner processing visualization (the "scribbles") */}
      <group ref={innerRef}>
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const radius = 2 + Math.random() * 1.5;
          return (
            <mesh 
              key={i} 
              position={[Math.cos(angle) * radius * 0.5, Math.sin(angle) * radius * 0.5, 0]}
            >
              <torusGeometry args={[0.8 + Math.random() * 0.5, 0.1, 8, 32]} />
              <meshBasicMaterial color="#8b5cf6" transparent opacity={0.7} />
            </mesh>
          );
        })}
      </group>
      
      {/* Center brain icon area */}
      <mesh>
        <circleGeometry args={[2, 32]} />
        <meshBasicMaterial color="#1e1e2e" />
      </mesh>
    </group>
  );
}

// Device icon (simplified 3D representation)
function DeviceIcon({ 
  position, 
  type 
}: { 
  position: [number, number, number];
  type: 'phone' | 'watch';
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  if (type === 'phone') {
    return (
      <group ref={groupRef} position={position}>
        {/* Phone body */}
        <mesh>
          <boxGeometry args={[3, 6, 0.3]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Screen */}
        <mesh position={[0, 0, 0.16]}>
          <boxGeometry args={[2.6, 5.4, 0.02]} />
          <meshBasicMaterial color="#3b82f6" />
        </mesh>
        {/* Home button / notch */}
        <mesh position={[0, 2.7, 0.16]}>
          <boxGeometry args={[1, 0.2, 0.02]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      </group>
    );
  }

  // Watch
  return (
    <group ref={groupRef} position={position}>
      {/* Watch body */}
      <mesh>
        <boxGeometry args={[2.5, 3, 0.5]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0, 0.26]}>
        <boxGeometry args={[2, 2.5, 0.02]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
      {/* Crown */}
      <mesh position={[1.4, 0.5, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.3, 16]} />
        <meshStandardMaterial color="#666666" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Strap top */}
      <mesh position={[0, 2.2, 0]}>
        <boxGeometry args={[1.8, 1.5, 0.3]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {/* Strap bottom */}
      <mesh position={[0, -2.2, 0]}>
        <boxGeometry args={[1.8, 1.5, 0.3]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </group>
  );
}

// Category bucket at the bottom
function CategoryBucket({ 
  category, 
  position 
}: { 
  category: typeof categories[0];
  position: [number, number, number];
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame(() => {
    if (groupRef.current) {
      const targetScale = hovered ? 1.1 : 1;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={position}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Bucket background */}
      <mesh>
        <boxGeometry args={[4, 4, 0.5]} />
        <meshStandardMaterial 
          color={category.color} 
          transparent 
          opacity={0.2}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>
      
      {/* Border */}
      <mesh position={[0, 0, 0.26]}>
        <ringGeometry args={[1.8, 2, 32]} />
        <meshBasicMaterial color={category.color} transparent opacity={0.8} />
      </mesh>
      
      {/* Icon background */}
      <mesh position={[0, 0, 0.3]}>
        <circleGeometry args={[1.5, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

// Card that travels along output track
function TravelingCard({
  curve,
  color,
  delay = 0,
  speed = 0.15,
}: {
  curve: THREE.CubicBezierCurve3;
  color: string;
  delay?: number;
  speed?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef(-delay);
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    progressRef.current += delta * speed;
    
    // Only show when progress is between 0 and 1
    if (progressRef.current < 0 || progressRef.current > 1) {
      meshRef.current.visible = false;
      if (progressRef.current > 1.5) {
        progressRef.current = -Math.random() * 2; // Random respawn delay
      }
      return;
    }
    
    meshRef.current.visible = true;
    
    const t = progressRef.current;
    const point = curve.getPoint(t);
    const tangent = curve.getTangent(t);
    
    meshRef.current.position.copy(point);
    
    // Rotate to follow curve
    const angle = Math.atan2(tangent.y, tangent.x);
    meshRef.current.rotation.z = angle - Math.PI / 2;
    
    // Scale based on position (smaller at start, larger at end)
    const scale = 0.5 + t * 0.5;
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.5, 2, 0.1]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </mesh>
  );
}

// Main scene content
function SceneContent() {
  const { camera } = useThree();
  const cameraYRef = useRef(40);
  
  // Create input curves (from devices to AI Core)
  const inputCurves = useMemo(() => {
    // Phone input curve (left side)
    const phoneCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-12, 40, 0),  // Start at phone
      new THREE.Vector3(-15, 25, 0),  // Control point 1
      new THREE.Vector3(-8, 10, 0),   // Control point 2
      new THREE.Vector3(0, 5, 0)      // End at AI Core top
    );
    
    // Watch input curve (right side)
    const watchCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(12, 40, 0),   // Start at watch
      new THREE.Vector3(15, 25, 0),   // Control point 1
      new THREE.Vector3(8, 10, 0),    // Control point 2
      new THREE.Vector3(0, 5, 0)      // End at AI Core top
    );
    
    return { phone: phoneCurve, watch: watchCurve };
  }, []);

  // Create output curves (from AI Core to buckets)
  const outputCurves = useMemo(() => {
    return categories.map((cat) => {
      return new THREE.CubicBezierCurve3(
        new THREE.Vector3(0, -5, 0),          // Start at AI Core bottom
        new THREE.Vector3(cat.x * 0.3, -15, 0), // Control point 1
        new THREE.Vector3(cat.x * 0.7, -30, 0), // Control point 2
        new THREE.Vector3(cat.x, -40, 0)       // End at bucket
      );
    });
  }, []);

  // Camera follows scroll
  useFrame(() => {
    // Lerp camera for smooth movement
    const targetY = 40 - scrollState.progress * 80; // From Y=40 to Y=-40
    cameraYRef.current = THREE.MathUtils.lerp(cameraYRef.current, targetY, 0.05);
    
    if (camera instanceof THREE.OrthographicCamera) {
      camera.position.y = cameraYRef.current;
      camera.lookAt(0, cameraYRef.current, 0);
    }
  });

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 20]} intensity={1} />
      
      {/* === ZONE A: CAPTURE (Y = 40) === */}
      <DeviceIcon position={[-12, 42, 0]} type="phone" />
      <DeviceIcon position={[12, 42, 0]} type="watch" />
      
      {/* Input lines with gradient effect */}
      <WavyTube 
        curve={inputCurves.phone} 
        isGradient={true}
        radius={0.2}
        delay={0}
      />
      <WavyTube 
        curve={inputCurves.watch} 
        isGradient={true}
        radius={0.2}
        delay={0.5}
      />
      
      {/* Traveling pulses on input lines */}
      {gradientColors.map((color, i) => (
        <React.Fragment key={`pulse-phone-${i}`}>
          <TravelingPulse 
            curve={inputCurves.phone} 
            color={color}
            speed={0.2}
            delay={i * 0.15}
            size={0.5}
          />
          <TravelingPulse 
            curve={inputCurves.watch} 
            color={color}
            speed={0.18}
            delay={i * 0.15 + 0.3}
            size={0.5}
          />
        </React.Fragment>
      ))}
      
      {/* === ZONE B: SYNTHESIZE (Y = 0) === */}
      <AICore position={[0, 0, 0]} />
      
      {/* === ZONE C: ORGANIZE (Y = -40) === */}
      {/* Output tracks */}
      {outputCurves.map((curve, i) => (
        <React.Fragment key={`output-${i}`}>
          <WavyTube 
            curve={curve} 
            color={categories[i].color}
            radius={0.12}
            animated={true}
            delay={i * 0.2}
          />
          {/* Multiple cards traveling to each bucket */}
          {[0, 1, 2].map((j) => (
            <TravelingCard
              key={`card-${i}-${j}`}
              curve={curve}
              color={categories[i].color}
              delay={j * 1.5 + i * 0.3}
              speed={0.12}
            />
          ))}
        </React.Fragment>
      ))}
      
      {/* Category buckets */}
      {categories.map((cat, i) => (
        <CategoryBucket 
          key={cat.id}
          category={cat}
          position={[cat.x, -42, 0]}
        />
      ))}
    </>
  );
}

// Main exported component
export function ScrollytellingScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const containerHeight = containerRef.current.offsetHeight;
      
      // Calculate scroll progress within the container
      // Start when container top reaches viewport bottom, end when container bottom leaves viewport top
      const scrollStart = -containerHeight;
      const scrollEnd = windowHeight;
      const currentScroll = rect.top;
      
      const rawProgress = 1 - (currentScroll - scrollStart) / (scrollEnd - scrollStart);
      scrollState.rawProgress = rawProgress;
      scrollState.progress = Math.max(0, Math.min(1, rawProgress));
      
      // Check if section is visible
      setIsVisible(rect.top < windowHeight && rect.bottom > 0);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative"
      style={{ height: '400vh' }}
    >
      {/* Fixed Canvas Background */}
      <div 
        className="fixed inset-0 pointer-events-none transition-opacity duration-500"
        style={{ 
          zIndex: isVisible ? 5 : -1,
          opacity: isVisible ? 1 : 0,
        }}
      >
        <Canvas
          orthographic
          camera={{ 
            zoom: 12, 
            position: [0, 40, 50],
            near: 0.1,
            far: 1000
          }}
          style={{ background: 'transparent' }}
        >
          <SceneContent />
        </Canvas>
      </div>
      
      {/* HTML Overlay Sections */}
      <div className="relative z-10 pointer-events-none">
        {/* Section 1: Capture */}
        <div className="h-[100vh] flex items-center justify-center">
          <div className="text-center max-w-2xl mx-auto px-6">
            <h2 className="text-4xl md:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              Capture
            </h2>
            <p className="text-xl md:text-2xl text-slate-500 font-light">
              Raw intent from any device.
            </p>
          </div>
        </div>
        
        {/* Section 2: Synthesize */}
        <div className="h-[100vh] flex items-center justify-center">
          <div className="text-center max-w-2xl mx-auto px-6">
            <h2 className="text-4xl md:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              Synthesize
            </h2>
            <p className="text-xl md:text-2xl text-slate-500 font-light">
              The Core interprets context.
            </p>
          </div>
        </div>
        
        {/* Section 3: Organize */}
        <div className="h-[100vh] flex items-center justify-center">
          <div className="text-center max-w-2xl mx-auto px-6">
            <h2 className="text-4xl md:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              Organize
            </h2>
            <p className="text-xl md:text-2xl text-slate-500 font-light">
              Data lands exactly where it belongs.
            </p>
          </div>
        </div>
        
        {/* Section 4: Final - Database view */}
        <div className="h-[100vh] flex items-end justify-center pb-32">
          <div className="text-center max-w-3xl mx-auto px-6">
            <p className="text-lg md:text-xl text-slate-600 mb-8">
              Six intelligent databases. Zero effort from you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((cat) => (
                <div 
                  key={cat.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border"
                  style={{ 
                    borderColor: cat.color,
                    backgroundColor: `${cat.color}10`
                  }}
                >
                  <span>{cat.icon}</span>
                  <span className="text-sm font-medium" style={{ color: cat.color }}>
                    {cat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

