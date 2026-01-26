import React, { useRef, Suspense, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Configure Draco decoder for compressed GLB models
useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

// State, types, and setter functions are in deviceState.ts (no Three.js dependency)
// so other components can import them without pulling in the 3D renderer.
import {
  globalState,
  callbacks,
  setPhoneScreen,
  setPhoneHoveredButton,
  setSelectedCard,
  setDemoActiveDevice,
  setChatInput,
  resetChat,
  CHAT_SUGGESTED_PROMPTS,
} from './deviceState';
import type { PhoneScreen } from './deviceState';
export type { SectionId, DemoState, DemoDevice, PhoneScreen } from './deviceState';
export {
  setCurrentSection,
  setOnChatOpen,
  setOnChatMessageSent,
  setNarrativeScrollProgress,
  setVideoHoverState,
  setVideoPlayState,
  setOnPhoneRecordClick,
  setOnWatchRecordClick,
  setOnStopRecordClick,
  setOnChatSendMessage,
  setOnChatInputClick,
  setDemoWaitingToStart,
  setDemoActiveDevice,
  setDemoRecording,
  setDemoProcessing,
  setDemoAudioLevels,
  setDemoCountdown,
  setDemoElapsed,
  setDemoTip,
  setDemoResults,
  setDemoError,
  getDemoState,
  getChatState,
  addChatMessage,
  setChatLoading,
  setChatError,
  setChatInput,
  setChatInputFocused,
  getPhoneScreenState,
  endHeroShowcase,
  isHeroShowcaseActive,
} from './deviceState';

// Transcript segments with categories for highlighting
interface TranscriptSegment {
  text: string;
  category?: string;
  highlightColor?: string;
}

// UNIFIED COLOR SCHEME - each category has its own distinct color
// Highlights are extra light/pastel for subtle text highlighting
const allCategoryConfigs: Record<string, { color: string; bg: string; highlight: string; label: string }> = {
  // Blue - Calendar, Events
  events: { color: '#2563eb', bg: '#dbeafe', highlight: 'rgba(191, 219, 254, 0.5)', label: 'Event' },
  // Green - Tasks, Work
  work: { color: '#16a34a', bg: '#dcfce7', highlight: 'rgba(187, 247, 208, 0.5)', label: 'Task' },
  // Orange - Errands
  errands: { color: '#ea580c', bg: '#fff7ed', highlight: 'rgba(254, 215, 170, 0.5)', label: 'Errand' },
  // Teal - Finance
  finance: { color: '#0891b2', bg: '#ecfeff', highlight: 'rgba(165, 243, 252, 0.5)', label: 'Task' },
  // Yellow - Ideas
  ideas: { color: '#ca8a04', bg: '#fefce8', highlight: 'rgba(254, 240, 138, 0.5)', label: 'Idea' },
  // Red - Health
  health: { color: '#dc2626', bg: '#fef2f2', highlight: 'rgba(254, 202, 202, 0.5)', label: 'Health Log' },
  // Purple - Shopping
  shopping: { color: '#7c3aed', bg: '#f5f3ff', highlight: 'rgba(221, 214, 254, 0.5)', label: 'Shopping' },
  // Pink - Social, Messages
  social: { color: '#db2777', bg: '#fdf2f8', highlight: 'rgba(251, 207, 232, 0.5)', label: 'Reminder' },
  messages: { color: '#db2777', bg: '#fdf2f8', highlight: 'rgba(251, 207, 232, 0.5)', label: 'Message' },
};

// Scenario definitions with extracted items
interface ExtractedItem {
  category: string;
  icon: string;
  label: string;
  content: string;
}

interface Scenario {
  title: string;
  subtitle: string;
  segments: TranscriptSegment[];
  categories: string[];
  extractedItems: ExtractedItem[];
}

const scenarios: Scenario[] = [
  // Scenario 1: Commuter Chaos
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
    categories: ['work', 'errands', 'ideas'],
    extractedItems: [
      { category: 'work', icon: '💼', label: 'Task', content: 'Send Q3 budget report to Sarah' },
      { category: 'errands', icon: '📋', label: 'Errand', content: 'Pick up dry cleaning by 5pm' },
      { category: 'ideas', icon: '💡', label: 'Idea', content: 'Blog: Why multitasking is a lie' },
    ]
  },
  // Scenario 2: 3 AM Brain Dump
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
    categories: ['health', 'finance', 'social'],
    extractedItems: [
      { category: 'health', icon: '❤️', label: 'Health Log', content: 'Headache - too much caffeine' },
      { category: 'finance', icon: '💰', label: 'Task', content: 'Cancel Netflix subscription' },
      { category: 'social', icon: '👥', label: 'Reminder', content: 'Call Mom tomorrow' },
    ]
  },
  // Scenario 3: Birthday Party Planning
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
    categories: ['events', 'messages', 'shopping'],
    extractedItems: [
      { category: 'events', icon: '📅', label: 'Event', content: 'Birthday party - January 1st' },
      { category: 'messages', icon: '💬', label: 'Draft', content: 'Party invitation for friends' },
      { category: 'shopping', icon: '🛒', label: 'List', content: 'Chicken salad ingredients' },
    ]
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

// Helper hook to get responsive device positioning
function useResponsiveDeviceLayout() {
  const { size } = useThree();

  // Breakpoints matching Tailwind
  const isMobile = size.width < 640;      // sm
  const isTablet = size.width < 1024;     // lg
  const isSmallDesktop = size.width < 1280; // xl

  // Calculate responsive values
  const layout = React.useMemo(() => {
    if (isMobile) {
      // Mobile: Stack vertically, center and scale down significantly
      return {
        phone: {
          position: new THREE.Vector3(0.25, 0.05, 0),
          scale: 0.38,
        },
        watch: {
          position: new THREE.Vector3(-0.15, -0.45, 0.3),
          scale: 0.12,
        },
      };
    } else if (isTablet) {
      // Tablet: Slightly offset, medium scale
      return {
        phone: {
          position: new THREE.Vector3(0.4, -0.02, -0.1),
          scale: 0.45,
        },
        watch: {
          position: new THREE.Vector3(0.05, -0.38, 0.35),
          scale: 0.14,
        },
      };
    } else if (isSmallDesktop) {
      // Small desktop: Closer to final but not quite
      return {
        phone: {
          position: new THREE.Vector3(0.5, -0.03, -0.15),
          scale: 0.5,
        },
        watch: {
          position: new THREE.Vector3(0.1, -0.36, 0.38),
          scale: 0.15,
        },
      };
    } else {
      // Large desktop: Full spread
      return {
        phone: {
          position: new THREE.Vector3(0.6, -0.05, -0.2),
          scale: 0.55,
        },
        watch: {
          position: new THREE.Vector3(0.15, -0.35, 0.4),
          scale: 0.17,
        },
      };
    }
  }, [isMobile, isTablet, isSmallDesktop]);

  return layout;
}

// Helper to create rounded plane geometry
function createRoundedPlaneGeometry(width: number, height: number, radius: number): THREE.ShapeGeometry {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;

  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);

  const geometry = new THREE.ShapeGeometry(shape);

  // Fix UVs for proper texture mapping
  const uvs = geometry.attributes.uv;
  for (let i = 0; i < uvs.count; i++) {
    const uvX = (uvs.getX(i) * width + width / 2) / width;
    const uvY = (uvs.getY(i) * height + height / 2) / height;
    uvs.setXY(i, uvX, uvY);
  }
  uvs.needsUpdate = true;

  return geometry;
}

// Define clickable button regions on the phone screen (in UV coordinates 0-1)
// UV origin is bottom-left, so y=0 is bottom, y=1 is top
interface ClickableRegion {
  id: string;
  screen: PhoneScreen;  // Which screen to navigate to when clicked
  label: string;
  // UV bounds (bottom-left origin)
  uv: { minX: number; maxX: number; minY: number; maxY: number };
}

// Navigation buttons and clickable regions
// UV coordinates match canvas Y (no flip needed)
// Nav bar is at canvas y = 0.88 to 1.0
// Stream cards start at y=0.27, each card is height 0.145, gap 0.012
const phoneClickableRegions: ClickableRegion[] = [
  // Bottom navigation bar (3 buttons: magic, stream, apps)
  { id: 'nav-magic', screen: 'magic', label: 'Magic', uv: { minX: 0.0, maxX: 0.33, minY: 0.88, maxY: 1.0 } },
  { id: 'nav-stream', screen: 'stream', label: 'Stream', uv: { minX: 0.33, maxX: 0.67, minY: 0.88, maxY: 1.0 } },
  { id: 'nav-apps', screen: 'apps', label: 'Apps', uv: { minX: 0.67, maxX: 1.0, minY: 0.88, maxY: 1.0 } },
  // Back button (top-left corner, canvas y = 0.06 to 0.11)
  { id: 'back', screen: 'stream', label: 'Back', uv: { minX: 0.02, maxX: 0.35, minY: 0.04, maxY: 0.12 } },
  // Big record button (center of screen, only shown in waiting-to-start mode)
  { id: 'record-phone', screen: 'stream', label: 'Record', uv: { minX: 0.25, maxX: 0.75, minY: 0.35, maxY: 0.65 } },
  // Stream card clicks (4 cards - takes user to voicenote view)
  { id: 'stream-card-1', screen: 'voicenote', label: 'Card 1', uv: { minX: 0.05, maxX: 0.95, minY: 0.27, maxY: 0.41 } },
  { id: 'stream-card-2', screen: 'voicenote', label: 'Card 2', uv: { minX: 0.05, maxX: 0.95, minY: 0.43, maxY: 0.57 } },
  { id: 'stream-card-3', screen: 'voicenote', label: 'Card 3', uv: { minX: 0.05, maxX: 0.95, minY: 0.59, maxY: 0.73 } },
  { id: 'stream-card-4', screen: 'voicenote', label: 'Card 4', uv: { minX: 0.05, maxX: 0.95, minY: 0.74, maxY: 0.87 } },
  // Apps grid clicks (3-column grid, 4 rows spread across screen)
  // Small icons distributed edge-to-edge. Cols: 0.04-0.25, 0.38-0.61, 0.73-0.96
  // Rows spread from 0.13 to 0.85 with equal spacing
  // Row 1: y 0.12-0.26
  { id: 'app-calendar', screen: 'app-calendar', label: 'Calendar', uv: { minX: 0.02, maxX: 0.28, minY: 0.12, maxY: 0.26 } },
  { id: 'app-todo', screen: 'app-todo', label: 'To Do List', uv: { minX: 0.30, maxX: 0.68, minY: 0.12, maxY: 0.26 } },
  { id: 'app-messages', screen: 'app-messages', label: 'Messages', uv: { minX: 0.70, maxX: 0.98, minY: 0.12, maxY: 0.26 } },
  // Row 2: y 0.30-0.46
  { id: 'app-people', screen: 'app-people', label: 'People Dir.', uv: { minX: 0.02, maxX: 0.28, minY: 0.28, maxY: 0.46 } },
  { id: 'app-research', screen: 'app-research', label: 'Research', uv: { minX: 0.30, maxX: 0.68, minY: 0.28, maxY: 0.46 } },
  { id: 'app-journal', screen: 'app-journal', label: 'Journal', uv: { minX: 0.70, maxX: 0.98, minY: 0.28, maxY: 0.46 } },
  // Row 3: y 0.50-0.66
  { id: 'app-meeting-notes', screen: 'app-meeting-notes', label: 'Meeting Notes', uv: { minX: 0.02, maxX: 0.28, minY: 0.48, maxY: 0.66 } },
  { id: 'app-shopping', screen: 'app-shopping', label: 'Shopping', uv: { minX: 0.30, maxX: 0.68, minY: 0.48, maxY: 0.66 } },
  { id: 'app-wisdom', screen: 'app-wisdom', label: 'Wisdom Jou.', uv: { minX: 0.70, maxX: 0.98, minY: 0.48, maxY: 0.66 } },
  // Row 4: y 0.70-0.86
  { id: 'app-insights', screen: 'app-insights', label: 'AI Insights', uv: { minX: 0.02, maxX: 0.28, minY: 0.68, maxY: 0.86 } },
  { id: 'app-summit', screen: 'app-summit', label: 'Summit Log', uv: { minX: 0.30, maxX: 0.68, minY: 0.68, maxY: 0.86 } },
  { id: 'app-sleep', screen: 'app-sleep', label: 'Sleep', uv: { minX: 0.70, maxX: 0.98, minY: 0.68, maxY: 0.86 } },
  // Chat suggested prompts (5 prompts, each 0.065 height + 0.015 gap, starting at 0.36)
  // contentStartY=0.12, promptStartY=0.12+0.24=0.36, each prompt stride=0.08
  { id: 'chat-prompt-0', screen: 'magic', label: 'Prompt 1', uv: { minX: 0.05, maxX: 0.95, minY: 0.36, maxY: 0.425 } },
  { id: 'chat-prompt-1', screen: 'magic', label: 'Prompt 2', uv: { minX: 0.05, maxX: 0.95, minY: 0.44, maxY: 0.505 } },
  { id: 'chat-prompt-2', screen: 'magic', label: 'Prompt 3', uv: { minX: 0.05, maxX: 0.95, minY: 0.52, maxY: 0.585 } },
  { id: 'chat-prompt-3', screen: 'magic', label: 'Prompt 4', uv: { minX: 0.05, maxX: 0.95, minY: 0.60, maxY: 0.665 } },
  { id: 'chat-prompt-4', screen: 'magic', label: 'Prompt 5', uv: { minX: 0.05, maxX: 0.95, minY: 0.68, maxY: 0.745 } },
  // Chat input field
  { id: 'chat-input', screen: 'magic', label: 'Input', uv: { minX: 0.05, maxX: 0.80, minY: 0.78, maxY: 0.85 } },
  // Chat send button
  { id: 'chat-send', screen: 'magic', label: 'Send', uv: { minX: 0.82, maxX: 0.95, minY: 0.78, maxY: 0.85 } },
  // Chat reset button (when limit reached)
  { id: 'chat-reset', screen: 'magic', label: 'Reset', uv: { minX: 0.32, maxX: 0.68, minY: 0.21, maxY: 0.25 } },
  // Lockscreen VOIS button (record on phone)
  { id: 'lockscreen-vois', screen: 'lockscreen', label: 'Record', uv: { minX: 0.30, maxX: 0.70, minY: 0.28, maxY: 0.42 } },
  // Stop recording button (center-bottom of phone during recording)
  { id: 'stop-recording', screen: 'stream', label: 'Stop', uv: { minX: 0.25, maxX: 0.75, minY: 0.75, maxY: 0.92 } },
];

// Module-level refs for device groups (used by drag detection)
let phoneGroupRef: THREE.Group | null = null;
let watchGroupRef: THREE.Group | null = null;
let videoMeshRef: THREE.Mesh | null = null;

// Check if UV coordinates hit a button
const getHitButton = (uvX: number, uvY: number, currentScreen: PhoneScreen): ClickableRegion | null => {
  const demoState = globalState.demoState;
  const chatState = globalState.chatState;

  for (const region of phoneClickableRegions) {
    // Back button logic - only show on detail screens (voicenote, app-*)
    const isDetailScreen = currentScreen === 'voicenote' || currentScreen.startsWith('app-');
    if (region.id === 'back' && !isDetailScreen) continue;

    // Record button is only active in waiting-to-start mode (regardless of screen)
    if (region.id === 'record-phone' && !demoState.isWaitingToStart) continue;

    // Stop button is only active during recording on phone
    if (region.id === 'stop-recording' && !(demoState.isRecording && demoState.activeDevice === 'phone')) continue;

    // Skip nav buttons when in waiting-to-start mode (record button takes priority)
    if (region.id.startsWith('nav-') && demoState.isWaitingToStart) continue;

    // Stream cards only clickable on stream screen (and not in waiting mode or demo mode)
    if (region.id.startsWith('stream-card') && (currentScreen !== 'stream' || demoState.isWaitingToStart || demoState.isRecording || demoState.isProcessing)) continue;

    // App buttons only clickable on apps screen
    if (region.id.startsWith('app-') && currentScreen !== 'apps') continue;

    // Chat prompts only clickable on magic screen when no messages yet and not loading
    if (region.id.startsWith('chat-prompt') && (currentScreen !== 'magic' || chatState.messages.length > 0 || chatState.isLoading)) continue;

    // Chat input and send only on magic screen when not limit reached and not loading
    if ((region.id === 'chat-input' || region.id === 'chat-send') && (currentScreen !== 'magic' || chatState.isLimitReached || chatState.isLoading)) continue;

    // Chat reset only when limit is reached on magic screen
    if (region.id === 'chat-reset' && (currentScreen !== 'magic' || !chatState.isLimitReached)) continue;

    // Lockscreen VOIS button only active on lockscreen when waiting to start
    if (region.id === 'lockscreen-vois' && (currentScreen !== 'lockscreen' || !demoState.isWaitingToStart)) continue;

    if (uvX >= region.uv.minX && uvX <= region.uv.maxX &&
        uvY >= region.uv.minY && uvY <= region.uv.maxY) {
      return region;
    }
  }
  return null;
};

// Component to handle phone screen raycasting
function PhoneScreenInteraction({ phoneScreenMeshRef }: { phoneScreenMeshRef: React.RefObject<THREE.Mesh | null> }) {
  const { camera, gl } = useThree();
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());

  // Handle clicks via window event listener (since canvas has pointer-events: none)
  useEffect(() => {
    const canvas = gl.domElement;

    const handleClick = (event: MouseEvent) => {
      // Only handle clicks in hero section
      if (globalState.currentSection !== 'hero') return;

      // Don't handle clicks when video is playing
      if (globalState.videoPlayerState.isPlaying) return;

      const mesh = phoneScreenMeshRef.current;
      if (!mesh) return;

      // Get normalized device coordinates relative to canvas
      const rect = canvas.getBoundingClientRect();
      pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Update raycaster
      raycasterRef.current.setFromCamera(pointerRef.current, camera);

      // Check for intersection with phone screen
      const intersects = raycasterRef.current.intersectObject(mesh, false);

      if (intersects.length > 0) {
        const hit = intersects[0];
        if (hit.uv) {
          const currentScreen = globalState.phoneScreenState.currentScreen;
          // UV coordinates already match canvas orientation (y=0 at top)
          const hitButton = getHitButton(hit.uv.x, hit.uv.y, currentScreen);

          if (hitButton) {
            // Handle record button specially
            if (hitButton.id === 'record-phone') {
              if (callbacks.onPhoneRecordClick) {
                setDemoActiveDevice('phone');
                callbacks.onPhoneRecordClick();
              }
            } else if (hitButton.id === 'stop-recording') {
              if (callbacks.onStopRecordClick) {
                callbacks.onStopRecordClick();
              }
            } else if (hitButton.id.startsWith('stream-card-')) {
              // Extract card index and set selected card
              const cardIndex = parseInt(hitButton.id.replace('stream-card-', '')) - 1;
              const cards = globalState.phoneScreenState.streamCards;
              if (cards[cardIndex]) {
                setSelectedCard(cards[cardIndex]);
              }
              setPhoneScreen(hitButton.screen);
            } else if (hitButton.id.startsWith('chat-prompt-')) {
              // Handle chat prompt click - send the prompt
              const promptIndex = parseInt(hitButton.id.replace('chat-prompt-', ''));
              const prompt = CHAT_SUGGESTED_PROMPTS[promptIndex];
              if (prompt && callbacks.onChatSendMessage) {
                callbacks.onChatSendMessage(prompt);
              }
            } else if (hitButton.id === 'chat-input') {
              // Focus chat input for typing
              if (callbacks.onChatInputClick) {
                callbacks.onChatInputClick();
              }
            } else if (hitButton.id === 'chat-send') {
              // Send current input text, or focus input if empty
              const inputText = globalState.chatState.inputText.trim();
              if (inputText && callbacks.onChatSendMessage) {
                callbacks.onChatSendMessage(inputText);
                setChatInput('');
              } else if (callbacks.onChatInputClick) {
                // Focus input if no text yet
                callbacks.onChatInputClick();
              }
            } else if (hitButton.id === 'chat-reset') {
              // Reset chat
              resetChat();
            } else if (hitButton.id === 'lockscreen-vois') {
              // Start recording on phone from lockscreen
              if (callbacks.onPhoneRecordClick) {
                setDemoActiveDevice('phone');
                callbacks.onPhoneRecordClick();
              }
            } else if (hitButton.id === 'back') {
              // Back button: navigate to apps if on an app detail screen, otherwise stream
              if (currentScreen.startsWith('app-')) {
                setPhoneScreen('apps');
              } else {
                setPhoneScreen(hitButton.screen);
              }
            } else {
              setPhoneScreen(hitButton.screen);
            }
          }
        }
      }
    };

    // Listen on window to catch clicks even though canvas has pointer-events: none
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [camera, gl, phoneScreenMeshRef]);

  // Handle hover - just update internal state, don't change cursor (canvas has pointer-events: none)
  useEffect(() => {
    const canvas = gl.domElement;

    const handleMouseMove = (event: MouseEvent) => {
      if (globalState.currentSection !== 'hero') {
        setPhoneHoveredButton(null);
        return;
      }

      if (globalState.videoPlayerState.isPlaying) {
        setPhoneHoveredButton(null);
        return;
      }

      const mesh = phoneScreenMeshRef.current;
      if (!mesh) {
        setPhoneHoveredButton(null);
        return;
      }

      // Get normalized device coordinates relative to canvas
      const rect = canvas.getBoundingClientRect();
      pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(pointerRef.current, camera);
      const intersects = raycasterRef.current.intersectObject(mesh, false);

      if (intersects.length > 0) {
        const hit = intersects[0];
        if (hit.uv) {
          const currentScreen = globalState.phoneScreenState.currentScreen;
          // UV coordinates already match canvas orientation (y=0 at top)
          const hitButton = getHitButton(hit.uv.x, hit.uv.y, currentScreen);
          setPhoneHoveredButton(hitButton?.id || null);
        }
      } else {
        setPhoneHoveredButton(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [camera, gl, phoneScreenMeshRef]);

  return null;
}

// Component to handle watch screen raycasting
function WatchScreenInteraction({ watchScreenMeshRef }: { watchScreenMeshRef: React.RefObject<THREE.Mesh | null> }) {
  const { camera, gl } = useThree();
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());

  // Handle clicks via window event listener (since canvas has pointer-events: none)
  useEffect(() => {
    const canvas = gl.domElement;

    const handleClick = (event: MouseEvent) => {
      // Only handle clicks in hero section
      if (globalState.currentSection !== 'hero') return;

      // Don't handle clicks when video is playing
      if (globalState.videoPlayerState.isPlaying) return;

      const demoState = globalState.demoState;
      const isRecordingOnWatch = demoState.isRecording && demoState.activeDevice === 'watch';
      const watchIsIdle = !demoState.isRecording && !demoState.isProcessing;

      // Watch responds to clicks when idle (to start) or when recording on watch (to stop)
      if (!watchIsIdle && !isRecordingOnWatch) return;

      const mesh = watchScreenMeshRef.current;
      if (!mesh) return;

      // Get normalized device coordinates relative to canvas
      const rect = canvas.getBoundingClientRect();
      pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Update raycaster
      raycasterRef.current.setFromCamera(pointerRef.current, camera);

      // Check for intersection with watch screen
      const intersects = raycasterRef.current.intersectObject(mesh, false);

      if (intersects.length > 0) {
        if (isRecordingOnWatch && callbacks.onStopRecordClick) {
          // Stop recording when watch is clicked during recording
          callbacks.onStopRecordClick();
        } else if (watchIsIdle && callbacks.onWatchRecordClick) {
          // Start recording on watch
          setDemoActiveDevice('watch');
          callbacks.onWatchRecordClick();
        }
      }
    };

    // Listen on window to catch clicks even though canvas has pointer-events: none
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [camera, gl, watchScreenMeshRef]);

  // Handle hover for watch record button
  useEffect(() => {
    const canvas = gl.domElement;

    const handleMouseMove = (event: MouseEvent) => {
      // Only track hover in hero section when watch is idle
      if (globalState.currentSection !== 'hero') {
        globalState.watchHoveredRecord = false;
        return;
      }
      // Watch is always ready when idle (not recording or processing)
      const watchIsIdle = !globalState.demoState.isRecording && !globalState.demoState.isProcessing;
      if (!watchIsIdle) {
        globalState.watchHoveredRecord = false;
        return;
      }
      if (globalState.videoPlayerState.isPlaying) {
        globalState.watchHoveredRecord = false;
        return;
      }

      const mesh = watchScreenMeshRef.current;
      if (!mesh) {
        globalState.watchHoveredRecord = false;
        return;
      }

      const rect = canvas.getBoundingClientRect();
      pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(pointerRef.current, camera);
      const intersects = raycasterRef.current.intersectObject(mesh, false);

      globalState.watchHoveredRecord = intersects.length > 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [camera, gl, watchScreenMeshRef]);

  return null;
}

// Component to detect which device is being dragged
function DeviceDragDetection() {
  const { camera, gl } = useThree();
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());

  useEffect(() => {
    const canvas = gl.domElement;

    const handleMouseDown = (event: MouseEvent) => {
      // Only detect drags in hero section
      if (globalState.currentSection !== 'hero') {
        globalState.draggedDevice = null;
        return;
      }

      // Get normalized device coordinates relative to canvas
      const rect = canvas.getBoundingClientRect();
      pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Update raycaster
      raycasterRef.current.setFromCamera(pointerRef.current, camera);

      // Check intersections with phone, watch, and video
      let hitDevice: 'phone' | 'watch' | 'video' | null = null;
      let closestDistance = Infinity;

      // When video is playing, only check video for dragging
      if (globalState.videoPlayerState.isPlaying) {
        if (videoMeshRef && videoMeshRef.visible) {
          const videoIntersects = raycasterRef.current.intersectObject(videoMeshRef, false);
          if (videoIntersects.length > 0) {
            hitDevice = 'video';
          }
        }
      } else {
        // Normal mode - check phone and watch
        if (phoneGroupRef) {
          const phoneIntersects = raycasterRef.current.intersectObject(phoneGroupRef, true);
          if (phoneIntersects.length > 0 && phoneIntersects[0].distance < closestDistance) {
            closestDistance = phoneIntersects[0].distance;
            hitDevice = 'phone';
          }
        }

        if (watchGroupRef) {
          const watchIntersects = raycasterRef.current.intersectObject(watchGroupRef, true);
          if (watchIntersects.length > 0 && watchIntersects[0].distance < closestDistance) {
            closestDistance = watchIntersects[0].distance;
            hitDevice = 'watch';
          }
        }
      }

      globalState.draggedDevice = hitDevice;

      // Prevent text selection when dragging a device
      if (hitDevice) {
        event.preventDefault();
      }
    };

    const handleMouseUp = () => {
      globalState.draggedDevice = null;
    };

    // Prevent text selection while dragging a device
    const handleSelectStart = (event: Event) => {
      if (globalState.draggedDevice) {
        event.preventDefault();
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('selectstart', handleSelectStart);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, [camera, gl]);

  return null;
}

// 3D Video Plane component for hover video player
function VideoPlane3D() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ambientTimeRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);
  const { size } = useThree();

  // Animation constants
  const VIDEO_ENTRY_DELAY = 0.5; // Wait for devices to exit first
  const VIDEO_ENTRY_DURATION = 1.0; // Smooth entry matching device entrance timing
  const VIDEO_EXIT_DURATION = 0.8; // Match the entry timing for smooth exit

  // Create video element and texture on mount
  React.useEffect(() => {
    const video = document.createElement('video');
    video.src = '/videos/Situations.mp4';
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.playsInline = true;
    video.muted = true; // No sound in this video
    video.preload = 'metadata';
    videoRef.current = video;

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;
    texture.colorSpace = THREE.SRGBColorSpace;
    setVideoTexture(texture);

    return () => {
      video.pause();
      video.src = '';
      texture.dispose();
    };
  }, []);

  // Control video playback based on state
  React.useEffect(() => {
    const checkPlayState = () => {
      const video = videoRef.current;
      if (!video) return;

      const state = globalState.videoPlayerState;
      if (state.isPlaying && video.paused) {
        video.currentTime = 0;
        video.play().catch(() => {
          // Autoplay failed, ignore
        });
      } else if (!state.isPlaying && !video.paused) {
        video.pause();
        video.currentTime = 0;
      }
    };

    const interval = setInterval(checkPlayState, 100);
    return () => clearInterval(interval);
  }, []);

  // Responsive sizing based on viewport
  const isMobile = size.width < 640;
  const isTablet = size.width < 1024;

  // Create rounded geometry - responsive size (16:9 aspect ratio)
  const geoSize = isMobile ? { w: 0.64, h: 0.36 } : isTablet ? { w: 0.8, h: 0.45 } : { w: 1.0, h: 0.5625 };
  const geometry = React.useMemo(
    () => createRoundedPlaneGeometry(geoSize.w, geoSize.h, 0.03),
    [geoSize.w, geoSize.h]
  );

  // Responsive position
  const endPos = React.useMemo(() => {
    if (isMobile) return { x: 0.2, y: 0.0, z: 0.1 };
    if (isTablet) return { x: 0.35, y: 0.02, z: 0.12 };
    return { x: 0.5, y: 0.05, z: 0.15 };
  }, [isMobile, isTablet]);

  // Set module-level ref for drag detection
  React.useEffect(() => {
    videoMeshRef = meshRef.current;
    return () => {
      videoMeshRef = null;
    };
  }, []);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const videoState = globalState.videoPlayerState;
    const videoActive = videoState.isHovering || videoState.isPlaying || videoState.isAnimatingIn;
    const isVisible = videoActive || videoState.isAnimatingOut;

    mesh.visible = isVisible;
    if (!isVisible) return;
    state.invalidate();

    // Update ambient time for entry/exit animations only
    ambientTimeRef.current += delta;
    const time = ambientTimeRef.current;

    // Get mouse position for parallax (same as devices use)
    const mouseX = globalState.mouseX;
    const mouseY = globalState.mouseY;

    // Final position - responsive
    const endX = endPos.x;
    const endY = endPos.y;
    const endZ = endPos.z;

    // Mouse parallax - position offset (like phone/watch)
    const mX = (mouseX - 0.5) * 0.35;
    const mY = mouseY * 0.35;

    // Mouse parallax rotation (similar to phone/watch)
    const mouseRotX = -mY * 0.4;
    const mouseRotY = mX * 0.4;

    // Ambient "breathing" animation - only used during entry/exit, NOT stable state
    const ambientY = Math.sin(time * 0.7) * 0.012;
    const ambientX = Math.cos(time * 0.5) * 0.006;
    const ambientRotX = Math.sin(time * 0.4) * 0.015;
    const ambientRotY = Math.cos(time * 0.6) * 0.015;

    // Base rotation - negative to twist INWARD (left edge closer to viewer)
    const baseRotY = -0.12;

    // Drag support - smooth interpolation
    const dragLerpSpeed = 0.1;
    const dragReturnSpeed = 0.02;
    const isVideoDragging = globalState.isDragging && globalState.draggedDevice === 'video';

    if (isVideoDragging) {
      globalState.videoSmoothDragX += (globalState.dragDeltaX - globalState.videoSmoothDragX) * dragLerpSpeed;
      globalState.videoSmoothDragY += (globalState.dragDeltaY - globalState.videoSmoothDragY) * dragLerpSpeed;
    } else {
      globalState.videoSmoothDragX += (0 - globalState.videoSmoothDragX) * dragReturnSpeed;
      globalState.videoSmoothDragY += (0 - globalState.videoSmoothDragY) * dragReturnSpeed;
    }

    // Video drag influence - position and rotation
    const videoDragPosX = globalState.videoSmoothDragX * 0.55;
    const videoDragPosY = -globalState.videoSmoothDragY * 0.55;
    const videoDragRotX = globalState.videoSmoothDragY * 0.65;
    const videoDragRotY = globalState.videoSmoothDragX * 0.9;

    // Entry animation (with delay to let devices exit first)
    // When playing, animate directly to the larger size/position
    const targetScale = videoState.isPlaying ? 1.12 : 1;
    const targetOffsetX = videoState.isPlaying ? -0.08 : 0;

    if (videoState.isAnimatingIn) {
      const totalElapsed = (Date.now() - videoState.entryStartTime) / 1000;

      // Wait for delay before starting animation
      if (totalElapsed < VIDEO_ENTRY_DELAY) {
        // Keep positioned off-screen to the right during delay
        mesh.position.x = 2.5;
        mesh.position.y = endY;
        mesh.position.z = endZ;
        mesh.rotation.y = -Math.PI / 3; // Starting rotation
        mesh.scale.setScalar(0.7);
        return;
      }

      const elapsed = totalElapsed - VIDEO_ENTRY_DELAY;
      const progress = Math.min(1, elapsed / VIDEO_ENTRY_DURATION);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      // Fly in from right with rotation - target position includes playing offset
      const startX = 2.5;
      const finalX = endX + targetOffsetX;
      mesh.position.x = startX + (finalX - startX) * eased + ambientX * eased - mX * 0.06 * eased;
      mesh.position.y = endY + ambientY * eased - mY * 0.06 * eased;
      mesh.position.z = endZ;

      // Rotate from steep angle to slight inward angle, plus mouse/ambient influence fading in
      const startRotY = -Math.PI / 3;
      mesh.rotation.x = (mouseRotX + ambientRotX) * eased;
      mesh.rotation.y = startRotY + (baseRotY - startRotY) * eased + (mouseRotY + ambientRotY) * eased;

      // Scale up to target scale (larger when playing)
      const scale = 0.7 + (targetScale - 0.7) * eased;
      mesh.scale.setScalar(scale);

      if (progress >= 1) {
        globalState.videoPlayerState.isAnimatingIn = false;
      }
    }
    // Exit animation (no rotation, straight slide out)
    // Start from playing position/scale since video was playing when exit triggered
    else if (videoState.isAnimatingOut) {
      const elapsed = (Date.now() - videoState.exitStartTime) / 1000;
      const progress = Math.min(1, elapsed / VIDEO_EXIT_DURATION);
      // Use ease-in-out for smoother exit
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      // Mirror the entry animation - fly out to the right with rotation
      // Start from playing position (endX - 0.08) and scale (1.12)
      const playingStartX = endX - 0.08;
      const playingStartScale = 1.12;
      const exitX = 2.5;
      const exitRotY = -Math.PI / 3; // Same steep angle as entry start

      mesh.position.x = playingStartX + (exitX - playingStartX) * eased;
      mesh.position.y = endY + ambientY * (1 - eased);
      mesh.position.z = endZ;
      mesh.rotation.x = (mouseRotX + ambientRotX) * (1 - eased);
      mesh.rotation.y = baseRotY + (exitRotY - baseRotY) * eased + (mouseRotY + ambientRotY) * (1 - eased);

      // Scale down from playing scale to entry start scale
      const scale = playingStartScale - (playingStartScale - 0.7) * eased;
      mesh.scale.setScalar(scale);

      if (progress >= 1) {
        globalState.videoPlayerState.isAnimatingOut = false;
      }
    }
    // Stable visible state - mouse tracking and drag support, NO ambient breathing
    // Uses targetScale and targetOffsetX defined above (larger when playing)
    else if (videoActive) {
      mesh.position.x = endX + targetOffsetX - mX * 0.06 + videoDragPosX;
      mesh.position.y = endY - mY * 0.06 + videoDragPosY;
      mesh.position.z = endZ;
      mesh.rotation.x = mouseRotX + videoDragRotX;
      mesh.rotation.y = baseRotY + mouseRotY + videoDragRotY;
      mesh.scale.setScalar(targetScale);
    }
  });

  // Update material when texture is ready
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  React.useEffect(() => {
    if (materialRef.current && videoTexture) {
      materialRef.current.map = videoTexture;
      materialRef.current.needsUpdate = true;
    }
  }, [videoTexture]);

  return (
    <mesh ref={meshRef} geometry={geometry} visible={false}>
      <meshBasicMaterial ref={materialRef} color="#ffffff" toneMapped={false} />
    </mesh>
  );
}

function SceneContent() {
  const phoneRef = useRef<THREE.Group>(null);
  const watchRef = useRef<THREE.Group>(null);

  // Store refs in module-level variables for drag detection
  useEffect(() => {
    phoneGroupRef = phoneRef.current;
    watchGroupRef = watchRef.current;
    return () => {
      phoneGroupRef = null;
      watchGroupRef = null;
    };
  });

  // Preload watch face background image
  const watchFaceBgRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.src = '/Photos/freepik__i-want-an-image-of-only-the-watch-face-here-and-ju__22837.png';
    img.onload = () => { watchFaceBgRef.current = img; };
    return () => { watchFaceBgRef.current = null; };
  }, []);

  // Load Models
  const phoneGLTF = useGLTF('/3d_models/iphone_16_pro_max.glb');
  const watchGLTF = useGLTF('/3d_models/Apple Watch 8 Ultra.glb');

  // Clone both scenes ONCE and store in state to prevent re-cloning on re-renders
  // This fixes the devices disappearing issue caused by GLTF cache interactions
  const [phoneScene] = useState(() => {
    return phoneGLTF.scene.clone(true);
  });
  const [watchScene] = useState(() => {
    return watchGLTF.scene.clone(true);
  });

  // Stable object references (memoized to prevent effect re-runs)
  const phone = React.useMemo(() => ({ scene: phoneScene }), [phoneScene]);
  const watch = React.useMemo(() => ({ scene: watchScene }), [watchScene]);


  // Canvas refs for dynamic screen textures
  const phoneCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const phoneTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const watchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const watchTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const phoneScreenMeshRef = useRef<THREE.Mesh | null>(null);
  const watchScreenMeshRef = useRef<THREE.Mesh | null>(null);
  const lockscreenWallpaperRef = useRef<HTMLImageElement | null>(null);
  const appScreenImagesRef = useRef<Record<string, HTMLImageElement>>({});

  // Load lockscreen wallpaper
  useEffect(() => {
    const img = new Image();
    img.src = '/Photos/freepik__so-take-away-i-want-to-see-only-this-background-no__88653.jpeg';
    img.onload = () => {
      lockscreenWallpaperRef.current = img;
    };
  }, []);

  // Load app detail screen images
  useEffect(() => {
    const appImages: Record<string, string> = {
      tasks: '/Photos/Tasks.png',
      todo: '/Photos/Tasks.png',
      shopping: '/Photos/Shopping.png',
      messages: '/Photos/ Messages.png',
    };
    Object.entries(appImages).forEach(([key, src]) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        appScreenImagesRef.current[key] = img;
      };
    });
    return () => { appScreenImagesRef.current = {}; };
  }, []);
  
  
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

  // Function to draw the phone transcription screen - with highlights and extracted items
  const drawPhoneScreen = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, _isRecording: boolean, _timer: number) => {
    const now = Date.now();
    const demoState = globalState.demoState;
    // Only enter demo mode on phone if PHONE is the active device (not watch)
    const isPhoneActiveDemo = demoState.activeDevice === 'phone' && (demoState.isRecording || demoState.isProcessing);
    const isDemoMode = isPhoneActiveDemo;
    const { scenario, elapsed, fullTranscript } = getScenarioState();
    const transcriptSegments = scenario.segments;
    const padding = width * 0.07;

    // Light gray background (lighter for more contrast with shadow)
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);

    // === INTERACTIVE NAVIGATION SCREENS ===
    const phoneScreen = globalState.phoneScreenState.currentScreen;
    const hoveredButton = globalState.phoneScreenState.hoveredButton;

    // Helper to draw simple line icons
    const drawIcon = (type: string, x: number, y: number, size: number, color: string) => {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = size * 0.12;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const s = size / 2; // half size for easier drawing

      if (type === 'magic') {
        // Sparkles icon - one large 4-point star with two smaller ones
        // Main large 4-point star (filled)
        const drawStar = (cx: number, cy: number, starSize: number) => {
          ctx.beginPath();
          ctx.moveTo(cx, cy - starSize);
          ctx.quadraticCurveTo(cx, cy, cx + starSize, cy);
          ctx.quadraticCurveTo(cx, cy, cx, cy + starSize);
          ctx.quadraticCurveTo(cx, cy, cx - starSize, cy);
          ctx.quadraticCurveTo(cx, cy, cx, cy - starSize);
          ctx.closePath();
          ctx.fill();
        };
        // Large star
        drawStar(x, y, s * 0.9);
        // Small star top-right
        drawStar(x + s * 0.7, y - s * 0.7, s * 0.35);
        // Tiny star top-right-right
        drawStar(x + s * 0.95, y - s * 0.3, s * 0.2);
      } else if (type === 'stream') {
        // Clean microphone icon
        const micW = s * 0.4;
        const micH = s * 0.65;
        // Mic head (pill shape)
        ctx.lineWidth = size * 0.1;
        ctx.beginPath();
        ctx.moveTo(x - micW, y - micH + micW);
        ctx.arc(x, y - micH + micW, micW, Math.PI, 0);
        ctx.lineTo(x + micW, y - s * 0.1);
        ctx.arc(x, y - s * 0.1, micW, 0, Math.PI);
        ctx.closePath();
        ctx.stroke();
        // Holder arc below mic
        ctx.beginPath();
        ctx.arc(x, y + s * 0.05, s * 0.55, Math.PI * 0.2, Math.PI * 0.8);
        ctx.stroke();
        // Stand/base line
        ctx.beginPath();
        ctx.moveTo(x, y + s * 0.05 + s * 0.55 * Math.sin(Math.PI * 0.2));
        ctx.lineTo(x, y + s * 0.85);
        ctx.stroke();
        // Small base
        ctx.beginPath();
        ctx.moveTo(x - s * 0.25, y + s * 0.85);
        ctx.lineTo(x + s * 0.25, y + s * 0.85);
        ctx.stroke();
      } else if (type === 'apps') {
        // 6 circles in 3x2 grid - cleaner version
        const circleR = s * 0.18;
        const spacingX = s * 0.5;
        const spacingY = s * 0.5;
        ctx.lineWidth = size * 0.1;
        for (let row = 0; row < 2; row++) {
          for (let col = 0; col < 3; col++) {
            const cx = x + (col - 1) * spacingX;
            const cy = y + (row - 0.5) * spacingY;
            ctx.beginPath();
            ctx.arc(cx, cy, circleR, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      } else if (type === 'messages') {
        // Chat bubble icon
        ctx.beginPath();
        ctx.moveTo(x - s * 0.8, y - s * 0.5);
        ctx.quadraticCurveTo(x - s * 0.8, y - s * 0.8, x - s * 0.3, y - s * 0.8);
        ctx.lineTo(x + s * 0.3, y - s * 0.8);
        ctx.quadraticCurveTo(x + s * 0.8, y - s * 0.8, x + s * 0.8, y - s * 0.3);
        ctx.lineTo(x + s * 0.8, y + s * 0.2);
        ctx.quadraticCurveTo(x + s * 0.8, y + s * 0.5, x + s * 0.3, y + s * 0.5);
        ctx.lineTo(x - s * 0.2, y + s * 0.5);
        ctx.lineTo(x - s * 0.5, y + s * 0.9);
        ctx.lineTo(x - s * 0.3, y + s * 0.5);
        ctx.quadraticCurveTo(x - s * 0.8, y + s * 0.5, x - s * 0.8, y);
        ctx.closePath();
        ctx.stroke();
      } else if (type === 'tasks') {
        // Checkmark in box icon
        ctx.strokeRect(x - s * 0.7, y - s * 0.7, s * 1.4, s * 1.4);
        ctx.beginPath();
        ctx.moveTo(x - s * 0.35, y);
        ctx.lineTo(x - s * 0.05, y + s * 0.35);
        ctx.lineTo(x + s * 0.4, y - s * 0.3);
        ctx.stroke();
      } else if (type === 'calendar') {
        // Calendar icon
        ctx.strokeRect(x - s * 0.7, y - s * 0.5, s * 1.4, s * 1.2);
        ctx.beginPath();
        ctx.moveTo(x - s * 0.7, y - s * 0.1);
        ctx.lineTo(x + s * 0.7, y - s * 0.1);
        ctx.moveTo(x - s * 0.35, y - s * 0.7);
        ctx.lineTo(x - s * 0.35, y - s * 0.5);
        ctx.moveTo(x + s * 0.35, y - s * 0.7);
        ctx.lineTo(x + s * 0.35, y - s * 0.5);
        ctx.stroke();
      } else if (type === 'people') {
        // Two people icon
        ctx.beginPath();
        ctx.arc(x - s * 0.3, y - s * 0.3, s * 0.35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x - s * 0.3, y + s * 0.6, s * 0.5, Math.PI * 1.2, Math.PI * 1.8);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + s * 0.4, y - s * 0.15, s * 0.3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + s * 0.4, y + s * 0.55, s * 0.4, Math.PI * 1.2, Math.PI * 1.8);
        ctx.stroke();
      } else if (type === 'research') {
        // Magnifying glass icon
        ctx.beginPath();
        ctx.arc(x - s * 0.15, y - s * 0.15, s * 0.55, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + s * 0.25, y + s * 0.25);
        ctx.lineTo(x + s * 0.7, y + s * 0.7);
        ctx.stroke();
      } else if (type === 'journal') {
        // Open book icon
        ctx.beginPath();
        // Left page
        ctx.moveTo(x, y - s * 0.7);
        ctx.quadraticCurveTo(x - s * 0.9, y - s * 0.6, x - s * 0.8, y + s * 0.5);
        ctx.lineTo(x, y + s * 0.4);
        // Right page
        ctx.moveTo(x, y - s * 0.7);
        ctx.quadraticCurveTo(x + s * 0.9, y - s * 0.6, x + s * 0.8, y + s * 0.5);
        ctx.lineTo(x, y + s * 0.4);
        // Spine
        ctx.moveTo(x, y - s * 0.7);
        ctx.lineTo(x, y + s * 0.4);
        ctx.stroke();
      } else if (type === 'meeting-notes') {
        // Document with lines icon
        const dw = s * 0.7;
        const dh = s * 0.9;
        ctx.strokeRect(x - dw, y - dh, dw * 2, dh * 2);
        // Fold corner
        ctx.beginPath();
        ctx.moveTo(x + dw - s * 0.35, y - dh);
        ctx.lineTo(x + dw, y - dh + s * 0.35);
        ctx.stroke();
        // Text lines
        for (let li = 0; li < 3; li++) {
          const ly = y - dh + s * 0.6 + li * s * 0.4;
          ctx.beginPath();
          ctx.moveTo(x - dw + s * 0.25, ly);
          ctx.lineTo(x + dw - s * 0.25 - (li === 2 ? s * 0.3 : 0), ly);
          ctx.stroke();
        }
      } else if (type === 'shopping') {
        // Shopping cart icon
        ctx.beginPath();
        ctx.moveTo(x - s * 0.8, y - s * 0.6);
        ctx.lineTo(x - s * 0.5, y - s * 0.6);
        ctx.lineTo(x - s * 0.2, y + s * 0.3);
        ctx.lineTo(x + s * 0.6, y + s * 0.3);
        ctx.lineTo(x + s * 0.8, y - s * 0.3);
        ctx.lineTo(x - s * 0.35, y - s * 0.3);
        ctx.stroke();
        // Wheels
        ctx.beginPath();
        ctx.arc(x - s * 0.05, y + s * 0.6, s * 0.15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + s * 0.45, y + s * 0.6, s * 0.15, 0, Math.PI * 2);
        ctx.stroke();
      } else if (type === 'wisdom' || type === 'insights') {
        // Lightbulb icon
        ctx.beginPath();
        ctx.arc(x, y - s * 0.2, s * 0.5, Math.PI * 0.8, Math.PI * 0.2, true);
        ctx.quadraticCurveTo(x + s * 0.35, y + s * 0.3, x + s * 0.2, y + s * 0.5);
        ctx.lineTo(x - s * 0.2, y + s * 0.5);
        ctx.quadraticCurveTo(x - s * 0.35, y + s * 0.3, x - s * 0.5, y - s * 0.2 + s * 0.5 * Math.sin(Math.PI * 0.8));
        ctx.stroke();
        // Filament lines at base
        ctx.beginPath();
        ctx.moveTo(x - s * 0.15, y + s * 0.65);
        ctx.lineTo(x + s * 0.15, y + s * 0.65);
        ctx.moveTo(x - s * 0.12, y + s * 0.78);
        ctx.lineTo(x + s * 0.12, y + s * 0.78);
        ctx.stroke();
      } else if (type === 'summit') {
        // Triangle / mountain icon
        ctx.beginPath();
        ctx.moveTo(x, y - s * 0.7);
        ctx.lineTo(x + s * 0.75, y + s * 0.6);
        ctx.lineTo(x - s * 0.75, y + s * 0.6);
        ctx.closePath();
        ctx.stroke();
      } else if (type === 'sleep') {
        // Crescent moon icon
        ctx.beginPath();
        ctx.arc(x, y, s * 0.65, 0, Math.PI * 2);
        ctx.fill();
        // Cut out a circle to make crescent
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x + s * 0.35, y - s * 0.25, s * 0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (type === 'todo') {
        // Checklist icon (checkbox + lines)
        const lineSpacing = s * 0.55;
        for (let li = 0; li < 3; li++) {
          const ly = y - s * 0.6 + li * lineSpacing;
          // Small checkbox
          ctx.strokeRect(x - s * 0.7, ly - s * 0.15, s * 0.3, s * 0.3);
          if (li === 0) {
            // Checkmark in first box
            ctx.beginPath();
            ctx.moveTo(x - s * 0.62, ly);
            ctx.lineTo(x - s * 0.52, ly + s * 0.1);
            ctx.lineTo(x - s * 0.42, ly - s * 0.08);
            ctx.stroke();
          }
          // Line next to checkbox
          ctx.beginPath();
          ctx.moveTo(x - s * 0.25, ly);
          ctx.lineTo(x + s * 0.7, ly);
          ctx.stroke();
        }
      }
    };

    // Helper to draw the bottom navigation bar (3 buttons: magic, stream, apps)
    const drawBottomNav = (activeTab: PhoneScreen) => {
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

      // Navigation buttons (3 tabs) - Magic (sparkles), Stream (mic), Apps (grid)
      const tabs: { id: PhoneScreen; label: string; iconType: string }[] = [
        { id: 'magic', label: 'Magic', iconType: 'magic' },
        { id: 'stream', label: 'Stream', iconType: 'stream' },
        { id: 'apps', label: 'Apps', iconType: 'apps' },
      ];

      const tabWidth = width / tabs.length;
      const iconY = navBarY + navBarH * 0.5; // Center icon vertically (no labels)

      tabs.forEach((tab, i) => {
        const tabX = tabWidth * i + tabWidth / 2;
        // Check if this tab is active (for app screens, apps tab is active; for voicenote, stream is active)
        let isActive = activeTab === tab.id;
        if (tab.id === 'apps' && activeTab.startsWith('app-')) isActive = true;
        if (tab.id === 'stream' && activeTab === 'voicenote') isActive = true;
        const isHovered = hoveredButton === `nav-${tab.id}`;

        const color = isActive ? '#1a1a1a' : (isHovered ? '#64748b' : '#9ca3af');

        // Draw icon only (no labels)
        drawIcon(tab.iconType, tabX, iconY, height * 0.04, color);
      });
    };

    // Helper to draw status bar (real time + signal/wifi/battery)
    const drawStatusBar = () => {
      const now = new Date();
      const hrs = now.getHours();
      const mins = now.getMinutes();
      const timeStr = `${hrs}:${mins.toString().padStart(2, '0')}`;

      // Time — left side, slightly right and down, slightly bigger
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `600 ${height * 0.029}px -apple-system, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(timeStr, padding + width * 0.02, height * 0.036);

      // Right-side indicators: signal, wifi, battery
      const indicatorY = height * 0.036;
      const iconColor = '#1a1a1a';
      let rightX = width - padding - width * 0.02;

      // Battery indicator (rightmost)
      const battW = width * 0.06;
      const battH = height * 0.018;
      const battX = rightX - battW;
      const battY = indicatorY - battH / 2;
      // Battery outline
      ctx.strokeStyle = iconColor;
      ctx.lineWidth = 1.2;
      roundRect(ctx, battX, battY, battW, battH, 2);
      ctx.stroke();
      // Battery nub
      ctx.fillStyle = iconColor;
      ctx.fillRect(battX + battW + 1, indicatorY - battH * 0.25, 2, battH * 0.5);
      // Battery fill (~80%)
      ctx.fillStyle = iconColor;
      roundRect(ctx, battX + 1.5, battY + 1.5, (battW - 3) * 0.8, battH - 3, 1);
      ctx.fill();

      rightX = battX - width * 0.03;

      // Wi-Fi icon (3 arcs)
      const wifiX = rightX;
      const wifiBaseY = indicatorY + height * 0.006;
      ctx.strokeStyle = iconColor;
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const r = (i + 1) * height * 0.008;
        ctx.beginPath();
        ctx.arc(wifiX, wifiBaseY, r, -Math.PI * 0.75, -Math.PI * 0.25);
        ctx.stroke();
      }
      // Wi-Fi dot
      ctx.fillStyle = iconColor;
      ctx.beginPath();
      ctx.arc(wifiX, wifiBaseY, 1.2, 0, Math.PI * 2);
      ctx.fill();

      rightX = wifiX - width * 0.05;

      // Signal bars (4 bars)
      const barCount = 4;
      const barWidth = width * 0.007;
      const barGap = width * 0.005;
      const maxBarH = height * 0.02;
      const signalStartX = rightX - (barCount * (barWidth + barGap)) / 2;
      for (let i = 0; i < barCount; i++) {
        const bh = maxBarH * ((i + 1) / barCount);
        const bx = signalStartX + i * (barWidth + barGap);
        const by = indicatorY + maxBarH / 2 - bh;
        ctx.fillStyle = iconColor;
        roundRect(ctx, bx, by, barWidth, bh, 1);
        ctx.fill();
      }
    };

    // Helper to draw back button
    const drawBackButton = (targetScreen: PhoneScreen = 'stream') => {
      const backHovered = hoveredButton === 'back';
      ctx.fillStyle = backHovered ? '#3b82f6' : '#64748b';
      ctx.font = `500 ${height * 0.028}px -apple-system`;
      ctx.textAlign = 'left';
      ctx.fillText('← Back', padding, height * 0.085);
    };

    // Sample app data
    const appData: Record<string, { icon: string; text: string; color: string }[]> = {
      tasks: [
        { icon: '✓', text: 'Send Q3 report to Sarah', color: '#16a34a' },
        { icon: '✓', text: 'Review marketing proposal', color: '#16a34a' },
        { icon: '○', text: 'Schedule team standup', color: '#9ca3af' },
      ],
      ideas: [
        { icon: '💡', text: 'Blog: Why multitasking is a lie', color: '#ca8a04' },
        { icon: '💡', text: 'App feature: voice shortcuts', color: '#ca8a04' },
        { icon: '💡', text: 'Podcast episode ideas', color: '#ca8a04' },
      ],
      calendar: [
        { icon: '📅', text: 'Team meeting at 2pm', color: '#2563eb' },
        { icon: '📅', text: 'Dentist appointment Thu', color: '#2563eb' },
        { icon: '📅', text: "Son's birthday party Sat", color: '#2563eb' },
      ],
      lists: [
        { icon: '🛒', text: 'Groceries: milk, eggs, bread', color: '#7c3aed' },
        { icon: '📋', text: 'Packing list for trip', color: '#7c3aed' },
        { icon: '📋', text: 'Books to read', color: '#7c3aed' },
      ],
      messages: [
        { icon: '💬', text: 'Hey, are we still on for lunch?', color: '#c2410c' },
        { icon: '💬', text: 'Project update from team', color: '#c2410c' },
        { icon: '💬', text: 'Reminder: call back Sarah', color: '#c2410c' },
      ],
      people: [
        { icon: '👤', text: 'Sarah — Product Manager', color: '#d97706' },
        { icon: '👤', text: 'James — Engineering Lead', color: '#d97706' },
        { icon: '👤', text: 'Emily — Design Director', color: '#d97706' },
      ],
      research: [
        { icon: '🔍', text: 'Market analysis Q3 2026', color: '#16a34a' },
        { icon: '🔍', text: 'Competitor feature comparison', color: '#16a34a' },
        { icon: '🔍', text: 'User interview insights', color: '#16a34a' },
      ],
      journal: [
        { icon: '📖', text: 'Morning reflection — gratitude', color: '#7c3aed' },
        { icon: '📖', text: 'Weekly review notes', color: '#7c3aed' },
        { icon: '📖', text: 'Creative writing prompt', color: '#7c3aed' },
      ],
      'meeting-notes': [
        { icon: '📝', text: 'Sprint planning — Jan 20', color: '#db2777' },
        { icon: '📝', text: 'Client call recap', color: '#db2777' },
        { icon: '📝', text: '1:1 with manager', color: '#db2777' },
      ],
      shopping: [
        { icon: '🛒', text: 'Groceries: milk, eggs, bread', color: '#0891b2' },
        { icon: '🛒', text: 'New running shoes', color: '#0891b2' },
        { icon: '🛒', text: 'Birthday gift for Mom', color: '#0891b2' },
      ],
      wisdom: [
        { icon: '💡', text: 'The obstacle is the way', color: '#1d4ed8' },
        { icon: '💡', text: 'Focus on process, not outcome', color: '#1d4ed8' },
        { icon: '💡', text: 'Rest is productive', color: '#1d4ed8' },
      ],
      insights: [
        { icon: '🤖', text: 'You are most productive at 10am', color: '#4f46e5' },
        { icon: '🤖', text: 'Pattern: stress peaks on Mondays', color: '#4f46e5' },
        { icon: '🤖', text: 'Suggestion: block deep work time', color: '#4f46e5' },
      ],
      summit: [
        { icon: '🏔', text: 'Completed 30-day meditation', color: '#1d4ed8' },
        { icon: '🏔', text: 'Read 12 books this quarter', color: '#1d4ed8' },
        { icon: '🏔', text: 'Zero inbox for 2 weeks', color: '#1d4ed8' },
      ],
      sleep: [
        { icon: '🌙', text: 'Average: 7.5h this week', color: '#4d7c0f' },
        { icon: '🌙', text: 'Best night: Tuesday 8.2h', color: '#4d7c0f' },
        { icon: '🌙', text: 'Wind-down routine logged', color: '#4d7c0f' },
      ],
      todo: [
        { icon: '✓', text: 'Finish quarterly review', color: '#16a34a' },
        { icon: '○', text: 'Book dentist appointment', color: '#9ca3af' },
        { icon: '○', text: 'Order new office supplies', color: '#9ca3af' },
      ],
    };

    // Add demo items to relevant apps if available
    if (demoState.items && demoState.items.length > 0) {
      demoState.items.forEach(item => {
        const appType = item.type.toLowerCase();
        if (appType === 'task' && appData.tasks) {
          appData.tasks.unshift({ icon: '○', text: item.content, color: '#16a34a' });
        } else if (appType === 'idea' && appData.ideas) {
          appData.ideas.unshift({ icon: '💡', text: item.content, color: '#ca8a04' });
        } else if (appType === 'event' && appData.calendar) {
          appData.calendar.unshift({ icon: '📅', text: item.content, color: '#2563eb' });
        } else if ((appType === 'reminder' || appType === 'note') && appData.lists) {
          appData.lists.unshift({ icon: '📋', text: item.content, color: '#7c3aed' });
        }
      });
    }

    const panelMargin = width * 0.045;
    const panelPadding = width * 0.045;
    const panelRadius = 20;

    // === LOCK SCREEN (iOS style with wallpaper, time, date) ===
    // Skip lockscreen if phone is actively recording, processing, or has results (let those UIs show instead)
    // Also skip if watch is processing (phone shows processing UI)
    const isPhoneRecordingActive = demoState.isRecording && demoState.activeDevice === 'phone';
    const isPhoneProcessingActive = demoState.isProcessing && demoState.activeDevice === 'phone';
    const isWatchProcessingForPhone = demoState.isProcessing && demoState.activeDevice === 'watch';
    const phoneHasDemoResults = demoState.activeDevice === 'phone' && demoState.transcript && demoState.transcript.length > 0 && !demoState.isRecording && !demoState.isProcessing;
    if (phoneScreen === 'lockscreen' && !isPhoneRecordingActive && !isPhoneProcessingActive && !isWatchProcessingForPhone && !phoneHasDemoResults) {
      // Draw wallpaper background
      const wallpaper = lockscreenWallpaperRef.current;
      if (wallpaper) {
        // Cover the canvas while maintaining aspect ratio
        const imgAspect = wallpaper.width / wallpaper.height;
        const canvasAspect = width / height;
        let drawWidth, drawHeight, drawX, drawY;

        if (imgAspect > canvasAspect) {
          // Image is wider - fit by height
          drawHeight = height;
          drawWidth = height * imgAspect;
          drawX = (width - drawWidth) / 2;
          drawY = 0;
        } else {
          // Image is taller - fit by width
          drawWidth = width;
          drawHeight = width / imgAspect;
          drawX = 0;
          drawY = (height - drawHeight) / 2;
        }
        ctx.drawImage(wallpaper, drawX, drawY, drawWidth, drawHeight);
      } else {
        // Fallback gradient if image not loaded
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#2d1b4e');
        gradient.addColorStop(0.3, '#8b2942');
        gradient.addColorStop(0.5, '#e85d3b');
        gradient.addColorStop(0.7, '#c76bd1');
        gradient.addColorStop(1, '#7dd3fc');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      // Check if watch is recording/processing
      const isWatchRecording = demoState.isRecording && demoState.activeDevice === 'watch';
      const isWatchProcessing = demoState.isProcessing && demoState.activeDevice === 'watch';

      // Add dark overlay when waiting to start or when watch is recording
      if (demoState.isWaitingToStart || isWatchRecording || isWatchProcessing) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(0, 0, width, height);
      }

      // Get current real time
      const currentTime = new Date();
      const hours = currentTime.getHours();
      const minutes = currentTime.getMinutes();
      const timeStr = `${hours}:${minutes.toString().padStart(2, '0')}`;

      // Get day and date
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const dayName = days[currentTime.getDay()];
      const date = currentTime.getDate();
      const monthName = months[currentTime.getMonth()];
      const dateStr = `${dayName}, ${date} ${monthName}`;

      // Date text (above time) - white with slight transparency
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.font = `500 ${height * 0.024}px -apple-system, SF Pro Display, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(dateStr, width / 2, height * 0.12);

      // Large time display - pink/mauve color like iOS
      ctx.fillStyle = 'rgba(232, 180, 208, 0.95)';
      ctx.font = `300 ${height * 0.14}px -apple-system, SF Pro Display, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(timeStr, width / 2, height * 0.21);

      // VOIS Logo (below time) - show when waiting to record OR when watch is recording
      if (demoState.isWaitingToStart || isWatchRecording || isWatchProcessing) {
        const voisLogoY = height * 0.34;
        const voisLogoSize = width * 0.12;

        // Only allow hover when waiting to start (not when watch is recording)
        const isVoisHovered = demoState.isWaitingToStart && hoveredButton === 'lockscreen-vois';

        // Simple hover scale (immediate, responsive) - only when waiting
        const hoverScale = isVoisHovered ? 1.12 : 1;
        const finalSize = voisLogoSize * hoverScale;

        // Simple background circle (brighter on hover)
        ctx.fillStyle = isVoisHovered ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.12)';
        ctx.beginPath();
        ctx.arc(width / 2, voisLogoY, finalSize * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Draw VOIS logo
        const logoColor = isVoisHovered ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.9)';
        drawVoisLogo(ctx, width / 2, voisLogoY, finalSize, logoColor);

        // Text below icon - different based on state
        ctx.font = `500 ${height * 0.018}px -apple-system`;
        ctx.textAlign = 'center';
        if (isWatchRecording) {
          // Show recording indicator when watch is recording
          ctx.fillStyle = 'rgba(239, 68, 68, 0.9)'; // Red for recording
          const elapsed = demoState.elapsed;
          const mins = Math.floor(elapsed / 60);
          const secs = elapsed % 60;
          ctx.fillText(`Recording on Watch ${mins}:${secs.toString().padStart(2, '0')}`, width / 2, voisLogoY + finalSize * 0.8 + height * 0.02);
        } else if (isWatchProcessing) {
          // Show processing indicator
          ctx.fillStyle = 'rgba(96, 165, 250, 0.9)'; // Blue for processing
          ctx.fillText('Processing...', width / 2, voisLogoY + finalSize * 0.8 + height * 0.02);
        } else {
          // Normal waiting state
          ctx.fillStyle = isVoisHovered ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.55)';
          ctx.fillText('Tap to record', width / 2, voisLogoY + finalSize * 0.8 + height * 0.02);
        }
      }

      // Bottom icons (flashlight and camera)
      const iconSize = height * 0.055;
      const iconY = height * 0.92;
      const iconBgRadius = iconSize * 0.75;

      // Flashlight icon (left)
      const flashX = width * 0.18;
      ctx.fillStyle = 'rgba(60, 60, 67, 0.6)';
      ctx.beginPath();
      ctx.arc(flashX, iconY, iconBgRadius, 0, Math.PI * 2);
      ctx.fill();
      // Flashlight shape
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = `${iconSize * 0.65}px -apple-system`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔦', flashX, iconY);

      // Camera icon (right)
      const cameraX = width * 0.82;
      ctx.fillStyle = 'rgba(60, 60, 67, 0.6)';
      ctx.beginPath();
      ctx.arc(cameraX, iconY, iconBgRadius, 0, Math.PI * 2);
      ctx.fill();
      // Camera shape
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = `${iconSize * 0.65}px -apple-system`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📷', cameraX, iconY);

      // Home indicator bar at bottom
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      const barWidth = width * 0.35;
      const barHeight = height * 0.005;
      roundRect(ctx, (width - barWidth) / 2, height * 0.97, barWidth, barHeight, barHeight / 2);
      ctx.fill();

      return;
    }

    // === STREAM SCREEN (cards list view - always shows historical voice notes) ===
    if (phoneScreen === 'stream' && !isDemoMode && !demoState.isWaitingToStart) {
      drawStatusBar();

      // Header row: Map button | "Stream" title | Bell + Search icons
      const headerY = height * 0.07;

      // Map button (left) - simple pill with icon
      ctx.fillStyle = '#f1f5f9';
      roundRect(ctx, panelMargin, headerY - height * 0.018, width * 0.17, height * 0.036, 12);
      ctx.fill();
      // Map icon (simple)
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const mapX = panelMargin + width * 0.045;
      ctx.moveTo(mapX - 4, headerY - 4);
      ctx.lineTo(mapX, headerY + 4);
      ctx.lineTo(mapX + 4, headerY - 4);
      ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = `500 ${height * 0.018}px -apple-system`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('Map', panelMargin + width * 0.065, headerY);

      // Stream title (center)
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `700 ${height * 0.038}px -apple-system`;
      ctx.textAlign = 'center';
      ctx.fillText('Stream', width / 2, headerY);

      // Bell icon (right) - simple line drawing
      const bellX = width - panelMargin - width * 0.11;
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(bellX, headerY - 2, 5, Math.PI * 1.1, Math.PI * 1.9);
      ctx.lineTo(bellX + 5, headerY + 4);
      ctx.lineTo(bellX - 5, headerY + 4);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(bellX, headerY + 6, 2, 0, Math.PI);
      ctx.stroke();

      // Search icon (right)
      const searchX = width - panelMargin - width * 0.04;
      ctx.beginPath();
      ctx.arc(searchX - 2, headerY - 2, 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(searchX + 2, headerY + 2);
      ctx.lineTo(searchX + 6, headerY + 6);
      ctx.stroke();

      // Category inboxes row (horizontal scrollable look)
      const inboxRowY = height * 0.135;
      const inboxSize = width * 0.115;
      const inboxSpacing = width * 0.175;

      // Category definitions with established color codes and icon types
      const categories = [
        { iconType: 'messages', label: 'Messages', color: '#f97316', bgColor: '#fff7ed', badge: '1' },
        { iconType: 'tasks', label: 'Tasks', color: '#22c55e', bgColor: '#f0fdf4', badge: '9+' },
        { iconType: 'calendar', label: 'Calendar', color: '#14b8a6', bgColor: '#f0fdfa', badge: null },
        { iconType: 'people', label: 'People', color: '#f59e0b', bgColor: '#fffbeb', badge: null },
        { iconType: 'research', label: 'Research', color: '#22c55e', bgColor: '#f0fdf4', badge: null },
      ];

      categories.forEach((cat, i) => {
        const x = panelMargin + i * inboxSpacing + inboxSize / 2;
        const iconY = inboxRowY;
        const labelY = inboxRowY + inboxSize * 0.75;

        // Circle background
        ctx.fillStyle = cat.bgColor;
        ctx.beginPath();
        ctx.arc(x, iconY, inboxSize / 2, 0, Math.PI * 2);
        ctx.fill();

        // Icon using drawIcon helper (uses the category color)
        drawIcon(cat.iconType, x, iconY, inboxSize * 0.5, cat.color);

        // Badge (if exists)
        if (cat.badge) {
          const badgeX = x + inboxSize * 0.38;
          const badgeY = iconY - inboxSize * 0.38;
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(badgeX, badgeY, height * 0.013, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${height * 0.011}px -apple-system`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(cat.badge, badgeX, badgeY);
        }

        // Label
        ctx.fillStyle = '#64748b';
        ctx.font = `500 ${height * 0.015}px -apple-system`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cat.label, x, labelY);
      });

      // "TODAY" label
      ctx.fillStyle = '#9ca3af';
      ctx.font = `600 ${height * 0.018}px -apple-system`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('TODAY', panelMargin, height * 0.24);

      // Transcription cards
      const cardStartY = height * 0.27;
      const cardH = height * 0.145;
      const cardGap = height * 0.012;

      // Sample cards with full data for detail view
      interface StreamCard {
        time: string;
        duration: string;
        title: string;
        preview: string;
        transcript: string;
        items: { type: string; content: string; icon: string }[];
        tags: { iconType: string; label: string; color: string }[];
      }

      const sampleCards: StreamCard[] = [
        {
          time: '9:15 AM',
          duration: '0:23',
          title: 'Morning Planning',
          preview: 'Okay so today I need to call mom about...',
          transcript: 'Okay so today I need to call mom about her birthday dinner on Saturday. Also need to pick up groceries and finish the quarterly report before the meeting at 3pm.',
          items: [
            { type: 'task', content: 'Call mom about birthday dinner', icon: '✓' },
            { type: 'task', content: 'Pick up groceries', icon: '✓' },
            { type: 'task', content: 'Finish quarterly report', icon: '✓' },
            { type: 'event', content: 'Meeting at 3pm', icon: '📅' }
          ],
          tags: [{ iconType: 'tasks', label: 'Tasks', color: '#22c55e' }, { iconType: 'calendar', label: 'Events', color: '#14b8a6' }]
        },
        {
          time: '8:42 AM',
          duration: '0:18',
          title: 'Product Ideas',
          preview: 'I was thinking we could add a feature...',
          transcript: 'I was thinking we could add a feature where users can share their notes with family members. Like a shared grocery list that syncs automatically.',
          items: [
            { type: 'idea', content: 'Family sharing feature for notes', icon: '💡' },
            { type: 'idea', content: 'Shared grocery list with auto-sync', icon: '💡' }
          ],
          tags: [{ iconType: 'magic', label: 'Ideas', color: '#f59e0b' }]
        },
        {
          time: 'Yesterday',
          duration: '0:31',
          title: 'Weekend Plans',
          preview: 'So this weekend Sarah and I are going to...',
          transcript: 'So this weekend Sarah and I are going to that new Italian place on Saturday night. Need to make a reservation for 7pm. Sunday we have brunch with the Johnsons at 11.',
          items: [
            { type: 'event', content: 'Dinner at Italian restaurant - Saturday 7pm', icon: '📅' },
            { type: 'task', content: 'Make restaurant reservation', icon: '✓' },
            { type: 'event', content: 'Brunch with Johnsons - Sunday 11am', icon: '📅' }
          ],
          tags: [{ iconType: 'calendar', label: 'Events', color: '#14b8a6' }]
        },
        {
          time: 'Yesterday',
          duration: '0:14',
          title: 'Reminder Note',
          preview: 'Remember to take vitamins every morning...',
          transcript: 'Remember to take vitamins every morning and drink more water throughout the day. Also need to schedule that dentist appointment I keep putting off.',
          items: [
            { type: 'reminder', content: 'Take vitamins every morning', icon: '🔔' },
            { type: 'reminder', content: 'Drink more water', icon: '🔔' },
            { type: 'task', content: 'Schedule dentist appointment', icon: '✓' }
          ],
          tags: [{ iconType: 'messages', label: 'Reminders', color: '#8b5cf6' }]
        },
      ];

      // If demo has results, add them as the first card
      if (demoState.transcript && demoState.transcript.length > 0 && !demoState.isRecording && !demoState.isProcessing) {
        const demoTags: { iconType: string; label: string; color: string }[] = [];
        const demoItems = (demoState.items || []).map(item => ({
          type: item.type,
          content: item.content,
          icon: item.icon || '•'
        }));
        if (demoItems.length > 0) {
          const types = new Set(demoItems.map(item => item.type.toLowerCase()));
          if (types.has('task')) demoTags.push({ iconType: 'tasks', label: 'Tasks', color: '#22c55e' });
          if (types.has('event')) demoTags.push({ iconType: 'calendar', label: 'Events', color: '#14b8a6' });
          if (types.has('idea')) demoTags.push({ iconType: 'magic', label: 'Ideas', color: '#f59e0b' });
          if (types.has('reminder')) demoTags.push({ iconType: 'messages', label: 'Reminders', color: '#8b5cf6' });
        }
        sampleCards.unshift({
          time: 'Just now',
          duration: `0:${String(demoState.elapsed || 0).padStart(2, '0')}`,
          title: 'Your Voice Note',
          preview: demoState.transcript.substring(0, 45) + (demoState.transcript.length > 45 ? '...' : ''),
          transcript: demoState.transcript,
          items: demoItems,
          tags: demoTags,
        });
      }

      // Store cards in globalState for click handler access
      globalState.phoneScreenState.streamCards = sampleCards.slice(0, 4).map(card => ({
        time: card.time,
        duration: card.duration,
        title: card.title,
        transcript: card.transcript,
        items: card.items
      }));

      sampleCards.slice(0, 4).forEach((card, i) => {
        const cardY = cardStartY + i * (cardH + cardGap);
        const isHovered = hoveredButton === `stream-card-${i + 1}`;
        const cardW = width - panelMargin * 2;

        // Card shadow
        ctx.fillStyle = 'rgba(0,0,0,0.03)';
        roundRect(ctx, panelMargin, cardY + 2, cardW, cardH, panelRadius);
        ctx.fill();

        // Card background
        ctx.fillStyle = isHovered ? '#f8fafc' : '#ffffff';
        roundRect(ctx, panelMargin, cardY, cardW, cardH, panelRadius);
        ctx.fill();

        // Time (left)
        ctx.fillStyle = '#9ca3af';
        ctx.font = `400 ${height * 0.017}px -apple-system`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const timeTextWidth = ctx.measureText(card.time).width;
        ctx.fillText(card.time, panelMargin + panelPadding, cardY + cardH * 0.15);

        // Phone icon (simple rectangle)
        const phoneIconX = panelMargin + panelPadding + timeTextWidth + 8;
        const phoneIconY = cardY + cardH * 0.15;
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 1;
        ctx.strokeRect(phoneIconX - 3, phoneIconY - 5, 6, 10);
        ctx.beginPath();
        ctx.arc(phoneIconX, phoneIconY + 3, 1, 0, Math.PI * 2);
        ctx.stroke();

        // Duration badge (right)
        const durationText = `▶ ${card.duration}`;
        ctx.fillStyle = '#e5e7eb';
        const durWidth = width * 0.12;
        roundRect(ctx, cardW - durWidth + panelMargin - panelPadding, cardY + cardH * 0.08, durWidth, height * 0.024, 8);
        ctx.fill();
        ctx.fillStyle = '#64748b';
        ctx.font = `500 ${height * 0.014}px -apple-system`;
        ctx.textAlign = 'center';
        ctx.fillText(durationText, cardW - durWidth / 2 + panelMargin - panelPadding, cardY + cardH * 0.15);

        // Title (bold)
        ctx.fillStyle = '#1a1a1a';
        ctx.font = `600 ${height * 0.022}px -apple-system`;
        ctx.textAlign = 'left';
        // Truncate title if too long
        let title = card.title;
        const maxTitleWidth = cardW - panelPadding * 2 - durWidth;
        while (ctx.measureText(title).width > maxTitleWidth && title.length > 0) {
          title = title.slice(0, -1);
        }
        if (title !== card.title) title += '...';
        ctx.fillText(title, panelMargin + panelPadding, cardY + cardH * 0.4);

        // Preview text (gray)
        ctx.fillStyle = '#64748b';
        ctx.font = `400 ${height * 0.018}px -apple-system`;
        let preview = card.preview;
        const maxPreviewWidth = cardW - panelPadding * 2;
        while (ctx.measureText(preview).width > maxPreviewWidth && preview.length > 0) {
          preview = preview.slice(0, -1);
        }
        if (preview !== card.preview) preview += '...';
        ctx.fillText(preview, panelMargin + panelPadding, cardY + cardH * 0.6);

        // Tags (if any)
        if (card.tags && card.tags.length > 0) {
          let tagX = panelMargin + panelPadding;
          card.tags.forEach(tag => {
            ctx.font = `500 ${height * 0.014}px -apple-system`;
            const labelWidth = ctx.measureText(tag.label).width;
            const iconSize = height * 0.016;
            const tagWidth = iconSize + labelWidth + width * 0.045;
            const tagH = height * 0.026;
            const tagY = cardY + cardH * 0.73;

            // Tag background (light version of color)
            ctx.fillStyle = tag.color + '15';
            roundRect(ctx, tagX, tagY, tagWidth, tagH, 6);
            ctx.fill();

            // Tag border
            ctx.strokeStyle = tag.color + '40';
            ctx.lineWidth = 1;
            roundRect(ctx, tagX, tagY, tagWidth, tagH, 6);
            ctx.stroke();

            // Tag icon (simple line icon)
            drawIcon(tag.iconType, tagX + width * 0.018, tagY + tagH / 2, iconSize, tag.color);

            // Tag label
            ctx.fillStyle = tag.color;
            ctx.font = `500 ${height * 0.014}px -apple-system`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(tag.label, tagX + width * 0.032, tagY + tagH / 2);

            tagX += tagWidth + width * 0.015;
          });
        }
      });

      drawBottomNav('stream');
      return;
    }

    // === MAGIC SCREEN (AI chat interface) ===
    if (phoneScreen === 'magic' && !isDemoMode && !demoState.isWaitingToStart) {
      drawStatusBar();

      const chatState = globalState.chatState;
      const messages = chatState.messages;
      const isLoading = chatState.isLoading;
      const isLimitReached = chatState.isLimitReached;
      const chatError = chatState.error;

      // Header
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `700 ${height * 0.04}px -apple-system`;
      ctx.textAlign = 'center';
      ctx.fillText('Ask VOIS anything', width / 2, height * 0.085);

      // Content area dimensions
      const contentStartY = height * 0.12;
      const inputAreaY = height * 0.78;
      const contentEndY = inputAreaY - height * 0.02;
      const msgPadding = width * 0.03;
      const msgRadius = 12;

      // Helper function to wrap text
      const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
        ctx.font = `400 ${fontSize}px -apple-system`;
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        for (const word of words) {
          const testLine = currentLine ? currentLine + ' ' + word : word;
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);
        return lines;
      };

      // === EMPTY STATE (no messages yet) ===
      if (messages.length === 0 && !isLoading) {
        // Intro text
        ctx.fillStyle = '#64748b';
        ctx.font = `400 ${height * 0.02}px -apple-system`;
        ctx.textAlign = 'center';
        const introLines = [
          "This is Alex's VOIS — 3 months of",
          "captured thoughts. Ask anything about",
          "their tasks, health, meetings, ideas,",
          "or the people in their life."
        ];
        introLines.forEach((line, i) => {
          ctx.fillText(line, width / 2, contentStartY + height * 0.06 + i * height * 0.028);
        });

        // Suggested prompts
        ctx.fillStyle = '#1a1a1a';
        ctx.font = `600 ${height * 0.018}px -apple-system`;
        ctx.fillText('Try asking:', width / 2, contentStartY + height * 0.2);

        const promptStartY = contentStartY + height * 0.24;
        const promptHeight = height * 0.065;
        const promptGap = height * 0.015;

        CHAT_SUGGESTED_PROMPTS.forEach((prompt, i) => {
          const promptY = promptStartY + i * (promptHeight + promptGap);
          const isHovered = hoveredButton === `chat-prompt-${i}`;

          // Prompt background
          ctx.fillStyle = isHovered ? '#e2e8f0' : '#f1f5f9';
          roundRect(ctx, panelMargin, promptY, width - panelMargin * 2, promptHeight, 10);
          ctx.fill();

          // Border on hover
          if (isHovered) {
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 1;
            roundRect(ctx, panelMargin, promptY, width - panelMargin * 2, promptHeight, 10);
            ctx.stroke();
          }

          // Prompt text
          ctx.fillStyle = '#334155';
          ctx.font = `400 ${height * 0.019}px -apple-system`;
          ctx.textAlign = 'left';
          ctx.fillText(prompt, panelMargin + panelPadding, promptY + promptHeight / 2 + height * 0.006);
        });
      }
      // === MESSAGES STATE ===
      else {
        // Calculate message positions from bottom up (most recent at bottom)
        let currentY = contentEndY;
        const msgFontSize = height * 0.019;
        const lineHeight = height * 0.025;
        const maxMsgWidth = width * 0.7;

        // Typing indicator when loading
        if (isLoading) {
          const indicatorH = height * 0.05;
          currentY -= indicatorH + height * 0.01;

          ctx.fillStyle = '#f1f5f9';
          roundRect(ctx, panelMargin, currentY, width * 0.25, indicatorH, msgRadius);
          ctx.fill();

          // Animated dots
          const dotTime = Date.now() / 300;
          for (let d = 0; d < 3; d++) {
            const dotAlpha = 0.3 + 0.7 * Math.abs(Math.sin(dotTime + d * 0.5));
            ctx.fillStyle = `rgba(100, 116, 139, ${dotAlpha})`;
            ctx.beginPath();
            ctx.arc(panelMargin + width * 0.06 + d * width * 0.04, currentY + indicatorH / 2, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Render messages in reverse order (newest visible at bottom)
        const visibleMessages = messages.slice(-6); // Show last 6 messages max
        const messageHeights: number[] = [];

        // Pre-calculate heights
        for (const msg of visibleMessages) {
          const lines = wrapText(msg.content, maxMsgWidth - msgPadding * 2, msgFontSize);
          let msgH = msgPadding * 2 + lines.length * lineHeight;

          // Add height for citations if present
          if (msg.citations && msg.citations.length > 0) {
            msgH += height * 0.035;
          }
          messageHeights.push(msgH);
        }

        // Draw messages from bottom to top
        for (let i = visibleMessages.length - 1; i >= 0; i--) {
          const msg = visibleMessages[i];
          const msgH = messageHeights[i];
          const isUser = msg.role === 'user';

          currentY -= msgH + height * 0.015;
          if (currentY < contentStartY) break; // Don't draw above content area

          const msgX = isUser ? width * 0.25 : panelMargin;
          const msgW = isUser ? width * 0.7 : Math.min(width * 0.75, maxMsgWidth);

          // Message bubble
          ctx.fillStyle = isUser ? '#1e293b' : '#f1f5f9';
          roundRect(ctx, msgX, currentY, msgW, msgH, msgRadius);
          ctx.fill();

          // Message text
          ctx.fillStyle = isUser ? '#ffffff' : '#1a1a1a';
          ctx.font = `400 ${msgFontSize}px -apple-system`;
          ctx.textAlign = 'left';

          const lines = wrapText(msg.content, msgW - msgPadding * 2, msgFontSize);
          lines.forEach((line, lineIdx) => {
            ctx.fillText(line, msgX + msgPadding, currentY + msgPadding + lineHeight * (lineIdx + 0.7));
          });

          // Citations (for AI messages)
          if (msg.citations && msg.citations.length > 0 && !isUser) {
            const citationY = currentY + msgPadding + lines.length * lineHeight + height * 0.01;
            let citationX = msgX + msgPadding;

            msg.citations.slice(0, 3).forEach((citation) => {
              const citationText = `📅 ${citation.date}`;
              ctx.font = `400 ${height * 0.014}px -apple-system`;
              const citationW = ctx.measureText(citationText).width + width * 0.025;

              ctx.fillStyle = '#e2e8f0';
              roundRect(ctx, citationX, citationY, citationW, height * 0.025, 6);
              ctx.fill();

              ctx.fillStyle = '#64748b';
              ctx.fillText(citationText, citationX + width * 0.012, citationY + height * 0.018);

              citationX += citationW + width * 0.015;
            });
          }
        }

        // Error message
        if (chatError) {
          ctx.fillStyle = '#fef2f2';
          roundRect(ctx, panelMargin, contentStartY, width - panelMargin * 2, height * 0.06, 8);
          ctx.fill();
          ctx.fillStyle = '#dc2626';
          ctx.font = `400 ${height * 0.018}px -apple-system`;
          ctx.textAlign = 'center';
          ctx.fillText(chatError, width / 2, contentStartY + height * 0.038);
        }

        // Limit reached message
        if (isLimitReached) {
          const limitY = contentStartY;
          ctx.fillStyle = '#fefce8';
          roundRect(ctx, panelMargin, limitY, width - panelMargin * 2, height * 0.12, 10);
          ctx.fill();

          ctx.fillStyle = '#854d0e';
          ctx.font = `500 ${height * 0.017}px -apple-system`;
          ctx.textAlign = 'center';
          ctx.fillText("You've reached the demo limit.", width / 2, limitY + height * 0.035);
          ctx.font = `400 ${height * 0.015}px -apple-system`;
          ctx.fillText("Get Early Access to chat unlimited", width / 2, limitY + height * 0.058);
          ctx.fillText("with your own memories.", width / 2, limitY + height * 0.078);

          // Start Over button
          const btnW = width * 0.35;
          const btnH = height * 0.04;
          const btnX = width / 2 - btnW / 2;
          const btnY = limitY + height * 0.09;
          const isBtnHovered = hoveredButton === 'chat-reset';

          ctx.fillStyle = isBtnHovered ? '#1e293b' : '#334155';
          roundRect(ctx, btnX, btnY, btnW, btnH, 6);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = `500 ${height * 0.016}px -apple-system`;
          ctx.fillText('Start Over', width / 2, btnY + btnH / 2 + height * 0.005);
        }
      }

      // Input field at bottom (disabled when loading or limit reached)
      const inputH = height * 0.07;
      const inputDisabled = isLoading || isLimitReached;
      const isInputHovered = hoveredButton === 'chat-input';
      const isInputFocused = chatState.isInputFocused;
      const inputW = width - panelMargin * 2 - height * 0.08;

      // Input background
      ctx.fillStyle = inputDisabled ? '#e2e8f0' : (isInputFocused ? '#ffffff' : (isInputHovered ? '#e2e8f0' : '#f1f5f9'));
      roundRect(ctx, panelMargin, inputAreaY, inputW, inputH, 20);
      ctx.fill();

      // Focus ring when focused
      if (isInputFocused && !inputDisabled) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        roundRect(ctx, panelMargin, inputAreaY, inputW, inputH, 20);
        ctx.stroke();
      }

      // Input placeholder or text
      const hasText = chatState.inputText.length > 0;
      ctx.fillStyle = inputDisabled ? '#9ca3af' : (hasText ? '#1a1a1a' : '#64748b');
      ctx.font = `400 ${height * 0.02}px -apple-system`;
      ctx.textAlign = 'left';
      const displayText = hasText ? chatState.inputText : (inputDisabled ? 'Chat disabled' : 'Ask anything...');
      ctx.fillText(displayText, panelMargin + panelPadding, inputAreaY + inputH / 2 + height * 0.006);

      // Blinking cursor when focused
      if (isInputFocused && !inputDisabled) {
        const cursorBlink = Math.floor(Date.now() / 500) % 2 === 0;
        if (cursorBlink) {
          const textWidth = ctx.measureText(chatState.inputText).width;
          const cursorX = panelMargin + panelPadding + textWidth + 2;
          ctx.fillStyle = '#1a1a1a';
          ctx.fillRect(cursorX, inputAreaY + inputH * 0.25, 2, inputH * 0.5);
        }
      }

      // Send button
      const sendBtnSize = height * 0.06;
      const sendBtnX = width - panelMargin - sendBtnSize;
      const sendBtnY = inputAreaY + (inputH - sendBtnSize) / 2;
      const isSendHovered = hoveredButton === 'chat-send';

      ctx.fillStyle = inputDisabled ? '#cbd5e1' : (isSendHovered ? '#1e40af' : '#3b82f6');
      ctx.beginPath();
      ctx.arc(sendBtnX + sendBtnSize / 2, sendBtnY + sendBtnSize / 2, sendBtnSize / 2, 0, Math.PI * 2);
      ctx.fill();

      // Send arrow icon
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      const arrowCX = sendBtnX + sendBtnSize / 2;
      const arrowCY = sendBtnY + sendBtnSize / 2;
      ctx.moveTo(arrowCX - 6, arrowCY);
      ctx.lineTo(arrowCX + 4, arrowCY);
      ctx.moveTo(arrowCX, arrowCY - 5);
      ctx.lineTo(arrowCX + 5, arrowCY);
      ctx.lineTo(arrowCX, arrowCY + 5);
      ctx.stroke();

      drawBottomNav('magic');
      return;
    }

    // === APPS SCREEN (3-column grid of apps, iOS-style) ===
    if (phoneScreen === 'apps' && !isDemoMode && !demoState.isWaitingToStart) {
      drawStatusBar();

      // VOISAPPS header (left-aligned, gray, uppercase)
      ctx.fillStyle = '#9ca3af';
      ctx.font = `700 ${height * 0.03}px -apple-system`;
      ctx.textAlign = 'left';
      ctx.fillText('VOISAPPS', panelMargin, height * 0.085);

      // Thin separator line
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(panelMargin, height * 0.10);
      ctx.lineTo(width - panelMargin, height * 0.10);
      ctx.stroke();

      // 3-column grid (small icons, spread across width, moderate vertical spacing)
      const cols = 3;
      const gridStartY = height * 0.13;
      const gridEndY = height * 0.78;
      const iconBoxSize = width * 0.185;
      const gridLeftPad = width * 0.07;
      const totalGridW = width - gridLeftPad * 2;
      const colGap = (totalGridW - iconBoxSize * cols) / (cols - 1);
      const labelHeight = height * 0.022;
      const cellHeight = iconBoxSize + labelHeight;
      const rows = 4;
      const rowGap = (gridEndY - gridStartY - cellHeight * rows) / (rows - 1);
      const iconRadius = iconBoxSize * 0.22;

      const apps = [
        // Row 1 — Calendar & To Do List first
        { id: 'calendar', iconType: 'calendar', label: 'Calendar', bg: '#dbeafe', iconColor: '#2563eb' },
        { id: 'todo', iconType: 'todo', label: 'To Do List', bg: '#dcfce7', iconColor: '#16a34a' },
        { id: 'messages', iconType: 'messages', label: 'Messages', bg: '#f5e0d8', iconColor: '#c2410c' },
        // Row 2
        { id: 'people', iconType: 'people', label: 'People Dir...', bg: '#fef3c7', iconColor: '#d97706' },
        { id: 'research', iconType: 'research', label: 'Research', bg: '#dcfce7', iconColor: '#16a34a' },
        { id: 'journal', iconType: 'journal', label: 'Journal', bg: '#e8dff5', iconColor: '#7c3aed' },
        // Row 3
        { id: 'meeting-notes', iconType: 'meeting-notes', label: 'Meeting Not...', bg: '#fce7f3', iconColor: '#db2777' },
        { id: 'shopping', iconType: 'shopping', label: 'Shopping', bg: '#dbeafe', iconColor: '#0891b2' },
        { id: 'wisdom', iconType: 'wisdom', label: 'Wisdom Jou...', bg: '#ddd6fe', iconColor: '#1d4ed8' },
        // Row 4
        { id: 'insights', iconType: 'insights', label: 'AI Insights J...', bg: '#ddd6fe', iconColor: '#4f46e5' },
        { id: 'summit', iconType: 'summit', label: 'Summit Log', bg: '#ddd6fe', iconColor: '#1d4ed8' },
        { id: 'sleep', iconType: 'sleep', label: 'Sleep', bg: '#dcfce7', iconColor: '#4d7c0f' },
      ];

      apps.forEach((app, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const bx = gridLeftPad + col * (iconBoxSize + colGap);
        const by = gridStartY + row * (cellHeight + rowGap);
        const isHovered = hoveredButton === `app-${app.id}`;

        // Rounded square background (pastel)
        ctx.fillStyle = isHovered ? '#f1f5f9' : app.bg;
        roundRect(ctx, bx, by, iconBoxSize, iconBoxSize, iconRadius);
        ctx.fill();

        // Draw canvas icon centered in the square
        const iconDrawSize = iconBoxSize * 0.45;
        drawIcon(app.iconType, bx + iconBoxSize / 2, by + iconBoxSize / 2, iconDrawSize, app.iconColor);

        // Label below icon
        ctx.fillStyle = '#64748b';
        ctx.font = `500 ${height * 0.015}px -apple-system`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(app.label, bx + iconBoxSize / 2, by + iconBoxSize + height * 0.003);
      });

      drawBottomNav('apps');
      return;
    }

    // === VOICENOTE DETAIL SCREEN (nice two-panel view with highlights) ===
    const selectedCard = globalState.phoneScreenState.selectedCard;
    if (phoneScreen === 'voicenote' && selectedCard && !isDemoMode && !demoState.isWaitingToStart) {
      drawStatusBar();
      drawBackButton('stream');

      // Header
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `600 ${height * 0.028}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('VOIS NOTE', width / 2, height * 0.085);

      // === TRANSCRIPTION PANEL ===
      const transPanelY = height * 0.115;
      const transPanelH = height * 0.35;
      const transPanelW = width - panelMargin * 2;

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      roundRect(ctx, panelMargin + 1, transPanelY + 4, transPanelW, transPanelH, panelRadius);
      ctx.fill();

      // Panel background
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, panelMargin, transPanelY, transPanelW, transPanelH, panelRadius);
      ctx.fill();

      // Category colors for highlighting
      const categoryHighlights: Record<string, string> = {
        task: 'rgba(187, 247, 208, 0.7)',
        event: 'rgba(191, 219, 254, 0.7)',
        idea: 'rgba(254, 240, 138, 0.7)',
        reminder: 'rgba(233, 213, 255, 0.7)',
        note: 'rgba(226, 232, 240, 0.7)',
      };

      // Build highlights from items
      const cardItems = selectedCard.items || [];
      const transcript = selectedCard.transcript || '';

      // Text rendering with highlights
      const textX = panelMargin + panelPadding;
      const textStartY = transPanelY + panelPadding + 10;
      const textMaxWidth = transPanelW - panelPadding * 2;
      const textSize = height * 0.024;
      const lineHeight = textSize * 1.5;

      ctx.font = `400 ${textSize}px -apple-system`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      // Word wrap and highlight matching words
      const words = transcript.split(' ');
      let curX = textX;
      let curY = textStartY;

      for (const word of words) {
        const wordW = ctx.measureText(word + ' ').width;

        if (curX + wordW > textX + textMaxWidth) {
          curX = textX;
          curY += lineHeight;
          if (curY > transPanelY + transPanelH - panelPadding) break;
        }

        // Check if word matches any item content
        let highlightColor: string | null = null;
        for (const item of cardItems) {
          const itemWords = (item.content || '').toLowerCase().split(' ');
          if (itemWords.some(iw => word.toLowerCase().includes(iw) && iw.length > 3)) {
            highlightColor = categoryHighlights[item.type?.toLowerCase()] || categoryHighlights.note;
            break;
          }
        }

        // Draw highlight if matched
        if (highlightColor) {
          ctx.fillStyle = highlightColor;
          roundRect(ctx, curX - 3, curY - 2, wordW + 2, textSize + 6, 4);
          ctx.fill();
        }

        // Draw word
        ctx.fillStyle = '#374151';
        ctx.fillText(word + ' ', curX, curY);
        curX += wordW;
      }

      // === ACTION CARDS PANEL ===
      const cardsPanelH = height * 0.34;
      const cardsPanelY = height * 0.52;
      const cardsPanelW = width - panelMargin * 2;

      // "Action Cards" header
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `600 ${height * 0.022}px -apple-system, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('Action Cards', panelMargin, cardsPanelY - height * 0.02);

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      roundRect(ctx, panelMargin + 1, cardsPanelY + 4, cardsPanelW, cardsPanelH, panelRadius);
      ctx.fill();

      // Panel background
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, panelMargin, cardsPanelY, cardsPanelW, cardsPanelH, panelRadius);
      ctx.fill();

      // Card colors
      const cardColors: Record<string, { bg: string; accent: string; text: string }> = {
        task: { bg: '#dcfce7', accent: '#4ade80', text: '#16a34a' },
        event: { bg: '#dbeafe', accent: '#60a5fa', text: '#2563eb' },
        idea: { bg: '#fefce8', accent: '#fde047', text: '#ca8a04' },
        reminder: { bg: '#f3e8ff', accent: '#c084fc', text: '#9333ea' },
        note: { bg: '#f1f5f9', accent: '#94a3b8', text: '#475569' },
      };

      const cardInnerPadding = panelPadding * 0.8;
      const cardStartY = cardsPanelY + cardInnerPadding;
      const cardH = height * 0.095;
      const cardGap = height * 0.012;
      const cardW = cardsPanelW - cardInnerPadding * 2;
      const cardStartX = panelMargin + cardInnerPadding;
      const cardRadius = 20;

      const maxCards = Math.min(3, cardItems.length);
      for (let i = 0; i < maxCards; i++) {
        const item = cardItems[i];
        const thisCardY = cardStartY + i * (cardH + cardGap);
        const itemType = item.type?.toLowerCase() || 'note';
        const colors = cardColors[itemType] || cardColors.note;

        // Card background
        ctx.fillStyle = colors.bg;
        roundRect(ctx, cardStartX, thisCardY, cardW, cardH, cardRadius);
        ctx.fill();

        // Left accent bar
        ctx.fillStyle = colors.accent;
        roundRect(ctx, cardStartX, thisCardY + cardH * 0.2, 4, cardH * 0.6, 2);
        ctx.fill();

        // Icon
        const iconX = cardStartX + 30;
        const iconY = thisCardY + cardH / 2;
        ctx.fillStyle = colors.text;
        ctx.font = `${height * 0.035}px -apple-system`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.icon || '✓', iconX, iconY);

        // Type label
        ctx.fillStyle = colors.text;
        ctx.font = `600 ${height * 0.020}px -apple-system`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const typeLabel = itemType.charAt(0).toUpperCase() + itemType.slice(1);
        ctx.fillText(typeLabel, iconX + 28, thisCardY + height * 0.018);

        // Content (truncate if needed)
        ctx.fillStyle = '#374151';
        ctx.font = `500 ${height * 0.024}px -apple-system`;
        let content = item.content || '';
        const maxContentWidth = cardW - 80;
        while (ctx.measureText(content).width > maxContentWidth && content.length > 0) {
          content = content.slice(0, -1);
        }
        if (content !== item.content) content += '...';
        ctx.fillText(content, iconX + 28, thisCardY + height * 0.052);

        // Check button
        ctx.fillStyle = colors.accent;
        ctx.font = `600 ${height * 0.024}px -apple-system`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✓', cardStartX + cardW - height * 0.03, thisCardY + cardH * 0.35);
      }

      // No items message
      if (cardItems.length === 0) {
        ctx.fillStyle = '#9ca3af';
        ctx.font = `400 ${height * 0.022}px -apple-system`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No action items extracted', width / 2, cardsPanelY + cardsPanelH / 2);
      }

      drawBottomNav('stream');
      return;
    }

    // === APP DETAIL SCREENS (app-tasks, app-ideas, etc.) ===
    if (phoneScreen.startsWith('app-') && !isDemoMode && !demoState.isWaitingToStart) {
      const appType = phoneScreen.replace('app-', '');
      const screenTitles: Record<string, string> = {
        tasks: 'Tasks',
        ideas: 'Ideas',
        calendar: 'Calendar',
        lists: 'Lists',
        messages: 'Messages',
        people: 'People Directory',
        research: 'Research',
        journal: 'Journal',
        'meeting-notes': 'Meeting Notes',
        shopping: 'Shopping',
        wisdom: 'Wisdom Journal',
        insights: 'AI Insights',
        summit: 'Summit Log',
        sleep: 'Sleep',
        todo: 'To Do List',
      };

      drawStatusBar();
      drawBackButton('apps');

      // Screen title
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `700 ${height * 0.045}px -apple-system`;
      ctx.textAlign = 'center';
      ctx.fillText(screenTitles[appType] || appType, width / 2, height * 0.085);

      // Check if we have a screenshot image for this app
      const appImage = appScreenImagesRef.current[appType];
      if (appImage) {
        // Draw the image filling the content area between header and nav bar
        const imgY = height * 0.11;
        const imgH = height * 0.77; // up to nav bar
        const imgW = width;

        // Scale image to fill width, crop vertically if needed
        const imgAspect = appImage.width / appImage.height;
        const targetAspect = imgW / imgH;

        if (imgAspect > targetAspect) {
          // Image wider than target: fit height, crop sides
          const drawW = imgH * imgAspect;
          const drawX = (imgW - drawW) / 2;
          ctx.drawImage(appImage, drawX, imgY, drawW, imgH);
        } else {
          // Image taller than target: fit width, crop bottom
          const drawH = imgW / imgAspect;
          ctx.drawImage(appImage, 0, imgY, imgW, drawH);
        }
      } else {
        // Fallback: list-based content
        const contentY = height * 0.14;
        const items = appData[appType] || [];
        const itemH = height * 0.1;
        const itemGap = height * 0.015;

        items.slice(0, 6).forEach((item, i) => {
          const itemY = contentY + i * (itemH + itemGap);

          // Card shadow
          ctx.fillStyle = 'rgba(0,0,0,0.04)';
          roundRect(ctx, panelMargin, itemY + 2, width - panelMargin * 2, itemH, panelRadius);
          ctx.fill();

          // Card background
          ctx.fillStyle = '#ffffff';
          roundRect(ctx, panelMargin, itemY, width - panelMargin * 2, itemH, panelRadius);
          ctx.fill();

          // Icon
          ctx.fillStyle = item.color;
          ctx.font = `${height * 0.032}px -apple-system`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item.icon, panelMargin + panelPadding + 15, itemY + itemH / 2);

          // Text
          ctx.fillStyle = '#1a1a1a';
          ctx.font = `500 ${height * 0.024}px -apple-system`;
          ctx.textAlign = 'left';
          const maxTextWidth = width - panelMargin * 2 - panelPadding * 2 - 50;
          let text = item.text;
          if (ctx.measureText(text).width > maxTextWidth) {
            while (ctx.measureText(text + '...').width > maxTextWidth && text.length > 0) {
              text = text.slice(0, -1);
            }
            text += '...';
          }
          ctx.fillText(text, panelMargin + panelPadding + 40, itemY + itemH / 2);
        });
      }

      drawBottomNav('apps');
      return;
    }

    // === WAITING TO START RECORDING MODE ===
    if (demoState.isWaitingToStart && !demoState.isRecording && !demoState.isProcessing) {
      // Status bar
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `600 ${height * 0.026}px -apple-system, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('9:41', padding, height * 0.032);

      // VOIS header
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `700 ${height * 0.05}px -apple-system`;
      ctx.textAlign = 'center';
      ctx.fillText('VOIS', width / 2, height * 0.15);

      // Instruction text
      ctx.fillStyle = '#64748b';
      ctx.font = `500 ${height * 0.028}px -apple-system`;
      ctx.fillText('Tap to start recording', width / 2, height * 0.24);

      // Big record button with strong hover effect
      const btnCenterY = height * 0.5;
      const isHovered = hoveredButton === 'record-phone';
      const baseRadius = width * 0.18;
      const pulseScale = 1 + Math.sin(now / 400) * 0.05;
      // Scale up significantly on hover
      const hoverScale = isHovered ? 1.15 : 1;
      const btnRadius = baseRadius * hoverScale;

      // Outer glow - much larger and brighter on hover
      const glowOpacity = isHovered ? 0.4 : 0.15;
      const glowSize = isHovered ? 1.8 : 1.4;
      ctx.fillStyle = `rgba(239, 68, 68, ${glowOpacity})`;
      ctx.beginPath();
      ctx.arc(width / 2, btnCenterY, btnRadius * glowSize * pulseScale, 0, Math.PI * 2);
      ctx.fill();

      // Extra ring on hover
      if (isHovered) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(width / 2, btnCenterY, btnRadius * 1.25, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Button shadow
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.beginPath();
      ctx.arc(width / 2, btnCenterY + 4, btnRadius, 0, Math.PI * 2);
      ctx.fill();

      // Button background (brighter red on hover)
      ctx.fillStyle = isHovered ? '#dc2626' : '#ef4444';
      ctx.beginPath();
      ctx.arc(width / 2, btnCenterY, btnRadius, 0, Math.PI * 2);
      ctx.fill();

      // White border on hover for extra emphasis
      if (isHovered) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(width / 2, btnCenterY, btnRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Microphone icon (scales with button)
      ctx.fillStyle = '#ffffff';
      ctx.font = `${height * 0.1 * hoverScale}px -apple-system`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎙️', width / 2, btnCenterY);

      // "Record" label below button (brighter on hover)
      ctx.fillStyle = isHovered ? '#dc2626' : '#ef4444';
      ctx.font = `600 ${height * 0.032}px -apple-system`;
      ctx.fillText('Record', width / 2, height * 0.72);

      // Hint at bottom
      ctx.fillStyle = '#9ca3af';
      ctx.font = `400 ${height * 0.022}px -apple-system`;
      ctx.fillText('Speak for up to 30 seconds', width / 2, height * 0.82);

      return;
    }

    // === DEMO RECORDING MODE (only show if this is the active device) ===
    if (demoState.isRecording && demoState.activeDevice === 'phone') {
      // Status bar
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `600 ${height * 0.026}px -apple-system, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('9:41', padding, height * 0.032);

      // VOIS text
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${width * 0.12}px -apple-system`;
      ctx.textAlign = 'center';
      ctx.fillText('VOIS', width / 2, height * 0.18);

      // === ANIMATED WAVEFORM (center of phone) ===
      const waveY = height * 0.42;
      const waveH = height * 0.12;
      const waveStartX = width * 0.1;
      const waveEndX = width * 0.9;
      const bars = 24;
      const barWidth = (waveEndX - waveStartX) / bars;
      const audioLevels = demoState.audioLevels;

      for (let i = 0; i < bars; i++) {
        const baseLevel = audioLevels[i] || 0.1;
        const animOffset = now * 0.003 + i * 0.2;
        const jitter = Math.sin(animOffset) * 0.1;
        const level = Math.min(1, Math.max(0.1, baseLevel + jitter));
        const dynamicH = waveH * (0.15 + level * 0.85);

        const intensity = 0.5 + level * 0.5;
        ctx.fillStyle = `rgba(239, 68, 68, ${intensity})`; // Red

        const barX = waveStartX + i * barWidth;
        const barW = barWidth * 0.6;
        roundRect(ctx, barX, waveY - dynamicH / 2, barW, dynamicH, 4);
        ctx.fill();
      }

      // Recording indicator dot (pulsing)
      const dotPulse = 0.7 + Math.sin(now / 300) * 0.3;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(width * 0.12, height * 0.18, 8 * dotPulse, 0, Math.PI * 2);
      ctx.fill();

      // Timer display (counting UP)
      const displayTime = demoState.elapsed;
      const minutes = Math.floor(displayTime / 60);
      const seconds = displayTime % 60;
      ctx.fillStyle = '#ef4444';
      ctx.font = `bold ${height * 0.08}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`${minutes}:${seconds.toString().padStart(2, '0')}`, width / 2, height * 0.62);

      // Status text
      ctx.fillStyle = '#666666';
      ctx.font = `500 ${height * 0.028}px -apple-system`;
      ctx.fillText('Recording...', width / 2, height * 0.72);

      // Stop button (red rounded rect with white square icon)
      const stopBtnY = height * 0.80;
      const stopBtnW = width * 0.38;
      const stopBtnH = height * 0.065;
      const stopBtnX = (width - stopBtnW) / 2;

      ctx.fillStyle = '#ef4444';
      roundRect(ctx, stopBtnX, stopBtnY, stopBtnW, stopBtnH, stopBtnH / 2);
      ctx.fill();

      // White square icon
      const sqSize = stopBtnH * 0.28;
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, width / 2 - stopBtnW * 0.16 - sqSize / 2, stopBtnY + (stopBtnH - sqSize) / 2, sqSize, sqSize, 2);
      ctx.fill();

      // "Stop" label
      ctx.fillStyle = '#ffffff';
      ctx.font = `600 ${height * 0.026}px -apple-system`;
      ctx.textAlign = 'center';
      ctx.fillText('Stop', width / 2 + stopBtnW * 0.06, stopBtnY + stopBtnH / 2 + height * 0.008);

      return;
    }

    // === DEMO PROCESSING MODE (show on phone when either phone OR watch is processing) ===
    const showPhoneProcessing = demoState.isProcessing && (demoState.activeDevice === 'phone' || demoState.activeDevice === 'watch');
    if (showPhoneProcessing) {
      // Status bar
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `600 ${height * 0.026}px -apple-system, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('9:41', padding, height * 0.032);

      // VOIS NOTE header
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `600 ${height * 0.028}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('VOIS NOTE', width / 2, height * 0.085);

      const panelPadding = width * 0.045;
      const panelMargin = width * 0.045;
      const panelRadius = 24;

      // === TOP PANEL - Processing status ===
      const topPanelY = height * 0.115;
      const topPanelH = height * 0.35;
      const topPanelW = width - panelMargin * 2;

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      roundRect(ctx, panelMargin + 1, topPanelY + 4, topPanelW, topPanelH, panelRadius);
      ctx.fill();

      // Panel background
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, panelMargin, topPanelY, topPanelW, topPanelH, panelRadius);
      ctx.fill();

      // Processing spinner (animated)
      const spinnerX = width / 2;
      const spinnerY = topPanelY + topPanelH * 0.35;
      const spinnerRadius = height * 0.04;
      const spinnerAngle = (now / 500) % (Math.PI * 2);

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(spinnerX, spinnerY, spinnerRadius, spinnerAngle, spinnerAngle + Math.PI * 1.5);
      ctx.stroke();

      // "Processing your voice..." text
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `600 ${height * 0.032}px -apple-system`;
      ctx.textAlign = 'center';
      ctx.fillText('Processing your voice...', width / 2, topPanelY + topPanelH * 0.62);

      // Elapsed time
      const minutes = Math.floor(demoState.elapsed / 60);
      const seconds = demoState.elapsed % 60;
      ctx.fillStyle = '#666666';
      ctx.font = `400 ${height * 0.024}px -apple-system`;
      ctx.fillText(`${minutes}:${seconds.toString().padStart(2, '0')} recorded`, width / 2, topPanelY + topPanelH * 0.8);

      // === BOTTOM PANEL - Did you know tip ===
      const bottomPanelY = height * 0.52;
      const bottomPanelH = height * 0.34;
      const bottomPanelW = width - panelMargin * 2;

      // Header
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `600 ${height * 0.022}px -apple-system, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('Did you know?', panelMargin, bottomPanelY - height * 0.02);

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      roundRect(ctx, panelMargin + 1, bottomPanelY + 4, bottomPanelW, bottomPanelH, panelRadius);
      ctx.fill();

      // Panel background
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, panelMargin, bottomPanelY, bottomPanelW, bottomPanelH, panelRadius);
      ctx.fill();

      // Tip icon
      ctx.fillStyle = '#fbbf24';
      ctx.font = `${height * 0.05}px -apple-system`;
      ctx.textAlign = 'center';
      ctx.fillText('💡', width / 2, bottomPanelY + bottomPanelH * 0.3);

      // Tip text (word wrap)
      const tip = demoState.tip || 'VOIS remembers everything you capture';
      ctx.fillStyle = '#374151';
      ctx.font = `500 ${height * 0.026}px -apple-system`;
      ctx.textAlign = 'center';

      // Simple word wrap
      const maxWidth = bottomPanelW - panelPadding * 2;
      const words = tip.split(' ');
      let line = '';
      let lineY = bottomPanelY + bottomPanelH * 0.5;
      const lineHeight = height * 0.038;

      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line) {
          ctx.fillText(line, width / 2, lineY);
          line = word;
          lineY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, width / 2, lineY);

      return;
    }

    // Helper to draw category-specific icons on action cards (vector-drawn, same style as hero demo)
    const drawCardIcon = (ctx: CanvasRenderingContext2D, type: string, x: number, y: number, size: number, color: string) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const s = size * 0.4;

      // Normalize API type names to hero demo category names
      const t = type.toLowerCase();

      if (t === 'task' || t === 'tasks' || t === 'work') {
        // Checkmark icon
        ctx.beginPath();
        ctx.arc(x, y, s * 0.85, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x - s * 0.4, y);
        ctx.lineTo(x - s * 0.1, y + s * 0.35);
        ctx.lineTo(x + s * 0.45, y - s * 0.3);
        ctx.stroke();
      } else if (t === 'event' || t === 'events' || t === 'calendar' || t === 'appointment') {
        // Calendar icon
        ctx.beginPath();
        roundRect(ctx, x - s, y - s * 0.6, s * 2, s * 1.4, 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - s, y - s * 0.2);
        ctx.lineTo(x + s, y - s * 0.2);
        ctx.stroke();
        // Calendar pins
        ctx.beginPath();
        ctx.moveTo(x - s * 0.35, y - s * 0.85);
        ctx.lineTo(x - s * 0.35, y - s * 0.45);
        ctx.moveTo(x + s * 0.35, y - s * 0.85);
        ctx.lineTo(x + s * 0.35, y - s * 0.45);
        ctx.stroke();
        // Date dots
        ctx.fillRect(x - s * 0.5, y + s * 0.1, s * 0.3, s * 0.3);
        ctx.fillRect(x + s * 0.2, y + s * 0.1, s * 0.3, s * 0.3);
      } else if (t === 'shopping' || t === 'grocery' || t === 'groceries' || t === 'list' || t === 'errands' || t === 'errand') {
        // Shopping cart / checklist icon
        ctx.beginPath();
        ctx.moveTo(x - s * 0.8, y - s * 0.5);
        ctx.lineTo(x - s * 0.4, y);
        ctx.lineTo(x + s * 0.8, y - s * 0.8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - s * 0.8, y + s * 0.5);
        ctx.lineTo(x + s * 0.8, y + s * 0.5);
        ctx.stroke();
      } else if (t === 'idea' || t === 'ideas') {
        // Lightbulb icon
        ctx.beginPath();
        ctx.arc(x, y - s * 0.3, s * 0.6, Math.PI * 0.8, Math.PI * 2.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - s * 0.3, y + s * 0.3);
        ctx.lineTo(x - s * 0.3, y + s * 0.6);
        ctx.lineTo(x + s * 0.3, y + s * 0.6);
        ctx.lineTo(x + s * 0.3, y + s * 0.3);
        ctx.stroke();
      } else if (t === 'health' || t === 'wellness' || t === 'sleep') {
        // Heart icon
        ctx.beginPath();
        ctx.moveTo(x, y + s * 0.6);
        ctx.bezierCurveTo(x - s * 1.2, y - s * 0.2, x - s * 0.6, y - s, x, y - s * 0.4);
        ctx.bezierCurveTo(x + s * 0.6, y - s, x + s * 1.2, y - s * 0.2, x, y + s * 0.6);
        ctx.stroke();
      } else if (t === 'social' || t === 'messages' || t === 'message' || t === 'family') {
        // Chat bubble icon
        ctx.beginPath();
        roundRect(ctx, x - s, y - s * 0.7, s * 2, s * 1.2, 4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - s * 0.3, y + s * 0.5);
        ctx.lineTo(x - s * 0.5, y + s);
        ctx.lineTo(x + s * 0.1, y + s * 0.5);
        ctx.fill();
      } else if (t === 'finance' || t === 'money' || t === 'budget') {
        // Briefcase / document icon
        ctx.beginPath();
        roundRect(ctx, x - s, y - s * 0.6, s * 2, s * 1.4, 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - s * 0.4, y - s * 0.6);
        ctx.lineTo(x - s * 0.4, y - s);
        ctx.lineTo(x + s * 0.4, y - s);
        ctx.lineTo(x + s * 0.4, y - s * 0.6);
        ctx.stroke();
      } else if (t === 'reminder' || t === 'reminders') {
        // Bell icon
        ctx.beginPath();
        ctx.arc(x, y - s * 0.3, s * 0.6, Math.PI * 1.1, Math.PI * 1.9);
        ctx.lineTo(x + s * 0.7, y + s * 0.3);
        ctx.lineTo(x - s * 0.7, y + s * 0.3);
        ctx.closePath();
        ctx.stroke();
        // Clapper
        ctx.beginPath();
        ctx.arc(x, y + s * 0.5, s * 0.2, 0, Math.PI);
        ctx.stroke();
      } else if (t === 'note' || t === 'notes') {
        // Document / note icon
        ctx.beginPath();
        roundRect(ctx, x - s * 0.7, y - s * 0.8, s * 1.4, s * 1.6, 2);
        ctx.stroke();
        // Lines inside the document
        ctx.beginPath();
        ctx.moveTo(x - s * 0.4, y - s * 0.3);
        ctx.lineTo(x + s * 0.4, y - s * 0.3);
        ctx.moveTo(x - s * 0.4, y + s * 0.05);
        ctx.lineTo(x + s * 0.4, y + s * 0.05);
        ctx.moveTo(x - s * 0.4, y + s * 0.4);
        ctx.lineTo(x + s * 0.1, y + s * 0.4);
        ctx.stroke();
      } else {
        // Default circle icon
        ctx.beginPath();
        ctx.arc(x, y, s * 0.6, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    };

    // === NO ITEMS RETRY SCREEN - Show when processing returned no action items ===
    if (demoState.error === 'no_items' && !demoState.isProcessing) {
      // Light background
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, width, height);

      // Status bar
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `600 ${height * 0.026}px -apple-system, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('9:41', padding, height * 0.032);

      // VOIS NOTE header
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `600 ${height * 0.028}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('VOIS NOTE', width / 2, height * 0.085);

      // Retry icon - circular arrow
      const iconY = height * 0.35;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(width / 2, iconY, height * 0.04, -Math.PI * 0.3, Math.PI * 1.3);
      ctx.stroke();
      // Arrowhead
      const arrowAngle = -Math.PI * 0.3;
      const arrowR = height * 0.04;
      const ax = width / 2 + arrowR * Math.cos(arrowAngle);
      const ay = iconY + arrowR * Math.sin(arrowAngle);
      const headLen = height * 0.015;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax + headLen, ay - headLen * 0.3);
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax + headLen * 0.3, ay + headLen);
      ctx.stroke();

      // Message text
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `600 ${height * 0.028}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("Let's try that again", width / 2, height * 0.45);

      ctx.fillStyle = '#64748b';
      ctx.font = `400 ${height * 0.024}px -apple-system, sans-serif`;
      ctx.fillText('Be more specific about what', width / 2, height * 0.52);
      ctx.fillText('you want to capture.', width / 2, height * 0.56);

      ctx.fillStyle = '#94a3b8';
      ctx.font = `400 ${height * 0.020}px -apple-system, sans-serif`;
      ctx.fillText('Restarting automatically...', width / 2, height * 0.64);

      // Bottom nav
      drawBottomNav('stream');
      return;
    }

    // === DEMO RESULTS MODE - Show actual user transcript with highlights (only if phone was active device) ===
    const hasDemoResults = demoState.activeDevice === 'phone' && demoState.transcript && demoState.transcript.length > 0 && !demoState.isRecording && !demoState.isProcessing;
    if (hasDemoResults) {
      const demoTranscript = demoState.transcript;
      const demoHighlights = demoState.highlights || [];
      const demoItems = demoState.items || [];

      // Animation timing for demo results (time since results arrived)
      // Use a simple approach: track via a ref or use elapsed as proxy
      const resultsStartTime = globalState.demoResultsStartTime || Date.now();
      if (!globalState.demoResultsStartTime) {
        globalState.demoResultsStartTime = Date.now();
      }
      const resultsElapsed = (Date.now() - resultsStartTime) / 1000;

      // Typing animation
      const demoTypingSpeed = 40; // chars per second
      const demoRevealedChars = Math.min(Math.floor(resultsElapsed * demoTypingSpeed), demoTranscript.length);
      const demoTypingComplete = demoRevealedChars >= demoTranscript.length;

      // === STATUS BAR ===
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `600 ${height * 0.026}px -apple-system, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('9:41', padding, height * 0.032);

      // === VOIS NOTE HEADER ===
      const headerY = height * 0.085;
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `600 ${height * 0.028}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('VOIS NOTE', width / 2, headerY);

      // === PANEL STYLING CONSTANTS ===
      const panelPadding = width * 0.045;
      const panelMargin = width * 0.045;
      const panelRadius = 24;

      // === TRANSCRIPTION PANEL ===
      const transPanelY = height * 0.115;
      const transPanelH = height * 0.35;
      const transPanelW = width - panelMargin * 2;

      // Shadow layers
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
      roundRect(ctx, panelMargin + 1, transPanelY + 8, transPanelW, transPanelH, panelRadius);
      ctx.fill();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      roundRect(ctx, panelMargin + 1, transPanelY + 4, transPanelW, transPanelH, panelRadius);
      ctx.fill();

      // Panel background
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, panelMargin, transPanelY, transPanelW, transPanelH, panelRadius);
      ctx.fill();

      // === TEXT WITH HIGHLIGHTS ===
      const textY = transPanelY + panelPadding;
      const textSize = height * 0.030;
      const lineH = height * 0.044;
      const textPadding = panelMargin + panelPadding;
      const maxX = width - textPadding;
      const maxTextY = transPanelY + transPanelH - panelPadding - textSize;

      // Get visible text
      const visibleText = demoTranscript.substring(0, demoRevealedChars);

      // Build word positions with highlight info
      interface DemoWordInfo {
        word: string;
        x: number;
        y: number;
        width: number;
        highlightColor?: string;
        category?: string;
      }

      const demoWordPositions: DemoWordInfo[] = [];
      const words = visibleText.split(' ');
      let curX = textPadding;
      let curY = textY;
      let charIndex = 0;

      ctx.font = `400 ${textSize}px -apple-system`;

      for (const word of words) {
        if (!word) {
          charIndex += 1; // space
          continue;
        }

        const wordW = ctx.measureText(word + ' ').width;

        // Wrap to next line if needed
        if (curX + wordW > maxX && curX > textPadding) {
          curY += lineH;
          curX = textPadding;
          if (curY > maxTextY) break;
        }

        // Check if this word falls within any highlight
        const wordStart = charIndex;
        const wordEnd = charIndex + word.length;
        let highlightColor: string | undefined;
        let category: string | undefined;

        // Category to highlight color mapping - FULL list matching demoPastelColors
        const categoryHighlightColors: Record<string, string> = {
          // GREEN - Tasks, Work, Projects
          task: 'rgba(187, 247, 208, 0.7)',
          tasks: 'rgba(187, 247, 208, 0.7)',
          work: 'rgba(187, 247, 208, 0.7)',
          projects: 'rgba(187, 247, 208, 0.7)',
          project: 'rgba(187, 247, 208, 0.7)',
          'meeting notes': 'rgba(187, 247, 208, 0.7)',
          meeting: 'rgba(187, 247, 208, 0.7)',
          // BLUE - Calendar, Events
          event: 'rgba(191, 219, 254, 0.7)',
          events: 'rgba(191, 219, 254, 0.7)',
          calendar: 'rgba(191, 219, 254, 0.7)',
          appointment: 'rgba(191, 219, 254, 0.7)',
          // ORANGE - Errands, Goals, Habits
          errands: 'rgba(254, 215, 170, 0.7)',
          errand: 'rgba(254, 215, 170, 0.7)',
          goals: 'rgba(254, 215, 170, 0.7)',
          goal: 'rgba(254, 215, 170, 0.7)',
          habits: 'rgba(254, 215, 170, 0.7)',
          habit: 'rgba(254, 215, 170, 0.7)',
          // TEAL - Finance
          finance: 'rgba(165, 243, 252, 0.7)',
          money: 'rgba(165, 243, 252, 0.7)',
          budget: 'rgba(165, 243, 252, 0.7)',
          expense: 'rgba(165, 243, 252, 0.7)',
          // YELLOW - Ideas, Dreams, Research
          idea: 'rgba(254, 240, 138, 0.7)',
          ideas: 'rgba(254, 240, 138, 0.7)',
          dreams: 'rgba(254, 240, 138, 0.7)',
          dream: 'rgba(254, 240, 138, 0.7)',
          research: 'rgba(254, 240, 138, 0.7)',
          gratitude: 'rgba(254, 240, 138, 0.7)',
          // RED - Health, Sleep, Tracking
          health: 'rgba(254, 202, 202, 0.7)',
          sleep: 'rgba(254, 202, 202, 0.7)',
          tracking: 'rgba(254, 202, 202, 0.7)',
          wellness: 'rgba(254, 202, 202, 0.7)',
          symptom: 'rgba(254, 202, 202, 0.7)',
          // PURPLE - Shopping, Journal, Meals
          shopping: 'rgba(221, 214, 254, 0.7)',
          list: 'rgba(221, 214, 254, 0.7)',
          grocery: 'rgba(221, 214, 254, 0.7)',
          groceries: 'rgba(221, 214, 254, 0.7)',
          journal: 'rgba(221, 214, 254, 0.7)',
          meals: 'rgba(221, 214, 254, 0.7)',
          meal: 'rgba(221, 214, 254, 0.7)',
          recipe: 'rgba(221, 214, 254, 0.7)',
          // PINK - Social, Family, Memories
          social: 'rgba(251, 207, 232, 0.7)',
          family: 'rgba(251, 207, 232, 0.7)',
          memories: 'rgba(251, 207, 232, 0.7)',
          memory: 'rgba(251, 207, 232, 0.7)',
          quotes: 'rgba(251, 207, 232, 0.7)',
          quote: 'rgba(251, 207, 232, 0.7)',
          message: 'rgba(251, 207, 232, 0.7)',
          // LIGHT PURPLE - Reminders
          reminder: 'rgba(233, 213, 255, 0.7)',
          reminders: 'rgba(233, 213, 255, 0.7)',
          // GRAY - Notes
          note: 'rgba(226, 232, 240, 0.7)',
          notes: 'rgba(226, 232, 240, 0.7)',
        };

        for (const h of demoHighlights) {
          // Check if word overlaps with highlight range
          if (wordStart < h.end && wordEnd > h.start) {
            category = h.category?.toLowerCase() || 'task';
            // Use category-based color, fall back to allCategoryConfigs, then default
            highlightColor = categoryHighlightColors[category]
              || allCategoryConfigs[category]?.highlight
              || 'rgba(187, 247, 208, 0.7)'; // default green
            break;
          }
        }

        demoWordPositions.push({
          word,
          x: curX,
          y: curY,
          width: wordW,
          highlightColor,
          category,
        });

        curX += wordW;
        charIndex += word.length + 1; // +1 for space
      }

      // === REAL-TIME HIGHLIGHTING (like hero showcase) ===
      // Highlights appear as soon as the cursor passes the highlighted segment
      const highlightSpeed = 80; // chars per second for highlight animation

      // Calculate highlight states based on current typing position
      interface DemoHighlightState {
        category: string;
        progress: number;
        startChar: number;
        endChar: number;
      }
      const demoHighlightStates: DemoHighlightState[] = [];

      for (const h of demoHighlights) {
        // Trigger highlight when cursor passes the END of this highlight (0.5s delay for effect)
        const triggerChar = h.end;
        const triggerTime = triggerChar / demoTypingSpeed + 0.3; // Small delay after passing

        if (resultsElapsed >= triggerTime) {
          const timeSinceTrigger = resultsElapsed - triggerTime;
          const segmentLength = h.end - h.start;
          const highlightDuration = segmentLength / highlightSpeed;
          const highlightProgress = Math.min(1, timeSinceTrigger / highlightDuration);

          demoHighlightStates.push({
            category: h.category?.toLowerCase() || 'task',
            progress: highlightProgress,
            startChar: h.start,
            endChar: h.end
          });
        }
      }

      // Draw highlights with progressive animation
      for (const wp of demoWordPositions) {
        if (wp.highlightColor && wp.category) {
          // Find the highlight state for this word
          const wordCharStart = demoWordPositions.slice(0, demoWordPositions.indexOf(wp))
            .reduce((sum, w) => sum + w.word.length + 1, 0);

          const highlightState = demoHighlightStates.find(hs =>
            hs.category === wp.category &&
            wordCharStart >= hs.startChar &&
            wordCharStart < hs.endChar
          );

          if (highlightState && highlightState.progress > 0) {
            // Calculate if this word should be highlighted based on progress
            const wordsInHighlight = demoWordPositions.filter(w => {
              const wStart = demoWordPositions.slice(0, demoWordPositions.indexOf(w))
                .reduce((sum, x) => sum + x.word.length + 1, 0);
              return w.category === highlightState.category &&
                     wStart >= highlightState.startChar &&
                     wStart < highlightState.endChar;
            });
            const wordIndexInHighlight = wordsInHighlight.indexOf(wp);
            const wordsToHighlight = Math.floor(highlightState.progress * wordsInHighlight.length);

            if (wordIndexInHighlight < wordsToHighlight) {
              ctx.fillStyle = wp.highlightColor;
              roundRect(ctx, wp.x - 3, wp.y - 2, wp.width + 2, textSize + 6, 4);
              ctx.fill();
            }
          }
        }
      }

      // Track which categories have completed highlighting (for card timing)
      const completedHighlightCategories = demoHighlightStates
        .filter(hs => hs.progress >= 1)
        .map(hs => hs.category);

      // Draw text
      ctx.font = `400 ${textSize}px -apple-system`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      for (const wp of demoWordPositions) {
        ctx.fillStyle = '#374151';
        ctx.fillText(wp.word + ' ', wp.x, wp.y);
      }

      // Typing cursor
      if (!demoTypingComplete && Math.floor(now / 500) % 2 === 0) {
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(curX + 2, curY, 3, textSize);
      }

      // === ACTION CARDS + CHAT CTA (cards show first, then fade to CTA after 3s) ===
      const cardsPanelH = height * 0.34;
      const cardsPanelY = height * 0.52;
      const cardsPanelW = width - panelMargin * 2;

      const cardInnerPadding = panelPadding * 0.8;
      const cardStartY = cardsPanelY + cardInnerPadding;
      const cardH = height * 0.095;
      const cardGap = height * 0.012;
      const cardW = cardsPanelW - cardInnerPadding * 2;
      const cardStartX = panelMargin + cardInnerPadding;
      const cardRadius = 20;

      // Pastel colors for demo item types
      const demoPastelColors: Record<string, { bg: string; accent: string; text: string }> = {
        task: { bg: '#dcfce7', accent: '#4ade80', text: '#16a34a' },
        tasks: { bg: '#dcfce7', accent: '#4ade80', text: '#16a34a' },
        work: { bg: '#dcfce7', accent: '#4ade80', text: '#16a34a' },
        event: { bg: '#dbeafe', accent: '#60a5fa', text: '#2563eb' },
        events: { bg: '#dbeafe', accent: '#60a5fa', text: '#2563eb' },
        calendar: { bg: '#dbeafe', accent: '#60a5fa', text: '#2563eb' },
        errands: { bg: '#fff7ed', accent: '#fdba74', text: '#ea580c' },
        errand: { bg: '#fff7ed', accent: '#fdba74', text: '#ea580c' },
        shopping: { bg: '#f5f3ff', accent: '#c4b5fd', text: '#7c3aed' },
        grocery: { bg: '#f5f3ff', accent: '#c4b5fd', text: '#7c3aed' },
        groceries: { bg: '#f5f3ff', accent: '#c4b5fd', text: '#7c3aed' },
        list: { bg: '#f5f3ff', accent: '#c4b5fd', text: '#7c3aed' },
        finance: { bg: '#ecfeff', accent: '#22d3ee', text: '#0891b2' },
        ideas: { bg: '#fefce8', accent: '#fde047', text: '#ca8a04' },
        idea: { bg: '#fefce8', accent: '#fde047', text: '#ca8a04' },
        health: { bg: '#fef2f2', accent: '#fca5a5', text: '#dc2626' },
        social: { bg: '#fdf2f8', accent: '#f9a8d4', text: '#db2777' },
        reminder: { bg: '#f3e8ff', accent: '#c084fc', text: '#9333ea' },
        reminders: { bg: '#f3e8ff', accent: '#c084fc', text: '#9333ea' },
        note: { bg: '#f1f5f9', accent: '#94a3b8', text: '#475569' },
        notes: { bg: '#f1f5f9', accent: '#94a3b8', text: '#475569' },
      };

      // Calculate per-card opacity based on highlight completion
      const cardOpacities: number[] = [];
      let latestCardFullyVisibleTime = 0; // resultsElapsed when the last card reaches opacity 1

      demoItems.forEach((item) => {
        const itemCategory = (item.type || 'task').toLowerCase();
        // Find matching highlight state
        const highlightState = demoHighlightStates.find(hs => hs.category === itemCategory);

        if (highlightState && highlightState.progress >= 1) {
          // Find the original highlight to calculate completion time
          const matchingHighlight = demoHighlights.find(h =>
            (h.category?.toLowerCase() || 'task') === itemCategory
          );
          if (matchingHighlight) {
            const triggerTime = matchingHighlight.end / demoTypingSpeed + 0.3;
            const segLen = matchingHighlight.end - matchingHighlight.start;
            const highlightDuration = segLen / 80;
            const completionTime = triggerTime + highlightDuration;
            const timeSinceComplete = resultsElapsed - completionTime;
            const fadeIn = 0.3;
            const opacity = Math.min(1, Math.max(0, timeSinceComplete / fadeIn));
            cardOpacities.push(opacity);
            if (opacity >= 1) {
              const fullyVisibleAt = completionTime + fadeIn;
              latestCardFullyVisibleTime = Math.max(latestCardFullyVisibleTime, fullyVisibleAt);
            }
          } else {
            cardOpacities.push(1);
          }
        } else if (!highlightState && demoTypingComplete) {
          // No matching highlight — fade in after typing finishes
          const typingDoneTime = demoTranscript.length / demoTypingSpeed;
          const timeSinceTyping = resultsElapsed - typingDoneTime;
          const fadeIn = 0.3;
          const opacity = Math.min(1, Math.max(0, timeSinceTyping / fadeIn));
          cardOpacities.push(opacity);
          if (opacity >= 1) {
            latestCardFullyVisibleTime = Math.max(latestCardFullyVisibleTime, typingDoneTime + fadeIn);
          }
        } else {
          cardOpacities.push(0);
        }
      });

      const allCardsFullyVisible = demoItems.length > 0 &&
        cardOpacities.length === demoItems.length &&
        cardOpacities.every(o => o >= 1);

      // Time since ALL cards became fully visible
      const timeSinceAllCardsVisible = allCardsFullyVisible
        ? resultsElapsed - latestCardFullyVisibleTime
        : -1;

      // Phase timing
      const cardShowDuration = 3.0;
      const cardFadeOutDuration = 0.5;
      const ctaFadeInDelay = 0.2;
      const ctaFadeInDuration = 0.5;

      const shouldFadeOutCards = timeSinceAllCardsVisible > cardShowDuration;
      const cardsFadeOutProgress = shouldFadeOutCards
        ? Math.min(1, (timeSinceAllCardsVisible - cardShowDuration) / cardFadeOutDuration)
        : 0;
      const ctaPhaseElapsed = shouldFadeOutCards
        ? timeSinceAllCardsVisible - cardShowDuration - cardFadeOutDuration - ctaFadeInDelay
        : -1;
      const ctaOpacity = ctaPhaseElapsed > 0
        ? Math.min(1, ctaPhaseElapsed / ctaFadeInDuration)
        : 0;

      // === DRAW ACTION CARDS (Phase 1) ===
      if (cardsFadeOutProgress < 1) {
        const cardsGlobalAlpha = 1 - cardsFadeOutProgress;

        // "Action Cards" header
        ctx.globalAlpha = cardsGlobalAlpha;
        ctx.fillStyle = '#1a1a1a';
        ctx.font = `600 ${height * 0.022}px -apple-system, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('Action Cards', panelMargin, cardsPanelY - height * 0.02);

        // Panel shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
        roundRect(ctx, panelMargin + 1, cardsPanelY + 8, cardsPanelW, cardsPanelH, panelRadius);
        ctx.fill();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        roundRect(ctx, panelMargin + 1, cardsPanelY + 4, cardsPanelW, cardsPanelH, panelRadius);
        ctx.fill();

        // Panel background
        ctx.fillStyle = '#ffffff';
        roundRect(ctx, panelMargin, cardsPanelY, cardsPanelW, cardsPanelH, panelRadius);
        ctx.fill();

        // Draw each card
        demoItems.forEach((item, i) => {
          const cardOpacity = (cardOpacities[i] || 0) * cardsGlobalAlpha;
          if (cardOpacity <= 0) return;

          ctx.globalAlpha = cardOpacity;
          const thisCardY = cardStartY + i * (cardH + cardGap);
          const itemCategory = (item.type || 'task').toLowerCase();
          const colors = demoPastelColors[itemCategory] || { bg: '#f8fafc', accent: '#94a3b8', text: '#64748b' };

          // Card background
          ctx.fillStyle = colors.bg;
          roundRect(ctx, cardStartX, thisCardY, cardW, cardH, cardRadius);
          ctx.fill();

          // Left accent bar
          const barWidth = 4;
          const barPadding = cardH * 0.2;
          ctx.fillStyle = colors.accent;
          roundRect(ctx, cardStartX, thisCardY + barPadding, barWidth, cardH - barPadding * 2, 2);
          ctx.fill();

          // Vector icon (same style as hero demo)
          const iconX = cardStartX + 30;
          const iconY = thisCardY + cardH / 2;
          const iconSize = height * 0.04;
          drawCardIcon(ctx, itemCategory, iconX, iconY, iconSize, colors.text);

          // Content text
          const contentTextX = iconX + iconSize + 12;

          // Type label
          ctx.fillStyle = colors.text;
          ctx.font = `600 ${height * 0.020}px -apple-system`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          const typeLabel = (item.type || 'Task').charAt(0).toUpperCase() + (item.type || 'Task').slice(1);
          ctx.fillText(typeLabel, contentTextX, thisCardY + height * 0.018);

          // Content
          ctx.fillStyle = '#374151';
          ctx.font = `500 ${height * 0.024}px -apple-system`;
          ctx.fillText(item.content, contentTextX, thisCardY + height * 0.052);

          // Checkmark and X buttons
          const btnSize = height * 0.024;
          const btnX = cardStartX + cardW - btnSize * 1.2;
          const checkBtnY = thisCardY + cardH * 0.32;
          const xBtnY = thisCardY + cardH * 0.68;

          ctx.fillStyle = colors.accent;
          ctx.font = `600 ${btnSize}px -apple-system`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('✓', btnX, checkBtnY);

          ctx.fillStyle = '#cbd5e1';
          ctx.font = `500 ${btnSize * 0.9}px -apple-system`;
          ctx.fillText('✕', btnX, xBtnY);
        });

        ctx.globalAlpha = 1;
      }

      // === DRAW CHAT CTA TEXT (Phase 2) ===
      if (ctaOpacity > 0) {
        ctx.globalAlpha = ctaOpacity;

        // CTA panel (smaller, just text)
        const ctaPanelY = height * 0.55;
        const ctaPanelW = width - panelMargin * 2;
        const ctaPanelH = height * 0.13;

        // Panel shadow + background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
        roundRect(ctx, panelMargin + 1, ctaPanelY + 4, ctaPanelW, ctaPanelH, panelRadius);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        roundRect(ctx, panelMargin, ctaPanelY, ctaPanelW, ctaPanelH, panelRadius);
        ctx.fill();

        // CTA text
        ctx.fillStyle = '#1a1a1a';
        ctx.font = `600 ${height * 0.026}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('Try your personalized', width / 2, ctaPanelY + height * 0.025);
        ctx.fillText('ChatGPT', width / 2, ctaPanelY + height * 0.06);

        ctx.globalAlpha = 1;
      }

      // === BOTTOM NAV BAR ===
      drawBottomNav('stream');

      // === ARROW ON TOP OF EVERYTHING (Phase 2 — drawn after nav so it overlays) ===
      if (ctaOpacity > 0) {
        ctx.globalAlpha = ctaOpacity;

        // Arrow from below CTA panel down to magic icon in bottom nav
        // Magic icon = first of 3 tabs, center X = width/6, Y = height*0.94
        const arrowStartX = width * 0.38;
        const arrowStartY = height * 0.70;
        const arrowEndX = width / 6;
        const arrowEndY = height * 0.92;

        // Control point bowing LEFT
        const cpX = arrowStartX - width * 0.22;
        const cpY = (arrowStartY + arrowEndY) / 2 + height * 0.02;

        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(arrowStartX, arrowStartY);
        ctx.quadraticCurveTo(cpX, cpY, arrowEndX, arrowEndY);
        ctx.stroke();

        // Arrowhead
        const angle = Math.atan2(arrowEndY - cpY, arrowEndX - cpX);
        const headLen = height * 0.022;
        ctx.fillStyle = '#9ca3af';
        ctx.beginPath();
        ctx.moveTo(arrowEndX, arrowEndY);
        ctx.lineTo(arrowEndX - headLen * Math.cos(angle - 0.4), arrowEndY - headLen * Math.sin(angle - 0.4));
        ctx.lineTo(arrowEndX - headLen * Math.cos(angle + 0.4), arrowEndY - headLen * Math.sin(angle + 0.4));
        ctx.closePath();
        ctx.fill();

        // Small sparkle hint near arrow tip
        ctx.fillStyle = '#9ca3af';
        ctx.font = `${height * 0.022}px -apple-system`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✦', arrowEndX + height * 0.025, arrowEndY - height * 0.018);

        ctx.globalAlpha = 1;
      }

      return;
    }

    // === LOGO SCREEN (before recording starts) ===
    if (elapsed < RECORDING_START_TIME) {
      const logoSize = width * 0.5;
      drawVoisLogo(ctx, width / 2, height * 0.4, logoSize, '#1a1a1a');

      ctx.fillStyle = '#1a1a1a';
      ctx.font = `700 ${height * 0.06}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('VOIS', width / 2, height * 0.58);

      ctx.fillStyle = '#9ca3af';
      ctx.font = `400 ${height * 0.022}px -apple-system`;
      ctx.fillText('Starting...', width / 2, height * 0.68);

      return;
    }

    // === TRANSCRIPTION SCREEN ===
    const transcriptionElapsed = elapsed - RECORDING_START_TIME;
    const typingSpeed = 28; // chars per second
    const highlightSpeed = 60; // chars per second for highlight animation
    const revealedChars = Math.min(Math.floor(transcriptionElapsed * typingSpeed), fullTranscript.length);
    const typingComplete = revealedChars >= fullTranscript.length;

    // Calculate segment positions for highlighting
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

    // Calculate highlight states with completion timing
    interface HighlightState { category: string; progress: number; completionTime: number; timeSinceComplete: number; }
    const highlightStates: HighlightState[] = [];

    for (let i = 0; i < segmentPositions.length; i++) {
      const seg = segmentPositions[i];
      const nextSeg = segmentPositions[i + 1];
      const triggerChar = nextSeg ? nextSeg.startChar : fullTranscript.length;
      const triggerTime = triggerChar / typingSpeed;

      if (transcriptionElapsed >= triggerTime) {
        const timeSinceTrigger = transcriptionElapsed - triggerTime;
        const segmentLength = seg.endChar - seg.startChar;
        const highlightDuration = segmentLength / highlightSpeed;
        const highlightChars = Math.min(Math.floor(timeSinceTrigger * highlightSpeed), segmentLength);
        const completionTime = triggerTime + highlightDuration;
        const timeSinceComplete = Math.max(0, transcriptionElapsed - completionTime);
        highlightStates.push({
          category: seg.category,
          progress: Math.min(1, highlightChars / segmentLength),
          completionTime,
          timeSinceComplete
        });
      }
    }

    const completedHighlights = highlightStates.filter(h => h.progress >= 1).map(h => h.category);

    // Time when all highlights complete
    const allHighlightsDone = highlightStates.length === segmentPositions.length &&
      highlightStates.every(h => h.progress >= 1);
    const typingCompleteTime = fullTranscript.length / typingSpeed;
    const cardsStartTime = typingCompleteTime + 1.0;

    // === STATUS BAR ===
    ctx.fillStyle = '#1a1a1a';
    ctx.font = `600 ${height * 0.026}px -apple-system, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('9:41', padding, height * 0.032);

    // === BACK BUTTON (goes to stream cards list) ===
    const backHovered = hoveredButton === 'back';
    ctx.fillStyle = backHovered ? '#3b82f6' : '#64748b';
    ctx.font = `500 ${height * 0.028}px -apple-system`;
    ctx.textAlign = 'left';
    ctx.fillText('← Back', padding, height * 0.085);

    // === VOIS NOTE HEADER - centered, all caps, below dynamic island ===
    const headerY = height * 0.085;
    ctx.fillStyle = '#1a1a1a';
    ctx.font = `600 ${height * 0.028}px -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('VOIS NOTE', width / 2, headerY);

    // === TRANSCRIPTION PANEL (floating card with natural shadow) ===
    const transPanelY = height * 0.115;
    const transPanelH = height * 0.35;
    const transPanelW = width - panelMargin * 2;

    // Natural layered shadow (multiple layers for depth)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    roundRect(ctx, panelMargin + 1, transPanelY + 8, transPanelW, transPanelH, panelRadius);
    ctx.fill();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    roundRect(ctx, panelMargin + 1, transPanelY + 4, transPanelW, transPanelH, panelRadius);
    ctx.fill();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    roundRect(ctx, panelMargin, transPanelY + 2, transPanelW, transPanelH, panelRadius);
    ctx.fill();

    // Panel background
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, panelMargin, transPanelY, transPanelW, transPanelH, panelRadius);
    ctx.fill();

    // === TEXT WITH LIVE HIGHLIGHTING (inside panel) ===
    const textY = transPanelY + panelPadding;
    const textSize = height * 0.030;
    const lineH = height * 0.044;
    const textPadding = panelMargin + panelPadding;
    const maxX = width - textPadding;
    const maxTextY = transPanelY + transPanelH - panelPadding - textSize; // Don't overflow panel

    // Build word positions with segment info
    interface WordInfo {
      word: string;
      x: number;
      y: number;
      width: number;
      category?: string;
      wordIndexInSegment: number;
      totalWordsInSegment: number;
    }

    const wordPositions: WordInfo[] = [];
    let wordCharCount = 0;
    let curX = textPadding;
    let curY = textY;

    // Pre-calculate words per segment
    const segmentWordCounts = new Map<string, number>();
    for (const seg of transcriptSegments) {
      if (seg.category) {
        segmentWordCounts.set(seg.category, seg.text.trim().split(/\s+/).length);
      }
    }
    const segmentWordIndex = new Map<string, number>();

    let textOverflow = false;
    for (const seg of transcriptSegments) {
      if (textOverflow) break;

      const segLen = seg.text.length;
      const visible = Math.min(Math.max(0, revealedChars - wordCharCount), segLen);
      const visibleText = seg.text.substring(0, visible);

      if (visible === 0) {
        wordCharCount += segLen;
        continue;
      }

      const words = visibleText.split(' ');
      for (const word of words) {
        if (!word) continue;

        ctx.font = `400 ${textSize}px -apple-system`;
        const wordW = ctx.measureText(word + ' ').width;

        if (curX + wordW > maxX && curX > textPadding) {
          curY += lineH;
          curX = textPadding;

          // Stop if we'd overflow the panel
          if (curY > maxTextY) {
            textOverflow = true;
            break;
          }
        }

        const currentIdx = segmentWordIndex.get(seg.category || '') || 0;
        if (seg.category) segmentWordIndex.set(seg.category, currentIdx + 1);

        wordPositions.push({
          word,
          x: curX,
          y: curY,
          width: wordW,
          category: seg.category,
          wordIndexInSegment: currentIdx,
          totalWordsInSegment: segmentWordCounts.get(seg.category || '') || 1
        });
        curX += wordW;
      }

      wordCharCount += segLen;
    }

    // Draw highlights
    for (const wp of wordPositions) {
      if (wp.category) {
        const highlightState = highlightStates.find(h => h.category === wp.category);
        if (highlightState) {
          const wordsToHighlight = Math.floor(highlightState.progress * wp.totalWordsInSegment);
          if (wp.wordIndexInSegment < wordsToHighlight) {
            const cfg = allCategoryConfigs[wp.category];
            ctx.fillStyle = cfg?.highlight || '#fef08a';
            roundRect(ctx, wp.x - 3, wp.y - 2, wp.width + 2, textSize + 6, 4);
            ctx.fill();
          }
        }
      }
    }

    // Draw text
    ctx.font = `400 ${textSize}px -apple-system`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    for (const wp of wordPositions) {
      ctx.fillStyle = '#374151';
      ctx.fillText(wp.word + ' ', wp.x, wp.y);
    }

    // Typing cursor
    if (!typingComplete && Math.floor(now / 500) % 2 === 0) {
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(curX + 2, curY, 3, textSize);
    }

    // === EXTRACTED CARDS PANEL (fixed at bottom) ===
    const cardsPanelH = height * 0.34;
    const cardsPanelY = height * 0.52;
    const cardsPanelW = width - panelMargin * 2;

    // "Action Cards" header
    ctx.fillStyle = '#1a1a1a';
    ctx.font = `600 ${height * 0.022}px -apple-system, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Action Cards', panelMargin, cardsPanelY - height * 0.02);

    // Natural layered shadow (multiple layers for depth)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    roundRect(ctx, panelMargin + 1, cardsPanelY + 8, cardsPanelW, cardsPanelH, panelRadius);
    ctx.fill();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    roundRect(ctx, panelMargin + 1, cardsPanelY + 4, cardsPanelW, cardsPanelH, panelRadius);
    ctx.fill();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    roundRect(ctx, panelMargin, cardsPanelY + 2, cardsPanelW, cardsPanelH, panelRadius);
    ctx.fill();

    // Panel background
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, panelMargin, cardsPanelY, cardsPanelW, cardsPanelH, panelRadius);
    ctx.fill();

    // Cards inside the panel - fixed positions
    const cardInnerPadding = panelPadding * 0.8;
    const cardStartY = cardsPanelY + cardInnerPadding;
    const cardH = height * 0.095;
    const cardGap = height * 0.012;
    const cardW = cardsPanelW - cardInnerPadding * 2;
    const cardStartX = panelMargin + cardInnerPadding;
    const cardRadius = 20; // Nicely rounded corners

    // UNIFIED pastel colors for cards - each category distinct
    const pastelColors: Record<string, { bg: string; accent: string; text: string }> = {
      // Blue - Calendar, Events
      events: { bg: '#dbeafe', accent: '#60a5fa', text: '#2563eb' },
      // Green - Tasks, Work
      work: { bg: '#dcfce7', accent: '#4ade80', text: '#16a34a' },
      // Orange - Errands
      errands: { bg: '#fff7ed', accent: '#fdba74', text: '#ea580c' },
      // Teal - Finance
      finance: { bg: '#ecfeff', accent: '#22d3ee', text: '#0891b2' },
      // Yellow - Ideas
      ideas: { bg: '#fefce8', accent: '#fde047', text: '#ca8a04' },
      // Red - Health
      health: { bg: '#fef2f2', accent: '#fca5a5', text: '#dc2626' },
      // Purple - Shopping
      shopping: { bg: '#f5f3ff', accent: '#c4b5fd', text: '#7c3aed' },
      // Pink - Social, Messages
      social: { bg: '#fdf2f8', accent: '#f9a8d4', text: '#db2777' },
      messages: { bg: '#fdf2f8', accent: '#f9a8d4', text: '#db2777' },
    };

    // Simple icon drawing function
    const drawSimpleIcon = (ctx: CanvasRenderingContext2D, type: string, x: number, y: number, size: number, color: string) => {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const s = size * 0.4;

      if (type === 'work' || type === 'finance') {
        // Briefcase / document icon
        ctx.beginPath();
        roundRect(ctx, x - s, y - s * 0.6, s * 2, s * 1.4, 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - s * 0.4, y - s * 0.6);
        ctx.lineTo(x - s * 0.4, y - s);
        ctx.lineTo(x + s * 0.4, y - s);
        ctx.lineTo(x + s * 0.4, y - s * 0.6);
        ctx.stroke();
      } else if (type === 'errands' || type === 'shopping') {
        // Checklist icon
        ctx.beginPath();
        ctx.moveTo(x - s * 0.8, y - s * 0.5);
        ctx.lineTo(x - s * 0.4, y);
        ctx.lineTo(x + s * 0.8, y - s * 0.8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - s * 0.8, y + s * 0.5);
        ctx.lineTo(x + s * 0.8, y + s * 0.5);
        ctx.stroke();
      } else if (type === 'ideas') {
        // Lightbulb icon
        ctx.beginPath();
        ctx.arc(x, y - s * 0.3, s * 0.6, Math.PI * 0.8, Math.PI * 2.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - s * 0.3, y + s * 0.3);
        ctx.lineTo(x - s * 0.3, y + s * 0.6);
        ctx.lineTo(x + s * 0.3, y + s * 0.6);
        ctx.lineTo(x + s * 0.3, y + s * 0.3);
        ctx.stroke();
      } else if (type === 'health') {
        // Heart icon
        ctx.beginPath();
        ctx.moveTo(x, y + s * 0.6);
        ctx.bezierCurveTo(x - s * 1.2, y - s * 0.2, x - s * 0.6, y - s, x, y - s * 0.4);
        ctx.bezierCurveTo(x + s * 0.6, y - s, x + s * 1.2, y - s * 0.2, x, y + s * 0.6);
        ctx.stroke();
      } else if (type === 'social' || type === 'messages') {
        // Chat bubble icon
        ctx.beginPath();
        roundRect(ctx, x - s, y - s * 0.7, s * 2, s * 1.2, 4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - s * 0.3, y + s * 0.5);
        ctx.lineTo(x - s * 0.5, y + s);
        ctx.lineTo(x + s * 0.1, y + s * 0.5);
        ctx.fill();
      } else if (type === 'events') {
        // Calendar icon
        ctx.beginPath();
        roundRect(ctx, x - s, y - s * 0.6, s * 2, s * 1.4, 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - s, y - s * 0.2);
        ctx.lineTo(x + s, y - s * 0.2);
        ctx.stroke();
        ctx.fillRect(x - s * 0.5, y + s * 0.1, s * 0.3, s * 0.3);
        ctx.fillRect(x + s * 0.2, y + s * 0.1, s * 0.3, s * 0.3);
      } else {
        // Default circle icon
        ctx.beginPath();
        ctx.arc(x, y, s * 0.6, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    // Draw all 3 card slots (fixed positions)
    scenario.extractedItems.forEach((item, i) => {
      // Check if this item's highlight is complete (progress >= 1)
      const highlightState = highlightStates.find(h => h.category === item.category);
      const isVisible = highlightState && highlightState.progress >= 1;

      // Card fades in smoothly over 0.3s after highlight completes
      const fadeInDuration = 0.3;
      const cardOpacity = isVisible ? Math.min(1, highlightState.timeSinceComplete / fadeInDuration) : 0;

      if (cardOpacity <= 0) return;

      ctx.globalAlpha = cardOpacity;
      const thisCardY = cardStartY + i * (cardH + cardGap);

      // Get pastel colors for this category
      const colors = pastelColors[item.category] || { bg: '#f8fafc', accent: '#94a3b8', text: '#64748b' };

      // Card background (pastel)
      ctx.fillStyle = colors.bg;
      roundRect(ctx, cardStartX, thisCardY, cardW, cardH, cardRadius);
      ctx.fill();

      // Left color accent bar - on the edge, shorter with padding top/bottom
      const barWidth = 4;
      const barPadding = cardH * 0.2;
      ctx.fillStyle = colors.accent;
      roundRect(ctx, cardStartX, thisCardY + barPadding, barWidth, cardH - barPadding * 2, 2);
      ctx.fill();

      // Simple icon
      const iconSize = height * 0.04;
      const iconX = cardStartX + 30;
      const iconY = thisCardY + cardH / 2;
      drawSimpleIcon(ctx, item.category, iconX, iconY, iconSize, colors.text);

      // Content text - left aligned after icon
      const contentTextX = iconX + iconSize + 12;

      // Label
      ctx.fillStyle = colors.text;
      ctx.font = `600 ${height * 0.020}px -apple-system`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(item.label, contentTextX, thisCardY + height * 0.018);

      // Content
      ctx.fillStyle = '#374151';
      ctx.font = `500 ${height * 0.024}px -apple-system`;
      ctx.fillText(item.content, contentTextX, thisCardY + height * 0.052);

      // Action buttons - stacked vertically on the right
      const btnSize = height * 0.024;
      const btnX = cardStartX + cardW - btnSize * 1.2;
      const checkBtnY = thisCardY + cardH * 0.32;
      const xBtnY = thisCardY + cardH * 0.68;

      // Checkmark button (confirm) - top
      ctx.fillStyle = colors.accent;
      ctx.font = `600 ${btnSize}px -apple-system`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✓', btnX, checkBtnY);

      // X button (dismiss) - bottom
      ctx.fillStyle = '#cbd5e1';
      ctx.font = `500 ${btnSize * 0.9}px -apple-system`;
      ctx.fillText('✕', btnX, xBtnY);
    });

    ctx.globalAlpha = 1;

    // Draw interactive bottom navigation bar
    drawBottomNav('stream');
  }, [roundRect, drawVoisLogo]);
  
  // Function to draw the watch screen - always shows watch face, VOIS icon changes based on state
  const drawWatchScreen = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, _isRecording: boolean, timer: number) => {
    const demoState = globalState.demoState;
    const now = Date.now();

    // Get current real time
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const timeStr = `${hours}:${minutes.toString().padStart(2, '0')}`;

    // Determine watch state
    const isWatchRecording = demoState.activeDevice === 'watch' && demoState.isRecording;
    const isWatchProcessing = demoState.activeDevice === 'watch' && demoState.isProcessing;
    const hasDemoResults = demoState.activeDevice === 'watch' && demoState.transcript && demoState.transcript.length > 0 && !demoState.isRecording && !demoState.isProcessing;
    const isHovered = globalState.watchHoveredRecord;
    const accentColor = '#ff6b35'; // Orange accent like Apple Watch Ultra

    // Hero showcase mode - show fullscreen recording UI in hero section (synced with phone voicenotes)
    const isHeroShowcase = globalState.heroShowcaseActive &&
      globalState.currentSection === 'hero' &&
      !demoState.isWaitingToStart &&
      globalState.phoneScreenState.currentScreen === 'voicenote';

    // Get scenario timing (syncs with phone's voicenote animation)
    const scenarioState = getScenarioState();
    const scenarioElapsed = Math.floor(scenarioState.elapsed);

    // Dark gradient background
    const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.7);
    bgGradient.addColorStop(0, '#1a1a2e');
    bgGradient.addColorStop(1, '#000000');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // === FULLSCREEN RECORDING MODE (Hero showcase or real recording) ===
    if (isHeroShowcase || isWatchRecording || isWatchProcessing) {
      const isProcessing = isWatchProcessing;
      const elapsed = isHeroShowcase ? scenarioElapsed : demoState.elapsed;

      // VOIS text at top
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${width * 0.12}px -apple-system`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('VOIS', width / 2, height * 0.18);

      // Recording indicator dot (pulsing)
      const dotPulse = 0.7 + Math.sin(now / 300) * 0.3;
      ctx.fillStyle = isProcessing ? '#60a5fa' : '#ef4444';
      ctx.beginPath();
      ctx.arc(width * 0.18, height * 0.18, 6 * dotPulse, 0, Math.PI * 2);
      ctx.fill();

      // === ANIMATED WAVEFORM ===
      const waveY = height * 0.48;
      const waveH = height * 0.18;
      const waveStartX = width * 0.1;
      const waveEndX = width * 0.9;
      const bars = 24;
      const barWidth = (waveEndX - waveStartX) / bars;

      // Use real audio levels if recording, simulated if hero showcase
      const audioLevels = isHeroShowcase ?
        Array.from({ length: 24 }, (_, i) => {
          const t = now * 0.002 + i * 0.3;
          return 0.3 + Math.sin(t) * 0.25 + Math.sin(t * 1.7) * 0.2 + Math.random() * 0.15;
        }) :
        demoState.audioLevels;

      for (let i = 0; i < bars; i++) {
        const baseLevel = audioLevels[i] || 0.1;
        const animOffset = now * 0.003 + i * 0.2;
        const jitter = Math.sin(animOffset) * 0.1;
        const level = Math.min(1, Math.max(0.1, baseLevel + jitter));
        const dynamicH = waveH * (0.15 + level * 0.85);

        const intensity = 0.5 + level * 0.5;
        ctx.fillStyle = isProcessing
          ? `rgba(96, 165, 250, ${intensity * 0.8})`
          : `rgba(239, 68, 68, ${intensity})`;

        const barX = waveStartX + i * barWidth;
        const barW = barWidth * 0.6;
        roundRect(ctx, barX, waveY - dynamicH / 2, barW, dynamicH, 3);
        ctx.fill();
      }

      // Timer display
      const displayMinutes = Math.floor(elapsed / 60);
      const displaySeconds = elapsed % 60;
      ctx.fillStyle = isProcessing ? '#60a5fa' : '#ef4444';
      ctx.font = `bold ${width * 0.16}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`${displayMinutes}:${displaySeconds.toString().padStart(2, '0')}`, width / 2, height * 0.75);

      if (isProcessing) {
        // Status text during processing
        ctx.fillStyle = '#888888';
        ctx.font = `500 ${width * 0.055}px -apple-system`;
        ctx.fillText('Processing...', width / 2, height * 0.88);
      } else if (isWatchRecording) {
        // Stop button on watch during real recording
        const stopBtnY = height * 0.82;
        const stopBtnR = width * 0.08;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(width / 2, stopBtnY, stopBtnR, 0, Math.PI * 2);
        ctx.fill();
        // White square icon inside
        const sq = stopBtnR * 0.7;
        ctx.fillStyle = '#ffffff';
        roundRect(ctx, width / 2 - sq / 2, stopBtnY - sq / 2, sq, sq, 2);
        ctx.fill();
        // Label below
        ctx.fillStyle = '#888888';
        ctx.font = `500 ${width * 0.045}px -apple-system`;
        ctx.fillText('Tap to stop', width / 2, height * 0.93);
      } else {
        // Hero showcase status text
        ctx.fillStyle = '#888888';
        ctx.font = `500 ${width * 0.055}px -apple-system`;
        ctx.fillText('Recording...', width / 2, height * 0.88);
      }

      return;
    }

    // === WAITING TO START MODE - Show prominent VOIS icon ===
    if (demoState.isWaitingToStart) {
      // Dim overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, width, height);

      // Time at top (dimmed)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = `500 ${width * 0.12}px -apple-system`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(timeStr, width / 2, height * 0.12);

      // Large centered VOIS logo
      const voisCenterY = height * 0.48;
      const voisSize = width * 0.25;
      const isWatchHovered = isHovered;
      const watchHoverScale = isWatchHovered ? 1.12 : 1;
      const finalVoisSize = voisSize * watchHoverScale;

      // Glow circle background (brighter on hover)
      ctx.fillStyle = isWatchHovered ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.12)';
      ctx.beginPath();
      ctx.arc(width / 2, voisCenterY, finalVoisSize * 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Draw VOIS logo
      const logoColor = isWatchHovered ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.9)';
      drawVoisLogo(ctx, width / 2, voisCenterY, finalVoisSize, logoColor);

      // "Tap to record" text
      ctx.fillStyle = isWatchHovered ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.55)';
      ctx.font = `500 ${width * 0.06}px -apple-system`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('Tap to record', width / 2, voisCenterY + finalVoisSize * 0.8);

      return;
    }

    // === WATCH FACE MODE (when not recording) ===

    // Draw watch face background image (complications, tick marks, etc.)
    if (watchFaceBgRef.current) {
      const img = watchFaceBgRef.current;
      // Cover the canvas, centered
      const imgAspect = img.width / img.height;
      const canvasAspect = width / height;
      let drawW: number, drawH: number, drawX: number, drawY: number;
      if (imgAspect > canvasAspect) {
        drawH = height;
        drawW = height * imgAspect;
        drawX = (width - drawW) / 2;
        drawY = 0;
      } else {
        drawW = width;
        drawH = width / imgAspect;
        drawX = 0;
        drawY = (height - drawH) / 2;
      }
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }

    // Dark overlay to dim the background and complications (but NOT the VOIS icon)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, width, height);

    // Large time display — tall and condensed (stretched vertically, narrower horizontally)
    // Very transparent so it looks like a subtle overlay
    const displayTime = `${hours}:${minutes.toString().padStart(2, '0')}`;
    const fontSize = width * 0.48;
    ctx.save();
    ctx.translate(width / 2, height * 0.52);
    ctx.scale(0.75, 1.35); // narrow + tall = condensed look
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.font = `700 ${fontSize}px -apple-system`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayTime, 0, 0);
    ctx.restore();

    // === VOIS COMPLICATION (Bottom-left) - Changes based on state ===
    const voisX = width * 0.28;
    const voisY = height * 0.88;
    const logoSize = width * 0.18;

    // === IMMEDIATELY TRANSFER TO PHONE when watch finishes processing ===
    // As soon as results are ready, transfer to phone for animated display
    if (hasDemoResults && globalState.demoState.activeDevice === 'watch') {
      // Immediately switch to phone - don't wait for watch checkmark
      globalState.demoState.activeDevice = 'phone';
      globalState.demoResultsStartTime = Date.now();
    }

    // === RESULTS STATE: Show success checkmark (briefly, while phone takes over) ===
    if (hasDemoResults || (demoState.activeDevice === 'phone' && demoState.transcript)) {
      const resultsAge = globalState.demoResultsStartTime ? now - globalState.demoResultsStartTime : 0;
      const WATCH_RESULTS_DURATION = 2000; // Brief checkmark

      if (resultsAge > WATCH_RESULTS_DURATION) {
        // Draw white VOIS logo (back to idle)
        drawVoisLogo(ctx, voisX, voisY, logoSize, '#ffffff');
        ctx.fillStyle = '#ffffff';
        ctx.font = `600 ${width * 0.04}px -apple-system`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('VOIS', voisX, voisY + logoSize * 0.4);
      } else {
        // Show green checkmark
        const fadeIn = Math.min(1, resultsAge / 300);
        const checkRadius = width * 0.11;

        // Green circle
        ctx.fillStyle = `rgba(34, 197, 94, ${fadeIn})`;
        ctx.beginPath();
        ctx.arc(voisX, voisY, checkRadius, 0, Math.PI * 2);
        ctx.fill();

        // White checkmark
        ctx.strokeStyle = `rgba(255, 255, 255, ${fadeIn})`;
        ctx.lineWidth = width * 0.025;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(voisX - checkRadius * 0.4, voisY);
        ctx.lineTo(voisX - checkRadius * 0.1, voisY + checkRadius * 0.3);
        ctx.lineTo(voisX + checkRadius * 0.4, voisY - checkRadius * 0.25);
        ctx.stroke();

        // Item count below
        const itemCount = demoState.items?.length || 0;
        ctx.fillStyle = `rgba(34, 197, 94, ${fadeIn})`;
        ctx.font = `600 ${width * 0.045}px -apple-system`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`${itemCount} items`, voisX, voisY + checkRadius + width * 0.03);
      }
      return;
    }

    // === IDLE STATE: Show bright VOIS logo (lit up, stands out) ===
    const hoverScale = isHovered ? 1.1 : 1;
    const pulseScale = 1 + Math.sin(now / 500) * 0.03;
    const finalSize = logoSize * hoverScale * pulseScale;

    // Always show a glow behind the logo so it "lights up"
    const glowGradient = ctx.createRadialGradient(voisX, voisY, 0, voisX, voisY, finalSize * 1.2);
    glowGradient.addColorStop(0, isHovered ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.25)');
    glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(voisX, voisY, finalSize * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Draw bright white VOIS logo
    drawVoisLogo(ctx, voisX, voisY, finalSize, '#ffffff');

    // "VOIS" label
    ctx.fillStyle = '#ffffff';
    ctx.font = `600 ${width * 0.04}px -apple-system`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('VOIS', voisX, voisY + finalSize * 0.4);

  }, [roundRect, drawVoisLogo]);

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
        const isScreen = child.name === 'Cube014_screen001_0' || child.material?.name === 'screen001';

        if (isScreen) {
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
    
    // Find and replace Watch materials
    // If we already have a reference to the screen mesh, use it directly
    // This handles remount scenarios where the original material name was replaced
    const existingWatchScreenMesh = watchScreenMeshRef.current;

    watch.scene.traverse((child: any) => {
      if (!child.isMesh) return;

      // Check multiple ways to identify the screen mesh:
      // 1. Already identified from previous mount
      // 2. By mesh name (Three.js creates names like Cube004_4 or Cube.004_4 for primitives)
      // 3. By material name (Material.004 is the screen, or vois_watch_screen from our replacement)
      const isExistingRef = existingWatchScreenMesh === child;
      const meshNameMatch = child.name === 'Cube004_4' || child.name === 'Cube.004_4' || child.name.includes('004_4');

      // Handle both single material and material arrays (from joined meshes)
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      const screenMaterialIndex = materials.findIndex((m: any) =>
        m?.name === 'Material.004' || m?.name === 'vois_watch_screen'
      );
      const materialMatch = screenMaterialIndex !== -1;

      const isScreen = isExistingRef || meshNameMatch || materialMatch;

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

        // Replace only the screen material in the array, or the whole material if single
        const newScreenMaterial = new THREE.MeshBasicMaterial({
          map: texture,
          toneMapped: false,
          side: THREE.DoubleSide,
          name: 'vois_watch_screen', // Named so we can find it on remount
        });

        if (Array.isArray(child.material)) {
          // Find index - might be screenMaterialIndex or might need to find by name
          const targetIndex = screenMaterialIndex !== -1 ? screenMaterialIndex :
            materials.findIndex((m: any) => m?.name === 'vois_watch_screen');
          if (targetIndex !== -1) {
            child.material[targetIndex] = newScreenMaterial;
          }
        } else {
          child.material = newScreenMaterial;
        }
      }
    });
    
    // CLEANUP: Dispose textures and materials on unmount to prevent memory leaks
    return () => {
      if (phoneTextureRef.current) {
        phoneTextureRef.current.dispose();
        phoneTextureRef.current = null;
      }
      if (watchTextureRef.current) {
        watchTextureRef.current.dispose();
        watchTextureRef.current = null;
      }
      phoneCanvasRef.current = null;
      watchCanvasRef.current = null;
    };
  }, [phone, watch, drawPhoneScreen, drawWatchScreen]);
  
  // Track recording state and timer
  const timerRef = useRef(0);
  const lastTimeRef = useRef(0);

  // THROTTLE: Only update textures periodically
  const lastTextureUpdateRef = useRef(0);
  const TEXTURE_UPDATE_INTERVAL = 100; // 100ms for smooth typing animation

  // Constants - base rotation to show front screen (90° from model default)
  const basePhoneRotY = Math.PI / 2;

  // Get responsive device layout based on viewport size
  const deviceLayout = useResponsiveDeviceLayout();

  // Device positions (hero section only) - now responsive
  const phoneRightPos = deviceLayout.phone.position;
  const watchStartPos = deviceLayout.watch.position;
  const phoneBaseScale = deviceLayout.phone.scale;
  const watchBaseScale = deviceLayout.watch.scale;

  // Track time for ambient movement
  const ambientTimeRef = useRef(0);

  // Entrance animation state
  const entranceProgressRef = useRef(0);
  const entranceStartTimeRef = useRef<number | null>(null);
  const ENTRANCE_DURATION = 1.8; // 1.8 seconds for smooth flip-in animation

  // MERGED: Single useFrame hook for both texture updates and device animations
  useFrame((state, delta) => {
    const clockTime = state.clock.elapsedTime;
    const now = Date.now();
    const currentSection = globalState.currentSection;

    // Update ambient time for floating animation
    ambientTimeRef.current += delta;
    const time = ambientTimeRef.current;

    const mouseX = globalState.mouseX;
    const mouseY = globalState.mouseY;

    // Only show devices in hero section
    const isHeroSection = currentSection === 'hero';

    // Skip rendering when hero is off-screen and no active animations
    if (!isHeroSection && entranceProgressRef.current >= 1 &&
        !globalState.videoPlayerState.isHovering && !globalState.videoPlayerState.isPlaying &&
        !globalState.videoPlayerState.isAnimatingIn && !globalState.videoPlayerState.isAnimatingOut) return;
    state.invalidate();

    // Update timer for screen animation
    if (clockTime - lastTimeRef.current > 1) {
      timerRef.current += 1;
      lastTimeRef.current = clockTime;
    }

    // === TEXTURE UPDATES (throttled) - always show hero screen ===
    const timeElapsed = now - lastTextureUpdateRef.current > TEXTURE_UPDATE_INTERVAL;

    if (timeElapsed) {
      lastTextureUpdateRef.current = now;

      // Update phone screen (always hero screen)
      if (phoneCanvasRef.current && phoneTextureRef.current) {
        const ctx = phoneCanvasRef.current.getContext('2d');
        if (ctx) {
          drawPhoneScreen(ctx, phoneCanvasRef.current.width, phoneCanvasRef.current.height, true, timerRef.current);
          phoneTextureRef.current.needsUpdate = true;
        }
      }

      // Update watch screen (always hero screen)
      if (watchCanvasRef.current && watchTextureRef.current) {
        const ctx = watchCanvasRef.current.getContext('2d');
        if (ctx) {
          drawWatchScreen(ctx, watchCanvasRef.current.width, watchCanvasRef.current.height, true, timerRef.current);
          watchTextureRef.current.needsUpdate = true;
        }
      }
    }

    // === ENTRANCE ANIMATION ===
    if (entranceStartTimeRef.current === null) {
      entranceStartTimeRef.current = clockTime;
    }

    const entranceElapsed = clockTime - entranceStartTimeRef.current;
    entranceProgressRef.current = Math.min(1, entranceElapsed / ENTRANCE_DURATION);

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const entranceProgress = easeOutCubic(entranceProgressRef.current);

    // Ambient floating movement
    const ambientScale = entranceProgress;
    const ambientY = Math.sin(time * 0.8) * 0.015 * ambientScale;
    const ambientX = Math.cos(time * 0.6) * 0.008 * ambientScale;
    const ambientRotX = Math.sin(time * 0.5) * 0.02 * ambientScale;
    const ambientRotY = Math.cos(time * 0.7) * 0.02 * ambientScale;

    // Smooth mouse interpolation for hover effect
    const mouseLerpSpeed = 0.04;
    globalState.smoothMouseX += (mouseX - globalState.smoothMouseX) * mouseLerpSpeed;
    globalState.smoothMouseY += (mouseY - globalState.smoothMouseY) * mouseLerpSpeed;

    // Mouse influence for rotation (using smoothed values)
    const mX = (globalState.smoothMouseX - 0.5) * 0.35 * entranceProgress;
    const mY = globalState.smoothMouseY * 0.35 * entranceProgress;

    // Per-device drag influence - smooth interpolation
    const dragLerpSpeed = 0.1; // How fast to follow drag
    const dragReturnSpeed = 0.02; // Slower return for gentle fade back to position

    // Update per-device smooth drag values
    const isPhoneDragging = globalState.isDragging && globalState.draggedDevice === 'phone';
    const isWatchDragging = globalState.isDragging && globalState.draggedDevice === 'watch';

    if (isPhoneDragging) {
      globalState.phoneSmoothDragX += (globalState.dragDeltaX - globalState.phoneSmoothDragX) * dragLerpSpeed;
      globalState.phoneSmoothDragY += (globalState.dragDeltaY - globalState.phoneSmoothDragY) * dragLerpSpeed;
    } else {
      globalState.phoneSmoothDragX += (0 - globalState.phoneSmoothDragX) * dragReturnSpeed;
      globalState.phoneSmoothDragY += (0 - globalState.phoneSmoothDragY) * dragReturnSpeed;
    }

    if (isWatchDragging) {
      globalState.watchSmoothDragX += (globalState.dragDeltaX - globalState.watchSmoothDragX) * dragLerpSpeed;
      globalState.watchSmoothDragY += (globalState.dragDeltaY - globalState.watchSmoothDragY) * dragLerpSpeed;
    } else {
      globalState.watchSmoothDragX += (0 - globalState.watchSmoothDragX) * dragReturnSpeed;
      globalState.watchSmoothDragY += (0 - globalState.watchSmoothDragY) * dragReturnSpeed;
    }

    // Decay raw delta when not dragging
    if (!globalState.isDragging) {
      globalState.dragDeltaX *= 0.95;
      globalState.dragDeltaY *= 0.95;
    }

    // Phone drag influence - about half of mouse distance for translation
    const phoneDragPosX = globalState.phoneSmoothDragX * 0.55 * entranceProgress;
    const phoneDragPosY = -globalState.phoneSmoothDragY * 0.55 * entranceProgress;
    const phoneDragRotX = globalState.phoneSmoothDragY * 0.65 * entranceProgress;
    const phoneDragRotY = globalState.phoneSmoothDragX * 0.9 * entranceProgress;

    // === VIDEO PLAYER EXIT/RETURN ANIMATION ===
    const VIDEO_EXIT_DURATION = 0.8;  // Devices exit duration (smooth, matches entrance)
    const VIDEO_RETURN_DELAY = 0.5;   // Wait for video to exit before devices return
    const VIDEO_RETURN_DURATION = 1.0; // Devices return duration (matches entrance)
    const videoState = globalState.videoPlayerState;
    const videoActive = videoState.isHovering || videoState.isPlaying || videoState.isAnimatingIn;

    let videoExitProgress = 0;
    if (videoActive && !videoState.isAnimatingOut) {
      // Devices exiting (video is playing)
      const elapsed = (Date.now() - videoState.entryStartTime) / 1000;
      videoExitProgress = Math.min(1, elapsed / VIDEO_EXIT_DURATION);
      videoExitProgress = 1 - Math.pow(1 - videoExitProgress, 3); // ease-out cubic
    } else if (videoState.isAnimatingOut) {
      // Devices returning (video is exiting)
      const totalElapsed = (Date.now() - videoState.exitStartTime) / 1000;

      if (totalElapsed < VIDEO_RETURN_DELAY) {
        // Keep devices off-screen during delay while video exits
        videoExitProgress = 1;
      } else {
        // Animate devices back in with smooth ease-out (like entrance)
        const returnElapsed = totalElapsed - VIDEO_RETURN_DELAY;
        const returnProgress = Math.min(1, returnElapsed / VIDEO_RETURN_DURATION);
        const easedReturn = 1 - Math.pow(1 - returnProgress, 3); // ease-out cubic
        videoExitProgress = 1 - easedReturn;

        if (returnProgress >= 1) {
          globalState.videoPlayerState.isAnimatingOut = false;
        }
      }
    }

    // Exit offsets for video player - devices slide out to the right (like entrance in reverse)
    const phoneExitX = 1.5 * videoExitProgress;  // Exit right off screen
    const phoneExitRotY = -Math.PI * 0.3 * videoExitProgress;  // Rotate as they exit
    const watchExitX = 1.2 * videoExitProgress;  // Exit right off screen
    const watchExitRotY = Math.PI * 0.25 * videoExitProgress;  // Rotate as they exit

    // -- PHONE --
    if (phoneRef.current) {
      const phoneEntranceX = 1.2 * (1 - entranceProgress);
      const phoneEntranceRotY = -Math.PI * 0.3 * (1 - entranceProgress);

      phoneRef.current.position.x = phoneRightPos.x - mX * 0.08 + ambientX + phoneEntranceX + phoneExitX + phoneDragPosX;
      phoneRef.current.position.y = phoneRightPos.y - mY * 0.08 + ambientY + phoneDragPosY;
      phoneRef.current.position.z = phoneRightPos.z;
      phoneRef.current.scale.setScalar(phoneBaseScale);
      phoneRef.current.rotation.x = -mY * 0.4 + ambientRotX + phoneDragRotX;
      phoneRef.current.rotation.y = basePhoneRotY + mX * 0.4 + ambientRotY + phoneEntranceRotY + phoneExitRotY + phoneDragRotY;
      phoneRef.current.rotation.z = 0;

      // Only visible in hero section
      phoneRef.current.visible = isHeroSection;
    }

    // -- WATCH --
    if (watchRef.current) {
      const watchEntranceDelay = 0.25;
      const watchEntranceDuration = ENTRANCE_DURATION - watchEntranceDelay;
      const safeWatchDuration = Math.max(0.1, watchEntranceDuration);
      const watchEntranceRaw = Math.max(0, Math.min(10, (entranceElapsed - watchEntranceDelay) / safeWatchDuration));
      const watchEntranceProgress = easeOutCubic(Math.min(1, watchEntranceRaw));

      const watchEntranceX = 1.0 * (1 - watchEntranceProgress);
      const watchEntranceRotY = Math.PI * 0.25 * (1 - watchEntranceProgress);

      const watchAmbientY = Math.sin(time * 0.9 + 2) * 0.012 * watchEntranceProgress;
      const watchAmbientX = Math.cos(time * 0.7 + 2) * 0.006 * watchEntranceProgress;
      const watchAmbientRotX = Math.sin(time * 0.6 + 1) * 0.025 * watchEntranceProgress;
      const watchAmbientRotY = Math.cos(time * 0.8 + 1) * 0.025 * watchEntranceProgress;

      const wMouseX = (globalState.smoothMouseX - 0.5) * 0.4 * watchEntranceProgress;
      const wMouseY = globalState.smoothMouseY * 0.4 * watchEntranceProgress;

      // Watch-specific drag influence - about half of mouse distance for translation
      const watchDragScale = watchEntranceProgress;
      const watchDragPosX = globalState.watchSmoothDragX * 0.55 * watchDragScale;
      const watchDragPosY = -globalState.watchSmoothDragY * 0.55 * watchDragScale;
      const watchDragRotX = globalState.watchSmoothDragY * 0.65 * watchDragScale;
      const watchDragRotY = globalState.watchSmoothDragX * 0.9 * watchDragScale;

      watchRef.current.position.x = watchStartPos.x - wMouseX * 0.08 + watchAmbientX + watchEntranceX + watchExitX + watchDragPosX;
      watchRef.current.position.y = watchStartPos.y - wMouseY * 0.08 + watchAmbientY + watchDragPosY;
      watchRef.current.position.z = watchStartPos.z;
      watchRef.current.scale.setScalar(watchBaseScale);
      watchRef.current.rotation.x = -wMouseY * 0.6 + watchAmbientRotX + watchDragRotX;
      watchRef.current.rotation.y = wMouseX * 0.6 + watchAmbientRotY + watchEntranceRotY + watchExitRotY + watchDragRotY;
      watchRef.current.rotation.z = 0;

      // Only visible in hero section
      watchRef.current.visible = isHeroSection;
    }
  });

  return (
    <>
      <group
        ref={phoneRef}
        scale={phoneBaseScale}
        position={[phoneRightPos.x, phoneRightPos.y, phoneRightPos.z]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <primitive object={phone.scene} />
      </group>

      <group
        ref={watchRef}
        scale={watchBaseScale}
        position={[watchStartPos.x, watchStartPos.y, watchStartPos.z]}
      >
        <primitive object={watch.scene} />
      </group>

      {/* 3D Video Player - flies in on click */}
      <VideoPlane3D />

      {/* Phone screen click detection */}
      <PhoneScreenInteraction phoneScreenMeshRef={phoneScreenMeshRef} />
      <WatchScreenInteraction watchScreenMeshRef={watchScreenMeshRef} />

      {/* Device-specific drag detection */}
      <DeviceDragDetection />
    </>
  );
}

// Combined Device Scene
export const DeviceScene: React.FC = () => {
  // Set up window scroll and mouse listeners with RAF throttling
  useEffect(() => {
    let scrollRAF: number | null = null;
    let mouseRAF: number | null = null;

    const handleScroll = () => {
      // Skip if already scheduled
      if (scrollRAF) return;
      scrollRAF = requestAnimationFrame(() => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        globalState.scrollProgress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
        scrollRAF = null;
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Skip if already scheduled
      if (mouseRAF) return;
      mouseRAF = requestAnimationFrame(() => {
        // Normalize to -1 to 1 range
        globalState.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        globalState.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

        // Update drag delta if dragging
        if (globalState.isDragging) {
          globalState.dragDeltaX = (e.clientX - globalState.dragStartX) / window.innerWidth;
          globalState.dragDeltaY = (e.clientY - globalState.dragStartY) / window.innerHeight;
        }
        mouseRAF = null;
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      globalState.isDragging = true;
      globalState.dragStartX = e.clientX;
      globalState.dragStartY = e.clientY;
      globalState.dragDeltaX = 0;
      globalState.dragDeltaY = 0;
    };

    const handleMouseUp = () => {
      globalState.isDragging = false;
      // Don't reset dragDelta here - let it smoothly animate back to 0 in useFrame
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Initial scroll position
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      // Cancel any pending RAF
      if (scrollRAF) cancelAnimationFrame(scrollRAF);
      if (mouseRAF) cancelAnimationFrame(mouseRAF);
    };
  }, []);

  return (
    <Canvas
      frameloop="demand"
      camera={{ position: [0, 0, 1.8], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent', width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      {/* Lighting for glossy materials */}
      <ambientLight intensity={2} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <directionalLight position={[-5, 5, 5]} intensity={1.5} />
      <directionalLight position={[0, 0, 5]} intensity={1.5} />

      <Suspense fallback={null}>
        <ResponsiveCamera />
        <SceneContent />
        <Environment preset="studio" />
      </Suspense>
    </Canvas>
  );
};

// Model preloading removed - load on-demand for faster initial page load
// useGLTF.preload('/3d_models/iphone_16_pro_max.glb');
// useGLTF.preload('/3d_models/Apple Watch 8 Ultra.glb');
