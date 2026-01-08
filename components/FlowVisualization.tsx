import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Category configuration - more intense/saturated colors for visibility
const CATEGORIES = [
  { x: -12, color: '#ff2222', label: 'Events', icon: '📅', items: ['Dinner 8pm', 'Meeting', 'Dentist'] },
  { x: -6,  color: '#0066ff', label: 'Tasks',  icon: '✅', items: ['Buy Milk', 'Call Mom', 'Pay Bills'] },
  { x: 0,   color: '#ffcc00', label: 'Ideas',  icon: '💡', items: ['App Idea', 'Gift List', 'Blog Post'] },
  { x: 6,   color: '#00dd44', label: 'Health', icon: '❤️', items: ['Run 5k', 'Vitamins', 'Gym'] },
  { x: 12,  color: '#aa22ff', label: 'Finance', icon: '💰', items: ['Receipt', 'Invoice', 'Budget'] }
];

// Pulse interface for multi-color waveforms
interface Pulse {
  id: number;
  progress: number;
  colorSegments: THREE.Color[];
  targetCategories: number[];
  lineIndex: number; // 0 = left (phone), 1 = right (watch)
}

// Card interface
interface Card {
  id: number;
  progress: number;
  trackIndex: number;
  color: string;
  text: string;
  isStacked: boolean;
  stackY: number;
}

// Global state for sharing between components
const globalState = {
  pulses: [] as Pulse[],
  cards: [] as Card[],
  stacks: {} as Record<number, Card[]>,
  pulseIdCounter: 0,
  cardIdCounter: 0,
};

// Initialize stacks
CATEGORIES.forEach((_, i) => {
  globalState.stacks[i] = [];
});

// Create hourglass-shaped input curve
// Lines start from above viewport (behind devices) and flow down to AI core
function createInputCurve(startX: number, startY: number): THREE.CubicBezierCurve3 {
  // Hourglass shape: start from device position, curve smoothly down to center
  const outwardBulge = startX < 0 ? -3 : 3; // Subtle outward curve
  
  return new THREE.CubicBezierCurve3(
    new THREE.Vector3(startX, startY, 0),           // Start behind device (off-screen top)
    new THREE.Vector3(startX + outwardBulge, startY * 0.4, 0), // Control 1: gentle curve
    new THREE.Vector3(startX * 0.2, 3, 0),          // Control 2: converge toward center
    new THREE.Vector3(0, 0, 0)                       // End at core center
  );
}

// Create output curve from core to bucket
function createOutputCurve(catX: number): THREE.CubicBezierCurve3 {
  return new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0, 0),           // Start at core
    new THREE.Vector3(catX * 0.1, -3, 0), // Slight spread
    new THREE.Vector3(catX * 0.7, -6, 0), // More spread
    new THREE.Vector3(catX, -10, 0)       // End at bucket
  );
}

// Single unified line with colored waveform sections - smoother version
function AnimatedLine({ 
  curve, 
  lineIndex 
}: { 
  curve: THREE.CubicBezierCurve3; 
  lineIndex: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [meshes, setMeshes] = useState<Array<{ geometry: THREE.TubeGeometry; color: string; key: string }>>([]);
  
  // Pre-generate smooth noise values for irregular waveform
  const noiseValues = useMemo(() => {
    const values: number[] = [];
    // Generate smoother noise using multiple octaves
    for (let i = 0; i < 300; i++) {
      const t = i / 300;
      const noise = Math.sin(t * 15) * 0.3 + Math.sin(t * 23 + 1) * 0.2 + Math.sin(t * 37 + 2) * 0.15;
      values.push(noise);
    }
    return values;
  }, []);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const numPoints = 250; // More points for smoother curves
    const newMeshes: Array<{ geometry: THREE.TubeGeometry; color: string; key: string }> = [];
    
    // Find pulse on this line
    const activePulse = globalState.pulses.find(p => p.lineIndex === lineIndex);
    const pulseWidth = 0.35;
    
    // Build the entire line as fewer, longer segments for smoothness
    const numSegments = 20; // Fewer segments = smoother
    const segmentSize = 1 / numSegments;
    
    for (let seg = 0; seg < numSegments; seg++) {
      const segStart = seg * segmentSize;
      const segEnd = (seg + 1) * segmentSize;
      const segMid = (segStart + segEnd) / 2;
      
      // Determine if this segment is in a pulse area
      let segmentColor = '#1a1a1a'; // Default black
      let isInPulse = false;
      
      if (activePulse) {
        const pulseStart = activePulse.progress - pulseWidth / 2;
        const pulseEnd = activePulse.progress + pulseWidth / 2;
        
        if (segMid >= pulseStart && segMid <= pulseEnd) {
          isInPulse = true;
          // Determine which color segment this falls into
          const posInPulse = (segMid - pulseStart) / pulseWidth;
          const colorIndex = Math.min(
            Math.floor(posInPulse * activePulse.colorSegments.length),
            activePulse.colorSegments.length - 1
          );
          const color = activePulse.colorSegments[colorIndex];
          segmentColor = `#${color.getHexString()}`;
        }
      }
      
      // Generate more points for smoother segments
      const pts: THREE.Vector3[] = [];
      const startIdx = Math.floor(segStart * numPoints);
      const endIdx = Math.floor(segEnd * numPoints);
      
      for (let i = startIdx; i <= endIdx; i++) {
        const t = Math.min(i / numPoints, 0.999);
        const point = curve.getPoint(t);
        
        // Add waveform displacement only in pulse area with smooth transitions
        if (activePulse) {
          const pulseStart = activePulse.progress - pulseWidth / 2;
          const pulseEnd = activePulse.progress + pulseWidth / 2;
          
          // Smooth fade in/out at edges
          let intensity = 0;
          if (t >= pulseStart && t <= pulseEnd) {
            const posInPulse = (t - pulseStart) / pulseWidth;
            // Smooth cosine fade at edges
            intensity = Math.sin(posInPulse * Math.PI);
          }
          
          if (intensity > 0.01) {
            // Smoother waveform using combined frequencies
            const baseFreq = i * 0.3;
            const wave1 = Math.sin(baseFreq + time * 4) * 0.45;
            const wave2 = Math.sin(baseFreq * 1.7 + time * 6 + 1.2) * 0.25;
            const wave3 = Math.sin(baseFreq * 2.3 + time * 2.5) * 0.15;
            const noise = noiseValues[i % noiseValues.length] * 0.25;
            
            const amplitude = (wave1 + wave2 + wave3 + noise) * intensity * 0.7;
            
            const tangent = curve.getTangentAt(t);
            const normal = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize();
            
            point.x += normal.x * amplitude;
            point.y += normal.y * amplitude;
          }
        }
        
        pts.push(point);
      }
      
      if (pts.length >= 2) {
        const segmentCurve = new THREE.CatmullRomCurve3(pts);
        // More tubular segments for smoother appearance
        const geometry = new THREE.TubeGeometry(segmentCurve, 15, 0.08, 8, false);
        
        newMeshes.push({
          geometry,
          color: segmentColor,
          key: `seg-${lineIndex}-${seg}`
        });
      }
    }
    
    setMeshes(newMeshes);
  });
  
  return (
    <group ref={groupRef}>
      {meshes.map(m => (
        <mesh key={m.key} geometry={m.geometry}>
          <meshBasicMaterial color={m.color} />
        </mesh>
      ))}
    </group>
  );
}

// Input Lines Component - single continuous line per side
// Lines start from higher up to appear as if coming from the phone/watch devices above
function InputLines() {
  const leftCurve = useMemo(() => createInputCurve(-8, 18), []);  // Higher start, closer to center
  const rightCurve = useMemo(() => createInputCurve(8, 18), []);
  
  return (
    <>
      <AnimatedLine curve={leftCurve} lineIndex={0} />
      <AnimatedLine curve={rightCurve} lineIndex={1} />
    </>
  );
}

// AI Core Component - rendered in front of lines (z=1)
function AICore() {
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [glowScale, setGlowScale] = useState(1);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Subtle breathing animation
    if (glowRef.current) {
      const breathe = 1 + Math.sin(time * 2) * 0.05;
      glowRef.current.scale.setScalar(breathe * glowScale);
    }
    
    if (ringRef.current) {
      ringRef.current.rotation.z = time * 0.1;
    }
    
    // Check if any pulse just finished
    const finishedPulses = globalState.pulses.filter(p => p.progress >= 1);
    if (finishedPulses.length > 0) {
      setGlowScale(1.3);
      setTimeout(() => setGlowScale(1), 200);
    }
  });
  
  return (
    <group position={[0, 0, 1]}> {/* z=1 puts it in front of lines */}
      {/* Solid background to hide lines */}
      <mesh position={[0, 0, -0.1]}>
        <circleGeometry args={[2.5, 64]} />
        <meshBasicMaterial color="#f8fafc" /> {/* Light background */}
      </mesh>
      
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <circleGeometry args={[2.2, 64]} />
        <meshBasicMaterial color="#e0e7ff" transparent opacity={0.5} />
      </mesh>
      
      {/* Ring */}
      <mesh ref={ringRef} position={[0, 0, 0.1]}>
        <ringGeometry args={[1.6, 1.9, 64]} />
        <meshBasicMaterial color="#c7d2fe" side={THREE.DoubleSide} />
      </mesh>
      
      {/* Inner fill */}
      <mesh position={[0, 0, 0.05]}>
        <circleGeometry args={[1.5, 64]} />
        <meshBasicMaterial color="#6366f1" transparent opacity={0.2} />
      </mesh>
      
      {/* Center highlight */}
      <mesh position={[0, 0, 0.15]}>
        <circleGeometry args={[0.8, 32]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

// Output Tracks Component (thicker tubes to buckets)
function OutputTracks() {
  const curves = useMemo(() => 
    CATEGORIES.map(cat => createOutputCurve(cat.x)),
  []);
  
  return (
    <>
      {curves.map((curve, i) => {
        const geometry = new THREE.TubeGeometry(curve, 50, 0.04, 8, false);
        
        return (
          <mesh key={`output-track-${i}`} geometry={geometry}>
            <meshBasicMaterial color="#d1d5db" />
          </mesh>
        );
      })}
    </>
  );
}

// Card mesh component
function CardMesh({ card }: { card: Card }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const curve = useMemo(() => createOutputCurve(CATEGORIES[card.trackIndex].x), [card.trackIndex]);
  
  // Create canvas texture for the card
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 350;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    // Card background
    ctx.fillStyle = card.color + '22';
    ctx.beginPath();
    roundRect(ctx, 0, 0, 350, 120, 20);
    ctx.fill();
    
    // Left stripe
    ctx.fillStyle = card.color;
    ctx.beginPath();
    roundRect(ctx, 0, 0, 15, 120, 10);
    ctx.fill();
    
    // Text
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 32px -apple-system, sans-serif';
    ctx.fillText(card.text, 35, 72);
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }, [card.color, card.text]);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    
    if (card.isStacked) {
      // Subtle hover in stack
      meshRef.current.position.y = card.stackY + Math.sin(time * 2 + card.id) * 0.03;
      meshRef.current.position.x = CATEGORIES[card.trackIndex].x;
      meshRef.current.rotation.z = 0;
    } else {
      // Follow curve
      const point = curve.getPoint(card.progress);
      meshRef.current.position.copy(point);
      
      // Slight rotation based on position
      meshRef.current.rotation.z = -point.x * 0.015;
    }
  });
  
  if (!texture) return null;
  
  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[3.2, 1.1]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}

// Helper for rounded rect
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Cards System Component - spawns cards as each color enters the core
function CardsSystem() {
  const [, forceUpdate] = useState(0);
  
  useFrame(() => {
    let needsUpdate = false;
    const pulseWidth = 0.35;
    
    // Update pulse progress and spawn cards as colors enter core
    for (let i = globalState.pulses.length - 1; i >= 0; i--) {
      const pulse = globalState.pulses[i];
      const oldProgress = pulse.progress;
      pulse.progress += 0.0012; // Slower animation
      
      // Check each color segment to see if it just entered the core
      // A segment enters the core when its position reaches ~1.0
      const numSegments = pulse.colorSegments.length;
      const segmentWidth = pulseWidth / numSegments;
      
      pulse.colorSegments.forEach((color, segIndex) => {
        // Calculate when this segment's leading edge reaches the core
        // Segment starts at: progress - pulseWidth/2 + segIndex * segmentWidth
        // Segment ends at: segment start + segmentWidth
        // It enters core when segment END reaches 1.0
        const segmentEndPos = (pos: number) => pos - pulseWidth/2 + (segIndex + 1) * segmentWidth;
        
        const oldSegEnd = segmentEndPos(oldProgress);
        const newSegEnd = segmentEndPos(pulse.progress);
        
        // Check if this segment just crossed the threshold (entered the core)
        const threshold = 0.98; // When segment reaches here, spawn card
        if (oldSegEnd < threshold && newSegEnd >= threshold) {
          const catIndex = pulse.targetCategories[segIndex];
          const cat = CATEGORIES[catIndex];
          
          globalState.cards.push({
            id: globalState.cardIdCounter++,
            progress: 0,
            trackIndex: catIndex,
            color: cat.color,
            text: cat.items[Math.floor(Math.random() * cat.items.length)],
            isStacked: false,
            stackY: -10
          });
          needsUpdate = true;
        }
      });
      
      // Remove pulse when fully past core
      if (pulse.progress >= 1.2) {
        globalState.pulses.splice(i, 1);
        needsUpdate = true;
      }
    }
    
    // Update card progress - slower for more visible animation
    for (let i = globalState.cards.length - 1; i >= 0; i--) {
      const card = globalState.cards[i];
      
      if (!card.isStacked) {
        card.progress += 0.004; // Card speed
        
        if (card.progress >= 1) {
          // Stack the card
          card.isStacked = true;
          const stack = globalState.stacks[card.trackIndex];
          card.stackY = -10 + stack.length * 1.3;
          stack.push(card);
          
          // Remove old cards if stack too tall
          if (stack.length > 5) {
            const oldCard = stack.shift();
            if (oldCard) {
              const idx = globalState.cards.indexOf(oldCard);
              if (idx > -1) globalState.cards.splice(idx, 1);
              // Reposition remaining cards
              stack.forEach((c, si) => {
                c.stackY = -10 + si * 1.3;
              });
            }
          }
          needsUpdate = true;
        }
      }
    }
    
    if (needsUpdate) {
      forceUpdate(n => n + 1);
    }
  });
  
  return (
    <>
      {globalState.cards.map(card => (
        <CardMesh key={card.id} card={card} />
      ))}
    </>
  );
}

// Pulse spawner - runs outside of render
function usePulseSpawner() {
  useEffect(() => {
    const spawnPulse = () => {
      // Random selection of 2-4 categories for this pulse
      const numCategories = 2 + Math.floor(Math.random() * 3);
      const shuffled = [...Array(5).keys()].sort(() => Math.random() - 0.5);
      const selectedCategories = shuffled.slice(0, numCategories);
      
      const colorSegments = selectedCategories.map(catIndex => 
        new THREE.Color(CATEGORIES[catIndex].color)
      );
      
      globalState.pulses.push({
        id: globalState.pulseIdCounter++,
        progress: 0,
        colorSegments,
        targetCategories: selectedCategories,
        lineIndex: Math.random() < 0.5 ? 0 : 1 // Alternate between phone and watch
      });
    };
    
    // Spawn initial pulse
    spawnPulse();
    
    // Spawn pulses less frequently - more deliberate pacing
    const interval = setInterval(spawnPulse, 5000); // 5 seconds between pulses
    
    return () => clearInterval(interval);
  }, []);
}

// Main scene content
function SceneContent() {
  usePulseSpawner();
  
  return (
    <>
      <InputLines />
      <AICore />
      <OutputTracks />
      <CardsSystem />
    </>
  );
}

// Responsive orthographic camera
function ResponsiveCamera() {
  const { camera, size } = useThree();
  const frustumSize = 25;
  
  useEffect(() => {
    const aspect = size.width / size.height;
    const cam = camera as THREE.OrthographicCamera;
    cam.left = -frustumSize * aspect / 2;
    cam.right = frustumSize * aspect / 2;
    cam.top = frustumSize / 2;
    cam.bottom = -frustumSize / 2;
    cam.updateProjectionMatrix();
  }, [camera, size]);
  
  return null;
}

// HTML Overlay for labels
function HTMLOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Device labels */}
      <div className="flow-device-label" style={{ left: '20%' }}>iPhone</div>
      <div className="flow-device-label" style={{ right: '20%' }}>Watch</div>
      
      {/* Center brand */}
      <div className="flow-center-brand">
        <h2>VOIS</h2>
      </div>
      
      {/* Bucket labels */}
      {CATEGORIES.map((cat, i) => {
        const positions = ['12%', '27%', '50%', '73%', '88%'];
        return (
          <div 
            key={cat.label}
            className="flow-bucket-label"
            style={{ left: positions[i] }}
          >
            <div 
              className="flow-bucket-icon"
              style={{ 
                color: cat.color,
                background: cat.color + '15'
              }}
            >
              {cat.icon}
            </div>
            <span>{cat.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// Main exported component
export const FlowVisualization: React.FC = () => {
  return (
    <div className="relative w-full h-screen bg-white">
      <Canvas
        orthographic
        camera={{ 
          position: [0, 0, 50],
          near: 1,
          far: 1000,
          zoom: 1
        }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'white' }}
      >
        <ResponsiveCamera />
        <SceneContent />
      </Canvas>
      <HTMLOverlay />
    </div>
  );
};

export default FlowVisualization;
