import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench,
  Palette,
  Home,
  UtensilsCrossed,
  Briefcase,
  ShoppingBag,
  HardHat,
  Scissors,
  Sparkles,
  Building2,
  HeartPulse,
} from 'lucide-react';

// ── Business data (matches video segment order) ──────────────────
interface Business {
  id: string;
  name: string;
  icon: React.ElementType;
  accent: string;
}

const BUSINESSES: Business[] = [
  { id: 'creative-agencies', name: 'Creative Agencies', icon: Palette, accent: 'rgba(168, 85, 247, 0.12)' },
  { id: 'plumbers', name: 'Plumbers', icon: Wrench, accent: 'rgba(59, 130, 246, 0.12)' },
  { id: 'dental-practices', name: 'Dental Practices', icon: HeartPulse, accent: 'rgba(20, 184, 166, 0.12)' },
  { id: 'consulting-firms', name: 'Consulting Firms', icon: Briefcase, accent: 'rgba(100, 116, 139, 0.12)' },
  { id: 'salons', name: 'Salons & Spas', icon: Scissors, accent: 'rgba(244, 114, 182, 0.12)' },
  { id: 'construction', name: 'Construction Companies', icon: HardHat, accent: 'rgba(245, 158, 11, 0.12)' },
  { id: 'real-estate', name: 'Real Estate Agents', icon: Home, accent: 'rgba(34, 197, 94, 0.12)' },
  { id: 'restaurants', name: 'Restaurants', icon: UtensilsCrossed, accent: 'rgba(234, 179, 8, 0.12)' },
  { id: 'cleaning', name: 'Cleaning Companies', icon: Sparkles, accent: 'rgba(6, 182, 212, 0.12)' },
  { id: 'online-stores', name: 'Online Stores', icon: ShoppingBag, accent: 'rgba(236, 72, 153, 0.12)' },
  { id: 'property-management', name: 'Property Managers', icon: Building2, accent: 'rgba(107, 114, 128, 0.12)' },
];

const CLIP_DURATION = 3.04; // seconds per segment in the concatenated video
const VIDEO_SRC = '/videos/hero-businesses.mp4';

// ── Component ────────────────────────────────────────────────────
interface HeroBusinessCarouselProps {
  paused?: boolean;
  className?: string;
}

export const HeroBusinessCarousel: React.FC<HeroBusinessCarouselProps> = ({
  paused = false,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const rafRef = useRef<number>(0);

  // Sync activeIndex to video currentTime
  // Each clip is a transition between two businesses, so we switch
  // the label at the midpoint of each clip (offset by half a clip).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Switch label slightly before midpoint so it feels snappy
    const offset = CLIP_DURATION * 0.6;
    const sync = () => {
      const t = video.currentTime;
      const idx = Math.min(
        Math.floor((t + offset) / CLIP_DURATION),
        BUSINESSES.length - 1
      );
      setActiveIndex(idx);
      rafRef.current = requestAnimationFrame(sync);
    };

    rafRef.current = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Pause/play video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (paused) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
  }, [paused]);

  const goTo = useCallback((idx: number) => {
    const video = videoRef.current;
    if (!video) return;
    // Jump to the point where this business is fully visible
    const halfClip = CLIP_DURATION / 2;
    video.currentTime = Math.max(0, idx * CLIP_DURATION - halfClip);
    setActiveIndex(idx);
  }, []);

  const current = BUSINESSES[activeIndex];
  const Icon = current.icon;

  return (
    <div className={`relative flex flex-col w-full ${className}`}>
      {/* "Made for..." label */}
      <p className="text-sm font-medium text-slate-400 tracking-wide mb-3 px-1">
        Made for...
      </p>

      {/* Card */}
      <div
        className="relative w-full rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow:
            '0 8px 40px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        }}
      >
        {/* Video area */}
        <div className="w-full overflow-hidden" style={{ aspectRatio: '1 / 1' }}>
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        {/* Title bar */}
        <div className="relative px-6 py-5" style={{ minHeight: 64 }}>
          <AnimatePresence mode="popLayout">
            <motion.h3
              key={current.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 px-6 py-5 text-2xl font-semibold text-slate-900 tracking-tight"
            >
              {current.name}
            </motion.h3>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 mt-5">
        {BUSINESSES.map((b, i) => (
          <button
            key={b.id}
            onClick={() => goTo(i)}
            className="group relative p-1"
            aria-label={`Go to ${b.name}`}
          >
            <div
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === activeIndex ? 24 : 6,
                background:
                  i === activeIndex
                    ? 'rgb(51, 65, 85)'
                    : 'rgba(148, 163, 184, 0.4)',
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default HeroBusinessCarousel;
