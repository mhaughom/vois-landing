import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { COPY } from './constants';
import { Navbar, scrollToSection } from './components/Navbar';
import { setCurrentSection, setOnChatOpen, setOnChatMessageSent, setOnCardVerified, areAllCardsVerified, resetCardVerifications } from './components/deviceState';
import type { SectionId } from './components/deviceState';
import { DeviceScene } from './components/DeviceScene';
// FlowVisualization deactivated — removed import to avoid bundling Three.js code
// import { FlowVisualization } from './components/FlowVisualization';
const NarrativeTransition = React.lazy(() => import('./components/NarrativeTransition'));
const OrganizeSection = React.lazy(() => import('./components/OrganizeSection'));
import { HeroDiscoveryDock, HeroDiscoveryContent, DiscoveryMode } from './components/HeroDiscoveryDock';
import { TryNowDemo, DemoSteps, DemoStage } from './components/TryNowDemo';
import { ChatDemo } from './components/ChatDemo';
import { PhoneMockup } from './components/PhoneMockup';
import { AppleWatchMockup } from './components/AppleWatchMockup';
import { MobileScrollHero, BG_VARIANTS } from './components/MobileScrollHero';
import { ArrowRight, Check, Sparkles, Lock, Cloud, Zap, Fingerprint, ChevronDown, X, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { CheckoutModal } from './components/CheckoutModal';
import { CookieConsent, CookieSettingsTrigger } from './components/CookieConsent';
import { FREE_FEATURES, PERSONAL_FEATURES, WORK_FEATURES } from './lib/tiers';
import { useIsMobile } from './hooks/useIsMobile';
import { Analytics } from './lib/analytics';

const faqData = [
  {
    question: "What's the difference between Personal and Work?",
    answer: "Personal is for everyday life — capturing tasks, ideas, reminders, and notes. Work adds meeting transcription, action items, team collaboration tools, and priority support."
  },
  {
    question: "Is my voice data private?",
    answer: "Yes. We use a local-first architecture. Your recordings are processed securely, and we do not use your personal thoughts to train our public models. Your brain is yours."
  },
  {
    question: "Can I switch plans or cancel anytime?",
    answer: "Absolutely. You can upgrade, downgrade, or cancel your subscription at any time. If you cancel, you'll keep access until the end of your current billing period."
  },
  {
    question: "What if it doesn't work for me?",
    answer: "We offer a 30-day money-back guarantee. If Vois doesn't help you clear your mind in the first month, email us for a full refund."
  }
];

// Hook to detect user's motion preference
const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
};

// Colorful carousel wave - one long gradient bar, smooth blended zones, pastel leading edge
const ColorWaveTags: React.FC<{ tags: string[]; visible: boolean }> = ({ tags, visible }) => {
  const spanRef = useRef<HTMLSpanElement>(null);

  const gray = { r: 203, g: 213, b: 225 }; // #cbd5e1

  // Zone colors (rgb) mapped to position 0-1
  const zones = [
    { r: 34, g: 197, b: 94 },   // green - TASKS
    { r: 59, g: 130, b: 246 },  // blue - CALENDAR
    { r: 234, g: 179, b: 8 },   // yellow - IDEAS
    { r: 168, g: 85, b: 247 },  // purple - LISTS
    { r: 236, g: 72, b: 153 },  // pink - CUSTOM APPS
  ];

  // Pastel shimmer colors for the leading edge
  const shimmer = [
    { r: 103, g: 232, b: 249 }, // cyan
    { r: 196, g: 181, b: 253 }, // violet
    { r: 253, g: 164, b: 175 }, // rose
  ];

  // Interpolate two rgb colors
  const mix = (a: typeof gray, b: typeof gray, t: number) => ({
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  });

  const toCSS = (c: typeof gray) => `rgb(${c.r},${c.g},${c.b})`;

  // Direct DOM manipulation — no React re-renders, just style mutation
  // Pauses the rAF loop entirely when the element is scrolled out of viewport
  useEffect(() => {
    if (!visible || !spanRef.current) return;

    let running = false;
    let animationId = 0;
    const startTime = Date.now();
    const el = spanRef.current;

    const tick = () => {
      if (!running) return;
      const elapsed = Date.now() - startTime;
      const progress = (elapsed % 12000) / 12000;
      const waveCenter = progress;

      const numStops = 20;
      const stops: string[] = [];

      for (let i = 0; i <= numStops; i++) {
        const pos = i / numStops;
        const pct = (pos * 100).toFixed(1);

        const zoneIndex = Math.min(zones.length - 1, Math.floor(pos * zones.length));
        const nextZone = Math.min(zones.length - 1, zoneIndex + 1);
        const zoneLocalPos = (pos * zones.length) - zoneIndex;
        const blendWidth = 0.3;
        let zoneColor: typeof gray;
        if (zoneLocalPos > (1 - blendWidth) && zoneIndex < zones.length - 1) {
          const blendT = (zoneLocalPos - (1 - blendWidth)) / blendWidth;
          zoneColor = mix(zones[zoneIndex], zones[nextZone], blendT);
        } else {
          zoneColor = zones[zoneIndex];
        }

        let dist = Math.abs(pos - waveCenter);
        if (dist > 0.5) dist = 1 - dist;

        const litRadius = 0.2;
        const fadeRadius = 0.08;
        const shimmerRadius = 0.04;

        let color: typeof gray;

        if (dist < litRadius - fadeRadius) {
          color = zoneColor;
        } else if (dist < litRadius) {
          const fadeT = (dist - (litRadius - fadeRadius)) / fadeRadius;
          const shimmerColor = shimmer[Math.floor(pos * shimmer.length * 3) % shimmer.length];
          color = mix(zoneColor, shimmerColor, fadeT * 0.6);
        } else if (dist < litRadius + shimmerRadius) {
          const hazeT = (dist - litRadius) / shimmerRadius;
          const shimmerColor = shimmer[Math.floor(pos * shimmer.length * 3) % shimmer.length];
          color = mix(shimmerColor, gray, hazeT);
        } else {
          color = gray;
        }

        stops.push(`${toCSS(color)} ${pct}%`);
      }

      el.style.backgroundImage = `linear-gradient(90deg, ${stops.join(', ')})`;
      animationId = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (!running) {
        running = true;
        animationId = requestAnimationFrame(tick);
      }
    };
    const stopLoop = () => {
      running = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = 0;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { rootMargin: '50px' }
    );
    observer.observe(el);

    return () => {
      stopLoop();
      observer.disconnect();
    };
  }, [visible]);

  if (!visible) return null;

  const tagString = tags.join('  ·  ');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-wrap mb-8 min-h-[2rem] items-center -mt-4"
    >
      <span
        ref={spanRef}
        className="text-xs md:text-sm tracking-widest uppercase font-medium bg-clip-text text-transparent"
        style={{ backgroundImage: `linear-gradient(90deg, rgb(203,213,225), rgb(203,213,225))` }}
      >
        {tagString}
      </span>
    </motion.div>
  );
};

const App = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [discoveryMode, setDiscoveryMode] = useState<DiscoveryMode>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showVideoClose, setShowVideoClose] = useState(false); // Track if flat video is playing
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [heroVideoPlaying, setHeroVideoPlaying] = useState(true);
  const [heroVideoMuted, setHeroVideoMuted] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('personal_monthly');
  const [annualBilling, setAnnualBilling] = useState(true);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const [bgVariant, setBgVariant] = useState(0);
  const [bgIntensity, setBgIntensity] = useState(1);
  const pageLoadTime = useRef(performance.now());
  const videoMilestonesRef = useRef(new Set<number>());

  // Demo state for step instructions
  const [demoStage, setDemoStage] = useState<DemoStage>('idle');
  const [demoControls, setDemoControls] = useState<{ stopRecording: () => void; reset: () => void; startNew: () => void } | null>(null);
  const [hasCompletedDemo, setHasCompletedDemo] = useState(false);
  const [chatOpened, setChatOpened] = useState(false);
  const [chatMessageCount, setChatMessageCount] = useState(0);
  const [allCardsVerified, setAllCardsVerified] = useState(false);
  const [demoGatePassed, setDemoGatePassed] = useState(false);
  const [retrieveVideoPlaying, setRetrieveVideoPlaying] = useState(false);
  const retrieveVideoRef = useRef<HTMLVideoElement>(null);

  // Track when user completes demo (sees results) and reset chat state on new recording
  useEffect(() => {
    if (demoStage === 'results') {
      setHasCompletedDemo(true);
      setDemoGatePassed(true);
    }
    if (demoStage === 'waiting') {
      const elapsed = (performance.now() - pageLoadTime.current) / 1000;
      Analytics.timeToAction('demo_start', Math.round(elapsed));
    }
    // Reset chat states when a new recording starts so steps show again
    if (demoStage === 'recording') {
      setChatOpened(false);
      setChatMessageCount(0);
      setAllCardsVerified(false);
      resetCardVerifications();
    }
  }, [demoStage]);

  // When hero video appears, try to play with sound; fall back to muted if browser blocks it
  useEffect(() => {
    if (!showVideoClose) return;
    const v = heroVideoRef.current;
    if (!v) return;
    v.muted = false;
    setHeroVideoMuted(false);
    const playPromise = v.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Browser blocked unmuted autoplay — fall back to muted
        v.muted = true;
        setHeroVideoMuted(true);
        v.play();
      });
    }
  }, [showVideoClose]);

  // Set session properties on mount
  useEffect(() => {
    const width = window.innerWidth;
    const deviceType = width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';
    const isReturningVisitor = localStorage.getItem('vois_visited') === 'true';
    localStorage.setItem('vois_visited', 'true');
    Analytics.setSessionProperties({
      device_type: deviceType,
      referrer: document.referrer || 'direct',
      is_returning_visitor: isReturningVisitor,
    });
  }, []);

  // Set up callback when chat is opened (sparkle icon tapped)
  useEffect(() => {
    setOnChatOpen(() => {
      setChatOpened(true);
      Analytics.chatOpened();
    });
    return () => setOnChatOpen(null);
  }, []);

  // Track scroll depth — fire once per section
  useEffect(() => {
    const sections = ['hero', 'video-transition', 'retrieve', 'privacy', 'faq', 'pricing'];
    const observers: IntersectionObserver[] = [];

    sections.forEach((sectionId) => {
      const el = document.getElementById(sectionId);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            Analytics.sectionViewed(sectionId);
            if (sectionId === 'pricing') {
              Analytics.scrolledToPricing();
            }
            observer.disconnect();
          }
        },
        { threshold: 0.3 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Set up callback when a chat message is sent
  useEffect(() => {
    setOnChatMessageSent(() => {
      setChatMessageCount(prev => prev + 1);
    });
    return () => setOnChatMessageSent(null);
  }, []);

  // Set up callback when a card is verified/declined
  useEffect(() => {
    setOnCardVerified(() => {
      if (areAllCardsVerified()) {
        setAllCardsVerified(true);
      }
    });
    return () => setOnCardVerified(null);
  }, []);
  // Demo is active when user has started the try-now flow (not idle/error)
  const isDemoActive = demoStage !== 'idle' && demoStage !== 'error';

  // Staged hero animation state
  const [heroStage, setHeroStage] = useState<'headline' | 'subheadline' | 'tags' | 'devices' | 'buttons' | 'complete'>('headline');
  const [typedSubheadline, setTypedSubheadline] = useState('');
  const [visibleTags, setVisibleTags] = useState<number>(0);
  const [devicesReady, setDevicesReady] = useState(false);

  // Tags to animate in (shown immediately, no animation)
  const heroTags = ['TASKS', 'CALENDAR', 'IDEAS', 'LISTS', 'CUSTOM APPS'];

  // Staged animation timing - faster, devices appear right after subheadline
  useEffect(() => {
    const fullSubheadline = COPY.hero.subheadline;
    const timeouts: NodeJS.Timeout[] = [];
    let typeIntervalRef: NodeJS.Timeout | null = null;

    // Stage 1: Headline is already visible, start typing subheadline after 500ms
    timeouts.push(setTimeout(() => {
      setHeroStage('subheadline');

      // Type out subheadline character by character (faster: 35ms per char)
      let charIndex = 0;
      typeIntervalRef = setInterval(() => {
        charIndex++;
        setTypedSubheadline(fullSubheadline.slice(0, charIndex));

        if (charIndex >= fullSubheadline.length) {
          if (typeIntervalRef) clearInterval(typeIntervalRef);

          // Show tags immediately and trigger devices right after subheadline finishes
          timeouts.push(setTimeout(() => {
            setHeroStage('tags');
            setVisibleTags(heroTags.length); // Show all tags at once

            // Show devices immediately after
            timeouts.push(setTimeout(() => {
              setHeroStage('devices');
              setDevicesReady(true);

              // After devices animate in, show buttons
              timeouts.push(setTimeout(() => {
                setHeroStage('buttons');

                // Mark complete
                timeouts.push(setTimeout(() => {
                  setHeroStage('complete');
                }, 600));
              }, 1800)); // Wait for device entrance
            }, 200)); // Short pause before devices
          }, 200)); // Short pause after typing
        }
      }, 35); // 35ms per character (faster typing)

    }, 500)); // Start after 500ms

    return () => {
      timeouts.forEach(t => clearTimeout(t));
      if (typeIntervalRef) clearInterval(typeIntervalRef);
    };
  }, []);

  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Scroll the 3D canvas with the page — applied synchronously in the scroll
  // handler (not deferred to rAF) so it runs in the same frame as the browser's
  // scroll paint, eliminating the one-frame jitter.
  useEffect(() => {
    if (isMobile) return; // No canvas on mobile
    const handleScroll = () => {
      if (canvasContainerRef.current) {
        canvasContainerRef.current.style.transform = `translateY(-${window.scrollY}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  // Refs for section tracking
  const heroRef = useRef<HTMLElement>(null);
  const videoTransitionRef = useRef<HTMLElement>(null);
  const narrativeRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLElement>(null);
  const flowRef = useRef<HTMLElement>(null);

  // Parallax for video-transition text: text scrolls at ~70% speed
  const { scrollYProgress: videoSectionProgress } = useScroll({
    target: videoTransitionRef,
    offset: ["start end", "end start"],
  });
  const textParallaxY = useTransform(videoSectionProgress, [0, 1], [60, -60]);

  // Handle scroll to section from query param (e.g., coming from login page)
  useEffect(() => {
    const scrollTarget = searchParams.get('scroll');
    if (scrollTarget) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        scrollToSection(scrollTarget);
        // Clean up the URL
        setSearchParams({});
      }, 100);
    }
  }, [searchParams, setSearchParams]);
  
  // Section tracking with IntersectionObserver - tells DeviceScene which section is visible
  useEffect(() => {
    const sectionMap: { ref: React.RefObject<HTMLElement | HTMLDivElement | null>; id: SectionId }[] = [
      { ref: heroRef, id: 'hero' },
      { ref: videoTransitionRef, id: 'video-transition' },
      { ref: narrativeRef, id: 'narrative' },
      { ref: captureRef, id: 'capture' },
      { ref: flowRef, id: 'flow' },
    ];
    
    // Track visibility ratios for all sections
    const visibilityMap = new Map<SectionId, number>();
    sectionMap.forEach(({ id }) => visibilityMap.set(id, id === 'hero' ? 1 : 0));
    
    // Function to determine and set the current section
    // NOTE: 'capture' section is handled directly by NarrativeTransition via scroll progress
    // This observer handles hero, video-transition, narrative, and flow
    // IMPORTANT: Flow section overlaps with capture due to negative margin - don't override capture
    const updateCurrentSection = () => {
      const heroRatio = visibilityMap.get('hero') || 0;
      const flowRatio = visibilityMap.get('flow') || 0;
      const narrativeRatio = visibilityMap.get('narrative') || 0;
      
      // Priority 1: Hero if visible
      if (heroRatio > 0.3) {
        setCurrentSection('hero');
        return;
      }
      
      // Priority 2: Flow section - but only when narrative is NOT visible
      // (capture is part of narrative, so if narrative is visible, let NarrativeTransition handle it)
      if (flowRatio > 0.5 && narrativeRatio < 0.1) {
        setCurrentSection('flow');
        return;
      }
      
      // Default: pick the most visible section (excluding capture which is handled separately)
      let maxRatio = 0;
      let mostVisibleSection: SectionId = 'hero';
      
      visibilityMap.forEach((ratio, id) => {
        // Skip capture - handled by NarrativeTransition
        // Skip flow - handled above with narrative check
        if (id === 'capture' || id === 'flow') return;
        if (ratio > maxRatio) {
          maxRatio = ratio;
          mostVisibleSection = id;
        }
      });
      
      if (maxRatio > 0.1) {
        setCurrentSection(mostVisibleSection);
      }
    };
    
    const observers: IntersectionObserver[] = [];
    
    sectionMap.forEach(({ ref, id }) => {
      if (!ref.current) return;
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Update visibility ratio for this section
            visibilityMap.set(id, entry.intersectionRatio);
            // Determine which section is now most visible
            updateCurrentSection();
          });
        },
        {
          // OPTIMIZED: Reduced thresholds for better performance
          threshold: [0, 0.3, 0.7, 1.0],
          rootMargin: '0px' // No margin - track actual visibility
        }
      );
      
      observer.observe(ref.current);
      observers.push(observer);
    });
    
    // CRITICAL: Run initial check immediately on mount
    // This ensures correct section is set before user scrolls
    setTimeout(() => {
      sectionMap.forEach(({ ref, id }) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
          const ratio = Math.max(0, visibleHeight / rect.height);
          visibilityMap.set(id, ratio);
        }
      });
      updateCurrentSection();
    }, 100);
    
    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  const handleScrollToPricing = () => {
    scrollToSection('pricing');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.2
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const } }
  };

  return (
    <div
      className="relative w-full min-h-screen font-sans scroll-smooth"
      style={isMobile && !demoGatePassed ? { height: '100dvh', overflow: 'hidden' } : undefined}
    >
      {/* Top white gradient overlay — blends with Safari Liquid Glass toolbar */}
      <div
        className="fixed top-0 left-0 right-0 pointer-events-none"
        style={{
          height: 'calc(env(safe-area-inset-top, 0px) + 120px)',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
          zIndex: 40,
        }}
      />
      <Navbar
        onCycleBg={() => setBgVariant((v) => (v + 1) % BG_VARIANTS.length)}
        bgVariant={bgVariant}
        bgIntensity={bgIntensity}
        onBgIntensityChange={setBgIntensity}
      />

      {/* Video Modal */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
            onClick={() => setShowVideoModal(false)}
          >
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="relative w-full max-w-4xl aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowVideoModal(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              {/* Placeholder Image - Replace with actual video later */}
              <div className="relative w-full h-full">
                <img 
                  src="/Photos/businesswoman-placeholder.webp"
                  alt="Video Placeholder"
                  className="w-full h-full object-cover"
                />
                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                    <Play size={32} className="text-slate-900 fill-current ml-1" />
                  </div>
                </div>
                {/* Coming Soon Badge */}
                <div className="absolute bottom-4 left-4 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                  Video Coming Soon
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        selectedPlan={selectedPlan}
      />

      {/* Cookie consent banner */}
      <CookieConsent />

      {/* Chat Demo - handles API calls for phone chat interface */}
      <ChatDemo onMessageSent={() => setChatMessageCount(prev => prev + 1)} />

      {/* Video close button moved inside flat video container */}

      <main className="w-full max-w-7xl mx-auto relative z-20">
        
        {/* HERO */}
        {isMobile ? (
          <MobileScrollHero
            heroRef={heroRef as React.RefObject<HTMLDivElement | null>}
            onWatchVideo={() => {
              Analytics.videoWatched();
              setShowVideoModal(true);
            }}
            onTryNow={() => {}}
            onGetAccess={() => {
              Analytics.checkoutModalOpened('hero');
              const elapsed = (performance.now() - pageLoadTime.current) / 1000;
              Analytics.timeToAction('checkout_open', Math.round(elapsed));
              setShowCheckoutModal(true);
            }}
            demoStage={demoStage}
            demoControls={demoControls}
            hasCompletedDemo={hasCompletedDemo}
            chatOpened={chatOpened}
            chatMessageCount={chatMessageCount}
            allCardsVerified={allCardsVerified}
            remaining={null}
            bgVariant={bgVariant}
            bgIntensity={bgIntensity}
            onSkipDemo={() => setDemoGatePassed(true)}
            gatePassed={demoGatePassed}
            tryNowElement={
              <TryNowDemo
                hasCompletedDemo={hasCompletedDemo}
                onStageChange={(stage, controls) => {
                  setDemoStage(stage);
                  setDemoControls(controls);
                }}
              />
            }
          />
        ) : (
        <section ref={heroRef} id="hero" className="min-h-screen flex flex-col lg:flex-row items-center sm:justify-center px-4 sm:px-6 md:px-16 pt-24 sm:pt-32 pb-12 sm:pb-24 gap-4 sm:gap-6 lg:gap-16 relative">
          
          {/* Right: 3D Devices - Fixed but scrolls with page via transform */}
          {/* Disabled when user prefers reduced motion for better performance */}
          {/* Only show after devicesReady to allow staged loading */}
          {/* Memoized to prevent re-renders from affecting 3D canvas */}
          {useMemo(() => (
            !prefersReducedMotion && !isMobile && devicesReady ? (
              <div
                ref={canvasContainerRef}
                className="fixed inset-0 z-30 pointer-events-none"
                style={{ willChange: 'transform' }}
              >
                <DeviceScene />
              </div>
            ) : null
          ), [prefersReducedMotion, isMobile, devicesReady])}


          {/* Left: Text Content - with z-index to sit above 3D */}
          <motion.div
            className={`lg:flex-1 relative z-10 overflow-visible ${showVideoClose ? 'max-w-2xl' : 'max-w-xl'} ${isMobile ? 'text-center flex flex-col items-center' : ''}`}
          >
            <AnimatePresence mode="wait">
              {showVideoClose ? (
                /* Flat HTML video player — replaces hero text when video is playing */
                <motion.div
                  key="hero-video"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="relative w-full"
                >
                  <div className="hero-video-container relative rounded-2xl overflow-hidden shadow-2xl" style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.2), 0 10px 20px rgba(0,0,0,0.1)' }}>
                    <video
                      ref={heroVideoRef}
                      autoPlay
                      playsInline
                      className="w-full aspect-video bg-black"
                      onPlay={() => setHeroVideoPlaying(true)}
                      onPause={() => setHeroVideoPlaying(false)}
                      onEnded={() => {
                        setShowVideoClose(false);
                      }}
                    >
                      <source src="/videos/Situations.mp4" type="video/mp4" />
                    </video>
                    {/* Minimal custom controls overlay — only visible on hover */}
                    <div className="hero-video-controls absolute bottom-0 left-0 right-0 flex items-center gap-3 px-4 py-3 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300">
                      <button
                        onClick={() => {
                          const v = heroVideoRef.current;
                          if (!v) return;
                          v.paused ? v.play() : v.pause();
                        }}
                        className="w-8 h-8 flex items-center justify-center text-white/90 hover:text-white transition-colors"
                      >
                        {heroVideoPlaying ? <Pause size={16} className="fill-current" /> : <Play size={16} className="fill-current" />}
                      </button>
                      <div className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden cursor-pointer"
                        onClick={(e) => {
                          const v = heroVideoRef.current;
                          if (!v || !v.duration) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          const pct = (e.clientX - rect.left) / rect.width;
                          v.currentTime = pct * v.duration;
                        }}
                      >
                        <div className="h-full bg-white/80 rounded-full" style={{ width: '0%' }} ref={(el) => {
                          if (!el) return;
                          const update = () => {
                            const v = heroVideoRef.current;
                            if (v && v.duration) el.style.width = `${(v.currentTime / v.duration) * 100}%`;
                            requestAnimationFrame(update);
                          };
                          requestAnimationFrame(update);
                        }} />
                      </div>
                    </div>
                    {/* Mute + Close buttons — always visible */}
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                      <button
                        onClick={() => {
                          const v = heroVideoRef.current;
                          if (!v) return;
                          v.muted = !v.muted;
                          setHeroVideoMuted(v.muted);
                        }}
                        className="w-9 h-9 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-all"
                      >
                        {heroVideoMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>
                      <button
                        onClick={() => {
                          if (heroVideoRef.current) heroVideoRef.current.pause();
                          setShowVideoClose(false);
                        }}
                        className="w-9 h-9 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-all"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Hero text content — headline, subheadline, tags, buttons */
                <motion.div
                  key="hero-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
            {/* Collapsing wrapper - hides hero text/buttons when demo is active, lets DemoSteps float up */}
            <div
              className={`grid ${isDemoActive ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'}`}
              style={{
                pointerEvents: isDemoActive ? 'none' : undefined,
                opacity: isDemoActive ? 0 : 1,
                overflow: 'visible',
                transition: isDemoActive
                  ? 'grid-template-rows 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.15s, opacity 0.4s ease-out'
                  : 'grid-template-rows 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-out 0.2s',
              }}
            >
            <div className="min-h-0 overflow-visible">
            {/* Headline - smoothly moves up when discovery mode is active */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: discoveryMode ? -20 : 0
              }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 leading-[1.05] tracking-tight mb-6"
            >
              {COPY.hero.headline}
            </motion.h1>

            {/* Default Hero Content - fades out when discovery mode is active */}
            <AnimatePresence mode="wait">
              {!discoveryMode ? (
                <motion.div
                  key="default-content"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
                  {/* Subheadline - types out */}
                  <p className="text-xl sm:text-2xl md:text-3xl text-slate-500 leading-relaxed font-normal mb-4 lg:mb-0 min-h-[2em] sm:min-h-[2.5em]">
                    {typedSubheadline}
                    {heroStage === 'subheadline' && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="inline-block w-[3px] h-[1em] bg-slate-400 ml-1 align-middle"
                      />
                    )}
                  </p>

                  {/* Tags - with colorful wind wave effect (hidden on smaller screens to prevent overlap) */}
                  <div className="hidden lg:block">
                    <ColorWaveTags tags={heroTags} visible={visibleTags >= heroTags.length} />
                  </div>

                  {/* Buttons - CSS transition to avoid React re-render flicker */}
                  {/* Padding added for shadow room */}
                  <div
                    className="flex items-start justify-center sm:justify-start gap-4 flex-wrap transition-opacity duration-700 ease-out py-6 -my-6"
                    style={{
                      opacity: heroStage === 'buttons' || heroStage === 'complete' ? 1 : 0
                    }}
                  >
                    {/* Watch Video - LEFT */}
                    <button
                      onClick={() => {
                        if (isMobile) {
                          Analytics.videoWatched();
                          setShowVideoModal(true);
                          return;
                        }
                        if (showVideoClose) {
                          Analytics.videoPaused('hero_flat', 0);
                          setShowVideoClose(false);
                        } else {
                          Analytics.videoWatched();
                          Analytics.videoPlayed('hero_flat');
                          demoControls?.reset();
                          setShowVideoClose(true);
                        }
                      }}
                      className="watch-video-btn group relative pl-4 pr-8 py-3 rounded-full text-base font-medium flex items-center justify-center gap-3 active:scale-95 transition-all duration-300 bg-slate-900 text-white border border-slate-800 hover:border-slate-200"
                      style={{ filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.25)) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15))' }}
                    >
                      {/* Inner container for overflow clipping (keeps shadow visible on outer button) */}
                      <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                        {/* Circular white fill expanding from play button on hover */}
                        <span className="watch-video-fill absolute bg-white rounded-full" />
                      </span>
                      {/* Play button circle - inverts on hover */}
                      <span className="relative z-10 flex items-center justify-center w-9 h-9 rounded-full transition-colors duration-200 bg-white group-hover:bg-slate-900">
                        <Play size={14} className="ml-0.5 transition-colors duration-200 fill-slate-900 text-slate-900 group-hover:fill-white group-hover:text-white" />
                      </span>
                      {/* Text changes color on hover */}
                      <span className="relative z-10 transition-colors duration-500 delay-100 group-hover:text-slate-900">
                        {showVideoClose ? 'End Video' : 'Watch Video'}
                      </span>
                    </button>

                    {/* View Plans button - always visible after first demo completion */}
                    {hasCompletedDemo && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-2"
                      >
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            Analytics.checkoutModalOpened('hero');
                            const elapsed = (performance.now() - pageLoadTime.current) / 1000;
                            Analytics.timeToAction('checkout_open', Math.round(elapsed));
                            scrollToSection('pricing');
                          }}
                          className="group relative pl-4 pr-6 py-1.5 rounded-full text-base font-medium flex items-center justify-center gap-3 shadow-lg shadow-violet-200/50 hover:shadow-violet-300/60 border border-violet-100/60 hover:border-violet-200/80 transition-all duration-300 overflow-hidden"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(245,235,255,0.85) 25%, rgba(235,245,255,0.85) 50%, rgba(255,245,235,0.85) 75%, rgba(255,255,255,0.85) 100%)',
                          }}
                        >
                          {/* Animated gradient overlay - more visible on hover */}
                          <motion.div
                            className="absolute inset-0 opacity-50 group-hover:opacity-80 transition-opacity duration-300"
                            style={{
                              background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.25), rgba(129,140,248,0.25), rgba(251,191,36,0.15), transparent)',
                              backgroundSize: '200% 100%',
                            }}
                            animate={{
                              backgroundPosition: ['0% 0%', '200% 0%'],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          />
                          {/* Second layer that moves on hover */}
                          <motion.div
                            className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-300"
                            style={{
                              background: 'linear-gradient(270deg, transparent, rgba(251,191,36,0.2), rgba(167,139,250,0.2), rgba(129,140,248,0.2), transparent)',
                              backgroundSize: '200% 100%',
                            }}
                            animate={{
                              backgroundPosition: ['200% 0%', '0% 0%'],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          />
                          {/* Sparkle icon circle - matches Watch Video play button size */}
                          <span className="relative z-10 flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-violet-400/30 to-amber-300/30">
                            <span className="text-violet-600">✦</span>
                          </span>
                          <span className="relative z-10 font-semibold text-slate-900">View Plans</span>
                        </motion.button>

                        {/* Retry button - only when idle or results (not during recording/processing) */}
                        {(demoStage === 'idle' || demoStage === 'results') && (
                          <button
                            onClick={() => {
                              setChatOpened(false);
                              setChatMessageCount(0);
                              setAllCardsVerified(false);
                              resetCardVerifications();
                              demoControls?.startNew();
                            }}
                            className="text-slate-400 hover:text-slate-600 text-sm transition-colors"
                          >
                            Try again
                          </button>
                        )}
                      </motion.div>
                    )}

                    {/* Try Now Demo - always rendered for recording functionality, hidden after completion when not actively recording */}
                    <div className={hasCompletedDemo && (demoStage === 'idle' || demoStage === 'results') ? 'hidden' : ''}>
                      <TryNowDemo
                        hasCompletedDemo={hasCompletedDemo}
                        onStageChange={(stage, controls) => {
                          setDemoStage(stage);
                          setDemoControls(controls);
                        }}
                      />
                    </div>
                  </div>

                </motion.div>
              ) : (
                <motion.div
                  key="discovery-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
                >
                  <HeroDiscoveryContent activeMode={discoveryMode} />
                </motion.div>
              )}
            </AnimatePresence>
            </div>
            </div>

            {/* Demo Steps - Outside collapsing wrapper so it lifts up to headline position */}
            <DemoSteps
              stage={demoStage}
              onStopRecording={demoControls?.stopRecording}
              onReset={demoControls?.reset}
              chatOpened={chatOpened}
              chatMessageCount={chatMessageCount}
              allCardsVerified={allCardsVerified}
            />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Mobile: Static device mockups as hero visual */}
          {isMobile && (
            <div className="relative flex items-end justify-center w-full flex-1" style={{ minHeight: '320px' }}>
              {/* Phone mockup — scaled down */}
              <div className="relative" style={{ transform: 'scale(0.45)', transformOrigin: 'bottom center', marginBottom: '-140px' }}>
                <PhoneMockup activeSection="hero" />
              </div>
              {/* Watch mockup — overlapping bottom-right of phone */}
              <div className="absolute" style={{ right: '8%', bottom: '0', transform: 'scale(0.5)', transformOrigin: 'bottom right' }}>
                <AppleWatchMockup />
              </div>
            </div>
          )}

          {/* Spacer to push content down if needed, but 3D is now fixed */}
          <div className="flex-1 h-[600px] hidden lg:block" />

          {/* Discovery Dock - Positioned at bottom left, scrolls with hero */}
          <HeroDiscoveryDock
            activeMode={discoveryMode}
            onModeChange={(mode) => {
              if (mode) Analytics.tabClicked(mode);
              setDiscoveryMode(mode);
            }}
          />

          {/* Bottom fade to white - smooth transition to next section */}
          <div
            style={{
              position: 'absolute',
              bottom: '-1px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100vw',
              height: '120px',
              background: 'linear-gradient(to bottom, transparent 0%, white 100%)',
              pointerEvents: 'none',
              zIndex: 40,
            }}
          />

        </section>
        )}

        {/* Gate: on mobile, rest of site hidden until demo completed or skipped */}
        <div style={isMobile && !demoGatePassed ? { display: 'none' } : undefined}>

        {/* THE UNIVERSAL LIE - Cinematic, borderless, Apple-style */}
        <section
          ref={videoTransitionRef}
          id="video-transition"
          className="relative min-h-screen flex items-center z-10"
          style={{
            width: '100vw',
            marginLeft: 'calc(-50vw + 50%)',
            marginTop: '-1px',
            backgroundColor: 'white',
          }}
        >
          {/* Right: Typography - Parallax: scrolls slightly slower than video */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ y: textParallaxY }}
            className="absolute right-0 top-0 bottom-0 w-full lg:w-[45%] flex flex-col justify-center px-6 sm:px-8 md:px-16 lg:px-20 z-10 pt-24 lg:pt-0"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif text-slate-900 mb-6 sm:mb-8 lg:mb-12 leading-[1.1] tracking-tight">
              Life doesn't wait for your notes app.
            </h2>
            <div className="space-y-4 sm:space-y-6 text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed font-light max-w-lg">
              <p>
                Walking into the meeting. Standing in the shower. Halfway out the door.
              </p>
              <p>
                An invitation. A task. A thought you can't afford to lose.
              </p>
              <p className="text-xl sm:text-2xl md:text-3xl font-serif text-slate-900 italic leading-snug">
                You tell yourself: "I'll just remember that."
              </p>
              <p className="text-slate-400">
                (You won't.)
              </p>
            </div>
          </motion.div>

          {/* The Chaos - Video with responsive positioning */}
          {/* Desktop: Left side with gradient fade to right */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            className="hidden lg:block absolute inset-0 overflow-hidden"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="none"
              className="absolute top-0 bottom-0 h-full object-cover"
              style={{
                width: '100%',
                left: '-15%',
                objectPosition: 'center center',
              }}
            >
              <source src="/videos/messy-man-loop-optimized.mp4" type="video/mp4" />
            </video>
            {/* Gradient overlay - fade to white on right, top, and bottom */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  linear-gradient(to right, transparent 0%, transparent 40%, rgba(255,255,255,0.5) 50%, white 60%, white 100%),
                  linear-gradient(to bottom, white 0%, transparent 5%, transparent 90%, white 100%)
                `
              }}
            />
          </motion.div>

          {/* Tablet: Video takes less space, centered */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            className="hidden md:block lg:hidden absolute inset-0 overflow-hidden"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="none"
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                objectPosition: '30% center',
              }}
            >
              <source src="/videos/messy-man-loop-optimized.mp4" type="video/mp4" />
            </video>
            {/* Stronger gradient for tablet to ensure text readability */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  linear-gradient(to right, transparent 0%, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.8) 50%, white 70%, white 100%),
                  linear-gradient(to bottom, white 0%, transparent 10%, transparent 100%)
                `
              }}
            />
          </motion.div>

          {/* Mobile: Static poster at bottom (saves bandwidth vs auto-playing video) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            className="md:hidden absolute bottom-0 left-0 right-0 h-[45vh] overflow-hidden"
          >
            <img
              src="/videos/messy-man-poster.jpg"
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center 30%' }}
            />
            {/* Top fade for mobile */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(to bottom, white 0%, transparent 25%, transparent 100%)'
              }}
            />
          </motion.div>
        </section>

        {/* NARRATIVE TRANSITION - Palate cleanser between Problem and Solution */}
        <Suspense fallback={<div className="min-h-screen" />}>
          <div ref={narrativeRef}>
            <NarrativeTransition />
          </div>
        </Suspense>

        {/* CAPTURE SECTION - Detection now handled by NarrativeTransition via scroll progress */}
        <section ref={captureRef} id="capture" className="h-0" />

        {/* ORGANIZE SECTION - MacBook opens as you scroll */}
        <Suspense fallback={<div className="min-h-screen" />}>
          <OrganizeSection />
        </Suspense>

        {/* FLOW VISUALIZATION - DEACTIVATED (kept for future use) */}
        {/* <section ref={flowRef} id="flow" className="relative min-h-screen -mt-[85vh]">
          {prefersReducedMotion ? (
            <div className="w-full h-screen bg-white flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-3xl font-serif text-slate-900 mb-4">VOIS</h2>
                <p className="text-slate-500">Intelligent categorization of your thoughts</p>
              </div>
            </div>
          ) : (
            <FlowVisualization />
          )}
        </section> */}

        {/* DEMO - DEACTIVATED (kept for future use) */}
        {/* <section id="demo" className="py-24 px-6 md:px-16">
            <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5 }}
               className="max-w-xl mr-auto ml-6 lg:ml-16 bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm border border-slate-100"
            >
               <div className="flex items-center gap-3 mb-6 text-life-purple-dark">
                  <Zap size={20} className="fill-current" />
                  <span className="font-mono text-xs uppercase tracking-widest">Realtime Processing</span>
               </div>
               <p className="text-xl md:text-2xl font-serif italic text-slate-400 mb-6 leading-relaxed">
                 {COPY.demo.input}
               </p>
               <div className="pl-6 border-l-2 border-slate-200">
                  <p className="text-slate-900 font-medium text-sm">{COPY.demo.caption}</p>
               </div>
            </motion.div>
        </section> */}

        {/* ADAPT - DEACTIVATED (kept for future use) */}
        {/* <section id="adapt" className="py-24 px-6 md:px-16">
           <motion.div
             initial={{ opacity: 0, x: -30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6 }}
             className="max-w-xl mr-auto ml-6 lg:ml-16 bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm border border-slate-100"
           >
             <h2 className="text-2xl md:text-3xl font-serif text-slate-900 mb-4">{COPY.adapt.title}</h2>
             <p className="text-base text-slate-500 leading-relaxed max-w-lg mb-8">
               {COPY.adapt.body}
             </p>
             <div className="grid gap-3 max-w-sm">
                {[
                  { label: 'Headache Tracker', color: 'bg-life-pink-light', text: 'text-life-pink-dark' },
                  { label: 'Meditation Streaks', color: 'bg-life-cyan-light', text: 'text-life-cyan-dark' },
                  { label: 'Dream Journal', color: 'bg-life-purple-light', text: 'text-life-purple-dark' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-4 rounded-2xl ${item.color} ${item.text} flex items-center justify-between`}
                  >
                    <span className="font-medium text-sm">{item.label}</span>
                    <div className="w-7 h-7 bg-white/50 rounded-full flex items-center justify-center">
                       <Check size={12} />
                    </div>
                  </motion.div>
                ))}
             </div>
           </motion.div>
        </section> */}

        {/* PRIVACY - LEFT side for watch on right */}
        {/* RETRIEVE SECTION - "Retrieve at the speed of sound" with click-to-play video */}
        <section id="retrieve" className="py-24 px-6 md:px-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center w-[90%] max-w-[1200px] mx-auto"
            style={{ gap: 'clamp(1.5rem, 3vw, 3rem)' }}
          >
            <h2
              className="font-serif text-slate-900 text-center"
              style={{
                fontSize: 'clamp(2rem, 5vw, 4.5rem)',
                fontWeight: 400,
                lineHeight: 1.1,
                marginBottom: '0.5rem',
              }}
            >
              Retrieve at the speed of sound.
            </h2>

            {/* Video with click-to-play (has sound) */}
            <div
              className="relative w-full cursor-pointer"
              style={{
                maxWidth: '700px',
                borderRadius: 'clamp(12px, 2vw, 24px)',
                overflow: 'hidden',
                boxShadow: '0 12px 48px rgba(0, 0, 0, 0.15)',
              }}
              onClick={() => {
                if (retrieveVideoRef.current) {
                  if (retrieveVideoPlaying) {
                    const vid = retrieveVideoRef.current;
                    const pct = vid.duration ? Math.round((vid.currentTime / vid.duration) * 100) : 0;
                    Analytics.videoPaused('retrieve', pct);
                    vid.pause();
                    setRetrieveVideoPlaying(false);
                  } else {
                    Analytics.videoPlayed('retrieve');
                    videoMilestonesRef.current.clear();
                    retrieveVideoRef.current.play();
                    setRetrieveVideoPlaying(true);
                  }
                }
              }}
            >
              <div className="aspect-video bg-slate-100 relative">
                <video
                  ref={retrieveVideoRef}
                  playsInline
                  className="w-full h-full object-cover"
                  onTimeUpdate={() => {
                    const vid = retrieveVideoRef.current;
                    if (!vid || !vid.duration) return;
                    const pct = Math.round((vid.currentTime / vid.duration) * 100);
                    for (const milestone of [25, 50, 75, 100]) {
                      if (pct >= milestone && !videoMilestonesRef.current.has(milestone)) {
                        videoMilestonesRef.current.add(milestone);
                        Analytics.videoProgress('retrieve', milestone);
                      }
                    }
                  }}
                  onEnded={() => {
                    Analytics.videoCompleted('retrieve');
                    setRetrieveVideoPlaying(false);
                  }}
                >
                  <source src="/videos/retrieve-placeholder.mp4" type="video/mp4" />
                </video>

                {/* Play button overlay - fades out when playing */}
                <AnimatePresence>
                  {!retrieveVideoPlaying && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/20"
                    >
                      <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform">
                        <Play size={32} className="text-slate-900 fill-current ml-1" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="privacy" className="pt-8 pb-24 px-6 md:px-16 relative z-10">
           <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6 }}
             className="max-w-xl mx-auto text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm border border-slate-100"
           >
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-900 mb-6 mx-auto">
                <Fingerprint size={24} strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl md:text-3xl font-serif text-slate-900 mb-4">{COPY.privacy.title}</h2>
              <p className="text-base text-slate-500 leading-relaxed max-w-lg">
                {COPY.privacy.body}
              </p>
              
              <div className="mt-8 flex items-center justify-center gap-3 text-sm font-medium text-slate-900">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200">
                      <Lock size={14} /> Local First
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200">
                      <Cloud size={14} /> Encrypted Sync
                  </div>
              </div>
           </motion.div>
        </section>

        {/* SECTION 5: FAQ */}
        <section id="faq" className="py-24 px-6 md:px-16">
          <div className="max-w-2xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-serif text-slate-900 text-center mb-12"
            >
              Common Questions
            </motion.h2>
            
            <div className="divide-y divide-slate-200">
              {faqData.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="border-b border-slate-200 last:border-b-0"
                >
                  <button
                    onClick={() => {
                      if (openFaq !== index) Analytics.faqExpanded(faq.question, index);
                      setOpenFaq(openFaq === index ? null : index);
                    }}
                    className="w-full py-6 flex items-center justify-between text-left group"
                  >
                    <span className="text-lg font-medium text-slate-900 group-hover:text-slate-600 transition-colors pr-4">
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{ rotate: openFaq === index ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown size={20} className="text-slate-400" />
                    </motion.div>
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {openFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="pb-6 text-slate-500 leading-relaxed">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 6: PRICING */}
        <section id="pricing" className="py-24 px-6 md:px-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-5xl mx-auto"
          >
            {/* Section header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif text-slate-900 mb-3">Choose Your Plan</h2>
              <p className="text-slate-500 text-lg">Start free. Upgrade when you're ready.</p>
              {/* Billing toggle */}
              <div className="flex items-center justify-center gap-3 mt-6">
                <span className={`text-sm font-medium ${!annualBilling ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
                <button
                  onClick={() => setAnnualBilling(!annualBilling)}
                  className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${annualBilling ? 'bg-slate-900' : 'bg-slate-300'}`}
                >
                  <motion.div
                    className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm"
                    animate={{ left: annualBilling ? 22 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
                <span className={`text-sm font-medium ${annualBilling ? 'text-slate-900' : 'text-slate-400'}`}>Annual</span>
                {annualBilling && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full"
                  >
                    Save up to 40%
                  </motion.span>
                )}
              </div>
            </div>

            {/* Pricing cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Free Plan */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-3xl p-8 shadow-xl shadow-black/5 border border-slate-200 relative flex flex-col"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Free</h3>
                <p className="text-slate-500 text-sm mb-5">Try it out, no card required</p>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-bold text-slate-900 tracking-tight">$0</span>
                  <span className="text-slate-400 text-sm">forever</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {FREE_FEATURES.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-600 text-sm">
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Check size={12} className="text-slate-400" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="https://apps.apple.com/app/vois"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => Analytics.externalLinkClicked('download_ios_pricing')}
                  className="block w-full bg-slate-100 text-slate-900 py-3.5 rounded-full text-base font-semibold hover:bg-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98] text-center"
                >
                  Download Free
                </a>
              </motion.div>

              {/* Personal Plan */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-3xl p-8 shadow-xl shadow-black/5 border-2 border-slate-900 relative flex flex-col"
              >
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-slate-900">Personal</h3>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Popular</span>
                </div>
                <p className="text-slate-500 text-sm mb-5">For everyday life organization</p>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-bold text-slate-900 tracking-tight">
                    {annualBilling ? '$79.99' : '$14.99'}
                  </span>
                  <span className="text-slate-400 text-sm">/{annualBilling ? 'year' : 'month'}</span>
                </div>
                {annualBilling && (
                  <p className="text-sm text-emerald-600 font-medium -mt-4 mb-6">
                    $6.67/mo — save 56% vs monthly
                  </p>
                )}
                <ul className="space-y-3 mb-8 flex-1">
                  {PERSONAL_FEATURES.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-600 text-sm">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <Check size={12} className="text-emerald-500" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => { Analytics.checkoutModalOpened('pricing'); setSelectedPlan(annualBilling ? 'personal_annual' : 'personal_monthly'); setShowCheckoutModal(true); }}
                  className="block w-full bg-slate-900 text-white py-3.5 rounded-full text-base font-semibold hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98] text-center"
                >
                  Get Started
                </button>
                <p className="text-center text-slate-500 text-xs mt-4">
                  Cancel anytime. 30-day money-back guarantee.
                </p>
              </motion.div>

              {/* Work Plan */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-slate-950 rounded-3xl p-8 shadow-2xl shadow-black/20 border border-slate-800 relative overflow-hidden flex flex-col"
              >
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black opacity-50 pointer-events-none" />
                <div className="relative z-10 flex flex-col flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">Work</h3>
                  <p className="text-slate-400 text-sm mb-5">For professionals & teams</p>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-4xl font-bold text-white tracking-tight">
                      {annualBilling ? '$249.99' : '$34.99'}
                    </span>
                    <span className="text-slate-500 text-sm">/{annualBilling ? 'year' : 'month'}</span>
                  </div>
                  {annualBilling && (
                    <p className="text-sm text-emerald-400 font-medium -mt-4 mb-6">
                      $20.83/mo — save 40% vs monthly
                    </p>
                  )}
                  <ul className="space-y-3 mb-8 flex-1">
                    {WORK_FEATURES.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                          <Check size={12} className="text-emerald-400" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => { Analytics.checkoutModalOpened('pricing'); setSelectedPlan(annualBilling ? 'work_annual' : 'work_monthly'); setShowCheckoutModal(true); }}
                    className="block w-full bg-white text-slate-950 py-3.5 rounded-full text-base font-semibold hover:bg-slate-100 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg text-center"
                  >
                    Get Started
                  </button>
                  <p className="text-center text-slate-500 text-xs mt-4">
                    Cancel anytime. 30-day money-back guarantee.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>
        
        {/* SECTION 7: FOOTER */}
        <footer className="py-16 px-6 md:px-16 border-t border-slate-100" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}>
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
              
              {/* Col 1: Logo & Tagline */}
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <img 
                    src="/Logo/vois-logo.svg" 
                    alt="Vois" 
                    className="h-8 w-8"
                  />
                  <span className="font-semibold text-sm tracking-tight text-slate-900">VOIS</span>
                </div>
                <p className="text-slate-500 text-sm">Clear your mind.</p>
              </div>
              
              {/* Col 2: Product */}
              <div>
                <h4 className="text-slate-900 font-medium text-sm mb-4">Product</h4>
                <ul className="space-y-3">
                  <li>
                    <Link to="/login" onClick={() => Analytics.externalLinkClicked('login')} className="text-slate-500 text-sm hover:text-slate-900 transition-colors">
                      Login
                    </Link>
                  </li>
                  <li>
                    <a href="https://apps.apple.com/app/vois" target="_blank" rel="noopener noreferrer" onClick={() => Analytics.externalLinkClicked('download_ios')} className="text-slate-500 text-sm hover:text-slate-900 transition-colors">
                      Download for iPhone
                    </a>
                  </li>
                  <li>
                    <a href="https://apps.apple.com/app/vois" target="_blank" rel="noopener noreferrer" onClick={() => Analytics.externalLinkClicked('download_watch')} className="text-slate-500 text-sm hover:text-slate-900 transition-colors">
                      Download for Watch
                    </a>
                  </li>
                  <li>
                    <a href="https://apps.apple.com/app/vois" target="_blank" rel="noopener noreferrer" onClick={() => Analytics.externalLinkClicked('download_mac')} className="text-slate-500 text-sm hover:text-slate-900 transition-colors">
                      Download for Mac
                    </a>
                  </li>
                </ul>
              </div>
              
              {/* Col 3: Support */}
              <div>
                <h4 className="text-slate-900 font-medium text-sm mb-4">Support</h4>
                <ul className="space-y-3">
                  <li>
                    <Link to="/support" onClick={() => Analytics.externalLinkClicked('support')} className="text-slate-500 text-sm hover:text-slate-900 transition-colors">
                      Help & FAQ
                    </Link>
                  </li>
                  <li>
                    <a href="mailto:hello@tryvois.com" onClick={() => Analytics.externalLinkClicked('contact_email')} className="text-slate-500 text-sm hover:text-slate-900 transition-colors">
                      Contact Us
                    </a>
                  </li>
                </ul>
              </div>

              {/* Col 4: Legal */}
              <div>
                <h4 className="text-slate-900 font-medium text-sm mb-4">Legal</h4>
                <ul className="space-y-3">
                  <li>
                    <Link to="/Privacy" onClick={() => Analytics.externalLinkClicked('privacy_policy')} className="text-slate-500 text-sm hover:text-slate-900 transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/Terms" onClick={() => Analytics.externalLinkClicked('terms_of_service')} className="text-slate-500 text-sm hover:text-slate-900 transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link to="/legal#refund" onClick={() => Analytics.externalLinkClicked('refund_policy')} className="text-slate-500 text-sm hover:text-slate-900 transition-colors">
                      Refund Policy
                    </Link>
                  </li>
                  <li>
                    <CookieSettingsTrigger />
                  </li>
                </ul>
              </div>
              
              {/* Col 4: Social */}
              <div>
                <h4 className="text-slate-900 font-medium text-sm mb-4">Social</h4>
                <ul className="space-y-3">
                  <li>
                    <a href="https://x.com/voisaiapp" target="_blank" rel="noopener noreferrer" onClick={() => Analytics.externalLinkClicked('twitter')} className="text-slate-500 text-sm hover:text-slate-900 transition-colors">
                      X / Twitter
                    </a>
                  </li>
                  <li>
                    <a href="https://www.instagram.com/usevois" target="_blank" rel="noopener noreferrer" onClick={() => Analytics.externalLinkClicked('instagram')} className="text-slate-500 text-sm hover:text-slate-900 transition-colors">
                      Instagram
                    </a>
                  </li>
                  <li>
                    <a href="https://www.tiktok.com/@getvois" target="_blank" rel="noopener noreferrer" onClick={() => Analytics.externalLinkClicked('tiktok')} className="text-slate-500 text-sm hover:text-slate-900 transition-colors">
                      TikTok
                    </a>
                  </li>
                  <li>
                    <a href="https://www.facebook.com/tryvois" target="_blank" rel="noopener noreferrer" onClick={() => Analytics.externalLinkClicked('facebook')} className="text-slate-500 text-sm hover:text-slate-900 transition-colors">
                      Facebook
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="mt-12 pt-8 border-t border-slate-100 text-center">
              <p className="text-slate-400 text-xs">
                &copy; {new Date().getFullYear()} Vois AI. All rights reserved.
              </p>
            </div>
          </div>
        </footer>

        </div>
      </main>
    </div>
  );
};

export default App;