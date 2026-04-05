import React, { useRef, useEffect, useCallback } from 'react';
import {
  getScenarioState,
  RECORDING_START_TIME,
  TYPING_SPEED,
} from '../lib/scenarios';
import { globalState } from '@li/shared/components/deviceState';

// ─── Props ───────────────────────────────────────────────────────────────────
interface WatchRecordingAnimationProps {
  startTime?: number;
  className?: string;
}

const BAR_COUNT = 24;

// ─── Component ───────────────────────────────────────────────────────────────
export const WatchRecordingAnimation: React.FC<WatchRecordingAnimationProps> = ({
  startTime,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const startTimeRef = useRef(startTime ?? Date.now());
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const timerRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const waitingOverlayRef = useRef<HTMLDivElement>(null);
  const waitingRecordBtnRef = useRef<HTMLDivElement>(null);
  const recordingContentRef = useRef<HTMLDivElement>(null);
  const statusTextRef = useRef<HTMLSpanElement>(null);
  const sentOverlayRef = useRef<HTMLDivElement>(null);

  const tick = useCallback(() => {
    const now = Date.now();

    // ── Check demo waiting state ────────────────────────────────────────
    const isDemoWaiting = globalState.demoState.isWaitingToStart;
    if (isDemoWaiting) {
      if (waitingOverlayRef.current) {
        waitingOverlayRef.current.style.opacity = '1';
        waitingOverlayRef.current.style.pointerEvents = 'auto';
      }
      if (waitingRecordBtnRef.current) {
        const pulse = 0.9 + Math.sin(now / 800) * 0.1;
        waitingRecordBtnRef.current.style.transform = `scale(${pulse})`;
        waitingRecordBtnRef.current.style.background = '#ef4444';
        waitingRecordBtnRef.current.style.boxShadow = '0 4px 20px rgba(239, 68, 68, 0.4)';
      }
      if (recordingContentRef.current) recordingContentRef.current.style.opacity = '0';
      if (sentOverlayRef.current) sentOverlayRef.current.style.opacity = '0';
      return;
    }

    const state = getScenarioState(startTimeRef.current);
    const elapsed = state.elapsed;
    const typingDuration = state.fullTranscript.length / TYPING_SPEED;
    const typingEndTime = RECORDING_START_TIME + typingDuration;

    const tapStart = RECORDING_START_TIME - 0.7;

    // Overlapping cross-fade timing (prevents blink):
    //   Tap to record fades in  0.6 → 1.0s  (z-index 10, underneath)
    //   Sent to iPhone fades out 0.8 → 1.2s  (z-index 12, on top, reveals tap)
    const tapFadeInStart = 0.6;
    const tapFadeInEnd = 1.0;
    const sentFadeOutStart = 0.8;
    const sentFadeOutEnd = 1.2;

    // ── Phase 1: Sent-to-iPhone → Tap-to-record → Tap animation (0 to RECORDING_START_TIME) ──
    if (elapsed < RECORDING_START_TIME) {
      if (recordingContentRef.current) recordingContentRef.current.style.opacity = '0';

      // --- "Sent to iPhone" (z-index 12, on top — fades out 0.8-1.2s) ---
      const sentAlpha = elapsed < sentFadeOutStart
        ? Math.min(1, elapsed / 0.3)
        : elapsed < sentFadeOutEnd
          ? Math.max(0, 1 - (elapsed - sentFadeOutStart) / (sentFadeOutEnd - sentFadeOutStart))
          : 0;

      if (sentOverlayRef.current) {
        sentOverlayRef.current.style.opacity = String(Math.max(0, sentAlpha));
      }

      // --- "Tap to record" (z-index 10, underneath — fades in 0.6-1.0s) ---
      const tapToRecordAlpha = elapsed < tapFadeInStart
        ? 0
        : elapsed < tapFadeInEnd
          ? (elapsed - tapFadeInStart) / (tapFadeInEnd - tapFadeInStart)
          : elapsed > RECORDING_START_TIME - 0.4 ? Math.max(0, (RECORDING_START_TIME - elapsed) / 0.4) : 1;

      if (waitingOverlayRef.current) {
        waitingOverlayRef.current.style.opacity = String(Math.max(0, Math.min(1, tapToRecordAlpha)));
        waitingOverlayRef.current.style.pointerEvents = 'none';
      }

      if (waitingRecordBtnRef.current) {
        const isTapping = elapsed > tapStart;
        if (isTapping) {
          const tapProgress = (elapsed - tapStart) / 0.7;
          const pressScale = tapProgress < 0.35 ? 1 - tapProgress * 0.14 : 0.951 + (tapProgress - 0.35) * 0.075;
          waitingRecordBtnRef.current.style.transform = `scale(${pressScale})`;
          const glowIntensity = 0.4 + tapProgress * 0.4;
          waitingRecordBtnRef.current.style.boxShadow = `0 4px 20px rgba(239, 68, 68, ${glowIntensity})`;
          waitingRecordBtnRef.current.style.background = '#ef4444';
        } else {
          const pulse = 0.9 + Math.sin(now / 800) * 0.1;
          waitingRecordBtnRef.current.style.transform = `scale(${pulse})`;
          waitingRecordBtnRef.current.style.background = 'rgba(255, 255, 255, 0.12)';
          waitingRecordBtnRef.current.style.boxShadow = 'none';
        }
      }

      return;
    }

    // ── Phase 2: Recording (RECORDING_START_TIME to typingEndTime) ──
    if (elapsed < typingEndTime) {
      if (waitingOverlayRef.current) {
        waitingOverlayRef.current.style.opacity = '0';
        waitingOverlayRef.current.style.pointerEvents = 'none';
      }
      if (sentOverlayRef.current) sentOverlayRef.current.style.opacity = '0';
      if (recordingContentRef.current) recordingContentRef.current.style.opacity = '1';

      const recordingElapsed = elapsed - RECORDING_START_TIME;

      // Waveform bars
      const t = now * 0.002;
      for (let i = 0; i < BAR_COUNT; i++) {
        const bar = barsRef.current[i];
        if (!bar) continue;
        const phase = t + i * 0.3;
        const level = 0.3 + Math.sin(phase) * 0.25 + Math.sin(phase * 1.7) * 0.2 + Math.sin(phase * 2.3 + i) * 0.1;
        const clamped = Math.min(1, Math.max(0.1, level));
        const h = 10 + clamped * 70;
        bar.style.height = `${h}px`;
        bar.style.opacity = String(0.5 + clamped * 0.5);
      }

      // Timer
      if (timerRef.current) {
        const secs = Math.floor(recordingElapsed);
        const mins = Math.floor(secs / 60);
        const displaySecs = secs % 60;
        timerRef.current.textContent = `${mins}:${String(displaySecs).padStart(2, '0')}`;
      }

      // Pulsing recording dot
      if (dotRef.current) {
        const pulse = 0.6 + Math.sin(now / 300) * 0.4;
        dotRef.current.style.opacity = String(pulse);
      }

      if (statusTextRef.current) statusTextRef.current.textContent = 'Recording...';
      return;
    }

    // ── Phase 3: Post-typing — "Sent to iPhone" ──
    {
      if (waitingOverlayRef.current) {
        waitingOverlayRef.current.style.opacity = '0';
        waitingOverlayRef.current.style.pointerEvents = 'none';
      }
      if (recordingContentRef.current) recordingContentRef.current.style.opacity = '0';

      const timeSinceEnd = elapsed - typingEndTime;
      const fadeIn = Math.min(1, timeSinceEnd / 0.4);
      if (sentOverlayRef.current) {
        sentOverlayRef.current.style.opacity = String(fadeIn);
      }
    }

  }, []);

  useEffect(() => {
    let running = false;

    const start = () => {
      if (!running) {
        running = true;
        rafRef.current = requestAnimationFrame(function loop() {
          tick();
          if (running) rafRef.current = requestAnimationFrame(loop);
        });
      }
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
        else stop();
      },
      { rootMargin: '100px' },
    );

    if (containerRef.current) observer.observe(containerRef.current);
    start();

    return () => {
      stop();
      observer.disconnect();
    };
  }, [tick]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 50%, #1a1a2e, #000000)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 34,
      }}
    >
      {/* Fine film grain overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          opacity: 0.15,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* "Sent to iPhone" overlay */}
      <div
        ref={sentOverlayRef}
        style={{
          position: 'absolute', inset: 0, zIndex: 12,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'radial-gradient(circle at 50% 50%, #1a1a2e, #000000)',
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        {/* Checkmark circle */}
        <div style={{
          width: '28%', aspectRatio: '1',
          borderRadius: '50%',
          background: 'rgba(34, 197, 94, 0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '6%',
        }}>
          <svg width="50%" height="50%" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 12 9 17 20 6" />
          </svg>
        </div>
        <span style={{
          color: 'rgba(255, 255, 255, 0.85)', fontWeight: 600,
          fontSize: '75%',
        }}>
          Sent to iPhone
        </span>
      </div>

      {/* Tap-to-record overlay */}
      <div
        ref={waitingOverlayRef}
        style={{
          position: 'absolute', inset: 0, zIndex: 10,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'radial-gradient(circle at 50% 50%, #1a1a2e, #000000)',
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        <div
          ref={waitingRecordBtnRef}
          style={{
            width: '38%', aspectRatio: '1',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '6%',
            transition: 'transform 0.15s ease',
          }}
        >
          <svg width="40%" height="40%" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="6" width="3" height="12" rx="1.5" fill="white" opacity="0.9" />
            <rect x="10.5" y="3" width="3" height="18" rx="1.5" fill="white" opacity="0.9" />
            <rect x="17" y="8" width="3" height="8" rx="1.5" fill="white" opacity="0.9" />
          </svg>
        </div>
        <span style={{
          color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500,
          fontSize: '70%',
        }}>
          Tap to Record
        </span>
      </div>

      {/* Recording content wrapper */}
      <div
        ref={recordingContentRef}
        style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          width: '100%', height: '100%',
          position: 'relative',
          transition: 'opacity 0.3s ease',
        }}
      >
        {/* Recording dot */}
        <div
          ref={dotRef}
          style={{
            position: 'absolute', top: '10%', left: '12%',
            width: 18, height: 18, borderRadius: '50%',
            background: '#ef4444',
          }}
        />

        {/* VOIS text */}
        <span style={{
          color: '#ffffff', fontWeight: 700,
          fontSize: '130%', letterSpacing: '0.08em',
          marginBottom: '4%',
        }}>
          VOIS
        </span>

        {/* Waveform bars */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 3, height: '35%', width: '88%',
          marginBottom: '6%',
        }}>
          {Array.from({ length: BAR_COUNT }, (_, i) => (
            <div
              key={i}
              ref={el => { barsRef.current[i] = el; }}
              style={{
                width: '6px', minWidth: '5px',
                borderRadius: 3,
                background: '#ef4444',
                height: '6px',
                transition: 'height 80ms ease-out',
                willChange: 'height',
                flexShrink: 0,
              }}
            />
          ))}
        </div>

        {/* Timer */}
        <span
          ref={timerRef}
          style={{
            color: '#ef4444', fontWeight: 700,
            fontSize: '350%', fontFamily: 'monospace',
            letterSpacing: '0.08em',
          }}
        >
          0:00
        </span>

        {/* Status text */}
        <span
          ref={statusTextRef}
          style={{
            color: '#888888', fontSize: '20%',
            marginTop: '4%', fontWeight: 500,
          }}
        >
          Recording...
        </span>
      </div>
    </div>
  );
};

export default WatchRecordingAnimation;
