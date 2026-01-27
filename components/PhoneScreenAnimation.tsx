import React, { useRef, useEffect, useCallback } from 'react';
import {
  scenarios,
  getScenarioState,
  RECORDING_START_TIME,
  SINGLE_SCENARIO_DURATION,
  TYPING_SPEED,
  HIGHLIGHT_SPEED,
} from '../lib/scenarios';

// ─── Props ───────────────────────────────────────────────────────────────────
interface PhoneScreenAnimationProps {
  startTime?: number;
  className?: string;
}

// ─── Highlight colors (70% opacity — matches DeviceScene canvas exactly) ─────
const highlightColors: Record<string, string> = {
  work:     'rgba(187, 247, 208, 0.7)',
  errands:  'rgba(254, 215, 170, 0.7)',
  ideas:    'rgba(254, 240, 138, 0.7)',
  health:   'rgba(254, 202, 202, 0.7)',
  finance:  'rgba(165, 243, 252, 0.7)',
  social:   'rgba(251, 207, 232, 0.7)',
  events:   'rgba(191, 219, 254, 0.7)',
  messages: 'rgba(251, 207, 232, 0.7)',
  shopping: 'rgba(221, 214, 254, 0.7)',
};

// ─── Card pastel colors (matches DeviceScene canvas exactly) ─────────────────
const cardColors: Record<string, { bg: string; accent: string; text: string }> = {
  work:     { bg: '#dcfce7', accent: '#4ade80', text: '#16a34a' },
  errands:  { bg: '#fff7ed', accent: '#fdba74', text: '#ea580c' },
  ideas:    { bg: '#fefce8', accent: '#fde047', text: '#ca8a04' },
  health:   { bg: '#fef2f2', accent: '#fca5a5', text: '#dc2626' },
  finance:  { bg: '#ecfeff', accent: '#22d3ee', text: '#0891b2' },
  social:   { bg: '#fdf2f8', accent: '#f9a8d4', text: '#db2777' },
  events:   { bg: '#dbeafe', accent: '#60a5fa', text: '#2563eb' },
  messages: { bg: '#fdf2f8', accent: '#f9a8d4', text: '#db2777' },
  shopping: { bg: '#f5f3ff', accent: '#c4b5fd', text: '#7c3aed' },
};

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
        border-radius: 24px; background: ${colors.bg};
        opacity: 0; transform: translateY(6px);
        will-change: opacity, transform;
        padding: 0; overflow: hidden;
        height: 9.5%;
        min-height: 48px;
      `;

      // Left accent bar (4px, 20% top/bottom padding)
      const bar = document.createElement('div');
      bar.style.cssText = `
        width: 4px; align-self: stretch; flex-shrink: 0;
        display: flex; flex-direction: column;
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

      // Icon
      const icon = document.createElement('span');
      icon.textContent = item.icon;
      icon.style.cssText = 'font-size: 16px; flex-shrink: 0; margin-left: 10px;';
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

      // Action buttons (stacked vertically on right)
      const btns = document.createElement('div');
      btns.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 2px; margin-right: 10px; flex-shrink: 0;';
      const check = document.createElement('span');
      check.textContent = '\u2713';
      check.style.cssText = `font-size: 14px; font-weight: 600; color: ${colors.accent}; line-height: 1;`;
      const dismiss = document.createElement('span');
      dismiss.textContent = '\u2715';
      dismiss.style.cssText = 'font-size: 13px; font-weight: 500; color: #cbd5e1; line-height: 1;';
      btns.appendChild(check);
      btns.appendChild(dismiss);
      card.appendChild(btns);

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

    // ── Logo phase (first 1s) ──────────────────────────────────────────
    if (logoRef.current) {
      logoRef.current.style.opacity = elapsed < RECORDING_START_TIME ? '1' : '0';
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
  }, [buildTranscript, buildCards]);

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
        background: '#f8f9fa',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: 'hidden',
        position: 'relative',
      }}
    >
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

      {/* ── VOIS Logo overlay (first 1s of each scenario) ──────────────── */}
      <div
        ref={logoRef}
        style={{
          position: 'absolute', inset: 0, zIndex: 20,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#f8f9fa',
          transition: 'opacity 0.3s ease',
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

      {/* ── Transcript panel (white card with layered shadow) ──────────── */}
      <div style={{
        margin: '0 4.5%',
        background: '#ffffff',
        borderRadius: 28,
        padding: '5%',
        minHeight: '35%',
        position: 'relative',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 8px 10px rgba(0,0,0,0.03)',
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

        {/* Cards panel (white card with layered shadow) */}
        <div style={{
          background: '#ffffff',
          borderRadius: 28,
          padding: '3.5%',
          flex: 1,
          boxShadow: '0 2px 4px rgba(0,0,0,0.04), 0 4px 6px rgba(0,0,0,0.05), 0 8px 10px rgba(0,0,0,0.03)',
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

      {/* ── Bottom navigation bar (matches desktop: fafafa bg, 1px border) */}
      <div style={{
        marginTop: 'auto',
        background: '#fafafa',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '3% 0 4%',
      }}>
        {/* Sparkles (Magic) — inactive */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#9ca3af" stroke="none">
          <path d="M12 2L13.5 7.5 19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5z" />
          <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z" />
        </svg>
        {/* Mic (Stream) — ACTIVE (dark) */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round">
          <rect x="9" y="1" width="6" height="12" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0" />
          <line x1="12" y1="17" x2="12" y2="21" />
          <line x1="8" y1="21" x2="16" y2="21" />
        </svg>
        {/* Grid (Apps) — inactive */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
          <circle cx="6" cy="6" r="2" /><circle cx="12" cy="6" r="2" /><circle cx="18" cy="6" r="2" />
          <circle cx="6" cy="14" r="2" /><circle cx="12" cy="14" r="2" /><circle cx="18" cy="14" r="2" />
        </svg>
      </div>
    </div>
  );
};

export default PhoneScreenAnimation;
