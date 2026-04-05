import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useTransform, useMotionValueEvent, useSpring, useMotionValue, animate } from 'framer-motion';
import { DemoSteps, DemoStage } from './TryNowDemo';
import { callbacks as deviceCallbacks, setDemoActiveDevice } from '@li/shared/components/deviceState';
import { ArrowDown, Play } from 'lucide-react';
import { PhoneScreenAnimation } from './PhoneScreenAnimation';
import { WatchRecordingAnimation } from './WatchRecordingAnimation';
import { useScreenOverlay } from '../hooks/useScreenOverlay';
import { allWhyBenefits } from './HeroDiscoveryDock';

// ─── Configuration ────────────────────────────────────────────────────────────
const PHONE_FRAME_COUNT = 30;
const WATCH_FRAME_COUNT = 30;
// 512×512 frames, 30 evenly-spaced samples across the full animation
const PHONE_FRAMES_PATH = '/frames/phone-hq30';
const WATCH_FRAMES_PATH = '/frames/watch-hq30';

// ─── Category badge carousel components ──────────────────────────────────────
const MobileCategoryBadge: React.FC<{ item: (typeof allWhyBenefits)[0] }> = ({ item }) => (
  <div className={`flex items-center gap-2.5 p-2.5 pr-4 rounded-xl ${item.bg} border border-white/40 flex-shrink-0`}>
    <div className={`w-9 h-9 rounded-lg ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
      <item.icon size={18} className={item.color} strokeWidth={1.5} />
    </div>
    <p className={`text-sm font-medium ${item.color} leading-tight whitespace-nowrap`}>{item.label}</p>
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
        className="flex gap-2.5"
        animate={{
          x: direction === 'left'
            ? [0, -60 * items.length * 3.5]
            : [-60 * items.length * 3.5, 0],
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
function preloadFrame(basePath: string, index: number): Promise<HTMLImageElement> {
  const src = `${basePath}/frame_${String(index).padStart(3, '0')}.webp`;
  return new Promise<HTMLImageElement>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(img);
    img.src = src;
  });
}

function preloadFramesLazy(
  basePath: string,
  count: number,
  startIndex: number,
  onFrame: (index: number, img: HTMLImageElement) => void,
): void {
  let i = startIndex;
  const BATCH_SIZE = 8; // Moderate batch size for mobile

  const loadBatch = () => {
    if (i >= count) return;

    const batch: Promise<void>[] = [];

    for (let j = 0; j < BATCH_SIZE && i < count; j++, i++) {
      const idx = i;
      batch.push(
        preloadFrame(basePath, idx).then((img) => {
          onFrame(idx, img);
        })
      );
    }

    Promise.all(batch).then(() => {
      // Small delay to allow browser to process
      setTimeout(loadBatch, 30);
    });
  };

  loadBatch();
}

// ─── Background gradient variants for A/B testing ────────────────────────────
export const BG_VARIANTS = [
  'linear-gradient(160deg, rgba(180,225,220,0.7) 0%, rgba(200,220,240,0.55) 20%, rgba(230,210,240,0.5) 40%, rgba(245,200,220,0.45) 60%, rgba(250,210,190,0.4) 80%, rgba(245,235,225,0.3) 100%)',
  'linear-gradient(160deg, rgba(248,210,195,0.6) 0%, rgba(245,195,210,0.55) 20%, rgba(225,205,235,0.5) 40%, rgba(200,215,240,0.45) 60%, rgba(190,230,225,0.4) 80%, rgba(230,240,235,0.3) 100%)',
  'linear-gradient(150deg, rgba(210,200,240,0.65) 0%, rgba(235,195,215,0.55) 20%, rgba(245,200,190,0.5) 40%, rgba(245,225,180,0.45) 60%, rgba(210,230,210,0.4) 80%, rgba(230,235,225,0.3) 100%)',
  'linear-gradient(160deg, rgba(160,210,245,0.28) 0%, rgba(150,220,220,0.24) 18%, rgba(245,245,250,0.12) 40%, rgba(250,248,245,0.10) 60%, rgba(255,200,150,0.22) 82%, rgba(255,175,120,0.25) 100%)',
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
  demoIsRecording?: boolean;
  chatOpened: boolean;
  chatMessageCount: number;
  allCardsVerified: boolean;
  appOpened?: boolean;
  remaining?: number | null;
  tryNowElement: React.ReactNode;
  bgVariant?: number;
  bgIntensity?: number;
  onSkipDemo?: () => void;
  gatePassed?: boolean;
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
  demoIsRecording,
  chatOpened,
  chatMessageCount,
  allCardsVerified,
  appOpened = false,
  remaining,
  tryNowElement,
  bgVariant = 0,
  bgIntensity = 1,
  onSkipDemo,
  gatePassed = false,
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
  const [loadingProgress, setLoadingProgress] = useState(0);
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
    cornersPath: '/frames/phone-hq30/screen-corners.json',
  });

  const {
    ready: watchOverlayReady,
    getTransform: getWatchTransform,
    canvasBounds: watchCanvasBounds,
  } = useScreenOverlay({
    canvasRef: watchCanvasRef,
    overlayWidth: 200,
    overlayHeight: 220,
    cornersPath: '/frames/watch-hq30/screen-corners.json',
  });

  // ── Motion values (driven by progress, not scroll) ─────────────────────────
  const springConfig = { stiffness: 300, damping: 30, mass: 0.5 };

  const headlineOpacity = 1;
  const headlineYRaw = useTransform(progress, [0, 0.545], [0, -300]);
  const headlineY = useSpring(headlineYRaw, springConfig);

  const phoneScaleRaw = useTransform(progress, [0, 1], [1, 1.5]);
  const phoneYRaw = useTransform(progress, [0, 1], [-20, -90]);
  const phoneXRaw = useTransform(progress, [0, 1], [20, 30]);
  const watchScaleRaw = useTransform(progress, [0, 1], [1, 1.45]);
  const watchXRaw = useTransform(progress, [0, 1], [50, -60]);
  const watchYRaw = useTransform(progress, [0, 1], [-70, -24]);

  const phoneScale = useSpring(phoneScaleRaw, springConfig);
  const phoneY = useSpring(phoneYRaw, springConfig);
  const phoneX = useSpring(phoneXRaw, springConfig);
  const watchScale = useSpring(watchScaleRaw, springConfig);
  const watchX = useSpring(watchXRaw, springConfig);
  const watchY = useSpring(watchYRaw, springConfig);

  const carouselYRaw = useTransform(progress, [0, 0.727], [0, -300]);
  const carouselYSmooth = useSpring(carouselYRaw, springConfig);
  const carouselOpacity = useTransform(progress, [0, 0.455, 0.818], [1, 1, 0]);
  const topRowItems = allWhyBenefits.slice(0, 10);
  const bottomRowItems = allWhyBenefits.slice(10, 20);

  const buttonOpacity = useTransform(progress, [0, 0.55, 0.80], [0, 0, 1]);
  const buttonYRaw = useTransform(progress, [0.55, 1.0], [120, -30]);
  const buttonY = useSpring(buttonYRaw, springConfig);

  const isDemoActive = demoStage !== 'idle';
  const [skipped, setSkipped] = useState(false);
  // Only switch to scroll-driven mode when gate passed AND demo is not running
  const scrollDriven = gatePassed && !isDemoActive;

  // ── Touch / wheel event handling ───────────────────────────────────────────
  // Swipe up on the hero drives the animation from 0→1.
  // After animation completes, touches are still captured (hard stop) until
  // the gate passes (user clicks Skip Demo or completes the demo).
  const animationDoneRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || scrollDriven) return;

    let lastY = 0;
    let touchOnInteractive = false;

    const isInteractive = (target: EventTarget | null): boolean => {
      let node = target as HTMLElement | null;
      while (node && node !== el) {
        if (node.tagName === 'BUTTON' || node.tagName === 'A' || node.tagName === 'INPUT' || node.closest?.('button, a')) return true;
        node = node.parentElement;
      }
      return false;
    };

    const onTouchStart = (e: TouchEvent) => {
      lastY = e.touches[0].clientY;
      touchOnInteractive = isInteractive(e.target);
    };

    const onTouchMove = (e: TouchEvent) => {
      // Don't hijack touches on buttons/links — let them behave normally
      if (touchOnInteractive) return;

      const y = e.touches[0].clientY;
      const delta = lastY - y; // positive = swipe up
      lastY = y;

      // After animation done + swiping down: release native scroll so Safari bar can minimize
      if (animationDoneRef.current && delta >= 0) return;

      e.preventDefault(); // Block native scroll only while animation is in progress

      // If swiping back up from done state, unlock animation
      if (animationDoneRef.current && delta < 0) {
        animationDoneRef.current = false;
        setHeroComplete(false);
      }

      const step = delta / (window.innerHeight * 0.55);
      const maxP = maxProgressRef.current;
      progressRef.current = Math.min(maxP, Math.max(0, progressRef.current + step));
      progress.set(progressRef.current);
    };

    const onTouchEnd = () => {
      // Don't snap animation when the user was tapping a button
      if (touchOnInteractive) {
        touchOnInteractive = false;
        return;
      }

      const p = progressRef.current;
      const maxP = maxProgressRef.current;
      if (maxP >= 1 && p > 0.85) {
        animate(progress, 1, { type: 'tween', duration: 0.15 });
        progressRef.current = 1;
        animationDoneRef.current = true;
        setHeroComplete(true);
      } else if (p < 0.1) {
        animate(progress, 0, { type: 'tween', duration: 0.15 });
        progressRef.current = 0;
      }
    };

    // Wheel for desktop testing
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (animationDoneRef.current && e.deltaY >= 0) return;
      if (animationDoneRef.current && e.deltaY < 0) {
        animationDoneRef.current = false;
        setHeroComplete(false);
      }
      const step = e.deltaY / (window.innerHeight * 0.55);
      const maxP = maxProgressRef.current;
      progressRef.current = Math.min(maxP, Math.max(0, progressRef.current + step));
      progress.set(progressRef.current);
      if (progressRef.current >= maxP && maxP >= 1) {
        animationDoneRef.current = true;
        setHeroComplete(true);
      }
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
  }, [scrollDriven, progress]);

  // ── Scroll-driven animation after gate passes ─────────────────────────────
  // Maps scroll position directly to animation progress:
  //   scrollY 0        → progress 0  (devices at initial position)
  //   scrollY = 1×vh   → progress 1  (devices fully scaled/positioned)
  // The hero is 200dvh with sticky inner content, so the first vh of
  // scroll drives the animation while the second vh scrolls content into view.
  useEffect(() => {
    if (!scrollDriven) return;
    const el = containerRef.current;
    if (!el) return;

    const vh = window.innerHeight;

    // If animation was already complete (user swiped through or clicked Skip),
    // jump past the entire 200dvh hero so they land on the content below.
    // The hero is no longer visible, so background/frame updates are invisible.
    // Otherwise sync scroll to wherever the touch-driven phase left off.
    if (progressRef.current >= 1) {
      window.scrollTo(0, vh * 2);
    } else if (progressRef.current > 0 && window.scrollY === 0) {
      window.scrollTo({ top: progressRef.current * vh });
    }

    const handleScroll = () => {
      const maxP = maxProgressRef.current;
      const p = Math.min(maxP, Math.max(0, window.scrollY / vh));
      progressRef.current = p;
      progress.set(p);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollDriven, progress]);


  // ── Preload frames ─────────────────────────────────────────────────────────
  // Load frame 0 for both devices first so they appear immediately,
  // then load the remaining frames lazily in the background.
  const phoneFramesRef = useRef<HTMLImageElement[]>(new Array(PHONE_FRAME_COUNT));
  const watchFramesRef = useRef<HTMLImageElement[]>(new Array(WATCH_FRAME_COUNT));
  const phoneLoadedRef = useRef(0);
  const watchLoadedRef = useRef(0);
  const maxProgressRef = useRef(0);

  useEffect(() => {
    // Load first frames immediately
    console.log('🖼️ Starting to load frames...');
    Promise.all([
      preloadFrame(PHONE_FRAMES_PATH, 0),
      preloadFrame(WATCH_FRAMES_PATH, 0),
    ]).then(([phone0, watch0]) => {
      console.log('✅ First frames loaded:', { phone0, watch0 });
      phoneFramesRef.current[0] = phone0;
      watchFramesRef.current[0] = watch0;
      phoneLoadedRef.current = 1;
      watchLoadedRef.current = 1;
      maxProgressRef.current = 0; // Only frame 0 loaded → can't scroll yet
      setPhoneFrames([...phoneFramesRef.current]);
      setWatchFrames([...watchFramesRef.current]);
      setFramesLoaded(true);
      drawToCanvas(phoneCanvasRef.current, phone0);
      drawToCanvas(watchCanvasRef.current, watch0);

      const updateMaxProgress = () => {
        const maxFrame = Math.min(phoneLoadedRef.current, watchLoadedRef.current) - 1;
        maxProgressRef.current = maxFrame / (Math.max(PHONE_FRAME_COUNT, WATCH_FRAME_COUNT) - 1);
        const loadPct = Math.round(maxProgressRef.current * 100);
        setLoadingProgress(loadPct);
        if (maxFrame % 10 === 0) {
          console.log(`📊 Frames loaded: phone=${phoneLoadedRef.current}/${PHONE_FRAME_COUNT}, watch=${watchLoadedRef.current}/${WATCH_FRAME_COUNT}, maxProgress=${maxProgressRef.current.toFixed(2)}`);
        }
      };

      // Load remaining frames in the background (no re-renders needed —
      // onProgressChange reads from the refs directly)
      preloadFramesLazy(PHONE_FRAMES_PATH, PHONE_FRAME_COUNT, 1, (idx, img) => {
        phoneFramesRef.current[idx] = img;
        phoneLoadedRef.current = idx + 1;
        updateMaxProgress();
      });
      preloadFramesLazy(WATCH_FRAMES_PATH, WATCH_FRAME_COUNT, 1, (idx, img) => {
        watchFramesRef.current[idx] = img;
        watchLoadedRef.current = idx + 1;
        updateMaxProgress();
      });
    }).catch((err) => {
      console.error('❌ Failed to load frames:', err);
    });
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

    // Log frame changes for debugging
    if (phoneIdx !== currentPhoneFrame.current && phoneIdx % 5 === 0) {
      console.log(`🎬 Progress: ${clamped.toFixed(2)}, Phone frame: ${phoneIdx}/${PHONE_FRAME_COUNT - 1}, Max loaded: ${Math.round(maxProgressRef.current * 100)}%`);
    }

    if (phoneIdx !== currentPhoneFrame.current) {
      currentPhoneFrame.current = phoneIdx;
      drawToCanvas(phoneCanvasRef.current, phoneFramesRef.current[phoneIdx]);
    }
    if (watchIdx !== currentWatchFrame.current) {
      currentWatchFrame.current = watchIdx;
      drawToCanvas(watchCanvasRef.current, watchFramesRef.current[watchIdx]);
    }
    if (phoneOverlayRef.current && phoneOverlayReady) {
      phoneOverlayRef.current.style.transform = getPhoneTransform(phoneIdx);
      phoneOverlayRef.current.style.opacity = '1';
    }
    if (watchOverlayRef.current && watchOverlayReady) {
      watchOverlayRef.current.style.transform = getWatchTransform(watchIdx);
      watchOverlayRef.current.style.opacity = '1';
    }
    // Scroll the background gradient with progress
    if (containerRef.current) {
      containerRef.current.style.backgroundPositionY = `${clamped * 100}%`;
    }
  }, [framesLoaded, drawToCanvas, phoneOverlayReady, getPhoneTransform, watchOverlayReady, getWatchTransform]);

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

  // Log component mount for debugging
  useEffect(() => {
    console.log('📱 MobileScrollHero mounted', {
      framesLoaded,
      scrollDriven,
      demoStage,
      gatePassed
    });
  }, [framesLoaded, scrollDriven, demoStage, gatePassed]);

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
      style={{
        height: scrollDriven ? '200dvh' : '100dvh',
        background: scaleGradientIntensity(BG_VARIANTS[bgVariant % BG_VARIANTS.length], bgIntensity),
        backgroundSize: '100% 300dvh',
        backgroundPosition: '0% 0%',
        ...(scrollDriven ? { pointerEvents: 'none' as const } : {}),
      }}
      className="relative"
    >
      <div
        className="flex flex-col items-center"
        style={{
          height: '100dvh',
          ...(scrollDriven ? { position: 'sticky' as const, top: 0 } : {}),
          overflow: 'visible',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >

        {/* Film grain removed for better mobile performance */}

        {/* ── Headlines ──────────────────────────────────────────────── */}
        <motion.div
          className="text-center px-6 flex-shrink-0 z-10"
          style={{
            opacity: headlineOpacity,
            y: headlineY,
            marginTop: 'calc(env(safe-area-inset-top, 0px) + 5.5rem)'
          }}
        >
          <h1 className="text-2xl sm:text-3xl font-serif font-medium text-slate-900 leading-tight tracking-tight mb-2">
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
            className="text-base sm:text-lg text-slate-500 leading-relaxed"
            style={{ minHeight: '1.4em' }}
          />

          {/* Watch Video Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={framesLoaded ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 1.2 }}
            onClick={onWatchVideo}
            className="mt-4 group relative pl-2.5 pr-5 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 mx-auto active:scale-95 transition-all duration-300 bg-slate-900 text-white border border-slate-800"
            style={{
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15))',
              pointerEvents: 'auto'
            }}
          >
            <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
              <span className="watch-video-fill absolute bg-white rounded-full" />
            </span>
            <span className="relative z-10 flex items-center justify-center w-6 h-6 rounded-full transition-colors duration-200 bg-white group-hover:bg-slate-900">
              <Play size={10} className="ml-0.5 transition-colors duration-200 fill-slate-900 text-slate-900 group-hover:fill-white group-hover:text-white" />
            </span>
            <span className="relative z-10 transition-colors duration-500 delay-100 group-hover:text-slate-900">
              Watch Video
            </span>
          </motion.button>
        </motion.div>

        {/* ── Device frames area ──────────────────────────────────────── */}
        <div className="relative flex-1 w-full flex items-center justify-center pointer-events-none">

          {/* Category badge carousel (behind devices) */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={framesLoaded ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.55 }}
            className="absolute -bottom-12 left-0 right-0 pointer-events-none"
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
              <div className="flex flex-col gap-2.5">
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
                  width: 'min(110vw, 62vh)',
                  height: 'min(110vw, 62vh)',
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
              {demoStage === 'waiting' && (
                <div
                  onClick={() => {
                    setDemoActiveDevice('phone');
                    deviceCallbacks.onPhoneRecordClick?.();
                  }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'auto',
                    cursor: 'pointer',
                    zIndex: 20,
                    borderRadius: 54,
                  }}
                />
              )}
            </motion.div>
          </motion.div>

          {/* Watch */}
          <motion.div
            className="absolute z-20"
            style={{
              right: '50%',
              bottom: '8%',
              marginRight: '20px' // Position relative to center, offset to the left
            }}
            initial={{ opacity: 0, x: -90 }}
            animate={framesLoaded ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.35 }}
          >
            <motion.div
              style={{
                scale: watchScale,
                x: watchX,
                y: watchY,
                willChange: 'transform',
                transformOrigin: '0% 100%',
              }}
            >
              <div style={{ position: 'relative' }}>
                <canvas
                  ref={watchCanvasRef}
                  style={{
                    width: 'min(55vw, 31vh)',
                    height: 'min(55vw, 31vh)',
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
                {demoStage === 'waiting' && (
                  <div
                    onClick={() => {
                      setDemoActiveDevice('watch');
                      deviceCallbacks.onWatchRecordClick?.();
                    }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      pointerEvents: 'auto',
                      cursor: 'pointer',
                      zIndex: 20,
                      borderRadius: 34,
                    }}
                  />
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
              chatMessageCount={chatMessageCount}
              allCardsVerified={allCardsVerified}
              appOpened={appOpened}
            />
          </div>
        )}

        {/* ── Buttons area ─────────────────────────────────────────────── */}
        <motion.div
          className="flex-shrink-0 flex flex-col items-center gap-3 pt-2 relative"
          style={{
            opacity: isDemoActive ? 1 : buttonOpacity,
            y: isDemoActive ? 0 : buttonY,
            pointerEvents: 'auto',
            zIndex: 40,
            paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
            minHeight: 'calc(4rem + env(safe-area-inset-bottom, 0px))',
          }}
        >
          {hasCompletedDemo && (demoStage === 'idle' || (demoStage === 'results' && !demoIsRecording)) ? (
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
                <span className="text-slate-900 font-semibold">View Plans</span>
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
              <motion.button
                whileHover={{ scale: skipped ? 1 : 1.02 }}
                whileTap={{ scale: skipped ? 1 : 0.98 }}
                onClick={() => {
                  if (skipped) return;
                  setSkipped(true);

                  // Mark animation as complete so the scroll-driven
                  // useEffect will position correctly after layout change.
                  // Don't call progress.set(1) here — that would instantly
                  // shift the background gradient. Let the scroll-driven
                  // effect update progress naturally when scroll jumps.
                  progressRef.current = 1;
                  animationDoneRef.current = true;
                  setHeroComplete(true);

                  // Pass the gate immediately — the scroll-driven useEffect
                  // handles scrolling after the layout updates
                  onSkipDemo?.();
                }}
                disabled={skipped}
                style={{
                  touchAction: 'manipulation',
                  minHeight: '44px',
                  filter: skipped
                    ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
                    : 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.25)) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15))'
                }}
                className={`group text-white pl-3 pr-6 py-2.5 rounded-full text-sm sm:text-base font-medium flex items-center justify-center gap-2 sm:gap-3 border transition-all duration-300 ${skipped ? 'bg-slate-700/50 border-slate-600/50 opacity-60' : 'bg-slate-900 border-slate-800 hover:bg-slate-800 hover:border-slate-700'}`}
              >
                <span className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-slate-900 rounded-full border border-slate-700">
                  <ArrowDown size={14} className="text-white" />
                </span>
                <span className="font-medium">{skipped ? 'Skipped' : 'Skip Demo'}</span>
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default MobileScrollHero;
