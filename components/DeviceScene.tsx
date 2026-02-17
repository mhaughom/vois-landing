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
  setCardVerification,
  CHAT_SUGGESTED_PROMPTS,
} from './deviceState';
import type { PhoneScreen } from './deviceState';
export type { SectionId, DemoState, DemoDevice, PhoneScreen } from './deviceState';
export {
  setCurrentSection,
  setOnChatOpen,
  setOnChatMessageSent,
  setNarrativeScrollProgress,
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
  setOnCardVerified,
  setCardVerification,
  getCardVerifications,
  resetCardVerifications,
  areAllCardsVerified,
} from './deviceState';

import {
  type TranscriptSegment,
  type ExtractedItem,
  type Scenario,
  allCategoryConfigs,
  scenarios,
  RECORDING_START_TIME,
  SINGLE_SCENARIO_DURATION,
  TOTAL_ANIMATION_DURATION,
  TYPING_SPEED,
} from '../lib/scenarios';
import {
  CATEGORY_CARD_COLORS,
  CATEGORY_HIGHLIGHT_COLORS,
  DEFAULT_CARD_COLOR,
  DEFAULT_HIGHLIGHT,
} from '../lib/categoryColors';

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
          position: new THREE.Vector3(0.1, 0.05, 0),
          scale: 0.76,
        },
        watch: {
          position: new THREE.Vector3(-0.3, -0.55, 0.3),
          scale: 0.24,
        },
      };
    } else if (isTablet) {
      // Tablet: Slightly offset, medium scale
      return {
        phone: {
          position: new THREE.Vector3(0.25, -0.02, -0.1),
          scale: 0.90,
        },
        watch: {
          position: new THREE.Vector3(-0.1, -0.48, 0.35),
          scale: 0.28,
        },
      };
    } else if (isSmallDesktop) {
      // Small desktop: Closer to final but not quite
      return {
        phone: {
          position: new THREE.Vector3(0.5, -0.03, -0.15),
          scale: 1.0,
        },
        watch: {
          position: new THREE.Vector3(0.1, -0.45, 0.38),
          scale: 0.30,
        },
      };
    } else {
      // Large desktop: Full spread
      return {
        phone: {
          position: new THREE.Vector3(0.6, -0.05, -0.2),
          scale: 1.1,
        },
        watch: {
          position: new THREE.Vector3(0.15, -0.44, 0.4),
          scale: 0.34,
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
// Floating pill nav: 60% width centered (x 0.20–0.80), y ~0.895–0.945
// Stream cards start at y=0.27, each card is height 0.145, gap 0.012
const phoneClickableRegions: ClickableRegion[] = [
  // Bottom floating pill navigation (3 buttons: magic, stream, apps)
  { id: 'nav-magic', screen: 'magic', label: 'Magic', uv: { minX: 0.20, maxX: 0.40, minY: 0.89, maxY: 0.95 } },
  { id: 'nav-stream', screen: 'stream', label: 'Stream', uv: { minX: 0.40, maxX: 0.60, minY: 0.89, maxY: 0.95 } },
  { id: 'nav-apps', screen: 'apps', label: 'Apps', uv: { minX: 0.60, maxX: 0.80, minY: 0.89, maxY: 0.95 } },
  // Back button (top-left corner, canvas y = 0.06 to 0.11)
  { id: 'back', screen: 'stream', label: 'Back', uv: { minX: 0.02, maxX: 0.35, minY: 0.04, maxY: 0.12 } },
  // Big record button (center of screen, only shown in waiting-to-start mode)
  { id: 'record-phone', screen: 'stream', label: 'Record', uv: { minX: 0.25, maxX: 0.75, minY: 0.35, maxY: 0.65 } },
  // Stream card clicks (4 cards - takes user to voicenote view)
  { id: 'stream-card-1', screen: 'voicenote', label: 'Card 1', uv: { minX: 0.05, maxX: 0.95, minY: 0.27, maxY: 0.41 } },
  { id: 'stream-card-2', screen: 'voicenote', label: 'Card 2', uv: { minX: 0.05, maxX: 0.95, minY: 0.43, maxY: 0.57 } },
  { id: 'stream-card-3', screen: 'voicenote', label: 'Card 3', uv: { minX: 0.05, maxX: 0.95, minY: 0.59, maxY: 0.73 } },
  { id: 'stream-card-4', screen: 'voicenote', label: 'Card 4', uv: { minX: 0.05, maxX: 0.95, minY: 0.74, maxY: 0.87 } },
  // Apps grid clicks (4-column, 2 rows below greeting card)
  // Row 1: y ~0.44-0.62
  { id: 'app-calendar', screen: 'app-calendar', label: 'Calendar', uv: { minX: 0.03, maxX: 0.23, minY: 0.44, maxY: 0.62 } },
  { id: 'app-todo', screen: 'app-todo', label: 'To Do List', uv: { minX: 0.24, maxX: 0.47, minY: 0.44, maxY: 0.62 } },
  { id: 'app-messages', screen: 'app-messages', label: 'Messages', uv: { minX: 0.48, maxX: 0.71, minY: 0.44, maxY: 0.62 } },
  { id: 'app-people', screen: 'app-people', label: 'People Dir.', uv: { minX: 0.72, maxX: 0.97, minY: 0.44, maxY: 0.62 } },
  // Row 2: y ~0.64-0.82
  { id: 'app-journal', screen: 'app-journal', label: 'Journal', uv: { minX: 0.03, maxX: 0.23, minY: 0.64, maxY: 0.82 } },
  { id: 'app-shopping', screen: 'app-shopping', label: 'Shopping', uv: { minX: 0.24, maxX: 0.47, minY: 0.64, maxY: 0.82 } },
  { id: 'app-meeting-notes', screen: 'app-meeting-notes', label: 'Period Tracker', uv: { minX: 0.48, maxX: 0.71, minY: 0.64, maxY: 0.82 } },
  // Chat suggested prompts (5 prompts, each 0.065 height + 0.015 gap, starting at 0.16)
  // contentStartY=0.12, promptStartY=0.12+0.04=0.16, each prompt stride=0.08
  { id: 'chat-prompt-0', screen: 'magic', label: 'Prompt 1', uv: { minX: 0.05, maxX: 0.95, minY: 0.16, maxY: 0.225 } },
  { id: 'chat-prompt-1', screen: 'magic', label: 'Prompt 2', uv: { minX: 0.05, maxX: 0.95, minY: 0.24, maxY: 0.305 } },
  { id: 'chat-prompt-2', screen: 'magic', label: 'Prompt 3', uv: { minX: 0.05, maxX: 0.95, minY: 0.32, maxY: 0.385 } },
  { id: 'chat-prompt-3', screen: 'magic', label: 'Prompt 4', uv: { minX: 0.05, maxX: 0.95, minY: 0.40, maxY: 0.465 } },
  { id: 'chat-prompt-4', screen: 'magic', label: 'Prompt 5', uv: { minX: 0.05, maxX: 0.95, minY: 0.48, maxY: 0.545 } },
  // Chat input field (floating, slightly inset)
  { id: 'chat-input', screen: 'magic', label: 'Input', uv: { minX: 0.06, maxX: 0.80, minY: 0.82, maxY: 0.89 } },
  // Chat send button
  { id: 'chat-send', screen: 'magic', label: 'Send', uv: { minX: 0.82, maxX: 0.95, minY: 0.82, maxY: 0.89 } },
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

  // Dynamic card verify/decline button detection (demo results on stream screen)
  const demoItems = demoState.items;
  const hasDemoResults = demoItems.length > 0 && demoState.transcript.length > 0;
  if (hasDemoResults && currentScreen === 'stream') {
    // Card layout constants matching the draw code (canvas 512x1024)
    const W = 512, H = 1024;
    const panelMargin = W * 0.045;
    const panelPadding = W * 0.045;
    const cardsPanelY = H * 0.52;
    const cardInnerPadding = panelPadding * 0.8;
    const cardStartY = cardsPanelY + cardInnerPadding;
    const cardH = H * 0.095;
    const cardGap = H * 0.012;
    const cardsPanelW = W - panelMargin * 2;
    const cardW = cardsPanelW - cardInnerPadding * 2;
    const cardStartX = panelMargin + cardInnerPadding;
    const btnSize = H * 0.024;
    const btnX = cardStartX + cardW - btnSize * 1.2;

    for (let i = 0; i < demoItems.length; i++) {
      // Skip already verified/declined cards
      if (i in globalState.cardVerifications) continue;

      const thisCardY = cardStartY + i * (cardH + cardGap);
      const checkBtnY = thisCardY + cardH * 0.32;
      const xBtnY = thisCardY + cardH * 0.68;

      // Convert to UV (0-1)
      const btnXuv = btnX / W;
      const hitHalfW = 0.06; // generous tap target
      const hitHalfH = 0.025;

      // Check verify button
      const checkUvY = checkBtnY / H;
      if (uvX >= btnXuv - hitHalfW && uvX <= btnXuv + hitHalfW &&
          uvY >= checkUvY - hitHalfH && uvY <= checkUvY + hitHalfH) {
        return { id: `card-verify-${i}`, screen: 'stream' as PhoneScreen, label: `Verify Card ${i}`, uv: { minX: 0, maxX: 1, minY: 0, maxY: 1 } };
      }

      // Check decline button
      const xUvY = xBtnY / H;
      if (uvX >= btnXuv - hitHalfW && uvX <= btnXuv + hitHalfW &&
          uvY >= xUvY - hitHalfH && uvY <= xUvY + hitHalfH) {
        return { id: `card-decline-${i}`, screen: 'stream' as PhoneScreen, label: `Decline Card ${i}`, uv: { minX: 0, maxX: 1, minY: 0, maxY: 1 } };
      }
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
          // Trigger touch ripple at tap location
          globalState.phoneTouchRipple = { x: hit.uv.x, y: hit.uv.y, startTime: Date.now() };

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
            } else if (hitButton.id.startsWith('card-verify-')) {
              const cardIdx = parseInt(hitButton.id.replace('card-verify-', ''));
              setCardVerification(cardIdx, 'verified');
            } else if (hitButton.id.startsWith('card-decline-')) {
              const cardIdx = parseInt(hitButton.id.replace('card-decline-', ''));
              setCardVerification(cardIdx, 'declined');
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
          globalState.phoneHoverUV = { x: hit.uv.x, y: hit.uv.y };
          const currentScreen = globalState.phoneScreenState.currentScreen;
          // UV coordinates already match canvas orientation (y=0 at top)
          const hitButton = getHitButton(hit.uv.x, hit.uv.y, currentScreen);
          setPhoneHoveredButton(hitButton?.id || null);
        }
      } else {
        globalState.phoneHoverUV = null;
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
        const watchHit = intersects[0];
        let clickX = 0.5, clickY = 0.5;
        if (watchHit.uv) {
          const m = globalState.watchUVMapping;
          if (m) {
            clickX = watchHit.uv.x * m.repeatX + m.offsetX;
            clickY = watchHit.uv.y * m.repeatY + m.offsetY;
          } else {
            clickX = watchHit.uv.x;
            clickY = watchHit.uv.y;
          }
        }

        // Check if click is within the VOIS logo area
        // - When waiting to start (Try Demo): centered at (0.5, 0.48)
        // - When idle (default watch face): bottom-left complication at (0.24, 0.83)
        // - When recording on watch: accept clicks anywhere (to stop)
        let isWithinLogoArea = false;
        if (isRecordingOnWatch) {
          // When recording, accept clicks anywhere on the watch screen
          isWithinLogoArea = true;
        } else {
          let targetX: number, targetY: number, radius: number;
          if (demoState.isWaitingToStart) {
            // "Try Demo" mode - logo is centered
            targetX = 0.5;
            targetY = 0.48;
            radius = 0.15;
          } else {
            // Default watch face - logo is in bottom-left complication
            targetX = 0.24;
            targetY = 0.83;
            radius = 0.12;
          }

          const dx = clickX - targetX;
          const dy = clickY - targetY;
          isWithinLogoArea = (dx * dx + dy * dy) < radius * radius;
        }

        if (isWithinLogoArea) {
          // Trigger touch ripple at the click position
          globalState.watchTouchRipple = { x: clickX, y: clickY, startTime: Date.now() };

          if (isRecordingOnWatch && callbacks.onStopRecordClick) {
            // Stop recording when watch is clicked during recording
            callbacks.onStopRecordClick();
          } else if (watchIsIdle && callbacks.onWatchRecordClick) {
            // Start recording on watch
            setDemoActiveDevice('watch');
            callbacks.onWatchRecordClick();
          }
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

      if (intersects.length > 0) {
        const watchHit = intersects[0];
        let hoverX = 0.5, hoverY = 0.5;
        if (watchHit.uv) {
          const m = globalState.watchUVMapping;
          if (m) {
            hoverX = watchHit.uv.x * m.repeatX + m.offsetX;
            hoverY = watchHit.uv.y * m.repeatY + m.offsetY;
          } else {
            hoverX = watchHit.uv.x;
            hoverY = watchHit.uv.y;
          }
        }
        globalState.watchHoverUV = { x: hoverX, y: hoverY };

        // Check different positions based on watch state
        // - When waiting to start (Try Demo): centered at (0.5, 0.48)
        // - When idle (default watch face): bottom-left complication at (0.24, 0.83)
        let targetX: number, targetY: number, radius: number;
        if (globalState.demoState.isWaitingToStart) {
          // "Try Demo" mode - logo is centered
          targetX = 0.5;
          targetY = 0.48;
          radius = 0.15; // Larger radius for centered logo
        } else {
          // Default watch face - logo is in bottom-left complication
          targetX = 0.24;
          targetY = 0.83;
          radius = 0.12;
        }

        const dx = hoverX - targetX;
        const dy = hoverY - targetY;
        globalState.watchHoveredRecord = (dx * dx + dy * dy) < radius * radius;
      } else {
        globalState.watchHoverUV = null;
        globalState.watchHoveredRecord = false;
      }
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
      let hitDevice: 'phone' | 'watch' | null = null;
      let closestDistance = Infinity;

      // Check phone and watch for dragging
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
  const drawPhoneScreen = useCallback((ctx: CanvasRenderingContext2D, width: number, height: height, _isRecording: boolean, _timer: number) => {
    const now = Date.now();
    const demoState = globalState.demoState;
    // isDemoMode not needed anymore - we always show results directly with streaming
    const isDemoMode = false;
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
      // Floating pill nav bar
      const pillW = width * 0.60;
      const pillH = height * 0.055;
      const pillX = (width - pillW) / 2;
      const pillY = height * 0.92 - pillH / 2;
      const pillR = pillH / 2; // full pill radius

      // Drop shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.10)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      roundRect(ctx, pillX, pillY, pillW, pillH, pillR);
      ctx.fill();
      ctx.restore();

      // Subtle border
      ctx.strokeStyle = 'rgba(0,0,0,0.06)';
      ctx.lineWidth = 0.5;
      roundRect(ctx, pillX, pillY, pillW, pillH, pillR);
      ctx.stroke();

      // Navigation buttons (3 tabs) - Magic (sparkles), Stream (mic), Apps (grid)
      const tabs: { id: PhoneScreen; label: string; iconType: string }[] = [
        { id: 'magic', label: 'Magic', iconType: 'magic' },
        { id: 'stream', label: 'Stream', iconType: 'stream' },
        { id: 'apps', label: 'Apps', iconType: 'apps' },
      ];

      const tabWidth = pillW / tabs.length;
      const iconY = pillY + pillH / 2;

      tabs.forEach((tab, i) => {
        const tabX = pillX + tabWidth * i + tabWidth / 2;
        let isActive = activeTab === tab.id;
        if (tab.id === 'apps' && activeTab.startsWith('app-')) isActive = true;
        if (tab.id === 'stream' && activeTab === 'voicenote') isActive = true;
        const isHovered = hoveredButton === `nav-${tab.id}`;

        const color = isActive ? '#1a1a1a' : (isHovered ? '#64748b' : '#9ca3af');

        drawIcon(tab.iconType, tabX, iconY, height * 0.035, color);
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

      // Right-side indicators: signal, wifi, battery (smaller, well-spaced)
      const indicatorY = height * 0.036;
      const iconColor = '#1a1a1a';
      let rightX = width - padding - width * 0.03;

      // Battery indicator (rightmost) — compact
      const battW = width * 0.048;
      const battH = height * 0.014;
      const battX = rightX - battW;
      const battY = indicatorY - battH / 2;
      ctx.strokeStyle = iconColor;
      ctx.lineWidth = 1;
      roundRect(ctx, battX, battY, battW, battH, 2);
      ctx.stroke();
      // Battery nub
      ctx.fillStyle = iconColor;
      ctx.fillRect(battX + battW + 1, indicatorY - battH * 0.3, 1.5, battH * 0.6);
      // Battery fill (~80%)
      ctx.fillStyle = iconColor;
      roundRect(ctx, battX + 1.5, battY + 1.5, (battW - 3) * 0.8, battH - 3, 1);
      ctx.fill();

      rightX = battX - width * 0.04;

      // Wi-Fi icon (3 arcs) — smaller
      const wifiX = rightX;
      const wifiBaseY = indicatorY + height * 0.004;
      ctx.strokeStyle = iconColor;
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const r = (i + 1) * height * 0.006;
        ctx.beginPath();
        ctx.arc(wifiX, wifiBaseY, r, -Math.PI * 0.75, -Math.PI * 0.25);
        ctx.stroke();
      }
      // Wi-Fi dot
      ctx.fillStyle = iconColor;
      ctx.beginPath();
      ctx.arc(wifiX, wifiBaseY, 1, 0, Math.PI * 2);
      ctx.fill();

      rightX = wifiX - width * 0.055;

      // Signal bars (4 bars) — smaller
      const barCount = 4;
      const barWidth = width * 0.006;
      const barGap = width * 0.004;
      const maxBarH = height * 0.015;
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
    // Skip lockscreen if demo has results to show (regardless of which device is recording)
    const phoneHasDemoResults = demoState.transcript && demoState.transcript.length > 0;
    if (phoneScreen === 'lockscreen' && !phoneHasDemoResults) {
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

        // Subtle pulse animation when waiting
        const lockPulse = demoState.isWaitingToStart ? 1 + Math.sin(now / 600) * 0.04 : 1;

        // Simple hover scale (immediate, responsive) - only when waiting
        const hoverScale = isVoisHovered ? 1.15 : 1;
        const finalSize = voisLogoSize * hoverScale * lockPulse;

        // Background circle - red glow on hover, subtle white normally
        if (isVoisHovered) {
          // Red glow behind on hover
          ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
          ctx.beginPath();
          ctx.arc(width / 2, voisLogoY, finalSize * 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = isVoisHovered ? 'rgba(239, 68, 68, 0.7)' : 'rgba(255, 255, 255, 0.12)';
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

      // Stream title (centered, below dynamic island)
      const headerY = height * 0.085;
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `700 ${height * 0.038}px -apple-system`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Stream', width / 2, headerY);

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
        items: { type: string; content: string; rawText?: string; icon: string }[];
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
            { type: 'task', content: 'Call mom about birthday dinner', rawText: 'call mom about her birthday dinner', icon: '✓' },
            { type: 'task', content: 'Pick up groceries', rawText: 'pick up groceries', icon: '✓' },
            { type: 'task', content: 'Finish quarterly report', rawText: 'finish the quarterly report', icon: '✓' },
            { type: 'event', content: 'Meeting at 3pm', rawText: 'the meeting at 3pm', icon: '📅' }
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
            { type: 'idea', content: 'Family sharing feature for notes', rawText: 'share their notes with family members', icon: '💡' },
            { type: 'idea', content: 'Shared grocery list with auto-sync', rawText: 'a shared grocery list that syncs automatically', icon: '💡' }
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
            { type: 'event', content: 'Dinner at Italian restaurant - Saturday 7pm', rawText: 'going to that new Italian place on Saturday night', icon: '📅' },
            { type: 'task', content: 'Make restaurant reservation', rawText: 'make a reservation for 7pm', icon: '✓' },
            { type: 'event', content: 'Brunch with Johnsons - Sunday 11am', rawText: 'brunch with the Johnsons at 11', icon: '📅' }
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
            { type: 'reminder', content: 'Take vitamins every morning', rawText: 'take vitamins every morning', icon: '🔔' },
            { type: 'reminder', content: 'Drink more water', rawText: 'drink more water throughout the day', icon: '🔔' },
            { type: 'task', content: 'Schedule dentist appointment', rawText: 'schedule that dentist appointment', icon: '✓' }
          ],
          tags: [{ iconType: 'messages', label: 'Reminders', color: '#8b5cf6' }]
        },
      ];

      // If demo has results, add them as the first card
      if (demoState.transcript && demoState.transcript.length > 0) {
        const demoTags: { iconType: string; label: string; color: string }[] = [];
        const demoItems = (demoState.items || []).map(item => ({
          type: item.type,
          content: item.content,
          rawText: item.rawText || item.content, // Preserve rawText for proper highlighting
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
      ctx.font = `700 ${height * 0.035}px -apple-system`;
      ctx.textAlign = 'center';
      ctx.fillText('Chat with your voice memos', width / 2, height * 0.085);

      // Content area dimensions
      const contentStartY = height * 0.12;
      const inputAreaY = height * 0.82;
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
        // Suggested prompts (no intro text — directly below header)
        const promptStartY = contentStartY + height * 0.04;
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

      // Floating input field (above nav pill, with shadow)
      const inputH = height * 0.07;
      const inputDisabled = isLoading || isLimitReached;
      const isInputHovered = hoveredButton === 'chat-input';
      const isInputFocused = chatState.isInputFocused;
      const inputMargin = panelMargin + width * 0.01;
      const inputW = width - inputMargin * 2 - height * 0.08;

      // Drop shadow for floating effect
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.08)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = inputDisabled ? '#e2e8f0' : (isInputFocused ? '#ffffff' : (isInputHovered ? '#f8fafc' : '#ffffff'));
      roundRect(ctx, inputMargin, inputAreaY, inputW, inputH, 22);
      ctx.fill();
      ctx.restore();

      // Subtle border
      ctx.strokeStyle = isInputFocused && !inputDisabled ? '#3b82f6' : 'rgba(0,0,0,0.06)';
      ctx.lineWidth = isInputFocused && !inputDisabled ? 2 : 0.5;
      roundRect(ctx, inputMargin, inputAreaY, inputW, inputH, 22);
      ctx.stroke();

      // Input placeholder or text
      const hasText = chatState.inputText.length > 0;
      ctx.fillStyle = inputDisabled ? '#9ca3af' : (hasText ? '#1a1a1a' : '#64748b');
      ctx.font = `400 ${height * 0.02}px -apple-system`;
      ctx.textAlign = 'left';
      const displayText = hasText ? chatState.inputText : (inputDisabled ? 'Chat disabled' : 'Ask anything...');
      ctx.fillText(displayText, inputMargin + panelPadding, inputAreaY + inputH / 2 + height * 0.006);

      // Blinking cursor when focused
      if (isInputFocused && !inputDisabled) {
        const cursorBlink = Math.floor(Date.now() / 500) % 2 === 0;
        if (cursorBlink) {
          const textWidth = ctx.measureText(chatState.inputText).width;
          const cursorX = inputMargin + panelPadding + textWidth + 2;
          ctx.fillStyle = '#1a1a1a';
          ctx.fillRect(cursorX, inputAreaY + inputH * 0.25, 2, inputH * 0.5);
        }
      }

      // Send button
      const sendBtnSize = height * 0.06;
      const sendBtnX = width - inputMargin - sendBtnSize;
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

    // === APPS SCREEN (greeting card + 4-column grid, iOS-style) ===
    if (phoneScreen === 'apps' && !isDemoMode && !demoState.isWaitingToStart) {
      drawStatusBar();

      // "Apps" header (centered, bold)
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `700 ${height * 0.035}px -apple-system`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Apps', width / 2, height * 0.085);

      // ── Greeting card ──
      const cardX = panelMargin;
      const cardY = height * 0.115;
      const cardW = width - panelMargin * 2;
      const cardH = height * 0.30;
      const cardR = 18;

      // Card shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.08)';
      ctx.shadowBlur = 22;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, cardX, cardY, cardW, cardH, cardR);
      ctx.fill();
      ctx.restore();

      // Card border
      ctx.strokeStyle = 'rgba(0,0,0,0.04)';
      ctx.lineWidth = 0.5;
      roundRect(ctx, cardX, cardY, cardW, cardH, cardR);
      ctx.stroke();

      // Greeting text
      const cardPad = width * 0.05;
      const greetHour = new Date().getHours();
      const greetWord = greetHour < 12 ? 'morning' : greetHour < 17 ? 'afternoon' : 'evening';
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `700 ${height * 0.028}px -apple-system`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`Good ${greetWord}, Alex`, cardX + cardPad, cardY + cardPad);

      // Date
      const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      ctx.fillStyle = '#94a3b8';
      ctx.font = `400 ${height * 0.017}px -apple-system`;
      ctx.fillText(dateStr, cardX + cardPad, cardY + cardPad + height * 0.035);

      // Sparkle emoji
      ctx.fillStyle = '#6366f1';
      ctx.font = `400 ${height * 0.02}px -apple-system`;
      ctx.fillText('✨', cardX + cardPad, cardY + cardPad + height * 0.065);

      // AI summary text (wrapped)
      ctx.fillStyle = '#64748b';
      ctx.font = `400 ${height * 0.017}px -apple-system`;
      const summaryLines = [
        "Great job staying on top of your tasks",
        "this week! Consider using this time to",
        "review your goals and plan ahead for",
        "the upcoming week."
      ];
      summaryLines.forEach((line, i) => {
        ctx.fillText(line, cardX + cardPad, cardY + cardPad + height * 0.09 + i * height * 0.024);
      });

      // Pagination dots (3 dots)
      const dotY = cardY + cardH - height * 0.02;
      const dotR = 3;
      const dotGap = 10;
      for (let d = 0; d < 3; d++) {
        ctx.fillStyle = d === 0 ? '#1a1a1a' : '#d1d5db';
        ctx.beginPath();
        ctx.arc(width / 2 + (d - 1) * dotGap, dotY, dotR, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── App grid (4 columns, 2 rows) ──
      const cols = 4;
      const gridStartY = cardY + cardH + height * 0.025;
      const iconBoxSize = width * 0.16;
      const gridLeftPad = width * 0.05;
      const totalGridW = width - gridLeftPad * 2;
      const colGap = (totalGridW - iconBoxSize * cols) / (cols - 1);
      const labelHeight = height * 0.025;
      const cellHeight = iconBoxSize + labelHeight;
      const rowGap = height * 0.015;
      const iconRadius = iconBoxSize * 0.26;

      const apps = [
        // Row 1
        { id: 'calendar', iconType: 'calendar', label: 'Calendar', bg: '#dbeafe', iconColor: '#2563eb' },
        { id: 'todo', iconType: 'todo', label: 'To-do List', bg: '#dcfce7', iconColor: '#16a34a' },
        { id: 'messages', iconType: 'messages', label: 'Messages', bg: '#e0e7ff', iconColor: '#3b82f6' },
        { id: 'people', iconType: 'people', label: 'People Dir...', bg: '#e0f2fe', iconColor: '#0891b2' },
        // Row 2
        { id: 'journal', iconType: 'journal', label: 'Journal', bg: '#fef3c7', iconColor: '#d97706' },
        { id: 'shopping', iconType: 'shopping', label: 'Shopping', bg: '#ffedd5', iconColor: '#ea580c' },
        { id: 'meeting-notes', iconType: 'meeting-notes', label: 'Period Trac...', bg: '#fce7f3', iconColor: '#db2777' },
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
        const iconDrawSize = iconBoxSize * 0.42;
        drawIcon(app.iconType, bx + iconBoxSize / 2, by + iconBoxSize / 2, iconDrawSize, app.iconColor);

        // Label below icon
        ctx.fillStyle = '#64748b';
        ctx.font = `500 ${height * 0.013}px -apple-system`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(app.label, bx + iconBoxSize / 2, by + iconBoxSize + height * 0.004);
      });

      drawBottomNav('apps');
      return;
    }

    // Helper to draw a liquid-glass event/calendar card
    // Helper to draw small pill-shaped tags on event cards
    const drawEventTags = (ctx: CanvasRenderingContext2D, x: number, y: number, content: string, h: number, isDimmed?: boolean) => {
      // Parse a date string from content (e.g. "January 1st", "Saturday 7pm")
      const dateMatch = content.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?/i)
        || content.match(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/i);
      const timeMatch = content.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM))/i);

      const dateStr = dateMatch ? dateMatch[0] : null;
      const timeStr = timeMatch ? timeMatch[1] : null;

      const tags: string[] = [];
      if (dateStr) tags.push(dateStr);
      tags.push(timeStr ? timeStr : 'Full day');

      const tagFont = `500 ${h * 0.12}px -apple-system`;
      const tagH = h * 0.19;
      const tagR = tagH / 2;
      const tagGap = 6;
      let tagX = x;

      ctx.font = tagFont;
      for (const tag of tags) {
        const tw = ctx.measureText(tag).width;
        const tagW = tw + tagH * 0.9;

        // Pill background
        ctx.fillStyle = isDimmed ? 'rgba(148, 163, 184, 0.15)' : 'rgba(96, 165, 250, 0.12)';
        roundRect(ctx, tagX, y, tagW, tagH, tagR);
        ctx.fill();

        // Pill text
        ctx.fillStyle = isDimmed ? '#94a3b8' : '#3b82f6';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(tag, tagX + tagH * 0.45, y + tagH / 2);

        tagX += tagW + tagGap;
      }
    };

    // Helper to draw a glass-style card background (Apple liquid glass feel)
    const drawGlassCardBg = (
      ctx: CanvasRenderingContext2D,
      x: number, y: number, w: number, h: number, r: number,
      colors: { bg: string; accent: string; text: string }
    ) => {
      ctx.save();

      // Soft shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.09)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 6;

      // Glass gradient background — tinted with the category color
      const bg = ctx.createLinearGradient(x, y, x + w * 0.3, y + h);
      bg.addColorStop(0, colors.bg);
      bg.addColorStop(1, 'rgba(255, 255, 255, 0.85)');
      ctx.fillStyle = bg;
      roundRect(ctx, x, y, w, h, r);
      ctx.fill();

      // Clear shadow for remaining draws
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Thin white glass border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 1;
      roundRect(ctx, x + 0.5, y + 0.5, w - 1, h - 1, r);
      ctx.stroke();

      // Glossy specular highlight across top portion
      ctx.save();
      roundRect(ctx, x, y, w, h, r);
      ctx.clip();
      const gloss = ctx.createLinearGradient(x, y, x, y + h * 0.5);
      gloss.addColorStop(0, 'rgba(255, 255, 255, 0.40)');
      gloss.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
      gloss.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gloss;
      ctx.fillRect(x, y, w, h * 0.5);
      ctx.restore();

      ctx.restore();
    };

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

      // Category colors for highlighting — unified from lib/categoryColors
      const categoryHighlights = CATEGORY_HIGHLIGHT_COLORS;

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

      // Build phrase-based highlights (same algorithm as streaming demo)
      const buildHighlights = () => {
        const transcriptLower = transcript.toLowerCase();
        const highlights: { start: number; end: number; color: string }[] = [];

        for (const item of cardItems) {
          const rawText = (item.rawText || item.content || '').toLowerCase();

          // Try 1: Exact match
          let idx = transcriptLower.indexOf(rawText);
          if (idx !== -1) {
            highlights.push({
              start: idx,
              end: idx + rawText.length,
              color: categoryHighlights[item.type?.toLowerCase()] || categoryHighlights.note
            });
            continue;
          }

          // Try 2: Progressive partial match with extension
          const coreWords = rawText.trim().split(/\s+/);
          if (coreWords.length >= 3) {
            let found = false;
            for (let wordCount = coreWords.length; wordCount >= Math.min(4, coreWords.length); wordCount--) {
              const searchPhrase = coreWords.slice(0, wordCount).join(' ');
              const phraseIdx = transcriptLower.indexOf(searchPhrase);

              if (phraseIdx !== -1) {
                let endPos = phraseIdx + searchPhrase.length;

                // Try to extend to include remaining words
                if (wordCount < coreWords.length) {
                  const remainingWords = coreWords.slice(wordCount);
                  for (const word of remainingWords) {
                    const extendSearch = transcriptLower.substring(endPos, endPos + 50);
                    const wordPos = extendSearch.indexOf(word);
                    if (wordPos !== -1 && wordPos < 10) {
                      endPos = endPos + wordPos + word.length;
                    } else {
                      break;
                    }
                  }
                }

                highlights.push({
                  start: phraseIdx,
                  end: endPos,
                  color: categoryHighlights[item.type?.toLowerCase()] || categoryHighlights.note
                });
                found = true;
                break;
              }
            }
            if (found) continue;
          }

          // Try 3: Minimum match (first 3-4 words)
          if (coreWords.length >= 3) {
            for (let wordCount = Math.min(4, coreWords.length); wordCount >= 3; wordCount--) {
              const searchPhrase = coreWords.slice(0, wordCount).join(' ');
              const phraseIdx = transcriptLower.indexOf(searchPhrase);

              if (phraseIdx !== -1) {
                highlights.push({
                  start: phraseIdx,
                  end: phraseIdx + searchPhrase.length,
                  color: categoryHighlights[item.type?.toLowerCase()] || categoryHighlights.note
                });
                break;
              }
            }
          }
        }

        return highlights;
      };

      const highlights = buildHighlights();

      // Render transcript with word wrapping and highlights
      const words = transcript.split(' ');
      let curX = textX;
      let curY = textStartY;
      let charPos = 0;

      for (const word of words) {
        const wordW = ctx.measureText(word + ' ').width;

        if (curX + wordW > textX + textMaxWidth) {
          curX = textX;
          curY += lineHeight;
          if (curY > transPanelY + transPanelH - panelPadding) break;
        }

        // Check if this word falls within any highlight range
        const wordStart = charPos;
        const wordEnd = charPos + word.length;
        const matchingHighlight = highlights.find(h =>
          (wordStart >= h.start && wordStart < h.end) ||
          (wordEnd > h.start && wordEnd <= h.end) ||
          (wordStart <= h.start && wordEnd >= h.end)
        );

        // Draw highlight if matched
        if (matchingHighlight) {
          ctx.fillStyle = matchingHighlight.color;
          roundRect(ctx, curX - 3, curY - 2, wordW + 2, textSize + 6, 4);
          ctx.fill();
        }

        // Draw word
        ctx.fillStyle = '#374151';
        ctx.fillText(word + ' ', curX, curY);
        curX += wordW;
        charPos += word.length + 1; // +1 for space
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

      // Card colors — unified from lib/categoryColors
      const cardColors = CATEGORY_CARD_COLORS;

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
        // Glass card background
        drawGlassCardBg(ctx, cardStartX, thisCardY, cardW, cardH, cardRadius, colors);

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
        const isEventType = itemType === 'event' || itemType === 'events' || itemType === 'calendar' || itemType === 'appointment';
        ctx.fillText(content, iconX + 28, thisCardY + (isEventType ? height * 0.035 : height * 0.052));

        // Event tags (date + full day)
        if (isEventType) {
          drawEventTags(ctx, iconX + 28, thisCardY + height * 0.062, item.content || '', cardH);
        }

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

      // VOIS logo icon (three vertical bars) - scales with button
      ctx.fillStyle = '#ffffff';
      const logoSize = height * 0.08 * hoverScale;
      const logoX = width / 2;
      const logoY = btnCenterY;

      // Draw three bars (like the VOIS logo)
      ctx.save();
      ctx.translate(logoX, logoY);

      // Left bar (medium height)
      ctx.beginPath();
      ctx.roundRect(-logoSize * 0.5, -logoSize * 0.35, logoSize * 0.18, logoSize * 0.7, logoSize * 0.09);
      ctx.fill();

      // Center bar (tallest)
      ctx.beginPath();
      ctx.roundRect(-logoSize * 0.09, -logoSize * 0.5, logoSize * 0.18, logoSize, logoSize * 0.09);
      ctx.fill();

      // Right bar (shortest)
      ctx.beginPath();
      ctx.roundRect(logoSize * 0.32, -logoSize * 0.2, logoSize * 0.18, logoSize * 0.4, logoSize * 0.09);
      ctx.fill();

      ctx.restore();

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

    // === DEMO RESULTS MODE - Show actual user transcript with highlights ===
    // Show results on phone regardless of which device is recording (watch or phone)
    const hasDemoResults = demoState.transcript && demoState.transcript.length > 0;
    if (hasDemoResults) {
      const demoTranscript = demoState.transcript;
      const demoHighlights = demoState.highlights || [];
      const demoItems = demoState.items || [];

      // No animations - show everything immediately for streaming

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

      // Build word positions with highlight info (show full transcript)
      interface DemoWordInfo {
        word: string;
        x: number;
        y: number;
        width: number;
        highlightColor?: string;
        category?: string;
      }

      const demoWordPositions: DemoWordInfo[] = [];
      const words = demoTranscript.split(' ');
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

        // Category to highlight color mapping — unified from lib/categoryColors
        const categoryHighlightColors = CATEGORY_HIGHLIGHT_COLORS;

        for (const h of demoHighlights) {
          // Check if word overlaps with highlight range
          if (wordStart < h.end && wordEnd > h.start) {
            category = h.category?.toLowerCase() || 'task';
            // Use category-based color, fall back to allCategoryConfigs, then default
            highlightColor = categoryHighlightColors[category]
              || allCategoryConfigs[category]?.highlight
              || DEFAULT_HIGHLIGHT;
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

      // === DRAW HIGHLIGHTS (immediately, no animation) ===
      for (const wp of demoWordPositions) {
        if (wp.highlightColor) {
          ctx.fillStyle = wp.highlightColor;
          roundRect(ctx, wp.x - 3, wp.y - 2, wp.width + 2, textSize + 6, 4);
          ctx.fill();
        }
      }

      // Draw text
      ctx.font = `400 ${textSize}px -apple-system`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      for (const wp of demoWordPositions) {
        ctx.fillStyle = '#374151';
        ctx.fillText(wp.word + ' ', wp.x, wp.y);
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

      // Pastel colors for demo item types — unified from lib/categoryColors
      const demoPastelColors = CATEGORY_CARD_COLORS;

      // === DRAW ACTION CARDS (cards stay visible permanently) ===
      {
        const cardsGlobalAlpha = 1;

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

        // Draw each card (full opacity, no fade-in animation)
        const verifications = globalState.cardVerifications;
        demoItems.forEach((item, i) => {
          const verification = verifications[i];
          // Declined cards fade to 40% opacity, others full opacity
          ctx.globalAlpha = verification === 'declined' ? 0.4 : 1.0;
          const thisCardY = cardStartY + i * (cardH + cardGap);
          const itemCategory = (item.type || 'task').toLowerCase();
          const colors = demoPastelColors[itemCategory] || DEFAULT_CARD_COLOR;
          // Glass card background — green tint for verified
          const cardBgColors = verification === 'verified'
            ? { bg: '#dcfce7', accent: '#22c55e', text: '#16a34a' }
            : colors;
          drawGlassCardBg(ctx, cardStartX, thisCardY, cardW, cardH, cardRadius, cardBgColors);

          // Verified: green left border
          if (verification === 'verified') {
            ctx.fillStyle = '#22c55e';
            roundRect(ctx, cardStartX, thisCardY + cardH * 0.2, 4, cardH - cardH * 0.4, 2);
            ctx.fill();
          } else {
            // Left accent bar
            const barWidth = 4;
            const barPadding = cardH * 0.2;
            ctx.fillStyle = colors.accent;
            roundRect(ctx, cardStartX, thisCardY + barPadding, barWidth, cardH - barPadding * 2, 2);
            ctx.fill();
          }

          // Vector icon (same style as hero demo)
          const iconX = cardStartX + 30;
          const iconY = thisCardY + cardH / 2;
          const iconSize = height * 0.04;
          drawCardIcon(ctx, itemCategory, iconX, iconY, iconSize, verification === 'declined' ? '#94a3b8' : colors.text);

          // Content text
          const contentTextX = iconX + iconSize + 12;

          // Type label
          ctx.fillStyle = verification === 'declined' ? '#94a3b8' : colors.text;
          ctx.font = `600 ${height * 0.020}px -apple-system`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          const typeLabel = (item.type || 'Task').charAt(0).toUpperCase() + (item.type || 'Task').slice(1);
          ctx.fillText(typeLabel, contentTextX, thisCardY + height * 0.018);

          // Content — strikethrough for declined
          const isEventItem = itemCategory === 'event' || itemCategory === 'events' || itemCategory === 'calendar' || itemCategory === 'appointment';
          ctx.fillStyle = verification === 'declined' ? '#94a3b8' : '#374151';
          ctx.font = `500 ${height * 0.024}px -apple-system`;
          const contentYPos = isEventItem ? thisCardY + height * 0.035 : thisCardY + height * 0.052;
          ctx.fillText(item.content, contentTextX, contentYPos);

          // Event tags
          if (isEventItem) {
            drawEventTags(ctx, contentTextX, thisCardY + height * 0.062, item.content || '', cardH, verification === 'declined');
          }

          if (verification === 'declined') {
            // Draw strikethrough line
            const textWidth = ctx.measureText(item.content).width;
            const lineY = contentYPos + height * 0.012;
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(contentTextX, lineY);
            ctx.lineTo(contentTextX + textWidth, lineY);
            ctx.stroke();
          }

          // Action buttons — show status icon if verified/declined, otherwise show check/X
          const btnSize = height * 0.024;
          const btnX = cardStartX + cardW - btnSize * 1.2;

          if (verification === 'verified') {
            // Show green checkmark
            ctx.fillStyle = '#22c55e';
            ctx.font = `700 ${btnSize * 1.1}px -apple-system`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✓', btnX, thisCardY + cardH / 2);
          } else if (verification === 'declined') {
            // Show red X
            ctx.fillStyle = '#ef4444';
            ctx.font = `600 ${btnSize}px -apple-system`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✕', btnX, thisCardY + cardH / 2);
          } else {
            // Unverified — show both buttons
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
          }
        });

        ctx.globalAlpha = 1;
      }

      // === BOTTOM NAV BAR ===
      drawBottomNav('stream');

      return;
    }

    // === LOGO SCREEN (before recording starts, with fade in/out) ===
    if (elapsed < RECORDING_START_TIME) {
      let logoAlpha = 1;
      if (elapsed < 0.5) {
        logoAlpha = elapsed / 0.5;
      } else if (elapsed > RECORDING_START_TIME - 0.5) {
        logoAlpha = (RECORDING_START_TIME - elapsed) / 0.5;
      }
      ctx.globalAlpha = Math.max(0, Math.min(1, logoAlpha));

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

      ctx.globalAlpha = 1;
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
      const colors = pastelColors[item.category] || DEFAULT_CARD_COLOR;
      // Glass card background
      drawGlassCardBg(ctx, cardStartX, thisCardY, cardW, cardH, cardRadius, colors);

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
      const isHeroEvent = item.category === 'events' || item.category === 'event' || item.category === 'calendar' || item.category === 'appointment';
      ctx.fillStyle = '#374151';
      ctx.font = `500 ${height * 0.024}px -apple-system`;
      ctx.fillText(item.content, contentTextX, thisCardY + (isHeroEvent ? height * 0.035 : height * 0.052));

      // Event tags
      if (isHeroEvent) {
        drawEventTags(ctx, contentTextX, thisCardY + height * 0.062, item.content, cardH);
      }

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
    const hasDemoResults = demoState.activeDevice === 'watch' &&
                          demoState.transcript &&
                          demoState.transcript.length > 0;
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

    // === HERO SHOWCASE MODE (synced with phone voicenotes, 3 phases) ===
    if (isHeroShowcase) {
      const scElapsed = scenarioState.elapsed;
      const typingDuration = scenarioState.fullTranscript.length / TYPING_SPEED;
      const typingEndTime = RECORDING_START_TIME + typingDuration;

      // ── Phase 1: Sent-to-iPhone → Tap-to-record → Tap animation (0 to RECORDING_START_TIME) ──
      if (scElapsed < RECORDING_START_TIME) {
        const voisCenterY = height * 0.45;
        const voisSize = width * 0.25;
        const tapStart = RECORDING_START_TIME - 0.7;

        // Overlapping cross-fade prevents blink:
        //   Tap to record fades in  0.6 → 1.0s  (drawn first = underneath)
        //   Sent to iPhone fades out 0.8 → 1.2s  (drawn second = on top, reveals tap)
        const tapFadeInStart = 0.6;
        const tapFadeInEnd = 1.0;
        const sentFadeOutStart = 0.8;
        const sentFadeOutEnd = 1.2;

        // --- "Tap to record" layer (drawn first = underneath) ---
        const tapToRecordAlpha = scElapsed < tapFadeInStart
          ? 0
          : scElapsed < tapFadeInEnd
            ? (scElapsed - tapFadeInStart) / (tapFadeInEnd - tapFadeInStart)
            : scElapsed > RECORDING_START_TIME - 0.4 ? Math.max(0, (RECORDING_START_TIME - scElapsed) / 0.4) : 1;

        if (tapToRecordAlpha > 0) {
          ctx.globalAlpha = Math.max(0, Math.min(1, tapToRecordAlpha));

          // Own dark background so the layer is opaque
          const tapBg = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.7);
          tapBg.addColorStop(0, '#1a1a2e');
          tapBg.addColorStop(1, '#000000');
          ctx.fillStyle = tapBg;
          ctx.fillRect(0, 0, width, height);

          const isTapping = scElapsed > tapStart;

          if (isTapping) {
            const tapProgress = (scElapsed - tapStart) / 0.7;
            const glowAlpha = tapProgress * 0.45;
            ctx.fillStyle = `rgba(239, 68, 68, ${glowAlpha})`;
            ctx.beginPath();
            ctx.arc(width / 2, voisCenterY, voisSize * 0.9, 0, Math.PI * 2);
            ctx.fill();

            const pressScale = tapProgress < 0.35 ? 1 - tapProgress * 0.14 : 0.951 + (tapProgress - 0.35) * 0.075;
            ctx.save();
            ctx.translate(width / 2, voisCenterY);
            ctx.scale(pressScale, pressScale);
            ctx.translate(-width / 2, -voisCenterY);
          }

          ctx.fillStyle = isTapping ? 'rgba(239, 68, 68, 0.65)' : 'rgba(255, 255, 255, 0.12)';
          ctx.beginPath();
          ctx.arc(width / 2, voisCenterY, voisSize * 0.7, 0, Math.PI * 2);
          ctx.fill();

          drawVoisLogo(ctx, width / 2, voisCenterY, voisSize, 'rgba(255, 255, 255, 0.9)');

          if (isTapping) ctx.restore();

          ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
          ctx.font = `500 ${width * 0.06}px -apple-system`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText('Tap to record', width / 2, voisCenterY + voisSize * 0.85);

          ctx.globalAlpha = 1;
        }

        // --- "Sent to iPhone" layer (drawn second = on top, fades out to reveal tap) ---
        const sentAlpha = scElapsed < sentFadeOutStart
          ? Math.min(1, scElapsed / 0.3)
          : scElapsed < sentFadeOutEnd
            ? Math.max(0, 1 - (scElapsed - sentFadeOutStart) / (sentFadeOutEnd - sentFadeOutStart))
            : 0;

        if (sentAlpha > 0) {
          ctx.globalAlpha = Math.max(0, Math.min(1, sentAlpha));

          // Own dark background so the layer is opaque
          const sentBg = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.7);
          sentBg.addColorStop(0, '#1a1a2e');
          sentBg.addColorStop(1, '#000000');
          ctx.fillStyle = sentBg;
          ctx.fillRect(0, 0, width, height);

          const checkY = voisCenterY - width * 0.02;
          const checkR = width * 0.14;
          ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
          ctx.beginPath();
          ctx.arc(width / 2, checkY, checkR, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = width * 0.02;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(width / 2 - checkR * 0.35, checkY + checkR * 0.05);
          ctx.lineTo(width / 2 - checkR * 0.05, checkY + checkR * 0.35);
          ctx.lineTo(width / 2 + checkR * 0.4, checkY - checkR * 0.25);
          ctx.stroke();

          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.font = `600 ${width * 0.07}px -apple-system`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText('Sent to iPhone', width / 2, checkY + checkR + width * 0.06);

          ctx.globalAlpha = 1;
        }

        return;
      }

      // ── Phase 2: Recording (RECORDING_START_TIME to typingEndTime) ──
      if (scElapsed < typingEndTime) {
        const recordingElapsed = scElapsed - RECORDING_START_TIME;
        const recordingSecs = Math.floor(recordingElapsed);

        // VOIS text at top
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${width * 0.12}px -apple-system`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('VOIS', width / 2, height * 0.18);

        // Pulsing recording dot
        const dotPulse = 0.7 + Math.sin(now / 300) * 0.3;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(width * 0.18, height * 0.18, 6 * dotPulse, 0, Math.PI * 2);
        ctx.fill();

        // Waveform bars
        const waveY = height * 0.48;
        const waveH = height * 0.18;
        const waveStartX = width * 0.1;
        const waveEndX = width * 0.9;
        const bars = 24;
        const barWidth = (waveEndX - waveStartX) / bars;

        const audioLevels = Array.from({ length: 24 }, (_, i) => {
          const t = now * 0.002 + i * 0.3;
          return 0.3 + Math.sin(t) * 0.25 + Math.sin(t * 1.7) * 0.2 + Math.random() * 0.15;
        });

        for (let i = 0; i < bars; i++) {
          const baseLevel = audioLevels[i] || 0.1;
          const animOffset = now * 0.003 + i * 0.2;
          const jitter = Math.sin(animOffset) * 0.1;
          const level = Math.min(1, Math.max(0.1, baseLevel + jitter));
          const dynamicH = waveH * (0.15 + level * 0.85);
          const intensity = 0.5 + level * 0.5;
          ctx.fillStyle = `rgba(239, 68, 68, ${intensity})`;
          const barX = waveStartX + i * barWidth;
          const barW = barWidth * 0.6;
          roundRect(ctx, barX, waveY - dynamicH / 2, barW, dynamicH, 3);
          ctx.fill();
        }

        // Timer (counts from 0, synced to actual recording duration)
        const displayMinutes = Math.floor(recordingSecs / 60);
        const displaySeconds = recordingSecs % 60;
        ctx.fillStyle = '#ef4444';
        ctx.font = `bold ${width * 0.16}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(`${displayMinutes}:${displaySeconds.toString().padStart(2, '0')}`, width / 2, height * 0.75);

        // Status text
        ctx.fillStyle = '#888888';
        ctx.font = `500 ${width * 0.055}px -apple-system`;
        ctx.fillText('Recording...', width / 2, height * 0.88);

        return;
      }

      // ── Phase 3: Post-typing — "Sent to iPhone" ──
      {
        const timeSinceEnd = scElapsed - typingEndTime;
        // Fade in over 0.4s
        const fadeIn = Math.min(1, timeSinceEnd / 0.4);
        ctx.globalAlpha = fadeIn;

        // Checkmark circle
        const checkY = height * 0.42;
        const checkR = width * 0.14;
        ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
        ctx.beginPath();
        ctx.arc(width / 2, checkY, checkR, 0, Math.PI * 2);
        ctx.fill();

        // Checkmark icon
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = width * 0.02;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(width / 2 - checkR * 0.35, checkY + checkR * 0.05);
        ctx.lineTo(width / 2 - checkR * 0.05, checkY + checkR * 0.35);
        ctx.lineTo(width / 2 + checkR * 0.4, checkY - checkR * 0.25);
        ctx.stroke();

        // "Sent to iPhone" text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.font = `600 ${width * 0.07}px -apple-system`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('Sent to iPhone', width / 2, checkY + checkR + width * 0.06);

        ctx.globalAlpha = 1;
      }

      return;
    }

    // === FULLSCREEN RECORDING MODE (real recording) ===
    if (isWatchRecording || isWatchProcessing) {
      const isProcessing = isWatchProcessing;
      const elapsed = demoState.elapsed;

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

      const audioLevels = demoState.audioLevels;

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
        const sq = stopBtnR * 0.7;
        ctx.fillStyle = '#ffffff';
        roundRect(ctx, width / 2 - sq / 2, stopBtnY - sq / 2, sq, sq, 2);
        ctx.fill();
        ctx.fillStyle = '#888888';
        ctx.font = `500 ${width * 0.045}px -apple-system`;
        ctx.fillText('Tap to stop', width / 2, height * 0.93);
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

      // Subtle pulse animation when waiting
      const watchPulse = 1 + Math.sin(now / 600) * 0.04;

      const watchHoverScale = isWatchHovered ? 1.15 : 1;
      const finalVoisSize = voisSize * watchHoverScale * watchPulse;

      // Red glow behind on hover
      if (isWatchHovered) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
        ctx.beginPath();
        ctx.arc(width / 2, voisCenterY, finalVoisSize * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }

      // Glow circle background - red on hover, subtle white normally
      ctx.fillStyle = isWatchHovered ? 'rgba(239, 68, 68, 0.7)' : 'rgba(255, 255, 255, 0.12)';
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

    // Subtle overlay to slightly dim the background (show more of the watch face)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
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
    const voisX = width * 0.24;
    const voisY = height * 0.83;
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

    // === IDLE STATE: VOIS logo with subtle pulse, red glow on hover ===
    const idlePulse = 0.97 + Math.sin(now / 800) * 0.03; // gentle breathing
    const hoverPulse = isHovered ? (0.92 + Math.sin(now / 250) * 0.08) : 1; // faster, stronger red pulse
    const hoverScale = isHovered ? 1.12 : 1;
    const finalSize = logoSize * hoverScale * idlePulse;

    // Outer glow — white idle, red on hover (pulsing intensity)
    if (isHovered) {
      const redGlowAlpha = 0.2 + Math.sin(now / 250) * 0.15; // pulsing 0.05–0.35
      const outerGlow = ctx.createRadialGradient(voisX, voisY, 0, voisX, voisY, finalSize * 1.6);
      outerGlow.addColorStop(0, `rgba(239, 68, 68, ${redGlowAlpha})`);
      outerGlow.addColorStop(0.6, `rgba(239, 68, 68, ${redGlowAlpha * 0.3})`);
      outerGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(voisX, voisY, finalSize * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Inner glow circle
    const innerAlpha = isHovered ? (0.45 + Math.sin(now / 250) * 0.15) : 0.2;
    const glowColor = isHovered ? `rgba(239, 68, 68, ${innerAlpha})` : `rgba(255, 255, 255, ${innerAlpha})`;
    const glowGradient = ctx.createRadialGradient(voisX, voisY, 0, voisX, voisY, finalSize * 1.0);
    glowGradient.addColorStop(0, glowColor);
    glowGradient.addColorStop(1, isHovered ? 'rgba(239, 68, 68, 0)' : 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(voisX, voisY, finalSize * 1.0, 0, Math.PI * 2);
    ctx.fill();

    // Draw VOIS logo — white normally, brighter on hover
    const logoColor = isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.9)';
    drawVoisLogo(ctx, voisX, voisY, finalSize, logoColor);

    // REC dot (pulsing) — small red dot next to logo
    const dotAlpha = isHovered ? hoverPulse : (0.5 + Math.sin(now / 1000) * 0.3);
    const dotRadius = isHovered ? width * 0.018 : width * 0.012;
    ctx.fillStyle = `rgba(239, 68, 68, ${dotAlpha})`;
    ctx.beginPath();
    ctx.arc(voisX + finalSize * 0.45, voisY - finalSize * 0.35, dotRadius, 0, Math.PI * 2);
    ctx.fill();

    // "VOIS" label
    ctx.fillStyle = isHovered ? '#ef4444' : 'rgba(255, 255, 255, 0.8)';
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

        // Store UV mapping for raw→canvas coordinate conversion in hover/click
        globalState.watchUVMapping = {
          repeatX: texture.repeat.x,
          repeatY: texture.repeat.y,
          offsetX: texture.offset.x,
          offsetY: texture.offset.y,
        };

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
    if (!isHeroSection && entranceProgressRef.current >= 1) return;

    // Always invalidate to keep scene responsive (Three.js with frameloop="demand" needs this)
    const isScrolling = globalState.isScrolling;
    state.invalidate();

    // Update timer for screen animation
    if (clockTime - lastTimeRef.current > 1) {
      timerRef.current += 1;
      lastTimeRef.current = clockTime;
    }

    // === TEXTURE UPDATES (throttled, but forced during ripple/hover animations) ===
    const hasActiveEffect = globalState.phoneTouchRipple !== null || globalState.watchTouchRipple !== null
      || globalState.phoneHoverUV !== null || globalState.watchHoverUV !== null;

    // Skip texture updates during scroll unless there's an active effect
    const timeElapsed = now - lastTextureUpdateRef.current > TEXTURE_UPDATE_INTERVAL;

    if ((timeElapsed || hasActiveEffect) && !isScrolling) {
      lastTextureUpdateRef.current = now;

      // Update phone screen (always hero screen)
      if (phoneCanvasRef.current && phoneTextureRef.current) {
        const ctx = phoneCanvasRef.current.getContext('2d');
        if (ctx) {
          drawPhoneScreen(ctx, phoneCanvasRef.current.width, phoneCanvasRef.current.height, true, timerRef.current);

          // Draw hover glow on phone (small, dark tint — visible on light background)
          const phoneHover = globalState.phoneHoverUV;
          if (phoneHover) {
            const w = phoneCanvasRef.current.width;
            const h = phoneCanvasRef.current.height;
            const cx = phoneHover.x * w;
            const cy = phoneHover.y * h;
            const radius = Math.max(w, h) * 0.04;

            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
            grad.addColorStop(0, 'rgba(0, 0, 0, 0.08)');
            grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.03)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
          }

          // Draw touch ripple overlay on phone (expanding, dark tint)
          const phoneRipple = globalState.phoneTouchRipple;
          if (phoneRipple) {
            const rippleAge = (now - phoneRipple.startTime) / 1000;
            const rippleDuration = 0.5;
            if (rippleAge < rippleDuration) {
              const progress = rippleAge / rippleDuration;
              const w = phoneCanvasRef.current.width;
              const h = phoneCanvasRef.current.height;
              const cx = phoneRipple.x * w;
              const cy = phoneRipple.y * h;
              const maxRadius = Math.max(w, h) * 0.18;
              const radius = maxRadius * progress;
              const alpha = 0.12 * (1 - progress);

              const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
              grad.addColorStop(0, `rgba(0, 0, 0, ${alpha})`);
              grad.addColorStop(0.5, `rgba(0, 0, 0, ${alpha * 0.5})`);
              grad.addColorStop(1, `rgba(0, 0, 0, 0)`);
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(cx, cy, radius, 0, Math.PI * 2);
              ctx.fill();
            } else {
              globalState.phoneTouchRipple = null;
            }
          }

          phoneTextureRef.current.needsUpdate = true;
        }
      }

      // Update watch screen (always hero screen)
      if (watchCanvasRef.current && watchTextureRef.current) {
        const ctx = watchCanvasRef.current.getContext('2d');
        if (ctx) {
          drawWatchScreen(ctx, watchCanvasRef.current.width, watchCanvasRef.current.height, true, timerRef.current);

          // Draw hover glow on watch (small, white)
          const watchHover = globalState.watchHoverUV;
          if (watchHover) {
            const w = watchCanvasRef.current.width;
            const h = watchCanvasRef.current.height;
            const cx = watchHover.x * w;
            const cy = watchHover.y * h;
            const radius = Math.max(w, h) * 0.06;

            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
            grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.18)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
          }

          // Draw touch ripple overlay on watch (expanding, white)
          const watchRipple = globalState.watchTouchRipple;
          if (watchRipple) {
            const rippleAge = (now - watchRipple.startTime) / 1000;
            const rippleDuration = 0.5;
            if (rippleAge < rippleDuration) {
              const progress = rippleAge / rippleDuration;
              const w = watchCanvasRef.current.width;
              const h = watchCanvasRef.current.height;
              const cx = watchRipple.x * w;
              const cy = watchRipple.y * h;
              const maxRadius = Math.max(w, h) * 0.25;
              const radius = maxRadius * progress;
              const alpha = 0.35 * (1 - progress);

              const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
              grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
              grad.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.5})`);
              grad.addColorStop(1, `rgba(255, 255, 255, 0)`);
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(cx, cy, radius, 0, Math.PI * 2);
              ctx.fill();
            } else {
              globalState.watchTouchRipple = null;
            }
          }

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

    // Ambient floating movement (reduced during scroll for better performance)
    const scrollDampening = isScrolling ? 0.2 : 1.0;
    const ambientScale = entranceProgress * scrollDampening;
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

    // Video exit offsets removed — video now plays as flat HTML
    const phoneExitX = 0;
    const phoneExitRotY = 0;
    const watchExitX = 0;
    const watchExitRotY = 0;

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

      {/* 3D Video Player removed — video now plays as flat HTML in hero */}

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
    let scrollTimeout: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      // Mark as scrolling
      globalState.isScrolling = true;

      // Clear previous timeout
      if (scrollTimeout) clearTimeout(scrollTimeout);

      // Set timeout to mark scrolling as stopped after 150ms of no scroll events
      scrollTimeout = setTimeout(() => {
        globalState.isScrolling = false;
      }, 150);

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
      // Cancel any pending RAF and timeouts
      if (scrollRAF) cancelAnimationFrame(scrollRAF);
      if (mouseRAF) cancelAnimationFrame(mouseRAF);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <Canvas
      frameloop="demand"
      camera={{ position: [0, 0, 1.8], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      style={{
        background: 'transparent',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
    >
      {/* Lighting for glossy materials */}
      <ambientLight intensity={2} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <directionalLight position={[-5, 5, 5]} intensity={1.5} />
      <directionalLight position={[0, 0, 5]} intensity={1.5} />

      <Suspense fallback={null}>
        <ResponsiveCamera />
        <SceneContent />
        <Environment preset="studio" background={false} />
      </Suspense>
    </Canvas>
  );
};

// Model preloading removed - load on-demand for faster initial page load
// useGLTF.preload('/3d_models/iphone_16_pro_max.glb');
// useGLTF.preload('/3d_models/Apple Watch 8 Ultra.glb');
