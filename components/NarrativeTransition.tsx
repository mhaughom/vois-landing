import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { setCurrentSection, setNarrativeScrollProgress } from './DeviceScene';

const NarrativeTransition: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });
  
  // Notify DeviceScene when we reach the "Capture at the speed of thought" section
  // Also pass the scroll progress so devices can sync their animation to the fog timing
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    // Always update the narrative scroll progress for device animation timing
    setNarrativeScrollProgress(progress);
    
    // Capture text starts becoming visible at ~45%, trigger devices at 40% (before text appears)
    if (progress >= 0.40 && progress < 0.92) {
      setCurrentSection('capture');
    } else if (progress < 0.40) {
      setCurrentSection('narrative');
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ENTRY EASE - Content scrolls up to meet you, easing into the stop
  // Creates smooth deceleration as you enter the sticky section
  // ═══════════════════════════════════════════════════════════════════════════
  const entryTranslateY = useTransform(
    scrollYProgress,
    [0, 0.02, 0.05, 0.10, 0.15],
    ['80px', '40px', '15px', '4px', '0px']
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 1: "Let's breathe." (0% - 25%)
  // Black text on White - scales up and fades out (fly-through effect)
  // Video starts appearing behind the text as it fades
  // ═══════════════════════════════════════════════════════════════════════════
  const phase1Opacity = useTransform(scrollYProgress, [0, 0.15, 0.25], [1, 0.8, 0]);
  const phase1Scale = useTransform(scrollYProgress, [0, 0.25], [1, 2.2]);
  const phase1Blur = useTransform(scrollYProgress, [0.15, 0.25], [0, 6]);

  // ═══════════════════════════════════════════════════════════════════════════
  // VIDEO REVEAL - White overlay fades out to reveal video
  // Shortened video visibility time (~15% less scroll time)
  // Video starts appearing at 12%, fully visible by 35%, fog returns sooner
  // ═══════════════════════════════════════════════════════════════════════════
  const whiteMaskOpacity = useTransform(scrollYProgress, [0.12, 0.35], [1, 0]);

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 2: FOG RE-ENTRY - starts sooner, completes faster
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Fog starts returning earlier (35% instead of 40%)
  const fogReturnOpacity = useTransform(scrollYProgress, [0.35, 0.62], [0, 1]);
  
  // Final white overlay fades in to lock the white screen (earlier)
  const finalWhiteOpacity = useTransform(scrollYProgress, [0.58, 0.75], [0, 1]);
  
  // "Capture at the speed of thought" - scrolls up with easing, STICKS in center, then exits smoothly
  const captureTextOpacity = useTransform(scrollYProgress, [0.45, 0.52, 0.88, 0.95], [0, 1, 1, 0]);
  // Ease-out landing: 80vh -> 15vh -> 3vh -> 0vh (decelerating)
  // Ease-in exit: 0vh -> -3vh -> -15vh -> -40vh (accelerating)
  const captureTextY = useTransform(
    scrollYProgress, 
    [0.45, 0.52, 0.58, 0.65, 0.72, 0.78, 0.85, 0.92, 1.0], 
    ['80vh', '20vh', '5vh', '0vh', '0vh', '-2vh', '-8vh', '-25vh', '-45vh']
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // VIDEO SCROLL-UP EFFECT
  // Subtle movement during reveal, then accelerates after fully visible
  // ═══════════════════════════════════════════════════════════════════════════
  const videoTranslateY = useTransform(
    scrollYProgress, 
    [0.15, 0.25, 0.35, 0.45, 0.55, 0.70, 0.85], 
    ['0%', '-1%', '-3%', '-8%', '-18%', '-35%', '-55%']
  );

  return (
    <>
      {/* Global styles */}
      <style>{`
        .narrative-text-dark {
          font-family: 'Instrument Serif', Georgia, serif;
          font-weight: 400;
          letter-spacing: 0.02em;
        }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════════════════
          SCROLL TRACK CONTAINER (280vh - compact for faster transition)
      ═══════════════════════════════════════════════════════════════════════ */}
      <div
        ref={containerRef}
        style={{
          height: '280vh',
          position: 'relative',
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
        }}
      >
        {/* ═══════════════════════════════════════════════════════════════════
            STICKY VIEWPORT (locks to screen while scrolling)
        ═══════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            width: '100%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
          }}
        >
          {/* ═════════════════════════════════════════════════════════════════
              LAYER 1: FULL-SCREEN VIDEO (Bottom - z-index: 1)
              Scrolls up after reveal to create natural vertical flow
          ═════════════════════════════════════════════════════════════════ */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              overflow: 'hidden',
              y: videoTranslateY,
            }}
          >
            {/* Full-screen video */}
            <video
              autoPlay
              loop
              muted
              playsInline
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            >
              <source src="/videos/kling_20260107_Image_to_Video_Static_sho_2574_2.mp4" type="video/mp4" />
            </video>
            
            {/* Softer vignette overlay - more landscape visible */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `
                  radial-gradient(ellipse 85% 85% at 50% 50%, 
                    transparent 0%, 
                    transparent 30%,
                    rgba(255, 255, 255, 0.05) 40%,
                    rgba(255, 255, 255, 0.15) 50%,
                    rgba(255, 255, 255, 0.3) 60%,
                    rgba(255, 255, 255, 0.5) 72%,
                    rgba(255, 255, 255, 0.75) 85%,
                    rgba(255, 255, 255, 0.92) 95%,
                    #ffffff 100%
                  )
                `,
                pointerEvents: 'none',
              }}
            />
            
            {/* Light white overlay (8% transparency) - more color visible */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                pointerEvents: 'none',
              }}
            />
            
            {/* Feathered bottom edge - soft gradient to white */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: '25%',
                background: 'linear-gradient(to top, #ffffff 0%, rgba(255,255,255,0.9) 20%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%)',
                pointerEvents: 'none',
              }}
            />
          </motion.div>

          {/* ═════════════════════════════════════════════════════════════════
              LAYER 2: WHITE MASK (z-index: 10)
              Covers video during text phases, fades to reveal video
          ═════════════════════════════════════════════════════════════════ */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#ffffff',
              opacity: whiteMaskOpacity,
              zIndex: 10,
              pointerEvents: 'none',
            }}
          />

          {/* ═════════════════════════════════════════════════════════════════
              LAYER 3: SEAMLESS FOG FADE (z-index: 18-25)
              Fog returns gradually once video is visible, creating smooth exit
          ═════════════════════════════════════════════════════════════════ */}
          
          {/* Fog returns slowly after video is revealed - like mist rolling back in */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 20,
              pointerEvents: 'none',
              backgroundColor: '#ffffff',
              opacity: fogReturnOpacity,
            }}
          />
          
          {/* Final white overlay - locks in the white permanently */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#ffffff',
              opacity: finalWhiteOpacity,
              zIndex: 25,
              pointerEvents: 'none',
            }}
          />

          {/* ═════════════════════════════════════════════════════════════════
              LAYER 4: TEXT CONTAINER (z-index: 30)
              Has entry ease - scrolls up to meet you as you enter
          ═════════════════════════════════════════════════════════════════ */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 30,
              pointerEvents: 'none',
              y: entryTranslateY,
            }}
          >
            {/* ─────────────────────────────────────────────────────────────────
                PHASE 1: "Let's breathe." (fly-through effect)
            ───────────────────────────────────────────────────────────────── */}
            <motion.h2
              className="narrative-text-dark"
              style={{
                position: 'absolute',
                opacity: phase1Opacity,
                scale: phase1Scale,
                filter: useTransform(phase1Blur, (v) => `blur(${v}px)`),
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                color: '#1e293b',
                textAlign: 'center',
                padding: '0 2rem',
                maxWidth: '90vw',
                lineHeight: 1.3,
              }}
            >
              Let's breathe.
            </motion.h2>

            {/* ─────────────────────────────────────────────────────────────────
                PHASE 3: Hero Section
                Headline + Subhead + Chips + CTA + Trust Text
            ───────────────────────────────────────────────────────────────── */}
            <motion.div
              style={{
                position: 'absolute',
                opacity: captureTextOpacity,
                y: captureTextY,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'clamp(1rem, 2vw, 1.5rem)',
                padding: '0 2rem',
                maxWidth: '1200px',
                width: '90%',
                textAlign: 'center',
                pointerEvents: 'auto',
              }}
            >
              {/* Headline */}
              <h2
                style={{
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                  color: '#0f172a',
                  lineHeight: 1.1,
                  fontWeight: 400,
                  margin: 0,
                }}
              >
                The Executive Assistant that clears your mind.
              </h2>
              
              {/* Subhead */}
              <p
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
                  color: '#64748b',
                  lineHeight: 1.5,
                  margin: '0.5rem 0 1rem 0',
                  maxWidth: '700px',
                  fontWeight: 400,
                }}
              >
                Turn your voice into tasks, plans, and insights instantly.
              </p>
              
              {/* Chips Row */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: 'clamp(0.5rem, 1vw, 0.75rem)',
                  marginBottom: '0.5rem',
                }}
              >
                {['Calendar Tasks', 'Shopping List', 'Business Ideas', '+ Custom Spaces'].map((chip, index) => (
                  <span
                    key={index}
                    style={{
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                      fontSize: 'clamp(0.85rem, 1.2vw, 1rem)',
                      color: '#475569',
                      backgroundColor: '#f1f5f9',
                      padding: 'clamp(0.5rem, 1vw, 0.75rem) clamp(1rem, 1.5vw, 1.25rem)',
                      borderRadius: '100px',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {chip}
                  </span>
                ))}
              </div>
              
              {/* Primary CTA Button */}
              <button
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
                  fontWeight: 600,
                  color: '#ffffff',
                  backgroundColor: '#0f172a',
                  border: 'none',
                  padding: 'clamp(0.875rem, 1.5vw, 1.125rem) clamp(2rem, 3vw, 3rem)',
                  borderRadius: '100px',
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1e293b';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(15, 23, 42, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0f172a';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(15, 23, 42, 0.25)';
                }}
              >
                Request Access
              </button>
              
              {/* Trust Text */}
              <p
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: 'clamp(0.8rem, 1vw, 0.9rem)',
                  color: '#94a3b8',
                  marginTop: '0.75rem',
                  fontWeight: 400,
                }}
              >
                Nothing changes without your approval.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default NarrativeTransition;
