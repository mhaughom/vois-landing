import React, { useRef, Suspense, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Global state (updated via window listeners)
const globalState = { 
  scrollProgress: 0, 
  mouseX: 0, 
  mouseY: 0,
  animationStartTime: Date.now()
};

// Transcript segments with categories for highlighting
interface TranscriptSegment {
  text: string;
  category?: string;
  highlightColor?: string;
}

// All category configs across all scenarios
const allCategoryConfigs: Record<string, { color: string; bg: string; highlight: string; label: string }> = {
  // Scenario 1: Birthday Party
  events: { color: '#16a34a', bg: '#dcfce7', highlight: '#bbf7d0', label: 'Event' },
  messages: { color: '#2563eb', bg: '#dbeafe', highlight: '#bfdbfe', label: 'Message' },
  shopping: { color: '#ea580c', bg: '#ffedd5', highlight: '#fed7aa', label: 'Shopping List Item' },
  // Scenario 2: Commuter Chaos
  work: { color: '#dc2626', bg: '#fef2f2', highlight: '#fecaca', label: 'Work Task' },
  errands: { color: '#2563eb', bg: '#dbeafe', highlight: '#bfdbfe', label: 'Errand' },
  ideas: { color: '#ca8a04', bg: '#fefce8', highlight: '#fef08a', label: 'Idea' },
  // Scenario 3: 3 AM Brain Dump
  health: { color: '#db2777', bg: '#fdf2f8', highlight: '#fbcfe8', label: 'Health Log' },
  finance: { color: '#16a34a', bg: '#dcfce7', highlight: '#bbf7d0', label: 'Finance' },
  social: { color: '#7c3aed', bg: '#f5f3ff', highlight: '#ddd6fe', label: 'Social' },
};

// Scenario definitions
interface Scenario {
  title: string;
  subtitle: string;
  segments: TranscriptSegment[];
  categories: string[];
}

const scenarios: Scenario[] = [
  // Scenario 1: Birthday Party Planning
  {
    title: "Son's Birthday Party",
    subtitle: "Planning Checklist",
    segments: [
      { text: "First " },
      { text: "of January we're going to have a birthday party for our son. ", category: 'events', highlightColor: allCategoryConfigs.events.highlight },
      { text: "We will invite friends. Maybe " },
      { text: "you can write a message to them as an invite. ", category: 'messages', highlightColor: allCategoryConfigs.messages.highlight },
      { text: "We're having chicken salad. Can you make a " },
      { text: "shopping list for that? ", category: 'shopping', highlightColor: allCategoryConfigs.shopping.highlight },
      { text: "Also need a birthday gift." }
    ],
    categories: ['events', 'messages', 'shopping']
  },
  // Scenario 2: Commuter Chaos
  {
    title: "Commuter Thoughts",
    subtitle: "On the way to work",
    segments: [
      { text: "Send the " },
      { text: "Q3 budget report to Sarah by Friday. ", category: 'work', highlightColor: allCategoryConfigs.work.highlight },
      { text: "Oh, and I need to " },
      { text: "pick up dry cleaning before they close at 5. ", category: 'errands', highlightColor: allCategoryConfigs.errands.highlight },
      { text: "Also, " },
      { text: "great idea for the blog: 'Why multitasking is a lie.' ", category: 'ideas', highlightColor: allCategoryConfigs.ideas.highlight },
    ],
    categories: ['work', 'errands', 'ideas']
  },
  // Scenario 3: 3 AM Brain Dump
  {
    title: "Late Night Thoughts",
    subtitle: "Brain dump before sleep",
    segments: [
      { text: "Feeling a " },
      { text: "sharp headache behind my left eye, probably too much caffeine today. ", category: 'health', highlightColor: allCategoryConfigs.health.highlight },
      { text: "Also, " },
      { text: "cancel the Netflix subscription, I never use it. ", category: 'finance', highlightColor: allCategoryConfigs.finance.highlight },
      { text: "Remind me to " },
      { text: "call Mom tomorrow, it's been a while.", category: 'social', highlightColor: allCategoryConfigs.social.highlight },
    ],
    categories: ['health', 'finance', 'social']
  }
];

// Animation timing constants
const RECORDING_START_TIME = 1.0; // Start recording after 1 second (no waiting for tap)
const SINGLE_SCENARIO_DURATION = 18.0; // Each scenario takes 18 seconds
const TOTAL_ANIMATION_DURATION = SINGLE_SCENARIO_DURATION * scenarios.length; // Total loop duration

// Helper to get current scenario and elapsed time within that scenario
const getScenarioState = () => {
  const totalElapsed = (Date.now() - globalState.animationStartTime) / 1000;
  const loopedTime = totalElapsed % TOTAL_ANIMATION_DURATION;
  const scenarioIndex = Math.floor(loopedTime / SINGLE_SCENARIO_DURATION);
  const scenarioElapsed = loopedTime % SINGLE_SCENARIO_DURATION;
  return { 
    scenario: scenarios[scenarioIndex], 
    scenarioIndex,
    elapsed: scenarioElapsed,
    fullTranscript: scenarios[scenarioIndex].segments.map(s => s.text).join('')
  };
};

// Responsive Camera Component
function ResponsiveCamera() {
  const { camera, size } = useThree();
  
  useEffect(() => {
    const aspect = size.width / size.height;
    const baseZ = 1.8; // Pulled back significantly
    
    if (aspect < 0.8) { 
       camera.position.z = baseZ + (0.8 - aspect) * 3; 
    } else if (aspect < 1.2) { 
       camera.position.z = baseZ + (1.2 - aspect) * 1;
    } else {
       camera.position.z = baseZ;
    }
    camera.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

function SceneContent() {
  const phoneRef = useRef<THREE.Group>(null);
  const watchRef = useRef<THREE.Group>(null);
  
  // Track scroll progress for screen content - use ref to avoid excessive re-renders
  const [scrollProgress, setScrollProgress] = useState(0);
  const lastScrollRef = useRef(0);
  
  // Clear GLTF cache on EVERY render to ensure fresh original UVs
  // This is necessary because UV modifications persist in the cached model
  useEffect(() => {
    useGLTF.clear('/3d_models/iphone_16_pro_max.glb');
  }, []);
  
  // Load Models
  const phone = useGLTF('/3d_models/iphone_16_pro_max.glb');
  const watch = useGLTF('/3d_models/Apple Watch 8 Ultra.glb');

  // Canvas refs for dynamic screen textures
  const phoneCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const phoneTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const watchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const watchTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const phoneScreenMeshRef = useRef<THREE.Mesh | null>(null);
  const watchScreenMeshRef = useRef<THREE.Mesh | null>(null);
  
  
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
  
  // Helper to draw the VOIS logo (3 vertical rounded bars)
  const drawVoisLogo = useCallback((ctx: CanvasRenderingContext2D, centerX: number, centerY: number, size: number, color: string = '#1a1a1a') => {
    const barWidth = size * 0.18;
    const barGap = size * 0.12;
    const shortHeight = size * 0.5;
    const tallHeight = size * 0.85;
    const radius = barWidth / 2;
    
    ctx.fillStyle = color;
    
    // Left bar (short)
    const leftX = centerX - barWidth - barGap - barWidth / 2;
    const leftY = centerY - shortHeight / 2;
    roundRect(ctx, leftX, leftY, barWidth, shortHeight, radius);
    ctx.fill();
    
    // Middle bar (tall)
    const midX = centerX - barWidth / 2;
    const midY = centerY - tallHeight / 2;
    roundRect(ctx, midX, midY, barWidth, tallHeight, radius);
    ctx.fill();
    
    // Right bar (short)
    const rightX = centerX + barGap + barWidth / 2;
    const rightY = centerY - shortHeight / 2;
    roundRect(ctx, rightX, rightY, barWidth, shortHeight, radius);
    ctx.fill();
  }, [roundRect]);

  // Draw iPhone Lock Screen with VOIS widget (iOS 17 style)
  const drawPhoneLockScreen = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, isRecording: boolean = false) => {
    // === BACKGROUND: Abstract organic shapes like iOS wallpaper ===
    
    // Base dark blue background
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#0a1628');
    bgGradient.addColorStop(0.5, '#0d1f3c');
    bgGradient.addColorStop(1, '#061220');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Large blue organic shape (top right area)
    ctx.beginPath();
    ctx.moveTo(width * 0.3, height * -0.1);
    ctx.bezierCurveTo(
      width * 1.2, height * 0.1,
      width * 1.1, height * 0.6,
      width * 0.5, height * 0.55
    );
    ctx.bezierCurveTo(
      width * 0.1, height * 0.5,
      width * -0.1, height * 0.2,
      width * 0.3, height * -0.1
    );
    const blueGradient = ctx.createRadialGradient(
      width * 0.6, height * 0.25, 0,
      width * 0.6, height * 0.25, width * 0.8
    );
    blueGradient.addColorStop(0, '#2563eb');
    blueGradient.addColorStop(0.4, '#1e40af');
    blueGradient.addColorStop(1, '#1e3a5f');
    ctx.fillStyle = blueGradient;
    ctx.fill();
    
    // Teal/green organic shape (bottom left)
    ctx.beginPath();
    ctx.moveTo(width * -0.3, height * 0.45);
    ctx.bezierCurveTo(
      width * 0.2, height * 0.35,
      width * 0.6, height * 0.55,
      width * 0.5, height * 0.85
    );
    ctx.bezierCurveTo(
      width * 0.4, height * 1.1,
      width * -0.2, height * 1.0,
      width * -0.3, height * 0.45
    );
    const tealGradient = ctx.createRadialGradient(
      width * 0.1, height * 0.65, 0,
      width * 0.1, height * 0.65, width * 0.7
    );
    tealGradient.addColorStop(0, '#14b8a6');
    tealGradient.addColorStop(0.3, '#0d9488');
    tealGradient.addColorStop(0.7, '#115e59');
    tealGradient.addColorStop(1, '#134e4a');
    ctx.fillStyle = tealGradient;
    ctx.fill();
    
    // Light blue accent (bottom right corner)
    ctx.beginPath();
    ctx.moveTo(width * 0.7, height * 0.85);
    ctx.bezierCurveTo(
      width * 1.0, height * 0.75,
      width * 1.2, height * 1.0,
      width * 0.8, height * 1.1
    );
    ctx.bezierCurveTo(
      width * 0.6, height * 1.05,
      width * 0.6, height * 0.95,
      width * 0.7, height * 0.85
    );
    const lightBlueGrad = ctx.createLinearGradient(width * 0.7, height * 0.8, width, height);
    lightBlueGrad.addColorStop(0, '#38bdf8');
    lightBlueGrad.addColorStop(1, '#0ea5e9');
    ctx.fillStyle = lightBlueGrad;
    ctx.fill();
    
    // Subtle blue stroke on shapes for depth
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width * 0.5, height * 0.55);
    ctx.bezierCurveTo(
      width * 0.1, height * 0.5,
      width * -0.1, height * 0.2,
      width * 0.3, height * -0.1
    );
    ctx.stroke();
    
    // === DYNAMIC ISLAND / NOTCH ===
    ctx.fillStyle = '#000000';
    roundRect(ctx, width * 0.32, height * 0.015, width * 0.36, height * 0.035, 12);
    ctx.fill();
    
    // === STATUS BAR ===
    ctx.fillStyle = '#ffffff';
    ctx.font = `600 ${height * 0.022}px -apple-system, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Carrier', width * 0.06, height * 0.032);
    
    // Signal dots
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 4; i++) {
      ctx.globalAlpha = i < 2 ? 1 : 0.4;
      ctx.beginPath();
      ctx.arc(width * 0.72 + i * width * 0.02, height * 0.032, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    
    // WiFi icon (simplified)
    ctx.font = `${height * 0.022}px -apple-system`;
    ctx.textAlign = 'center';
    ctx.fillText('📶', width * 0.85, height * 0.032);
    
    // Battery
    ctx.textAlign = 'right';
    ctx.font = `500 ${height * 0.018}px -apple-system`;
    ctx.fillText('29', width * 0.96, height * 0.032);
    
    // === DATE ===
    ctx.fillStyle = '#ffffff';
    ctx.font = `500 ${height * 0.028}px -apple-system`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Mon Jan 5', width / 2, height * 0.09);
    
    // === TIME (Large, frosted/translucent style) ===
    // Shadow/glow for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 4;
    
    // Semi-transparent time with slight white overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = `250 ${height * 0.14}px -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('03:56', width / 2, height * 0.19);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // === VOIS WIDGET (circular, center-bottom area) ===
    const widgetY = height * 0.72;
    const widgetSize = width * 0.16;
    
    if (isRecording) {
      // Recording state - red pulsing widget
      const pulse = 0.8 + Math.sin(Date.now() / 200) * 0.2;
      
      // Pulsing glow effect
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.beginPath();
      ctx.arc(width / 2, widgetY, widgetSize * 1.3 * pulse, 0, Math.PI * 2);
      ctx.fill();
      
      // Widget background (red)
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.beginPath();
      ctx.arc(width / 2, widgetY, widgetSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Widget border (red)
      ctx.strokeStyle = 'rgba(255, 100, 100, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(width / 2, widgetY, widgetSize, 0, Math.PI * 2);
      ctx.stroke();
      
      // Recording dot (pulsing)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(width / 2, widgetY, widgetSize * 0.3 * pulse, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Normal state - frosted glass widget
      // Widget background (frosted glass circle)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(width / 2, widgetY, widgetSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Widget border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(width / 2, widgetY, widgetSize, 0, Math.PI * 2);
      ctx.stroke();
      
      // VOIS logo in widget (3 bars)
      drawVoisLogo(ctx, width / 2, widgetY, widgetSize * 1.2, '#ffffff');
    }
    
    // === BOTTOM CONTROLS ===
    const bottomY = height * 0.9;
    const btnRadius = width * 0.08;
    
    // Flashlight button (left)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.arc(width * 0.18, bottomY, btnRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Flashlight icon
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    const flX = width * 0.18;
    const flY = bottomY;
    const flSize = btnRadius * 0.45;
    // Flashlight body
    roundRect(ctx, flX - flSize * 0.35, flY - flSize * 0.6, flSize * 0.7, flSize * 1.2, 3);
    ctx.stroke();
    // Flashlight top
    ctx.beginPath();
    ctx.moveTo(flX - flSize * 0.35, flY - flSize * 0.6);
    ctx.lineTo(flX - flSize * 0.5, flY - flSize * 0.9);
    ctx.lineTo(flX + flSize * 0.5, flY - flSize * 0.9);
    ctx.lineTo(flX + flSize * 0.35, flY - flSize * 0.6);
    ctx.stroke();
    
    // "Personal" label (center)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = `500 ${height * 0.02}px -apple-system`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👤 Personal', width / 2, bottomY);
    
    // Camera button (right)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.arc(width * 0.82, bottomY, btnRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Camera icon
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    const camX = width * 0.82;
    const camY = bottomY;
    const camSize = btnRadius * 0.5;
    // Camera body
    roundRect(ctx, camX - camSize * 0.7, camY - camSize * 0.4, camSize * 1.4, camSize * 0.9, 3);
    ctx.stroke();
    // Camera lens
    ctx.beginPath();
    ctx.arc(camX, camY, camSize * 0.25, 0, Math.PI * 2);
    ctx.stroke();
    // Camera bump
    ctx.beginPath();
    ctx.moveTo(camX - camSize * 0.3, camY - camSize * 0.4);
    ctx.lineTo(camX - camSize * 0.15, camY - camSize * 0.6);
    ctx.lineTo(camX + camSize * 0.15, camY - camSize * 0.6);
    ctx.lineTo(camX + camSize * 0.3, camY - camSize * 0.4);
    ctx.stroke();
    
    // === HOME INDICATOR ===
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    roundRect(ctx, width * 0.35, height * 0.965, width * 0.3, height * 0.006, 3);
    ctx.fill();
  }, [roundRect, drawVoisLogo]);

  // Draw Apple Watch Modular Ultra face with VOIS complication
  const drawWatchLockScreen = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, isRecording: boolean = false) => {
    // Pure black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    // === LARGE TIME (center) ===
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${width * 0.34}px -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('03', width * 0.32, height * 0.4);
    
    // Colon (dots)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.35, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.45, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillText('59', width * 0.68, height * 0.4);
    
    // === BOTTOM ROW COMPLICATIONS ===
    const bottomY = height * 0.72;
    const bottomCompR = width * 0.12;
    
    // VOIS complication (left) - with TYPICAL/RECORDING label
    if (isRecording) {
      // Recording state - red pulsing
      const pulse = 0.8 + Math.sin(Date.now() / 200) * 0.2;
      
      // Pulsing glow
      ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.beginPath();
      ctx.arc(width * 0.2, bottomY, bottomCompR * 1.3 * pulse, 0, Math.PI * 2);
      ctx.fill();
      
      // Red background
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.beginPath();
      ctx.arc(width * 0.2, bottomY, bottomCompR, 0, Math.PI * 2);
      ctx.fill();
      
      // Recording dot (pulsing white)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(width * 0.2, bottomY, bottomCompR * 0.35 * pulse, 0, Math.PI * 2);
      ctx.fill();
      
      // RECORDING label
      ctx.fillStyle = '#ef4444';
      ctx.font = `600 ${width * 0.04}px -apple-system`;
      ctx.textAlign = 'center';
      ctx.fillText('REC', width * 0.2, height * 0.88);
    } else {
      // Normal state
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.arc(width * 0.2, bottomY, bottomCompR, 0, Math.PI * 2);
      ctx.fill();
      
      // VOIS logo (3 bars)
      drawVoisLogo(ctx, width * 0.2, bottomY, bottomCompR * 1.3, '#ffffff');
      
      // TYPICAL label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = `600 ${width * 0.045}px -apple-system`;
      ctx.textAlign = 'center';
      ctx.fillText('TYPICAL', width * 0.2, height * 0.88);
    }
    
    // Middle complication (red dots - data visualization)
    const midX = width * 0.5;
    ctx.fillStyle = '#ff3b30';
    // Two dots with connection
    ctx.beginPath();
    ctx.arc(midX - width * 0.04, bottomY - width * 0.02, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(midX + width * 0.02, bottomY + width * 0.02, 4, 0, Math.PI * 2);
    ctx.fill();
    // Small circle with dot
    ctx.strokeStyle = '#ff3b30';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(midX + width * 0.06, bottomY - width * 0.01, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#ff3b30';
    ctx.beginPath();
    ctx.arc(midX + width * 0.06, bottomY - width * 0.01, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Running/workout complication (right) - with WELL ABOVE label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(width * 0.8, bottomY, bottomCompR, 0, Math.PI * 2);
    ctx.fill();
    
    // Running figure icon (orange)
    ctx.fillStyle = '#f97316';
    ctx.font = `${bottomCompR * 1.1}px -apple-system`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏃', width * 0.8, bottomY);
    
    // WELL ABOVE label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = `600 ${width * 0.04}px -apple-system`;
    ctx.fillText('WELL ABOVE', width * 0.8, height * 0.88);
    
  }, [roundRect, drawVoisLogo]);

  // Function to draw the phone transcription screen
  const drawPhoneScreen = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, _isRecording: boolean, _timer: number) => {
    const now = Date.now();
    const { scenario, elapsed, fullTranscript } = getScenarioState();
    const transcriptSegments = scenario.segments;
    const categoryConfig = allCategoryConfigs;
    const padding = width * 0.08;
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // === LOGO SCREEN (before recording starts) ===
    if (elapsed < RECORDING_START_TIME) {
      // Draw VOIS logo centered
      const logoSize = width * 0.5;
      drawVoisLogo(ctx, width / 2, height * 0.4, logoSize, '#1a1a1a');
      
      // VOIS text below logo
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `700 ${height * 0.06}px -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
      ctx.fillText('VOIS', width / 2, height * 0.58);
      
      // Starting text
      ctx.fillStyle = '#9ca3af';
      ctx.font = `400 ${height * 0.022}px -apple-system`;
      ctx.fillText('Starting...', width / 2, height * 0.68);
      
      return;
    }
    
    // === TRANSCRIPTION SCREEN ===
    const transcriptionElapsed = elapsed - RECORDING_START_TIME;
    
    // === TIMING CALCULATIONS ===
    const typingSpeed = 28;
    const highlightWriteSpeed = 70; // chars per second for highlight animation (faster than typing)
    
    // Calculate character positions for each category segment
    const segmentPositions: { category: string; startChar: number; endChar: number }[] = [];
    let charPos = 0;
    for (const seg of transcriptSegments) {
      if (seg.category) {
        segmentPositions.push({
          category: seg.category,
          startChar: charPos,
          endChar: charPos + seg.text.length
        });
      }
      charPos += seg.text.length;
    }
    
    // Calculate revealed chars (caps at full text)
    const revealedChars = Math.min(Math.floor(transcriptionElapsed * typingSpeed), fullTranscript.length);
    const typingComplete = revealedChars >= fullTranscript.length;
    
    // Calculate highlight progress for each category
    // Highlight starts when typing reaches the NEXT category (or when typing completes for the last one)
    interface HighlightState {
      category: string;
      progress: number; // 0 to 1
      charsRevealed: number;
    }
    const highlightStates: HighlightState[] = [];
    
    for (let i = 0; i < segmentPositions.length; i++) {
      const seg = segmentPositions[i];
      const nextSeg = segmentPositions[i + 1];
      
      // Highlight starts when typing reaches the next segment (or end of text for last segment)
      const triggerChar = nextSeg ? nextSeg.startChar : fullTranscript.length;
      const triggerTime = triggerChar / typingSpeed; // Time when trigger char is typed
      
      if (transcriptionElapsed >= triggerTime) {
        // Calculate how many chars of highlight have been "written" based on elapsed time
        const timeSinceTrigger = transcriptionElapsed - triggerTime;
        const segmentLength = seg.endChar - seg.startChar;
        const highlightCharsRevealed = Math.min(
          Math.floor(timeSinceTrigger * highlightWriteSpeed),
          segmentLength
        );
        const progress = highlightCharsRevealed / segmentLength;
        
        highlightStates.push({
          category: seg.category,
          progress: Math.min(1, progress),
          charsRevealed: highlightCharsRevealed
        });
      }
    }
    
    // Active highlights (for tags and notifications) - only when highlight is fully revealed
    const activeHighlights = highlightStates
      .filter(h => h.progress >= 1)
      .map(h => h.category);
    
    // Current notification (show when a highlight just completed)
    let currentNotification: string | null = null;
    for (const hs of highlightStates) {
      if (hs.progress >= 0.95 && hs.progress < 1.05) {
        // Just completed or about to complete
        const existingIndex = activeHighlights.indexOf(hs.category);
        if (existingIndex === activeHighlights.length - 1 || highlightStates.length === 1) {
          currentNotification = hs.category;
        }
      }
    }
    // Also show notification for 2 seconds after completion
    if (!currentNotification && activeHighlights.length > 0) {
      const lastCompleted = highlightStates.find(h => h.category === activeHighlights[activeHighlights.length - 1]);
      if (lastCompleted && lastCompleted.progress >= 1) {
        const timeSinceComplete = (lastCompleted.charsRevealed - (segmentPositions.find(s => s.category === lastCompleted.category)!.endChar - segmentPositions.find(s => s.category === lastCompleted.category)!.startChar)) / highlightWriteSpeed;
        if (timeSinceComplete < 2) {
          currentNotification = lastCompleted.category;
        }
      }
    }
    
    // Title animation - appears after all highlights are done
    const allHighlightsDone = highlightStates.length === segmentPositions.length && 
      highlightStates.every(h => h.progress >= 1);
    const titleStartTime = allHighlightsDone ? 
      (fullTranscript.length / typingSpeed) + (segmentPositions.length * 0.5) + 1 : 999;
    const titleProgress = allHighlightsDone ? 
      Math.min(1, Math.max(0, (transcriptionElapsed - titleStartTime) * 2)) : 0;
    const titleText = scenario.title;
    const subtitleText = scenario.subtitle;
    const titleCharsVisible = Math.floor(titleProgress * (titleText.length + subtitleText.length + 5));
    
    // === STATUS BAR ===
    ctx.fillStyle = '#1a1a1a';
    ctx.font = `600 ${height * 0.028}px -apple-system, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('03:00', padding, height * 0.035);
    
    // === TITLE (animated at the end) ===
    const titleY = height * 0.08;
    if (titleCharsVisible > 0) {
      ctx.fillStyle = '#0f172a';
      ctx.font = `700 ${height * 0.038}px -apple-system, sans-serif`;
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      const visibleTitle = titleText.substring(0, Math.min(titleCharsVisible, titleText.length));
      ctx.fillText(visibleTitle, padding, titleY);
      
      // Subtitle appears after title
      if (titleCharsVisible > titleText.length) {
        ctx.fillStyle = '#64748b';
        ctx.font = `400 ${height * 0.022}px -apple-system`;
        const subtitleChars = titleCharsVisible - titleText.length - 2;
        const visibleSubtitle = subtitleText.substring(0, Math.min(subtitleChars, subtitleText.length));
        ctx.fillText(visibleSubtitle, padding, titleY + height * 0.048);
      }
    }
    
    // === AUDIO PLAYER ===
    const audioY = titleY + height * 0.12;
    const audioH = height * 0.055;
    
    // Play button
    const playR = audioH * 0.45;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(padding + playR, audioY + audioH / 2, playR, 0, Math.PI * 2);
    ctx.fill();
    
    // Play triangle
    ctx.fillStyle = '#fff';
      ctx.beginPath();
    const t = playR * 0.4;
    ctx.moveTo(padding + playR - t * 0.2, audioY + audioH / 2 - t * 0.55);
    ctx.lineTo(padding + playR - t * 0.2, audioY + audioH / 2 + t * 0.55);
    ctx.lineTo(padding + playR + t * 0.5, audioY + audioH / 2);
    ctx.closePath();
    ctx.fill();
    
    // Waveform
    const waveStart = padding + playR * 2 + width * 0.05;
    const waveEnd = width - padding;
    const bars = 30;
    const barGap = (waveEnd - waveStart) / bars;
    
    for (let i = 0; i < bars; i++) {
      const h = audioH * (0.25 + Math.abs(Math.sin(i * 0.7)) * 0.5);
      ctx.fillStyle = i < 1 ? '#0f172a' : '#d1d5db';
      roundRect(ctx, waveStart + i * barGap, audioY + (audioH - h) / 2, barGap * 0.55, h, 2);
      ctx.fill();
    }
    
    // Time labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = `500 ${height * 0.018}px -apple-system`;
    ctx.textAlign = 'left';
    ctx.fillText('0:00', waveStart, audioY + audioH + height * 0.018);
    ctx.textAlign = 'right';
    ctx.fillText('1:10', waveEnd, audioY + audioH + height * 0.018);
    
    // === TRANSCRIPTION HEADER ===
    const transY = audioY + audioH + height * 0.06;
    ctx.fillStyle = '#94a3b8';
    ctx.font = `700 ${height * 0.016}px -apple-system`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('TRANSCRIPTION', padding, transY);
    
    // === TEXT WITH SEQUENTIAL HIGHLIGHTING ===
    const textY = transY + height * 0.04;
    const lineH = height * 0.052;
    const textSize = height * 0.034;
    const maxX = width - padding;
    
    // First pass: calculate word positions for all segments
    interface WordInfo {
      word: string;
      x: number;
      y: number;
      width: number;
      segment: TranscriptSegment;
      isBold: boolean;
      wordIndexInSegment: number;
      totalWordsInSegment: number;
    }
    
    const wordPositions: WordInfo[] = [];
    let charCount = 0;
    let curX = padding;
    let curY = textY;
    
    // Pre-calculate total words per segment for highlight animation
    const segmentWordCounts: Map<TranscriptSegment, number> = new Map();
    for (const seg of transcriptSegments) {
      if (seg.category) {
        segmentWordCounts.set(seg, seg.text.trim().split(/\s+/).length);
      }
    }
    
    // Track word index within each segment
    const segmentWordIndex: Map<TranscriptSegment, number> = new Map();
    
    for (const seg of transcriptSegments) {
      const segLen = seg.text.length;
      const visible = Math.min(Math.max(0, revealedChars - charCount), segLen);
      const visibleText = seg.text.substring(0, visible);
      
      if (visible === 0) {
        charCount += segLen;
        continue;
      }
      
      const words = visibleText.split(' ');
      for (const word of words) {
        if (!word) continue;
        
        const isBold = seg.text.startsWith('First') && word === 'First';
        ctx.font = isBold ? `700 ${textSize}px -apple-system` : `400 ${textSize}px -apple-system`;
        const wordW = ctx.measureText(word + ' ').width;
        
        if (curX + wordW > maxX && curX > padding) {
          curY += lineH;
          curX = padding;
        }
        
        const currentWordIndex = segmentWordIndex.get(seg) || 0;
        segmentWordIndex.set(seg, currentWordIndex + 1);
        
        wordPositions.push({ 
          word, 
          x: curX, 
          y: curY, 
          width: wordW, 
          segment: seg, 
          isBold,
          wordIndexInSegment: currentWordIndex,
          totalWordsInSegment: segmentWordCounts.get(seg) || 1
        });
        curX += wordW;
      }
      
      charCount += segLen;
    }
    
    // Second pass: draw highlights with progressive "writing" animation
    for (const wp of wordPositions) {
      if (wp.segment.category && wp.segment.highlightColor) {
        // Find the highlight state for this category
        const highlightState = highlightStates.find(h => h.category === wp.segment.category);
        
        if (highlightState) {
          // Calculate how many words should be highlighted based on progress
          const wordsToHighlight = Math.floor(highlightState.progress * wp.totalWordsInSegment);
          
          // This word should be highlighted if its index is less than wordsToHighlight
          if (wp.wordIndexInSegment < wordsToHighlight) {
            const cfg = categoryConfig[wp.segment.category];
            ctx.fillStyle = cfg.highlight;
            roundRect(ctx, wp.x - 3, wp.y - 3, wp.width + 4, textSize + 8, 5);
            ctx.fill();
          } else if (wp.wordIndexInSegment === wordsToHighlight && highlightState.progress < 1) {
            // Partial highlight for the current word being "written"
            const partialProgress = (highlightState.progress * wp.totalWordsInSegment) % 1;
            if (partialProgress > 0) {
              const cfg = categoryConfig[wp.segment.category];
              ctx.fillStyle = cfg.highlight;
              const partialWidth = (wp.width + 4) * partialProgress;
              roundRect(ctx, wp.x - 3, wp.y - 3, partialWidth, textSize + 8, 5);
              ctx.fill();
            }
          }
        }
      }
    }
    
    // Third pass: draw text
    for (const wp of wordPositions) {
      ctx.font = wp.isBold ? `700 ${textSize}px -apple-system` : `400 ${textSize}px -apple-system`;
      ctx.fillStyle = wp.isBold ? '#0f172a' : '#374151';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(wp.word + ' ', wp.x, wp.y);
    }
    
    // Typing cursor (only while typing)
    if (!typingComplete) {
      if (Math.floor(now / 500) % 2 === 0) {
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(curX + 2, curY, 3, textSize);
      }
    }
    
    // === "AGENT FOUND" NOTIFICATION - positioned above the text ===
    if (currentNotification) {
      const cfg = categoryConfig[currentNotification as keyof typeof categoryConfig];
      // Use "an" before vowels, "a" before consonants
      const article = /^[aeiouAEIOU]/.test(cfg.label) ? 'an' : 'a';
      const notifText = `✨ Agent found ${article} ${cfg.label}`;
      
      ctx.font = `600 ${height * 0.02}px -apple-system`;
      const notifW = ctx.measureText(notifText).width + width * 0.06;
      const notifH = height * 0.038;
      const notifX = padding;
      const notifY = transY - height * 0.055;
      
      // Notification background
      ctx.fillStyle = cfg.bg;
      roundRect(ctx, notifX, notifY, notifW, notifH, notifH / 2);
      ctx.fill();
      
      // Border
      ctx.strokeStyle = cfg.color;
      ctx.lineWidth = 1.5;
      roundRect(ctx, notifX, notifY, notifW, notifH, notifH / 2);
      ctx.stroke();
      
      // Text
      ctx.fillStyle = cfg.color;
    ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(notifText, notifX + notifW / 2, notifY + notifH / 2);
    }
    
    // === CATEGORY TAGS (below transcription text) ===
    const tagsY = curY + lineH + height * 0.02;
    const tagH = height * 0.032;
    const tagFontSize = height * 0.016;
    
    // Category icons mapping
    const categoryIcons: Record<string, string> = {
      events: '📅', messages: '💬', shopping: '🛒',
      work: '💼', errands: '📋', ideas: '💡',
      health: '❤️', finance: '💰', social: '👥'
    };
    
    let tagX = padding;
    ctx.textBaseline = 'middle';
    
    // Use scenario's categories
    for (const cat of scenario.categories) {
      const isActive = activeHighlights.includes(cat);
      if (!isActive) continue; // Only show tags that are found
      
      const cfg = categoryConfig[cat];
      if (!cfg) continue;
      
      ctx.font = `500 ${tagFontSize}px -apple-system`;
      const labelW = ctx.measureText(cfg.label).width;
      const tagW = labelW + width * 0.08;
      
      // Tag background
      ctx.fillStyle = cfg.bg;
      roundRect(ctx, tagX, tagsY, tagW, tagH, tagH / 2);
      ctx.fill();
      
      // Tag border
      ctx.strokeStyle = cfg.color;
      ctx.lineWidth = 1;
      roundRect(ctx, tagX, tagsY, tagW, tagH, tagH / 2);
      ctx.stroke();
      
      // Icon and text
      ctx.fillStyle = cfg.color;
      ctx.textAlign = 'center';
      const icon = categoryIcons[cat] || '📌';
      ctx.fillText(`${icon} ${cfg.label}`, tagX + tagW / 2, tagsY + tagH / 2);
      
      tagX += tagW + width * 0.02;
    }
    
    // === BOTTOM NAV BAR ===
    const navBarY = height * 0.88;
    const navBarH = height * 0.12;
    
    // Nav bar background
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, navBarY, width, navBarH);
    
    // Top border
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, navBarY);
    ctx.lineTo(width, navBarY);
    ctx.stroke();
    
    // Three nav icons: microphone, sparkle, grid (drawn manually for consistent black color)
    const navW = width / 3;
    const iconSize = height * 0.028;
    const iconY = navBarY + navBarH * 0.5;
    ctx.strokeStyle = '#1a1a1a';
    ctx.fillStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    
    // Microphone icon (left)
    const micX = navW * 0.5;
    ctx.beginPath();
    ctx.arc(micX, iconY - iconSize * 0.3, iconSize * 0.35, Math.PI, 0);
    ctx.lineTo(micX + iconSize * 0.35, iconY + iconSize * 0.2);
    ctx.arc(micX, iconY + iconSize * 0.2, iconSize * 0.35, 0, Math.PI);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(micX, iconY + iconSize * 0.55);
    ctx.lineTo(micX, iconY + iconSize * 0.8);
    ctx.moveTo(micX - iconSize * 0.25, iconY + iconSize * 0.8);
    ctx.lineTo(micX + iconSize * 0.25, iconY + iconSize * 0.8);
    ctx.stroke();
    
    // Sparkle icon (center)
    const sparkX = navW * 1.5;
    ctx.beginPath();
    // 4-point star
    ctx.moveTo(sparkX, iconY - iconSize * 0.6);
    ctx.lineTo(sparkX + iconSize * 0.15, iconY - iconSize * 0.15);
    ctx.lineTo(sparkX + iconSize * 0.5, iconY);
    ctx.lineTo(sparkX + iconSize * 0.15, iconY + iconSize * 0.15);
    ctx.lineTo(sparkX, iconY + iconSize * 0.6);
    ctx.lineTo(sparkX - iconSize * 0.15, iconY + iconSize * 0.15);
    ctx.lineTo(sparkX - iconSize * 0.5, iconY);
    ctx.lineTo(sparkX - iconSize * 0.15, iconY - iconSize * 0.15);
    ctx.closePath();
    ctx.fill();
    
    // Grid icon (right)
    const gridX = navW * 2.5;
    const dotR = iconSize * 0.12;
    const dotSpacing = iconSize * 0.4;
    for (let row = -1; row <= 1; row++) {
      for (let col = -1; col <= 1; col++) {
        ctx.beginPath();
        ctx.arc(gridX + col * dotSpacing, iconY + row * dotSpacing, dotR, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [roundRect]);
  
  // Function to draw the watch recording screen
  const drawWatchScreen = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, _isRecording: boolean, timer: number) => {
    const { elapsed } = getScenarioState();
    const isBeforeRecording = elapsed < RECORDING_START_TIME;
    const isRecording = elapsed >= RECORDING_START_TIME;
    
    // Dark gradient background
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.7);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Time in top area
    ctx.fillStyle = '#666666';
    ctx.font = `bold ${width * 0.08}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('10:09', width / 2, height * 0.12);
    
    // Center content
    const centerY = height * 0.5;
    
    if (isBeforeRecording) {
      // === LOGO SCREEN - Brief startup ===
      // Draw VOIS logo with startup animation
      const startupProgress = elapsed / RECORDING_START_TIME;
      const scale = 0.8 + startupProgress * 0.2;
      const logoSize = width * 0.6 * scale;
      drawVoisLogo(ctx, width / 2, centerY - height * 0.05, logoSize, '#3b82f6');
      
      // "Starting..." text with fade
      ctx.fillStyle = '#3b82f6';
      ctx.font = `600 ${width * 0.07}px -apple-system`;
      ctx.fillText('Starting...', width / 2, height * 0.82);
      
    } else {
      // === RECORDING SCREEN ===
      // Pulsing glow effect
      const pulseSize = width * 0.25 + Math.sin(Date.now() / 300) * width * 0.05;
      ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
      ctx.beginPath();
      ctx.arc(width / 2, centerY, pulseSize, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.beginPath();
      ctx.arc(width / 2, centerY, pulseSize * 1.3, 0, Math.PI * 2);
      ctx.fill();
    
    // Main button circle
    const btnRadius = width * 0.18;
      ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(width / 2, centerY, btnRadius, 0, Math.PI * 2);
    ctx.fill();
    
      // Inner recording indicator (pulsing dot)
      const dotPulse = 0.8 + Math.sin(Date.now() / 400) * 0.2;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(width / 2, centerY, btnRadius * 0.35 * dotPulse, 0, Math.PI * 2);
      ctx.fill();
      
      // VOIS text above button
      ctx.fillStyle = '#3b82f6';
      ctx.font = `bold ${width * 0.1}px -apple-system`;
      ctx.fillText('VOIS', width / 2, height * 0.25);
    
    // Timer display
      const recordingTime = Math.floor(elapsed - RECORDING_START_TIME);
      const minutes = Math.floor(recordingTime / 60);
      const seconds = recordingTime % 60;
      ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${width * 0.12}px monospace`;
    ctx.fillText(`${minutes}:${seconds.toString().padStart(2, '0')}`, width / 2, height * 0.78);
    
      // Status text
    ctx.fillStyle = '#666666';
      ctx.font = `${width * 0.06}px -apple-system`;
      ctx.fillText('Recording...', width / 2, height * 0.90);
    }
  }, [drawVoisLogo]);
  
  // Set up screen textures on model load
  useEffect(() => {
    // Create phone canvas - simple portrait canvas
    const phoneCanvas = document.createElement('canvas');
    phoneCanvas.width = 512;
    phoneCanvas.height = 1024;
    phoneCanvasRef.current = phoneCanvas;
    
    // Create watch canvas
    const watchCanvas = document.createElement('canvas');
    watchCanvas.width = 328;
    watchCanvas.height = 392;
    watchCanvasRef.current = watchCanvas;
    
    // Draw initial content on canvases BEFORE creating textures
    const phoneCtx = phoneCanvas.getContext('2d');
    const watchCtx = watchCanvas.getContext('2d');
    if (phoneCtx) {
      // Fill with white first to ensure it's not transparent
      phoneCtx.fillStyle = '#ffffff';
      phoneCtx.fillRect(0, 0, phoneCanvas.width, phoneCanvas.height);
      drawPhoneScreen(phoneCtx, phoneCanvas.width, phoneCanvas.height, false, 0);
    }
    if (watchCtx) {
      watchCtx.fillStyle = '#000000';
      watchCtx.fillRect(0, 0, watchCanvas.width, watchCanvas.height);
      drawWatchScreen(watchCtx, watchCanvas.width, watchCanvas.height, false, 0);
    }
    
    phone.scene.traverse((child: any) => {
      if (child.isMesh) {
        if (child.name === 'Cube014_screen001_0' || child.material?.name === 'screen001') {
          phoneScreenMeshRef.current = child;
          
          // FIX: Create LINEAR UVs from vertex POSITIONS (the model's UVs are broken)
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
          
          // Create UVs: Y→U (flipped), Z→V (flipped) for correct orientation
          const vertCount = pos.length / 3;
          const newUV = new Float32Array(vertCount * 2);
          for (let i = 0; i < vertCount; i++) {
            const y = pos[i * 3 + 1];
            const z = pos[i * 3 + 2];
            newUV[i * 2] = 1 - (y - minY) / (maxY - minY);       // U = 1-Y (horizontal - flipped to fix mirror)
            newUV[i * 2 + 1] = 1 - (z - minZ) / (maxZ - minZ);   // V = 1-Z (vertical - flipped for upright)
          }
          geometry.setAttribute('uv', new THREE.BufferAttribute(newUV, 2));
          
          const texture = new THREE.CanvasTexture(phoneCanvas);
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.flipY = false;  // Canvas textures are already in correct orientation
          texture.repeat.set(1, 1);
          texture.offset.set(0, 0);
          
          phoneTextureRef.current = texture;
          
          child.material = new THREE.MeshBasicMaterial({ 
            map: texture,
            toneMapped: false,
            side: THREE.DoubleSide,
          });
        }
      }
    });
    
    // Find and replace Watch screen material
    watch.scene.traverse((child: any) => {
      // Watch screen is Cube004_4 with Material.004
      const isScreen = child.isMesh && (
        child.name === 'Cube004_4' ||
        child.material?.name === 'Material.004'
      );
      if (isScreen) {
        watchScreenMeshRef.current = child;
        
        // Analyze UV coordinates for proper texture mapping
        const geometry = child.geometry;
        let watchUvData: any = { hasUV: false };
        if (geometry && geometry.attributes.uv) {
          const uvArray = geometry.attributes.uv.array;
          let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity;
          for (let i = 0; i < uvArray.length; i += 2) {
            minU = Math.min(minU, uvArray[i]);
            maxU = Math.max(maxU, uvArray[i]);
            minV = Math.min(minV, uvArray[i+1]);
            maxV = Math.max(maxV, uvArray[i+1]);
          }
          watchUvData = { hasUV: true, minU, maxU, minV, maxV };
        }
        
        const texture = new THREE.CanvasTexture(watchCanvas);
        texture.flipY = false;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        
        // Apply UV remapping (same technique as phone)
        if (watchUvData.hasUV) {
          const uRange = watchUvData.maxU - watchUvData.minU;
          const vRange = watchUvData.maxV - watchUvData.minV;
          if (uRange > 0.01) {
            texture.repeat.x = 1 / uRange;
            texture.offset.x = -watchUvData.minU / uRange;
          }
          if (vRange > 0.01) {
            texture.repeat.y = 1 / vRange;
            texture.offset.y = -watchUvData.minV / vRange;
          }
        }
        
        watchTextureRef.current = texture;
        child.material = new THREE.MeshBasicMaterial({ 
          map: texture,
          toneMapped: false,
          side: THREE.DoubleSide,
        });
      }
    });
    
  }, [phone, watch, drawPhoneScreen, drawWatchScreen]);
  
  // Track recording state and timer
  const timerRef = useRef(0);
  const lastTimeRef = useRef(0);
  const section3EnteredTimeRef = useRef<number | null>(null);
  const wasInSection3Ref = useRef(false);
  
  // Update screen content based on scroll progress
  useFrame((state) => {
    const r = globalState.scrollProgress;
    const time = state.clock.elapsedTime;
    
    // Section 1 (hero): transcription screen | Section 3+: lock screen with widget
    const isHeroSection = r < 0.10;
    const isSection3 = r >= 0.19 && r < 0.35; // Section 3 range (capture + flow sections)
    
    // Track when we enter section 3
    if (isSection3 && !wasInSection3Ref.current) {
      section3EnteredTimeRef.current = time;
      wasInSection3Ref.current = true;
    } else if (!isSection3) {
      wasInSection3Ref.current = false;
      section3EnteredTimeRef.current = null;
    }
    
    // Calculate if lock screen widgets should be recording (different timing for each device)
    const timeInSection3 = section3EnteredTimeRef.current !== null ? time - section3EnteredTimeRef.current : 0;
    const phoneLockScreenRecording = isSection3 && timeInSection3 > 2.0; // Phone after 2 sec
    const watchLockScreenRecording = isSection3 && timeInSection3 > 3.0; // Watch after 3 sec
    
    // Phone recording active only in hero section
    const phoneRecording = isHeroSection;
    // Watch recording active only in hero section
    const watchRecording = isHeroSection;
    
    // Update timer when recording (shared timer for both devices)
    if ((phoneRecording || watchRecording) && time - lastTimeRef.current > 1) {
      timerRef.current += 1;
      lastTimeRef.current = time;
    }
    
    // Update phone screen - transcription in hero, lock screen in section 3+
    if (phoneCanvasRef.current && phoneTextureRef.current) {
      const ctx = phoneCanvasRef.current.getContext('2d');
      if (ctx) {
        if (isHeroSection) {
          // Section 1: Show transcription screen
          drawPhoneScreen(ctx, phoneCanvasRef.current.width, phoneCanvasRef.current.height, phoneRecording, timerRef.current);
        } else {
          // Section 3+: Show lock screen with VOIS widget (recording state after 2 sec)
          drawPhoneLockScreen(ctx, phoneCanvasRef.current.width, phoneCanvasRef.current.height, phoneLockScreenRecording);
        }
        phoneTextureRef.current.needsUpdate = true;
      }
    }
    
    // Update watch screen - recording in hero, lock screen with complication in section 3+
    if (watchCanvasRef.current && watchTextureRef.current) {
      const ctx = watchCanvasRef.current.getContext('2d');
      if (ctx) {
        if (isHeroSection) {
          // Section 1: Show recording screen
          drawWatchScreen(ctx, watchCanvasRef.current.width, watchCanvasRef.current.height, watchRecording, timerRef.current);
        } else {
          // Section 3+: Show watch face with VOIS complication (recording state after 3 sec)
          drawWatchLockScreen(ctx, watchCanvasRef.current.width, watchCanvasRef.current.height, watchLockScreenRecording);
        }
        watchTextureRef.current.needsUpdate = true;
      }
    }
  });
  
  // Update scroll progress for React state only when it changes significantly
  useFrame(() => {
    const current = globalState.scrollProgress;
    // Only update state if scroll changed by more than 1%
    if (Math.abs(current - lastScrollRef.current) > 0.01) {
      lastScrollRef.current = current;
      setScrollProgress(current);
    }
  });

  // Constants - base rotation to show front screen (90° from model default)
  const basePhoneRotY = Math.PI / 2;
  
  // Phone positions
  const phoneRightPos = new THREE.Vector3(0.6, -0.05, -0.2);  // Hero: right side
  const phoneLeftPos = new THREE.Vector3(-0.5, 0.0, 0.2);     // Sections 2-3: left side (centered vertically)
  
  // Watch positions  
  const watchStartPos = new THREE.Vector3(0.15, -0.35, 0.4);  // Hero: next to phone
  const watchRightPos = new THREE.Vector3(0.5, -0.2, 0.3);    // Section 4+: right side (lower)
  
  // Track time for ambient movement
  const timeRef = useRef(0);
  
  useFrame((state, delta) => {
    timeRef.current += delta;
    const time = timeRef.current;
    
    const r = globalState.scrollProgress; // 0 to 1 based on page scroll
    const mouseX = globalState.mouseX;
    const mouseY = globalState.mouseY;
    
    // Ambient floating movement (subtle sine waves)
    const ambientY = Math.sin(time * 0.8) * 0.015;
    const ambientX = Math.cos(time * 0.6) * 0.008;
    const ambientRotX = Math.sin(time * 0.5) * 0.02;
    const ambientRotY = Math.cos(time * 0.7) * 0.02;
    
    // Define scroll phases (adjusted for longer page with flow section):
    // Phase 1: 0-10% - Move up with hero section (no sideways movement)
    // Phase 2: 10-17% - Video section (messy man) - devices hidden
    // Phase 3: 17-19% - Phone enters from left, Watch enters from right (FAST!)
    // Phase 4: 19-24% - Both stay in position for capture section
    // Phase 5: 24%+ - Devices scroll up with page content (same speed as text)
    
    // -- PHONE ANIMATION --
    if (phoneRef.current) {
      // Scroll up - starts immediately (0 to 0.10)
      const scrollAwayProgress = THREE.MathUtils.smoothstep(r, 0, 0.10);
      
      // Phase 3: Enter from left (0.17 to 0.19) - snaps into place right at section 3
      const enterFromLeftProgress = THREE.MathUtils.smoothstep(r, 0.17, 0.19);
      
      // Position
      let targetX, targetY, targetZ, targetScale, targetRotY, targetRotZ;
      
      if (r < 0.10) {
        // Phase 1: Scroll up with hero
        targetX = phoneRightPos.x;
        targetY = phoneRightPos.y + scrollAwayProgress * 2.0;
        targetZ = phoneRightPos.z;
        targetScale = 0.55;
        targetRotY = basePhoneRotY;
        targetRotZ = 0;
      } else if (r < 0.17) {
        // Phase 2: Hidden during video - off screen left
        targetX = -2.5;
        targetY = -0.2; // Lower position to match text level
        targetZ = 0;
        targetScale = 0;
        targetRotY = basePhoneRotY + 0.5;
        targetRotZ = 0.2;
      } else {
        // Phase 3+: Enter from left, snap into place at section 3, then scroll up
        const phoneLeftX = -0.50;
        targetX = THREE.MathUtils.lerp(-1.8, phoneLeftX, enterFromLeftProgress);
        
        // Y position: centered with text, then scroll up after section 3
        const scrollUpStart = 0.24;
        const scrollUpAmount = r > scrollUpStart ? (r - scrollUpStart) * 8.0 : 0;
        targetY = -0.1 + scrollUpAmount; // Lower Y to align with text
        
        targetZ = phoneLeftPos.z + 0.4;
        targetScale = THREE.MathUtils.lerp(0, 0.28, enterFromLeftProgress);
        
        // Rotation: start with dramatic tilt, settle to subtle angle facing text
        const tiltTowardCenter = 0.15;
        targetRotY = THREE.MathUtils.lerp(basePhoneRotY + 0.7, basePhoneRotY + tiltTowardCenter, enterFromLeftProgress);
        targetRotZ = THREE.MathUtils.lerp(0.2, 0, enterFromLeftProgress);
      }
      
      // Mouse interaction - active in hero phase and during capture phase
      const mouseInfluence = r < 0.10 ? (1 - scrollAwayProgress) : (r > 0.17 && r < 0.25 ? enterFromLeftProgress : 0);
      const mX = (mouseX - 0.6) * 0.35 * mouseInfluence;
      const mY = mouseY * 0.35 * mouseInfluence;

      // Smooth updates - position with ambient + mouse movement (faster lerp for snappier response)
      phoneRef.current.position.x = THREE.MathUtils.lerp(phoneRef.current.position.x, targetX - mX * 0.08 + ambientX * mouseInfluence, 0.15);
      phoneRef.current.position.y = THREE.MathUtils.lerp(phoneRef.current.position.y, targetY - mY * 0.08 + ambientY * mouseInfluence, 0.15);
      phoneRef.current.position.z = THREE.MathUtils.lerp(phoneRef.current.position.z, targetZ, 0.15);
      phoneRef.current.scale.setScalar(THREE.MathUtils.lerp(phoneRef.current.scale.x, targetScale, 0.15));
      
      // Rotation with ambient + mouse response
      phoneRef.current.rotation.y = THREE.MathUtils.lerp(phoneRef.current.rotation.y, targetRotY + mX * 0.4 + ambientRotY * mouseInfluence, 0.15);
      phoneRef.current.rotation.x = THREE.MathUtils.lerp(phoneRef.current.rotation.x, -mY * 0.4 + ambientRotX * mouseInfluence, 0.15);
      phoneRef.current.rotation.z = THREE.MathUtils.lerp(phoneRef.current.rotation.z, targetRotZ, 0.15);
    }

    // -- WATCH ANIMATION --
    if (watchRef.current) {
      // Scroll up - starts immediately (0 to 0.10)
      const scrollAwayProgress = THREE.MathUtils.smoothstep(r, 0, 0.10);
      
      // Phase 3: Enter from right (0.17 to 0.19) - snaps into place at section 3
      const enterFromRightProgress = THREE.MathUtils.smoothstep(r, 0.17, 0.19);
      
      let targetX, targetY, targetZ, targetScale, targetRotY, targetRotZ;
      
      // Ambient movement for watch
      const watchAmbientY = Math.sin(time * 0.9 + 2) * 0.012;
      const watchAmbientX = Math.cos(time * 0.7 + 2) * 0.006;
      const watchAmbientRotX = Math.sin(time * 0.6 + 1) * 0.025;
      const watchAmbientRotY = Math.cos(time * 0.8 + 1) * 0.025;
      
      if (r < 0.10) {
        // Phase 1: Scroll up with hero
        targetX = watchStartPos.x;
        targetY = watchStartPos.y + scrollAwayProgress * 2.0;
        targetZ = watchStartPos.z;
        targetScale = 0.17;
        targetRotY = 0;
        targetRotZ = 0;
      } else if (r < 0.17) {
        // Phase 2: Hidden during video - off screen right
        targetX = 2.5;
        targetY = -0.15; // Lower position to match text level
        targetZ = 0;
        targetScale = 0;
        targetRotY = -0.5;
        targetRotZ = -0.2;
      } else {
        // Phase 3+: Enter from right, snap into place at section 3, then scroll up
        const watchRightX = 0.40;
        targetX = THREE.MathUtils.lerp(1.8, watchRightX, enterFromRightProgress);
        
        // Y position: centered with text, then scroll up after section 3
        const scrollUpStart = 0.24;
        const scrollUpAmount = r > scrollUpStart ? (r - scrollUpStart) * 8.0 : 0;
        targetY = -0.05 + scrollUpAmount; // Lower Y to align with text
        
        targetZ = watchRightPos.z + 0.4;
        targetScale = THREE.MathUtils.lerp(0, 0.13, enterFromRightProgress);
        
        // Rotation: start with dramatic tilt, settle to subtle angle
        targetRotY = THREE.MathUtils.lerp(-0.6, -0.1, enterFromRightProgress);
        targetRotZ = THREE.MathUtils.lerp(-0.25, 0, enterFromRightProgress);
      }
      
      // Mouse interaction - active in hero phase and during capture phase
      const watchMouseInfluence = r < 0.10 ? (1 - scrollAwayProgress) : (r > 0.17 && r < 0.25 ? enterFromRightProgress : 0);
      const wMouseX = (mouseX - 0.6) * 0.4 * watchMouseInfluence;
      const wMouseY = mouseY * 0.4 * watchMouseInfluence;
      
      watchRef.current.position.x = THREE.MathUtils.lerp(watchRef.current.position.x, targetX - wMouseX * 0.08 + watchAmbientX * watchMouseInfluence, 0.15);
      watchRef.current.position.y = THREE.MathUtils.lerp(watchRef.current.position.y, targetY - wMouseY * 0.08 + watchAmbientY * watchMouseInfluence, 0.15);
      watchRef.current.position.z = THREE.MathUtils.lerp(watchRef.current.position.z, targetZ, 0.15);
      watchRef.current.scale.setScalar(THREE.MathUtils.lerp(watchRef.current.scale.x, targetScale, 0.15));
      
      // Rotation with mouse + ambient
      watchRef.current.rotation.y = THREE.MathUtils.lerp(watchRef.current.rotation.y, targetRotY + wMouseX * 0.6 * watchMouseInfluence + watchAmbientRotY * watchMouseInfluence, 0.15);
      watchRef.current.rotation.x = THREE.MathUtils.lerp(watchRef.current.rotation.x, -wMouseY * 0.6 * watchMouseInfluence + watchAmbientRotX * watchMouseInfluence, 0.15);
      watchRef.current.rotation.z = THREE.MathUtils.lerp(watchRef.current.rotation.z, targetRotZ, 0.15);
    }
  });

  return (
    <>
      <group ref={phoneRef} scale={0.60} position={[0.6, -0.05, -0.2]}>
        <primitive object={phone.scene} />
      </group>
      
      <group ref={watchRef} scale={0.17} position={[0.15, -0.35, 0.4]}>
        <primitive object={watch.scene} />
      </group>
    </>
  );
}

// Combined Device Scene
export const DeviceScene: React.FC = () => {
  // Set up window scroll and mouse listeners
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      globalState.scrollProgress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to -1 to 1 range
      globalState.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      globalState.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    // Initial scroll position
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 1.8], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
    >
      <ambientLight intensity={2} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <directionalLight position={[-5, 5, 5]} intensity={1.5} />
      <spotLight position={[0, 5, 10]} angle={0.3} penumbra={1} intensity={1} castShadow={false} />
      
      <Suspense fallback={null}>
        <ResponsiveCamera />
        <SceneContent />
        <Environment preset="studio" />
      </Suspense>
    </Canvas>
  );
};

// Preload models
useGLTF.preload('/3d_models/iphone_16_pro_max.glb');
useGLTF.preload('/3d_models/Apple Watch 8 Ultra.glb');
