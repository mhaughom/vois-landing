import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useTransform, useMotionValueEvent, useSpring, useMotionValue, animate } from 'framer-motion';
import { DemoSteps, DemoStage } from './TryNowDemo';
import { PhoneScreenAnimation } from './PhoneScreenAnimation';
import { WatchRecordingAnimation } from './WatchRecordingAnimation';
import { useScreenOverlay } from '../hooks/useScreenOverlay';
import { allWhyBenefits } from './HeroDiscoveryDock';

// ─── Configuration ────────────────────────────────────────────────────────────
const PHONE_FRAME_COUNT = 60;
const WATCH_FRAME_COUNT = 60;
const PHONE_FRAMES_PATH = '/frames/phone';
const WATCH_FRAMES_PATH = '/frames/watch';

// ─── Category badge carousel components ──────────────────────────────────────
const MobileCategoryBadge: React.FC<{ item: (typeof allWhyBenefits)[0] }> = ({ item }) => (
  <div className={`flex items-center gap-2 p-2 pr-3 rounded-lg ${item.bg} border border-white/40 flex-shrink-0`}>
    <div className={`w-7 h-7 rounded-md ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
      <item.icon size={14} className={item.color} strokeWidth={1.5} />
    </div>
    <p className={`text-xs font-medium ${item.color} leading-tight whitespace-nowrap`}>{item.label}</p>
  </div>
);

const MobileCategoryRow: React.FC<{
  items: (typeof allWhyBenefits);
  direction: 'left' | 'right';
  duration?: number;
}> = ({ items, direction, duration = 45 }) => {
  const duplicated = [...items, ...items];
  return (
    <div
      className="overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
      }}
    >
      <motion.div
        className="flex gap-2"
        animate={{
          x: direction === 'left'
            ? [0, -50 * items.length * 3.5]
            : [-50 * items.length * 3.5, 0],
        }}
        transition={{
          x: { repeat: Infinity, repeatType: 'loop', duration, ease: 'linear' },
        }}
      >
        {duplicated.map((item, i) => (
          <MobileCategoryBadge key={`${item.label}-${i}`} item={item} />
        ))}
      </motion.div>
    </div>
  );
};

// ─── Frame preloader ──────────────────────────────────────────────────────────
function preloadFrames(basePath: string, count: number): Promise<HTMLImageElement[]> {
  return Promise.all(
    Array.from({ length: count }, (_, i) => {
      const src = `${basePath}/frame_${String(i).padStart(3, '0')}.webp`;
      return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(img);
        img.src = src;
      });
    })
  );
}

// ─── Background gradient variants for A/B testing ────────────────────────────
export const BG_VARIANTS = [
  'linear-gradient(160deg, rgba(180,225,220,0.7) 0%, rgba(200,220,240,0.55) 20%, rgba(230,210,240,0.5) 40%, rgba(245,200,220,0.45) 60%, rgba(250,210,190,0.4) 80%, rgba(245,235,225,0.3) 100%)',
  'linear-gradient(160deg, rgba(248,210,195,0.6) 0%, rgba(245,195,210,0.55) 20%, rgba(225,205,235,0.5) 40%, rgba(200,215,240,0.45) 60%, rgba(190,230,225,0.4) 80%, rgba(230,240,235,0.3) 100%)',
  'linear-gradient(150deg, rgba(210,200,240,0.65) 0%, rgba(235,195,215,0.55) 20%, rgba(245,200,190,0.5) 40%, rgba(245,225,180,0.45) 60%, rgba(210,230,210,0.4) 80%, rgba(230,235,225,0.3) 100%)',
  'linear-gradient(160deg, rgba(190,215,245,0.6) 0%, rgba(180,225,225,0.55) 20%, rgba(210,205,235,0.5) 40%, rgba(240,210,215,0.45) 60%, rgba(248,230,210,0.35) 80%, rgba(245,240,230,0.25) 100%)',
  'linear-gradient(155deg, rgba(240,200,210,0.6) 0%, rgba(225,200,225,0.55) 20%, rgba(200,200,240,0.5) 40%, rgba(190,220,235,0.45) 60%, rgba(190,235,220,0.4) 80%, rgba(220,240,230,0.3) 100%)',
  'linear-gradient(160deg, rgba(250,215,190,0.6) 0%, rgba(245,195,195,0.55) 20%, rgba(230,195,225,0.5) 40%, rgba(200,195,240,0.45) 60%, rgba(195,215,245,0.4) 80%, rgba(220,235,245,0.3) 100%)',
  'linear-gradient(165deg, rgba(185,230,220,0.65) 0%, rgba(190,215,240,0.55) 20%, rgba(205,195,235,0.5) 40%, rgba(230,195,220,0.45) 60%, rgba(245,205,200,0.4) 80%, rgba(248,220,200,0.3) 100%)',
  'linear-gradient(155deg, rgba(248,235,195,0.6) 0%, rgba(248,215,195,0.55) 20%, rgba(240,200,210,0.5) 40%, rgba(220,200,235,0.5) 60%, rgba(200,210,245,0.45) 80%, rgba(210,230,245,0.3) 100%)',
];

function scaleGradientIntensity(gradient: string, intensity: number): string {
  return gradient.replace(/rgba\((\d+),(\d+),(\d+),([\d.]+)\)/g, (_, r, g, b, a) => {
    const scaled = Math.min(1, parseFloat(a) * intensity);
    return `rgba(${r},${g},${b},${scaled.toFixed(2)})`;
  });
}

interface MobileScrollHeroProps {
  heroRef: React.RefObject<HTMLElement | null>;
  onWatchVideo: () => void;
  onTryNow: () => void;
  onGetAccess: () => void;
  demoStage: DemoStage;
  demoControls: { stopRecording: () => void; reset: () => void; startNew: () => void } | null;
  hasCompletedDemo: boolean;
  chatOpened: boolean;
  chatMessageSent: boolean;
  remaining: number | null;
  tryNowElement: React.ReactNode;
  bgVariant?: number;
  bgIntensity?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const MobileScrollHero: React.FC<MobileScrollHeroProps> = ({
  heroRef,
  onWatchVideo,
  onTryNow,
  onGetAccess,
  demoStage,
  demoControls,
  hasCompletedDemo,
  chatOpened,
  chatMessageSent,
  remaining,
  tryNowElement,
  bgVariant = 0,
  bgIntensity = 1,
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const phoneCanvasRef = useRef<HTMLCanvasElement>(null);
  const watchCanvasRef = useRef<HTMLCanvasElement>(null);
  const phoneOverlayRef = useRef<HTMLDivElement>(null);
  const watchOverlayRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  const [phoneFrames, setPhoneFrames] = useState<HTMLImageElement[]>([]);
  const [watchFrames, setWatchFrames] = useState<HTMLImageElement[]>([]);
  const [framesLoaded, setFramesLoaded] = useState(false);
  const currentPhoneFrame = useRef(0);
  const currentWatchFrame = useRef(0);

  const animStartTime = useRef(Date.now()).current;

  // ── Touch-driven progress (replaces scroll-driven) ─────────────────────────
  const [heroComplete, setHeroComplete] = useState(false);
  const progressRef = useRef(0);
  const progress = useMotionValue(0);

  // ── Screen overlays ────────────────────────────────────────────────────────
  const {
    ready: phoneOverlayReady,
    getTransform: getPhoneTransform,
    canvasBounds: phoneCanvasBounds,
  } = useScreenOverlay({
    canvasRef: phoneCanvasRef,
    overlayWidth: 320,
    overlayHeight: 650,
  });

  const {
    ready: watchOverlayReady,
    getTransform: getWatchTransform,
    canvasBounds: watchCanvasBounds,
  } = useScreenOverlay({
    canvasRef: watchCanvasRef,
    overlayWidth: 200,
    overlayHeight: 220,
    cornersPath: '/frames/watch/screen-corners.json',
  });

  // ── Motion values (driven by progress, not scroll) ─────────────────────────
  const springConfig = { stiffness: 300, damping: 30, mass: 0.5 };

  const headlineOpacity = 1;
  const headlineYRaw = useTransform(progress, [0, 0.545], [0, -300]);
  const headlineY = useSpring(headlineYRaw, springConfig);

  const phoneScaleRaw = useTransform(progress, [0, 1], [1, 1.5]);
  const phoneYRaw = useTransform(progress, [0, 1], [0, -40]);
  const phoneXRaw = useTransform(progress, [0, 1], [20, 30]);
  const watchScaleRaw = useTransform(progress, [0, 1], [1, 1.45]);
  const watchXRaw = useTransform(progress, [0, 1], [20, -60]);

  const phoneScale = useSpring(phoneScaleRaw, springConfig);
  const phoneY = useSpring(phoneYRaw, springConfig);
  const phoneX = useSpring(phoneXRaw, springConfig);
  const watchScale = useSpring(watchScaleRaw, springConfig);
  const watchX = useSpring(watchXRaw, springConfig);

  const carouselYRaw = useTransform(progress, [0, 0.727], [0, -300]);
  const carouselYSmooth = useSpring(carouselYRaw, springConfig);
  const carouselOpacity = useTransform(progress, [0, 0.455, 0.818], [1, 1, 0]);
  const topRowItems = allWhyBenefits.slice(0, 10);
  const bottomRowItems = allWhyBenefits.slice(10, 20);

  const buttonOpacity = useTransform(progress, [0, 0.55, 0.80], [0, 0, 1]);
  const buttonYRaw = useTransform(progress, [0.55, 1.0], [120, 0]);
  const buttonY = useSpring(buttonYRaw, springConfig);

  const isDemoActive = demoStage !== 'idle';

  // ── Touch / wheel event handling ───────────────────────────────────────────
  // Swipe up on the hero drives the animation from 0→1.
  // When complete, the hero stops capturing input and normal page scroll resumes.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || heroComplete) return;

    let lastY = 0;

    const onTouchStart = (e: TouchEvent) => {
      lastY = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const y = e.touches[0].clientY;
      const delta = lastY - y; // positive = swipe up
      lastY = y;
      const step = delta / (window.innerHeight * 0.55);
      progressRef.current = Math.min(1, Math.max(0, progressRef.current + step));
      progress.set(progressRef.current);
    };

    const onTouchEnd = () => {
      const p = progressRef.current;
      if (p > 0.85) {
        animate(progress, 1, { type: 'tween', duration: 0.15 });
        progressRef.current = 1;
        setHeroComplete(true);
      } else if (p < 0.1) {
        animate(progress, 0, { type: 'tween', duration: 0.15 });
        progressRef.current = 0;
      }
    };

    // Wheel for desktop testing
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const step = e.deltaY / (window.innerHeight * 0.55);
      progressRef.current = Math.min(1, Math.max(0, progressRef.current + step));
      progress.set(progressRef.current);
      if (progressRef.current >= 1) setHeroComplete(true);
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('wheel', onWheel);
    };
  }, [heroComplete, progress]);

  // ── Preload frames ─────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      preloadFrames(PHONE_FRAMES_PATH, PHONE_FRAME_COUNT),
      preloadFrames(WATCH_FRAMES_PATH, WATCH_FRAME_COUNT),
    ]).then(([phone, watch]) => {
      setPhoneFrames(phone);
      setWatchFrames(watch);
      setFramesLoaded(true);
      drawToCanvas(phoneCanvasRef.current, phone[0]);
      drawToCanvas(watchCanvasRef.current, watch[0]);
    }).catch(console.error);
  }, []);

  // ── Canvas drawing ─────────────────────────────────────────────────────────
  const drawToCanvas = useCallback((
    canvas: HTMLCanvasElement | null,
    img: HTMLImageElement | undefined,
  ) => {
    if (!canvas || !img || !img.naturalWidth) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  }, []);

  // ── Progress → frame mapping ───────────────────────────────────────────────
  const onProgressChange = useCallback((value: number) => {
    if (!framesLoaded) return;

    const clamped = Math.min(1, Math.max(0, value));

    const phoneIdx = Math.min(
      PHONE_FRAME_COUNT - 1,
      Math.round(clamped * (PHONE_FRAME_COUNT - 1)),
    );
    const watchIdx = Math.min(
      WATCH_FRAME_COUNT - 1,
      Math.round(clamped * (WATCH_FRAME_COUNT - 1)),
    );

    if (phoneIdx !== currentPhoneFrame.current) {
      currentPhoneFrame.current = phoneIdx;
      drawToCanvas(phoneCanvasRef.current, phoneFrames[phoneIdx]);
    }
    if (watchIdx !== currentWatchFrame.current) {
      currentWatchFrame.current = watchIdx;
      drawToCanvas(watchCanvasRef.current, watchFrames[watchIdx]);
    }
    if (phoneOverlayRef.current && phoneOverlayReady) {
      phoneOverlayRef.current.style.transform = getPhoneTransform(phoneIdx);
      phoneOverlayRef.current.style.opacity = '1';
    }
    if (watchOverlayRef.current && watchOverlayReady) {
      watchOverlayRef.current.style.transform = getWatchTransform(watchIdx);
      watchOverlayRef.current.style.opacity = '1';
    }
  }, [framesLoaded, phoneFrames, watchFrames, drawToCanvas, phoneOverlayReady, getPhoneTransform, watchOverlayReady, getWatchTransform]);

  useMotionValueEvent(progress, 'change', onProgressChange);

  // Set initial overlay transforms
  useEffect(() => {
    if (phoneOverlayReady && phoneOverlayRef.current) {
      phoneOverlayRef.current.style.transform = getPhoneTransform(0);
      phoneOverlayRef.current.style.opacity = '1';
    }
  }, [phoneOverlayReady, getPhoneTransform]);

  useEffect(() => {
    if (watchOverlayReady && watchOverlayRef.current) {
      watchOverlayRef.current.style.transform = getWatchTransform(0);
      watchOverlayRef.current.style.opacity = '1';
    }
  }, [watchOverlayReady, getWatchTransform]);

  // ── Subtitle typewriter effect ─────────────────────────────────────────────
  useEffect(() => {
    const text = 'Capture everything. Organize nothing.';
    const el = subtitleRef.current;
    if (!el) return;
    el.textContent = '';
    let i = 0;
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        i++;
        el.textContent = text.slice(0, i);
        if (i >= text.length) clearInterval(interval);
      }, 45);
    }, 900);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section
      ref={(el) => {
        (containerRef as React.MutableRefObject<HTMLElement | null>).current = el;
        if (heroRef && 'current' in heroRef) {
          (heroRef as React.MutableRefObject<HTMLElement | null>).current = el;
        }
      }}
      id="hero"
      style={{ height: '100dvh' }}
      className="relative"
    >
      <div
        className="flex flex-col items-center overflow-hidden"
        style={{
          height: '100%',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          background: scaleGradientIntensity(BG_VARIANTS[bgVariant % BG_VARIANTS.length], bgIntensity),
        }}
      >

        {/* White gradient overlays — polished edge fade */}
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none"
          style={{
            height: 120,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.45), transparent)',
            zIndex: 30,
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: 100,
            background: 'linear-gradient(to top, rgba(255,255,255,0.45), transparent)',
            zIndex: 30,
          }}
        />

        {/* Top spacer for nav */}
        <div className="h-24 flex-shrink-0" />

        {/* ── Headlines ──────────────────────────────────────────────── */}
        <motion.div
          className="text-center px-6 flex-shrink-0 z-10"
          style={{ opacity: isDemoActive ? 0 : headlineOpacity, y: headlineY }}
        >
          <h1 className="text-3xl font-serif font-medium text-slate-900 leading-tight tracking-tight mb-2">
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              The Executive Assistant
            </motion.span>
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            >
              that clears your mind.
            </motion.span>
          </h1>
          <p
            ref={subtitleRef}
            className="text-lg text-slate-500 leading-relaxed"
            style={{ minHeight: '1.6em' }}
          />
        </motion.div>

        {/* ── Device frames area ──────────────────────────────────────── */}
        <div className="relative flex-1 w-full flex items-center justify-center">

          {/* Category badge carousel (behind devices) */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={framesLoaded ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.55 }}
            className="absolute -bottom-24 left-0 right-0 pointer-events-none"
            style={{ zIndex: 5 }}
          >
            <motion.div
              style={{
                y: carouselYSmooth,
                opacity: isDemoActive ? 0 : carouselOpacity,
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 100%)',
              }}
            >
              <div className="flex flex-col gap-2">
                <MobileCategoryRow items={topRowItems} direction="right" duration={45} />
                <MobileCategoryRow items={bottomRowItems} direction="left" duration={45} />
              </div>
            </motion.div>
          </motion.div>

          {/* Phone */}
          <motion.div
            initial={{ opacity: 0, x: 90 }}
            animate={framesLoaded ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.15 }}
            style={{ position: 'relative', zIndex: 10 }}
          >
            <motion.div
              style={{
                scale: phoneScale,
                y: phoneY,
                x: phoneX,
                willChange: 'transform',
              }}
            >
              <canvas
                ref={phoneCanvasRef}
                style={{
                  maxHeight: '58vh',
                  width: 'auto',
                  imageRendering: 'auto',
                  display: 'block',
                }}
              />
              {framesLoaded && phoneOverlayReady && phoneCanvasBounds && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: phoneCanvasBounds.width,
                    height: phoneCanvasBounds.height,
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    ref={phoneOverlayRef}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: 320,
                      height: 650,
                      transformOrigin: '0 0',
                      transform: getPhoneTransform(0),
                      pointerEvents: 'none',
                      overflow: 'hidden',
                      borderRadius: 54,
                    }}
                  >
                    <PhoneScreenAnimation startTime={animStartTime} />
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Watch */}
          <motion.div
            className="absolute z-20"
            style={{ left: '-8%', bottom: '8%' }}
            initial={{ opacity: 0, x: -90 }}
            animate={framesLoaded ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.35 }}
          >
            <motion.div
              style={{
                scale: watchScale,
                x: watchX,
                willChange: 'transform',
                transformOrigin: '0% 100%',
              }}
            >
              <div style={{ position: 'relative' }}>
                <canvas
                  ref={watchCanvasRef}
                  style={{
                    maxHeight: '30vh',
                    width: 'auto',
                    imageRendering: 'auto',
                    display: 'block',
                  }}
                />
                {framesLoaded && watchOverlayReady && watchCanvasBounds && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: watchCanvasBounds.width,
                      height: watchCanvasBounds.height,
                      pointerEvents: 'none',
                    }}
                  >
                    <div
                      ref={watchOverlayRef}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 200,
                        height: 220,
                        transformOrigin: '0 0',
                        transform: getWatchTransform(0),
                        pointerEvents: 'none',
                        overflow: 'hidden',
                        borderRadius: 34,
                      }}
                    >
                      <WatchRecordingAnimation startTime={animStartTime} />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Demo steps (shown during demo mode) ──────────────────────── */}
        {isDemoActive && (
          <div className="text-center px-6 flex-shrink-0">
            <DemoSteps
              stage={demoStage}
              onStopRecording={demoControls?.stopRecording}
              onReset={demoControls?.reset}
              chatOpened={chatOpened}
              chatMessageSent={chatMessageSent}
            />
          </div>
        )}

        {/* ── Buttons area ─────────────────────────────────────────────── */}
        <motion.div
          className="flex-shrink-0 flex flex-col items-center gap-3 pb-6 pt-2 mt-4"
          style={{
            opacity: isDemoActive ? 1 : buttonOpacity,
            y: isDemoActive ? 0 : buttonY,
          }}
        >
          {hasCompletedDemo && (demoStage === 'idle' || demoStage === 'results') ? (
            <div className="flex flex-col items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onGetAccess}
                className="relative px-6 py-3 rounded-full text-base font-semibold shadow-lg border border-violet-100/60 overflow-hidden flex items-center gap-3"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(245,235,255,0.85) 25%, rgba(235,245,255,0.85) 50%, rgba(255,245,235,0.85) 75%, rgba(255,255,255,0.85) 100%)',
                }}
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-violet-400/30 to-amber-300/30">
                  <span className="text-violet-600">✦</span>
                </span>
                <span className="text-slate-900 font-semibold">Get Early Access</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-700">
                  {remaining ?? '--'} left
                </span>
              </motion.button>

              <button
                onClick={() => demoControls?.startNew()}
                className="text-slate-400 text-sm"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {tryNowElement}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default MobileScrollHero;
