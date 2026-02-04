import React, { useRef, useEffect, useCallback } from 'react';
import {
  getScenarioState,
  RECORDING_START_TIME,
} from '../lib/scenarios';
import { globalState } from './deviceState';

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
      }
      return;
    }
    // Hide waiting overlay
    if (waitingOverlayRef.current) {
      waitingOverlayRef.current.style.opacity = '0';
      waitingOverlayRef.current.style.pointerEvents = 'none';
    }

    const state = getScenarioState(startTimeRef.current);
    const elapsed = state.elapsed;
    const recordingElapsed = Math.max(0, elapsed - RECORDING_START_TIME);

    // Update waveform bars — deterministic sine-based levels
    const t = now * 0.002;
    for (let i = 0; i < BAR_COUNT; i++) {
      const bar = barsRef.current[i];
      if (!bar) continue;
      const phase = t + i * 0.3;
      const level = 0.3 + Math.sin(phase) * 0.25 + Math.sin(phase * 1.7) * 0.2 + Math.sin(phase * 2.3 + i) * 0.1;
      const clamped = Math.min(1, Math.max(0.1, level));
      const h = 10 + clamped * 70; // 10px min, 80px max
      bar.style.height = `${h}px`;
      const intensity = 0.5 + clamped * 0.5;
      bar.style.opacity = String(intensity);
    }

    // Update timer
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
      {/* Waiting to record overlay */}
      <div
        ref={waitingOverlayRef}
        style={{
          position: 'absolute', inset: 0, zIndex: 10,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'radial-gradient(circle at 50% 50%, #1a1a2e, #000000)',
          transition: 'opacity 0.3s ease',
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        <div
          ref={waitingRecordBtnRef}
          style={{
            width: '38%', aspectRatio: '1',
            borderRadius: '50%',
            background: '#ef4444',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '6%',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)',
            transition: 'transform 0.15s ease',
          }}
        >
          <div style={{
            width: '40%', height: '40%',
            borderRadius: '50%',
            background: 'white',
          }} />
        </div>
        <span style={{
          color: '#ffffff', fontWeight: 600,
          fontSize: '70%',
        }}>
          Tap to Record
        </span>
      </div>

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
      <span style={{
        color: '#888888', fontSize: '20%',
        marginTop: '4%', fontWeight: 500,
      }}>
        Recording...
      </span>
    </div>
  );
};

export default WatchRecordingAnimation;
