import React, { useRef, useEffect, useCallback } from 'react';
import {
  getScenarioState,
  RECORDING_START_TIME,
} from '../lib/scenarios';

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

  const tick = useCallback(() => {
    const now = Date.now();
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
