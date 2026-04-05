import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { setCurrentSection, setNarrativeScrollProgress } from '@li/shared/components/deviceState';

const NarrativeTransition: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [videosActive, setVideosActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const lastProgressRef = useRef(0);

  // Detect mobile viewport for responsive video loading
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Lazy load videos when section is near viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVideosActive(true);
          // Once loaded, disconnect - no need to unload
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Load 200px before visible
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Notify DeviceScene when we reach the "Capture at the speed of thought" section
  // THROTTLED: Only update if progress changed by more than 1%
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    // Skip if change is too small (less than 1%)
    if (Math.abs(progress - lastProgressRef.current) < 0.01) return;
    lastProgressRef.current = progress;

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
  // PHASE 1: "You don't have to carry it all." (0% - 25%)
  // Black text on White - scales up and fades out (fly-through effect)
  // Video starts appearing behind the text as it fades
  // ═══════════════════════════════════════════════════════════════════════════
  const phase1Opacity = useTransform(scrollYProgress, [0, 0.15, 0.25], [1, 0.8, 0]);
  const phase1Scale = useTransform(scrollYProgress, [0, 0.25], [1, 2.2]);
  const phase1Blur = useTransform(scrollYProgress, [0.15, 0.25], [0, 6]);

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 1.5: "VOIS wants to help." - appears on the video over mountains
  // Fades in as video is revealed, stays visible, then fades with fog return
  // ═══════════════════════════════════════════════════════════════════════════
  const videoTextOpacity = useTransform(scrollYProgress, [0.25, 0.35, 0.50, 0.60], [0, 1, 1, 0]);

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIFIED OVERLAY - Single smooth curve for video reveal and fog return
  // Creates a valley at the scroll snap point (~0.27) where clarity is maximum
  // Before snap: overlay decreases (video reveals)
  // At snap: minimum overlay (clearest moment)
  // After snap: overlay increases smoothly (fog returns)
  // ═══════════════════════════════════════════════════════════════════════════
  const unifiedOverlayOpacity = useTransform(
    scrollYProgress, 
    [0.0, 0.12, 0.20, 0.27, 0.34, 0.45, 0.58],
    [1, 1, 0.55, 0.35, 0.55, 0.85, 1]
  );
  
  // "Capture at the speed of thought" - fades in as fog completes, stays visible
  const captureTextOpacity = useTransform(scrollYProgress, [0.52, 0.60], [0, 1]);
  // Content centered at 0vh (true center), then scrolls up naturally
  const captureTextY = useTransform(
    scrollYProgress, 
    [0.45, 0.52, 0.58, 0.65, 0.70, 0.78, 0.88, 1.0], 
    ['80vh', '20vh', '5vh', '0vh', '-5vh', '-15vh', '-30vh', '-50vh']
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
        {/* ═══════════════════════════════════════════════════════════════════════
            SCROLL SNAP TARGET 1 - Nature/mountain scene when fully revealed
            Positioned at ~35% where the beautiful landscape is fully visible
        ═══════════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: 'absolute',
            top: '35%',
            left: 0,
            width: '100%',
            height: '1px',
            scrollSnapAlign: 'center',
            pointerEvents: 'none',
          }}
        />
        
        {/* ═══════════════════════════════════════════════════════════════════════
            SCROLL SNAP TARGET 2 - "Capture at speed of thought" when centered
            Positioned at ~65% where Capture text and image are centered
        ═══════════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: 'absolute',
            top: '65%',
            left: 0,
            width: '100%',
            height: '1px',
            scrollSnapAlign: 'center',
            pointerEvents: 'none',
          }}
        />
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
            backgroundColor: 'transparent',
            contain: 'layout style paint',
            willChange: 'transform',
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
              willChange: 'transform',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {/* Full-screen video - lazy loaded with responsive sources */}
            {videosActive && (
              <video
                autoPlay
                loop
                muted
                playsInline
                poster="/videos/landscape-poster.jpg"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                {isMobile ? (
                  <source src="/videos/landscape-mobile.mp4" type="video/mp4" />
                ) : (
                  <source src="/videos/kling_20260107_Image_to_Video_Static_sho_2574_2.mp4" type="video/mp4" />
                )}
              </video>
            )}
            
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
            
            {/* "VOIS wants to help." - scrolls with video, over mountains */}
            <motion.h2
              className="narrative-text-dark"
              style={{
                position: 'absolute',
                top: '22%',
                left: '50%',
                transform: 'translateX(-50%)',
                opacity: videoTextOpacity,
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                color: 'rgba(15, 23, 42, 0.5)',
                textAlign: 'center',
                padding: '0 2rem',
                maxWidth: '90vw',
                lineHeight: 1.3,
                pointerEvents: 'none',
                willChange: 'opacity',
              }}
            >
              VOIS wants to help.
            </motion.h2>
          </motion.div>

          {/* ═════════════════════════════════════════════════════════════════
              LAYER 2: UNIFIED WHITE OVERLAY (z-index: 15)
              Single smooth curve: reveals video → clearest at snap → fog returns
              No discontinuity or "click" at the transition point
          ═════════════════════════════════════════════════════════════════ */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#ffffff',
              opacity: unifiedOverlayOpacity,
              zIndex: 15,
              pointerEvents: 'none',
              willChange: 'opacity',
              transform: 'translateZ(0)',
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
              willChange: 'transform',
              transform: 'translateZ(0)',
            }}
          >
            {/* ─────────────────────────────────────────────────────────────────
                PHASE 1: "You don't have to carry it all." (fly-through effect)
            ───────────────────────────────────────────────────────────────── */}
            <motion.h2
              className="narrative-text-dark"
              style={{
                position: 'absolute',
                opacity: phase1Opacity,
                scale: phase1Scale,
                filter: useTransform(phase1Blur, (v) => `blur(${v}px)`),
                fontSize: 'clamp(1.8rem, 4.5vw, 3.5rem)',
                color: '#1e293b',
                textAlign: 'center',
                padding: '0 2rem',
                maxWidth: '90vw',
                lineHeight: 1.3,
                willChange: 'transform, opacity, filter',
                transform: 'translateZ(0)',
              }}
            >
              Your brain is for thinking, not for storage.
            </motion.h2>
            

            {/* ─────────────────────────────────────────────────────────────────
                PHASE 3: "Capture at the speed of thought."
                Headline + Video with 3D devices on sides
            ───────────────────────────────────────────────────────────────── */}
            <motion.div
              style={{
                position: 'absolute',
                opacity: captureTextOpacity,
                y: captureTextY,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'clamp(1.5rem, 3vw, 3rem)',
                padding: '0 2rem',
                maxWidth: '1200px',
                width: '90%',
                textAlign: 'center',
                willChange: 'transform, opacity',
                transform: 'translateZ(0)',
              }}
            >
              <h2
                style={{
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  fontSize: 'clamp(2rem, 5vw, 4.5rem)',
                  color: '#0f172a',
                  lineHeight: 1.1,
                  fontWeight: 400,
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'clamp(0.75rem, 2vw, 1.5rem)',
                }}
              >
                <span
                  style={{
                    fontSize: 'clamp(1.5rem, 3.5vw, 3rem)',
                    color: '#64748b',
                    fontWeight: 400,
                  }}
                >
                  1
                </span>
                Capture at the speed of thought.
              </h2>

              {/* Video container - no 3D devices for better performance */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '700px',
                  aspectRatio: '16 / 9',
                  borderRadius: 'clamp(12px, 2vw, 24px)',
                  overflow: 'hidden',
                  boxShadow: '0 12px 48px rgba(0, 0, 0, 0.15)',
                  backgroundColor: '#f1f5f9',
                }}
              >
                {videosActive && (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster="/videos/situations-poster.jpg"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: 'translateZ(0)',
                      willChange: 'transform',
                    }}
                  >
                    {isMobile ? (
                      <source src="/videos/Situations-mobile.mp4" type="video/mp4" />
                    ) : (
                      <source src="/videos/Situations.mp4" type="video/mp4" />
                    )}
                  </video>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default NarrativeTransition;
