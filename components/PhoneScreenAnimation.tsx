import React, { useRef, useEffect, useCallback } from 'react';
import {
  scenarios,
  getScenarioState,
  RECORDING_START_TIME,
  SINGLE_SCENARIO_DURATION,
  TYPING_SPEED,
  HIGHLIGHT_SPEED,
} from '../lib/scenarios';
import { globalState } from './deviceState';

// ─── Props ───────────────────────────────────────────────────────────────────
interface PhoneScreenAnimationProps {
  startTime?: number;
  className?: string;
}

// ─── Colors — unified from lib/categoryColors ───────────────────────────────
import {
  CATEGORY_CARD_COLORS as cardColors,
  CATEGORY_HIGHLIGHT_COLORS as highlightColors,
  DEFAULT_CARD_COLOR,
} from '../lib/categoryColors';

const DEMO_BAR_COUNT = 24;

// ─── Component ───────────────────────────────────────────────────────────────
export const PhoneScreenAnimation: React.FC<PhoneScreenAnimationProps> = ({
  startTime,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const startTimeRef = useRef(startTime ?? Date.now());

  // Refs for direct DOM manipulation (zero React re-renders during animation)
  const logoRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null); // kept for ref stability
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardsHeaderRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);

  // Segment span refs per scenario
  const segmentSpansRef = useRef<HTMLSpanElement[][]>([]);
  const currentScenarioRef = useRef(-1);

  // ── Demo mode refs ──────────────────────────────────────────────────────
  const demoOverlayRef = useRef<HTMLDivElement>(null);
  const demoDotRef = useRef<HTMLDivElement>(null);
  const demoTimerRef = useRef<HTMLSpanElement>(null);
  const demoStatusRef = useRef<HTMLSpanElement>(null);
  const demoBarsRef = useRef<(HTMLDivElement | null)[]>([]);
  const demoModeRef = useRef<'scenario' | 'waiting' | 'recording' | 'processing' | 'results'>('scenario');
  const waitingOverlayRef = useRef<HTMLDivElement>(null);
  const waitingRecordBtnRef = useRef<HTMLDivElement>(null);
  const demoResultsBuiltRef = useRef(false);
  const demoResultsRevealStart = useRef<number | null>(null);

  // ── Build transcript spans for a scenario ──────────────────────────────
  const buildTranscript = useCallback((scenarioIndex: number) => {
    const el = transcriptRef.current;
    if (!el) return;
    const scenario = scenarios[scenarioIndex];

    el.innerHTML = '';
    const spans: HTMLSpanElement[] = [];

    scenario.segments.forEach((seg) => {
      const span = document.createElement('span');
      span.textContent = seg.text;
      span.style.visibility = 'hidden';
      span.style.opacity = '1';
      if (seg.category) {
        span.dataset.category = seg.category;
        span.style.borderRadius = '4px';
        span.style.padding = '2px 0';
        // Use CSS custom property for progressive highlight sweep
        span.style.setProperty('--p', '0');
        const color = highlightColors[seg.category] || 'rgba(187,247,208,0.7)';
        span.style.setProperty('--hc', color);
        span.style.background = 'linear-gradient(90deg, var(--hc) calc(var(--p) * 100%), transparent calc(var(--p) * 100%))';
      }
      spans.push(span);
      el.appendChild(span);
    });

    segmentSpansRef.current[scenarioIndex] = spans;
  }, []);

  // ── Build extracted item cards for a scenario ──────────────────────────
  const buildCards = useCallback((scenarioIndex: number) => {
    const container = cardsContainerRef.current;
    if (!container) return;
    const scenario = scenarios[scenarioIndex];
    container.innerHTML = '';
    cardRefs.current = [];

    scenario.extractedItems.forEach((item) => {
      const colors = cardColors[item.category] || cardColors.work;

      const card = document.createElement('div');
      card.style.cssText = `
        display: flex; align-items: center;
        border-radius: 24px;
        background: rgba(255, 255, 255, 0.45);
        backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.6);
        box-shadow: 0 2px 12px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.7);
        opacity: 0; transform: translateY(6px);
        will-change: opacity, transform;
        padding: 0; overflow: hidden;
        height: 9.5%;
        min-height: 48px;
      `;

      // Icon
      const icon = document.createElement('span');
      icon.textContent = item.icon;
      icon.style.cssText = 'font-size: 16px; flex-shrink: 0; margin-left: 12px;';
      card.appendChild(icon);

      // Text wrapper
      const textWrap = document.createElement('div');
      textWrap.style.cssText = 'flex: 1; min-width: 0; margin-left: 8px;';
      const label = document.createElement('div');
      label.textContent = item.label;
      label.style.cssText = `font-size: 11px; font-weight: 600; color: ${colors.text}; letter-spacing: 0.02em;`;
      const content = document.createElement('div');
      content.textContent = item.content;
      content.style.cssText = 'font-size: 13px; font-weight: 500; color: #374151; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px;';
      textWrap.appendChild(label);
      textWrap.appendChild(content);
      card.appendChild(textWrap);

      // Action buttons (stacked vertically)
      const btns = document.createElement('div');
      btns.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 2px; margin-right: 0; flex-shrink: 0;';
      const check = document.createElement('span');
      check.textContent = '\u2713';
      check.style.cssText = `font-size: 14px; font-weight: 600; color: ${colors.accent}; line-height: 1;`;
      const dismiss = document.createElement('span');
      dismiss.textContent = '\u2715';
      dismiss.style.cssText = 'font-size: 13px; font-weight: 500; color: #cbd5e1; line-height: 1;';
      btns.appendChild(check);
      btns.appendChild(dismiss);
      card.appendChild(btns);

      // Right accent bar (4px, 20% top/bottom padding)
      const bar = document.createElement('div');
      bar.style.cssText = `
        width: 4px; align-self: stretch; flex-shrink: 0;
        display: flex; flex-direction: column;
        margin-left: 8px;
      `;
      const barTop = document.createElement('div');
      barTop.style.cssText = 'flex: 0 0 20%; background: transparent;';
      const barMid = document.createElement('div');
      barMid.style.cssText = `flex: 1; background: ${colors.accent}; border-radius: 2px;`;
      const barBot = document.createElement('div');
      barBot.style.cssText = 'flex: 0 0 20%; background: transparent;';
      bar.appendChild(barTop);
      bar.appendChild(barMid);
      bar.appendChild(barBot);
      card.appendChild(bar);

      container.appendChild(card);
      cardRefs.current.push(card);
    });
  }, []);

  // ── Build demo results transcript (from real API data) ─────────────────
  const buildDemoTranscript = useCallback(() => {
    const el = transcriptRef.current;
    if (!el) return;

    const { transcript, highlights } = globalState.demoState;
    el.innerHTML = '';
    const spans: HTMLSpanElement[] = [];

    if (!highlights || highlights.length === 0) {
      // No highlights — just show plain transcript
      const span = document.createElement('span');
      span.textContent = transcript;
      span.style.visibility = 'visible';
      span.style.opacity = '1';
      spans.push(span);
      el.appendChild(span);
    } else {
      // Build segments from highlights
      const sorted = [...highlights].sort((a, b) => a.start - b.start);
      let cursor = 0;

      sorted.forEach((hl) => {
        // Text before highlight
        if (hl.start > cursor) {
          const before = document.createElement('span');
          before.textContent = transcript.substring(cursor, hl.start);
          before.style.visibility = 'visible';
          before.style.opacity = '0';
          spans.push(before);
          el.appendChild(before);
        }
        // Highlighted text
        const hlSpan = document.createElement('span');
        hlSpan.textContent = hl.text || transcript.substring(hl.start, hl.end);
        hlSpan.style.visibility = 'visible';
        hlSpan.style.opacity = '0';
        hlSpan.style.borderRadius = '4px';
        hlSpan.style.padding = '2px 0';
        const color = highlightColors[hl.category] || 'rgba(187,247,208,0.7)';
        hlSpan.style.background = color;
        spans.push(hlSpan);
        el.appendChild(hlSpan);
        cursor = hl.end;
      });

      // Remaining text after last highlight
      if (cursor < transcript.length) {
        const after = document.createElement('span');
        after.textContent = transcript.substring(cursor);
        after.style.visibility = 'visible';
        after.style.opacity = '0';
        spans.push(after);
        el.appendChild(after);
      }
    }

    // Store spans for animation
    segmentSpansRef.current[999] = spans;
    demoResultsRevealStart.current = Date.now();
  }, []);

  // ── Build demo results cards (from real API data) ──────────────────────
  const buildDemoCards = useCallback(() => {
    const container = cardsContainerRef.current;
    if (!container) return;

    const { items } = globalState.demoState;
    container.innerHTML = '';
    cardRefs.current = [];

    items.forEach((item) => {
      const category = item.type?.toLowerCase() || 'task';
      const colors = cardColors[category] || cardColors.task;

      const card = document.createElement('div');
      card.style.cssText = `
        display: flex; align-items: center;
        border-radius: 24px;
        background: rgba(255, 255, 255, 0.45);
        backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.6);
        box-shadow: 0 2px 12px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.7);
        opacity: 0; transform: translateY(6px);
        will-change: opacity, transform;
        padding: 0; overflow: hidden;
        height: 9.5%;
        min-height: 48px;
        transition: opacity 0.4s ease, transform 0.4s ease;
      `;

      // Icon
      const icon = document.createElement('span');
      icon.textContent = item.icon || '📋';
      icon.style.cssText = 'font-size: 16px; flex-shrink: 0; margin-left: 12px;';
      card.appendChild(icon);

      // Text wrapper
      const textWrap = document.createElement('div');
      textWrap.style.cssText = 'flex: 1; min-width: 0; margin-left: 8px;';
      const label = document.createElement('div');
      label.textContent = (item.type || 'Task').charAt(0).toUpperCase() + (item.type || 'task').slice(1);
      label.style.cssText = `font-size: 11px; font-weight: 600; color: ${colors.text}; letter-spacing: 0.02em;`;
      const content = document.createElement('div');
      content.textContent = item.content;
      content.style.cssText = 'font-size: 13px; font-weight: 500; color: #374151; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px;';
      textWrap.appendChild(label);
      textWrap.appendChild(content);
      card.appendChild(textWrap);

      // Action buttons
      const btns = document.createElement('div');
      btns.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 2px; margin-right: 0; flex-shrink: 0;';
      const check = document.createElement('span');
      check.textContent = '\u2713';
      check.style.cssText = `font-size: 14px; font-weight: 600; color: ${colors.accent}; line-height: 1;`;
      const dismiss = document.createElement('span');
      dismiss.textContent = '\u2715';
      dismiss.style.cssText = 'font-size: 13px; font-weight: 500; color: #cbd5e1; line-height: 1;';
      btns.appendChild(check);
      btns.appendChild(dismiss);
      card.appendChild(btns);

      // Right accent bar
      const bar = document.createElement('div');
      bar.style.cssText = `
        width: 4px; align-self: stretch; flex-shrink: 0;
        display: flex; flex-direction: column;
        margin-left: 8px;
      `;
      const barTop = document.createElement('div');
      barTop.style.cssText = 'flex: 0 0 20%; background: transparent;';
      const barMid = document.createElement('div');
      barMid.style.cssText = `flex: 1; background: ${colors.accent}; border-radius: 2px;`;
      const barBot = document.createElement('div');
      barBot.style.cssText = 'flex: 0 0 20%; background: transparent;';
      bar.appendChild(barTop);
      bar.appendChild(barMid);
      bar.appendChild(barBot);
      card.appendChild(bar);

      container.appendChild(card);
      cardRefs.current.push(card);
    });
  }, []);

  // ── Main animation tick — rAF, direct DOM mutations only ───────────────
  const tick = useCallback(() => {
    // Update clock
    if (clockRef.current) {
      const now = new Date();
      const h = now.getHours();
      const m = String(now.getMinutes()).padStart(2, '0');
      clockRef.current.textContent = `${h}:${m}`;
    }

    // ── Check demo state ─────────────────────────────────────────────────
    const demoState = globalState.demoState;
    const isDemoRecording = demoState.isRecording;
    const isDemoProcessing = demoState.isProcessing;
    const isDemoWaiting = demoState.isWaitingToStart;
    const hasDemoResults = demoState.transcript.length > 0 && demoState.items.length > 0 && !isDemoRecording && !isDemoProcessing;

    let currentMode: 'scenario' | 'waiting' | 'recording' | 'processing' | 'results';
    if (isDemoRecording) currentMode = 'recording';
    else if (isDemoProcessing) currentMode = 'processing';
    else if (hasDemoResults) currentMode = 'results';
    else if (isDemoWaiting) currentMode = 'waiting';
    else currentMode = 'scenario';

    // ── Mode transitions ─────────────────────────────────────────────────
    if (currentMode !== demoModeRef.current) {
      const prevMode = demoModeRef.current;
      demoModeRef.current = currentMode;

      if (currentMode === 'results' && !demoResultsBuiltRef.current) {
        demoResultsBuiltRef.current = true;
        buildDemoTranscript();
        buildDemoCards();
      }

      if (currentMode === 'recording') {
        // Reset results state for fresh recording (handles retry)
        demoResultsBuiltRef.current = false;
        demoResultsRevealStart.current = null;
      }

      if (currentMode === 'scenario') {
        demoResultsBuiltRef.current = false;
        demoResultsRevealStart.current = null;
        // Force scenario rebuild on return
        currentScenarioRef.current = -1;
      }
    }

    // ── Demo waiting overlay ─────────────────────────────────────────────
    if (currentMode === 'waiting') {
      if (waitingOverlayRef.current) {
        waitingOverlayRef.current.style.opacity = '1';
        waitingOverlayRef.current.style.pointerEvents = 'auto';
      }
      if (demoOverlayRef.current) {
        demoOverlayRef.current.style.opacity = '0';
        demoOverlayRef.current.style.pointerEvents = 'none';
      }
      if (logoRef.current) {
        logoRef.current.style.opacity = '0';
        logoRef.current.style.pointerEvents = 'none';
      }
      // Pulse the record button
      if (waitingRecordBtnRef.current) {
        const pulse = 0.9 + Math.sin(Date.now() / 800) * 0.1;
        waitingRecordBtnRef.current.style.transform = `scale(${pulse})`;
      }
      return;
    }

    // Hide waiting overlay for all non-waiting modes
    if (waitingOverlayRef.current) {
      waitingOverlayRef.current.style.opacity = '0';
      waitingOverlayRef.current.style.pointerEvents = 'none';
    }

    // ── Demo recording / processing overlay ──────────────────────────────
    if (currentMode === 'recording' || currentMode === 'processing') {
      // Show demo overlay, hide logo and scenario content
      if (demoOverlayRef.current) {
        demoOverlayRef.current.style.opacity = '1';
        demoOverlayRef.current.style.pointerEvents = 'auto';
      }
      if (logoRef.current) {
        logoRef.current.style.opacity = '0';
        logoRef.current.style.pointerEvents = 'none';
      }

      if (currentMode === 'recording') {
        // Update waveform bars with real audio levels
        const levels = demoState.audioLevels;
        for (let i = 0; i < DEMO_BAR_COUNT; i++) {
          const bar = demoBarsRef.current[i];
          if (!bar) continue;
          const level = levels[i] || 0.1;
          const h = 8 + level * 50;
          bar.style.height = `${h}px`;
          bar.style.opacity = String(0.5 + level * 0.5);
        }

        // Update timer
        if (demoTimerRef.current) {
          const secs = demoState.elapsed;
          const mins = Math.floor(secs / 60);
          const displaySecs = secs % 60;
          demoTimerRef.current.textContent = `${mins}:${String(displaySecs).padStart(2, '0')}`;
          demoTimerRef.current.style.fontSize = '48px';
        }

        // Pulse recording dot
        if (demoDotRef.current) {
          const pulse = 0.6 + Math.sin(Date.now() / 300) * 0.4;
          demoDotRef.current.style.opacity = String(pulse);
        }

        // Update status text
        if (demoStatusRef.current) {
          demoStatusRef.current.textContent = 'Recording...';
          demoStatusRef.current.style.color = '#ef4444';
        }
      } else {
        // Processing mode
        // Subtle pulsing bars
        for (let i = 0; i < DEMO_BAR_COUNT; i++) {
          const bar = demoBarsRef.current[i];
          if (!bar) continue;
          const t = Date.now() * 0.001;
          const level = 0.2 + Math.sin(t * 2 + i * 0.3) * 0.1;
          bar.style.height = `${8 + level * 30}px`;
          bar.style.opacity = '0.4';
        }

        // Update timer to show processing state
        if (demoTimerRef.current) {
          const dots = '.'.repeat(1 + Math.floor((Date.now() / 500) % 3));
          demoTimerRef.current.textContent = `Processing${dots}`;
          demoTimerRef.current.style.fontSize = '18px';
        }

        // Hide recording dot
        if (demoDotRef.current) {
          demoDotRef.current.style.opacity = '0';
        }

        // Show tip
        if (demoStatusRef.current) {
          demoStatusRef.current.textContent = demoState.tip || 'Analyzing your voice note...';
          demoStatusRef.current.style.color = '#94a3b8';
        }
      }

      return; // Skip normal scenario animation
    }

    // ── Demo results mode ────────────────────────────────────────────────
    if (currentMode === 'results') {
      // Hide demo overlay
      if (demoOverlayRef.current) {
        demoOverlayRef.current.style.opacity = '0';
        demoOverlayRef.current.style.pointerEvents = 'none';
      }
      if (logoRef.current) {
        logoRef.current.style.opacity = '0';
        logoRef.current.style.pointerEvents = 'none';
      }

      // Animate transcript reveal (typewriter effect)
      const revealStart = demoResultsRevealStart.current;
      const spans = segmentSpansRef.current[999];
      if (spans && revealStart) {
        const elapsed = (Date.now() - revealStart) / 1000;
        const totalText = globalState.demoState.transcript;
        const revealedChars = Math.min(Math.floor(elapsed * 60), totalText.length); // 60 chars/sec

        let charCount = 0;
        spans.forEach((span) => {
          const text = span.textContent || '';
          const segLen = text.length;
          const segStart = charCount;
          const segEnd = charCount + segLen;

          if (revealedChars >= segEnd) {
            span.style.opacity = '1';
          } else if (revealedChars > segStart) {
            span.style.opacity = '1';
          } else {
            span.style.opacity = '0';
          }

          charCount += segLen;
        });
      }

      // Animate card reveal (staggered fade-in after transcript is mostly revealed)
      if (revealStart) {
        const elapsed = (Date.now() - revealStart) / 1000;
        const transcriptDuration = (globalState.demoState.transcript.length / 60) + 0.3;
        cardRefs.current.forEach((card, i) => {
          if (!card) return;
          const cardDelay = transcriptDuration + i * 0.2;
          if (elapsed > cardDelay) {
            const cardElapsed = elapsed - cardDelay;
            const opacity = Math.min(1, cardElapsed / 0.3);
            card.style.opacity = String(opacity);
            card.style.transform = opacity >= 1 ? 'translateY(0)' : `translateY(${6 * (1 - opacity)}px)`;
          }
        });
      }

      if (cardsHeaderRef.current) cardsHeaderRef.current.style.opacity = '1';
      return;
    }

    // ── Normal scenario mode ─────────────────────────────────────────────
    // Hide demo overlay
    if (demoOverlayRef.current) {
      demoOverlayRef.current.style.opacity = '0';
      demoOverlayRef.current.style.pointerEvents = 'none';
    }

    const state = getScenarioState(startTimeRef.current);
    const { scenario, scenarioIndex, elapsed, fullTranscript } = state;

    // ── Scenario changed → rebuild DOM ─────────────────────────────────
    if (scenarioIndex !== currentScenarioRef.current) {
      currentScenarioRef.current = scenarioIndex;
      buildTranscript(scenarioIndex);
      buildCards(scenarioIndex);
    }

    const spans = segmentSpansRef.current[scenarioIndex];
    if (!spans) return;

    // ── Logo phase (with fade in/out) ──────────────────────────────────
    if (logoRef.current) {
      let logoOpacity = 0;
      if (elapsed < 0.5) {
        // Fade in over first 0.5s
        logoOpacity = elapsed / 0.5;
      } else if (elapsed < RECORDING_START_TIME - 0.5) {
        // Fully visible
        logoOpacity = 1;
      } else if (elapsed < RECORDING_START_TIME) {
        // Fade out over last 0.5s
        logoOpacity = (RECORDING_START_TIME - elapsed) / 0.5;
      }
      logoRef.current.style.opacity = String(logoOpacity);
      logoRef.current.style.pointerEvents = elapsed < RECORDING_START_TIME ? 'auto' : 'none';
    }

    if (elapsed < RECORDING_START_TIME) {
      spans.forEach(s => { s.style.visibility = 'hidden'; });
      cardRefs.current.forEach(c => { if (c) { c.style.opacity = '0'; c.style.transform = 'translateY(6px)'; } });
      // cursor removed
      if (cardsHeaderRef.current) cardsHeaderRef.current.style.opacity = '0';
      return;
    }
    if (cardsHeaderRef.current) cardsHeaderRef.current.style.opacity = '1';

    // ── Typing phase ───────────────────────────────────────────────────
    const typingElapsed = elapsed - RECORDING_START_TIME;
    const revealedChars = Math.min(
      Math.floor(typingElapsed * TYPING_SPEED),
      fullTranscript.length,
    );
    const typingComplete = revealedChars >= fullTranscript.length;

    // Reveal spans character by character
    let charCount = 0;
    const segs = scenarios[scenarioIndex].segments;
    spans.forEach((span, idx) => {
      const originalText = segs[idx].text;
      const segLen = originalText.length;
      const segStart = charCount;
      const segEnd = charCount + segLen;

      if (revealedChars >= segEnd) {
        span.style.visibility = 'visible';
        if (span.textContent !== originalText) span.textContent = originalText;
      } else if (revealedChars > segStart) {
        span.style.visibility = 'visible';
        const partial = originalText.substring(0, revealedChars - segStart);
        if (span.textContent !== partial) span.textContent = partial;
      } else {
        span.style.visibility = 'hidden';
        if (span.textContent !== originalText) span.textContent = originalText;
      }

      charCount += segLen;
    });

    // Cursor removed — typing animation is clear without it

    // ── Highlight phase ────────────────────────────────────────────────
    // Build segment char offsets
    interface SegPos { category: string; startChar: number; endChar: number; spanIndex: number }
    const segmentPositions: SegPos[] = [];
    let pos = 0;
    segs.forEach((seg, i) => {
      if (seg.category) {
        segmentPositions.push({ category: seg.category, startChar: pos, endChar: pos + seg.text.length, spanIndex: i });
      }
      pos += seg.text.length;
    });

    // Desktop logic: trigger when cursor passes END of segment + 0.3s delay
    // Then sweep at HIGHLIGHT_SPEED
    const highlightStates: { category: string; progress: number; completionTime: number }[] = [];

    segmentPositions.forEach((segPos) => {
      const span = spans[segPos.spanIndex];
      if (!span) return;

      const triggerChar = segPos.endChar;
      const triggerTime = triggerChar / TYPING_SPEED + 0.3; // 0.3s delay after cursor passes end

      if (typingElapsed >= triggerTime) {
        const timeSinceTrigger = typingElapsed - triggerTime;
        const segLen = segPos.endChar - segPos.startChar;
        const highlightDuration = segLen / HIGHLIGHT_SPEED;
        const progress = Math.min(1, timeSinceTrigger / highlightDuration);
        span.style.setProperty('--p', String(progress));
        highlightStates.push({
          category: segPos.category,
          progress,
          completionTime: triggerTime + highlightDuration,
        });
      } else {
        span.style.setProperty('--p', '0');
      }
    });

    // ── Cards phase ────────────────────────────────────────────────────
    const cards = cardRefs.current;
    const items = scenario.extractedItems;
    let allCardsFullyVisible = true;
    let latestCardVisibleTime = 0;

    items.forEach((item, i) => {
      const card = cards[i];
      if (!card) return;

      const hs = highlightStates.find(h => h.category === item.category);

      if (hs && hs.progress >= 1) {
        // Card fades in over 0.3s after highlight completes
        const timeSinceComplete = typingElapsed - hs.completionTime;
        const cardOpacity = Math.min(1, Math.max(0, timeSinceComplete / 0.3));
        card.style.opacity = String(cardOpacity);
        card.style.transform = cardOpacity >= 1 ? 'translateY(0)' : `translateY(${6 * (1 - cardOpacity)}px)`;
        if (cardOpacity >= 1) {
          latestCardVisibleTime = Math.max(latestCardVisibleTime, hs.completionTime + 0.3);
        } else {
          allCardsFullyVisible = false;
        }
      } else if (!hs && typingComplete) {
        // No matching highlight but typing is done — show card
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(6px)';
        allCardsFullyVisible = false;
      }
    });

    // Fade everything out 2s before scenario ends
    if (elapsed > SINGLE_SCENARIO_DURATION - 2.0) {
      const fadeOut = Math.max(0, 1 - (elapsed - (SINGLE_SCENARIO_DURATION - 2.0)) / 1.0);
      cards.forEach(c => { if (c) c.style.opacity = String(Math.min(parseFloat(c.style.opacity || '1'), fadeOut)); });
      spans.forEach(s => { s.style.opacity = String(fadeOut); });
      if (cardsHeaderRef.current) cardsHeaderRef.current.style.opacity = String(fadeOut);
    } else {
      // Reset opacity after scenario change
      spans.forEach(s => { if (s.style.opacity !== '1') s.style.opacity = '1'; });
    }
  }, [buildTranscript, buildCards, buildDemoTranscript, buildDemoCards]);

  // ── Animation loop with IntersectionObserver ───────────────────────────
  useEffect(() => {
    let running = false;

    const start = () => {
      if (!running) {
        running = true;
        const loop = () => {
          tick();
          if (running) rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      }
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };

    const observer = new IntersectionObserver(
      ([entry]) => { entry.isIntersecting ? start() : stop(); },
      { rootMargin: '100px' },
    );

    if (containerRef.current) observer.observe(containerRef.current);
    start();

    return () => { stop(); observer.disconnect(); };
  }, [tick]);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(160deg,
          rgba(160,210,245,0.28) 0%,
          rgba(150,220,220,0.24) 18%,
          rgba(245,245,250,0.12) 40%,
          rgba(250,248,245,0.10) 60%,
          rgba(255,200,150,0.22) 82%,
          rgba(255,175,120,0.25) 100%),
          #F8F9FA`,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Fine film grain overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          opacity: 0.12,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      {/* ── Status bar: time | dynamic island | cellular ─────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px 0',
        position: 'relative',
        zIndex: 30,
      }}>
        {/* Time — left of dynamic island */}
        <span
          ref={clockRef}
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#1a1a1a',
            minWidth: 50,
          }}
        >
          {(() => { const n = new Date(); return `${n.getHours()}:${String(n.getMinutes()).padStart(2, '0')}`; })()}
        </span>

        {/* Dynamic Island */}
        <div style={{
          width: '35%',
          height: 28,
          borderRadius: 20,
          background: '#000000',
          flexShrink: 0,
        }} />

        {/* Cellular + Wi-Fi + Battery — right of dynamic island */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 50, justifyContent: 'flex-end' }}>
          {/* Cellular bars */}
          <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
            <rect x="0" y="9" width="3" height="3" rx="0.5" fill="#1a1a1a" />
            <rect x="4.5" y="6" width="3" height="6" rx="0.5" fill="#1a1a1a" />
            <rect x="9" y="3" width="3" height="9" rx="0.5" fill="#1a1a1a" />
            <rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="#1a1a1a" />
          </svg>
          {/* Wi-Fi */}
          <svg width="15" height="12" viewBox="0 0 15 12" fill="#1a1a1a">
            <path d="M7.5 10.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />
            <path d="M4.2 8.4a4.5 4.5 0 0 1 6.6 0" stroke="#1a1a1a" strokeWidth="1.4" fill="none" strokeLinecap="round" />
            <path d="M1.5 5.7a8.2 8.2 0 0 1 12 0" stroke="#1a1a1a" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          </svg>
          {/* Battery */}
          <svg width="22" height="11" viewBox="0 0 22 11" fill="none">
            <rect x="0.5" y="0.5" width="18" height="10" rx="2" stroke="#1a1a1a" strokeWidth="1" />
            <rect x="2" y="2" width="14" height="7" rx="1" fill="#1a1a1a" />
            <path d="M20 3.5v4a1.5 1.5 0 0 0 0-4z" fill="#1a1a1a" />
          </svg>
        </div>
      </div>

      {/* ── VOIS NOTE header ─────────────────────────────────────────────── */}
      <div style={{
        textAlign: 'center',
        padding: '4px 0 4px',
        fontSize: 20,
        fontWeight: 700,
        color: '#1a1a1a',
        letterSpacing: '0.04em',
      }}>
        VOIS NOTE
      </div>

      {/* ── VOIS Logo overlay (first 2s of each scenario) ──────────────── */}
      <div
        ref={logoRef}
        style={{
          position: 'absolute', inset: 0, zIndex: 20,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(160deg,
            rgba(190,215,245,0.55) 0%,
            rgba(180,225,225,0.50) 20%,
            rgba(210,205,235,0.45) 40%,
            rgba(240,210,215,0.40) 60%,
            rgba(248,230,210,0.32) 80%,
            rgba(245,240,230,0.22) 100%),
            #F8F9FA`,
        }}
      >
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: '#1a1a1a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 12,
        }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="6" width="3" height="12" rx="1.5" fill="white" />
            <rect x="10.5" y="3" width="3" height="18" rx="1.5" fill="white" />
            <rect x="17" y="8" width="3" height="8" rx="1.5" fill="white" />
          </svg>
        </div>
        <span style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a', letterSpacing: '0.05em' }}>
          VOIS
        </span>
        <span style={{ fontSize: 18, color: '#94a3b8', marginTop: 4 }}>
          Listening...
        </span>
      </div>

      {/* ── Demo Recording / Processing overlay ────────────────────────── */}
      <div
        ref={demoOverlayRef}
        style={{
          position: 'absolute', inset: 0, zIndex: 25,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(160deg,
            rgba(190,215,245,0.55) 0%,
            rgba(180,225,225,0.50) 20%,
            rgba(210,205,235,0.45) 40%,
            rgba(240,210,215,0.40) 60%,
            rgba(248,230,210,0.32) 80%,
            rgba(245,240,230,0.22) 100%),
            #F8F9FA`,
          transition: 'opacity 0.3s ease',
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        {/* VOIS Logo */}
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: '#1a1a1a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16,
        }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="6" width="3" height="12" rx="1.5" fill="white" />
            <rect x="10.5" y="3" width="3" height="18" rx="1.5" fill="white" />
            <rect x="17" y="8" width="3" height="8" rx="1.5" fill="white" />
          </svg>
        </div>

        {/* Recording dot + label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div
            ref={demoDotRef}
            style={{
              width: 10, height: 10, borderRadius: '50%',
              background: '#ef4444',
            }}
          />
          <span style={{ fontSize: 16, fontWeight: 600, color: '#ef4444', letterSpacing: '0.02em' }}>
            Recording
          </span>
        </div>

        {/* Timer */}
        <span
          ref={demoTimerRef}
          style={{
            fontSize: 48, fontWeight: 700,
            color: '#1a1a1a', fontFamily: 'monospace',
            letterSpacing: '0.05em',
            marginBottom: 20,
          }}
        >
          0:00
        </span>

        {/* Waveform bars */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 3, height: 60, width: '80%',
          marginBottom: 16,
        }}>
          {Array.from({ length: DEMO_BAR_COUNT }, (_, i) => (
            <div
              key={i}
              ref={el => { demoBarsRef.current[i] = el; }}
              style={{
                width: 4, minWidth: 3,
                borderRadius: 2,
                background: '#ef4444',
                height: 8,
                transition: 'height 80ms ease-out',
                willChange: 'height',
                flexShrink: 0,
              }}
            />
          ))}
        </div>

        {/* Status / tip text */}
        <span
          ref={demoStatusRef}
          style={{
            fontSize: 14, color: '#94a3b8',
            fontWeight: 500, textAlign: 'center',
            maxWidth: '80%',
          }}
        >
          Recording...
        </span>
      </div>

      {/* ── Waiting to record overlay ─────────────────────────────────── */}
      <div
        ref={waitingOverlayRef}
        style={{
          position: 'absolute', inset: 0, zIndex: 22,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(160deg,
            rgba(190,215,245,0.55) 0%,
            rgba(180,225,225,0.50) 20%,
            rgba(210,205,235,0.45) 40%,
            rgba(240,210,215,0.40) 60%,
            rgba(248,230,210,0.32) 80%,
            rgba(245,240,230,0.22) 100%),
            #F8F9FA`,
          transition: 'opacity 0.3s ease',
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        <div
          ref={waitingRecordBtnRef}
          style={{
            width: 80, height: 80, borderRadius: '50%',
            background: '#ef4444',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.35)',
            transition: 'transform 0.15s ease',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <rect x="9" y="1" width="6" height="12" rx="3" fill="white" />
            <path d="M5 10a7 7 0 0 0 14 0" />
            <line x1="12" y1="17" x2="12" y2="21" />
            <line x1="8" y1="21" x2="16" y2="21" />
          </svg>
        </div>
        <span style={{ fontSize: 18, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>
          Tap to Record
        </span>
        <span style={{ fontSize: 13, color: '#94a3b8' }}>
          Share your thoughts
        </span>
      </div>

      {/* ── Transcript panel (white card with layered shadow) ──────────── */}
      <div style={{
        margin: '0 4.5%',
        background: '#ffffff',
        borderRadius: 28,
        padding: '5%',
        minHeight: '35%',
        position: 'relative',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06), 0 12px 28px rgba(0,0,0,0.04)',
      }}>
        <div
          ref={transcriptRef}
          style={{
            fontSize: 15,
            lineHeight: 1.7,
            color: '#374151',
            fontWeight: 400,
            wordBreak: 'break-word',
          }}
        />
      </div>

      {/* ── Action Cards section ───────────────────────────────────────── */}
      <div style={{ margin: '2% 4.5% 0', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* "Action Cards" header */}
        <div
          ref={cardsHeaderRef}
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#1a1a1a',
            marginBottom: '1.5%',
            transition: 'opacity 0.3s',
          }}
        >
          Action Cards
        </div>

        {/* Cards panel */}
        <div style={{
          background: '#ffffff',
          borderRadius: 28,
          padding: '3.5%',
          flex: 1,
          boxShadow: '0 4px 16px rgba(0,0,0,0.05), 0 12px 28px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div
            ref={cardsContainerRef}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.2%', flex: 1 }}
          />
        </div>
      </div>

      {/* ── Floating pill navigation bar ─────────────────────────────── */}
      <div style={{
        position: 'absolute',
        bottom: '3%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '60%',
        background: 'rgba(255,255,255,0.92)',
        borderRadius: 9999,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '2.5% 0',
        boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
        border: '0.5px solid rgba(0,0,0,0.06)',
        zIndex: 10,
      }}>
        {/* Sparkles (Magic) — inactive */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#9ca3af" stroke="none">
          <path d="M12 2L13.5 7.5 19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5z" />
          <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z" />
        </svg>
        {/* Mic (Stream) — ACTIVE (dark) */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round">
          <rect x="9" y="1" width="6" height="12" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0" />
          <line x1="12" y1="17" x2="12" y2="21" />
          <line x1="8" y1="21" x2="16" y2="21" />
        </svg>
        {/* Grid (Apps) — inactive */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
          <circle cx="6" cy="6" r="2" /><circle cx="12" cy="6" r="2" /><circle cx="18" cy="6" r="2" />
          <circle cx="6" cy="14" r="2" /><circle cx="12" cy="14" r="2" /><circle cx="18" cy="14" r="2" />
        </svg>
      </div>
    </div>
  );
};

export default PhoneScreenAnimation;
