import React, { useRef, useState, useEffect } from 'react';
import { useScroll, useTransform, useMotionValue, motion, useMotionValueEvent } from 'framer-motion';
import { useIsMobile } from '../hooks/useIsMobile';

// Each "app" shown on a phone — all using the calendar image for now
const APPS = [
  { label: 'Calendar',   image: '/Photos/IMG_3495%202.PNG', color: '#3b82f6' },
  { label: 'Tasks',      image: '/Photos/IMG_3495%202.PNG', color: '#10b981' },
  { label: 'Journal',    image: '/Photos/IMG_3495%202.PNG', color: '#f59e0b' },
  { label: 'To-do List', image: '/Photos/IMG_3495%202.PNG', color: '#a855f7' },
  { label: 'Shopping',   image: '/Photos/IMG_3495%202.PNG', color: '#ef4444' },
];

const PHONE_W      = 260;
const PHONE_H      = 540;
const PHONE_W_MOB  = 198;
const PHONE_H_MOB  = 408;
const GAP          = 28;

// ─── Phone mockup ─────────────────────────────────────────────────────────────

interface PhoneProps {
  label: string;
  image: string;
  color: string;
  mobile: boolean;
}

function PhoneMockup({ label, image, color, mobile }: PhoneProps) {
  const w  = mobile ? PHONE_W_MOB : PHONE_W;
  const h  = mobile ? PHONE_H_MOB : PHONE_H;
  const pad = mobile ? 3 : 4;             // bezel thickness in px — keep it thin
  const br = mobile ? '40px' : '48px';    // outer border-radius
  const bi = `${parseInt(mobile ? '40' : '48') - pad}px`; // inner = outer − bezel
  const niW = mobile ? '68px' : '82px';  // dynamic island width
  const niH = mobile ? '18px' : '22px';  // dynamic island height

  return (
    <div
      style={{
        width: w,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '18px',
      }}
    >
      {/* Phone frame */}
      <div
        style={{
          width: w,
          height: h,
          background: 'linear-gradient(145deg, #1e1e22, #111114)',
          borderRadius: br,
          padding: `${pad}px`,
          position: 'relative',
          boxShadow: [
            `0 60px 140px rgba(0,0,0,0.30)`,
            `0 20px 40px rgba(0,0,0,0.18)`,
            `0 0 0 1px rgba(255,255,255,0.07)`,
            `0 0 60px ${color}1a`,
          ].join(', '),
        }}
      >
        {/* Screen */}
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: bi,
            overflow: 'hidden',
            background: '#000',
          }}
        >
          <img
            src={image}
            alt={label}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top',
              display: 'block',
            }}
          />
        </div>

        {/* Dynamic island */}
        <div
          style={{
            position: 'absolute',
            top: `${pad + 10}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            width: niW,
            height: niH,
            background: '#111114',
            borderRadius: '10px',
            zIndex: 10,
          }}
        />

        {/* Volume buttons (left) */}
        {[
          { top: '20%', height: '26px' },
          { top: '31%', height: '48px' },
          { top: '43%', height: '48px' },
        ].map((btn, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '-3px',
              top: btn.top,
              width: '3px',
              height: btn.height,
              background: '#2c2c30',
              borderRadius: '2px 0 0 2px',
            }}
          />
        ))}

        {/* Power button (right) */}
        <div
          style={{
            position: 'absolute',
            right: '-3px',
            top: '34%',
            width: '3px',
            height: '62px',
            background: '#2c2c30',
            borderRadius: '0 2px 2px 0',
          }}
        />
      </div>

      {/* App label */}
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: mobile ? '0.8rem' : '0.92rem',
          color: '#64748b',
          fontWeight: 500,
          margin: 0,
          letterSpacing: '0.025em',
        }}
      >
        {label}
      </p>
    </div>
  );
}

// ─── Main section ──────────────────────────────────────────────────────────────

const OrganizeSection: React.FC = () => {
  const containerRef   = useRef<HTMLDivElement>(null);
  const isMobile       = useIsMobile();
  const [activeIndex, setActiveIndex] = useState(0);
  const currentXRef    = useRef(0); // accumulated horizontal px (desktop only)

  const phoneW         = isMobile ? PHONE_W_MOB : PHONE_W;
  const numPhones      = APPS.length;
  const totalTranslation = -(numPhones - 1) * (phoneW + GAP);
  const maxX           = Math.abs(totalTranslation);

  // ── Desktop: motion value driven by wheel interception ──────────────────
  const xDesktop = useMotionValue(0);

  useEffect(() => {
    if (isMobile) return;

    const handleWheel = (e: WheelEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const vh   = window.innerHeight;

      // Section fully above viewport — reset so it starts fresh on re-entry
      if (rect.bottom <= 0) {
        currentXRef.current = 0;
        xDesktop.set(0);
        setActiveIndex(0);
        return;
      }

      // Section not yet visible — don't interfere at all
      if (rect.top >= vh) return;

      // At x limits let the natural scroll take over
      const atStart = currentXRef.current <= 0    && e.deltaY < 0;
      const atEnd   = currentXRef.current >= maxX && e.deltaY > 0;
      if (atStart || atEnd) return;

      // ── Blend factor: 0 = all vertical, 1 = all horizontal ──────────────
      // Entry  (section rising into view): ease-out curve so vertical drops
      //   quickly at first then eases very gently the last few percent → the
      //   "ease into stopping" feeling the user described.
      // Pinned (fully in viewport):        always 1.
      // Exit   (section leaving upward):   ease-in curve so vertical resumes
      //   slowly at first and then accelerates back to full speed.
      let blend = 0;
      if (rect.top > 0) {
        const raw = 1 - rect.top / vh;          // 0 → 1 as section enters
        blend = 1 - Math.pow(1 - raw, 2.5);     // ease-out: slow final approach to 0
      } else if (rect.bottom < vh) {
        const raw = rect.bottom / vh;            // 1 → 0 as section exits
        blend = Math.pow(raw, 2.5);              // ease-in: vertical resumes gradually
      } else {
        blend = 1;
      }
      blend = Math.max(0, Math.min(1, blend));

      // Take control of this wheel tick
      e.preventDefault();

      const hDelta = e.deltaY * blend;
      const vDelta = e.deltaY * (1 - blend);

      // Move phones horizontally
      currentXRef.current = Math.max(0, Math.min(maxX, currentXRef.current + hDelta));
      xDesktop.set(-currentXRef.current);

      // Return the remaining vertical slice as a synchronous scroll
      if (Math.abs(vDelta) > 0.5) {
        document.documentElement.scrollTop += vDelta;
      }

      // Update active dot
      const norm = currentXRef.current / maxX;
      setActiveIndex(Math.min(numPhones - 1, Math.max(0, Math.round(norm * (numPhones - 1)))));
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isMobile, maxX, numPhones]);

  // ── Mobile: scroll-progress driven (touch can't be split the same way) ──
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  const xMobile = useTransform(scrollYProgress, [0.03, 0.82], [0, totalTranslation]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!isMobile) return;
    const normalized = Math.max(0, Math.min(1, (v - 0.03) / 0.79));
    setActiveIndex(Math.min(numPhones - 1, Math.max(0, Math.round(normalized * (numPhones - 1)))));
  });

  const x = isMobile ? xMobile : xDesktop;

  return (
    <div
      ref={containerRef}
      style={{
        height: isMobile ? '350vh' : '380vh',
        position: 'relative',
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        zIndex: 1,
      }}
    >
      {/* ── Sticky viewport ─────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Soft colour blob behind phones */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            filter: 'blur(110px)',
            background: `radial-gradient(ellipse 1200px 480px at 50% 72%, ${APPS[activeIndex].color}12, transparent 68%)`,
            transition: 'background 0.9s ease',
          }}
        />

        {/* ── Headline ────────────────────────────────────────────────────── */}
        <div
          style={{
            position: 'relative',
            zIndex: 20,
            textAlign: 'center',
            marginBottom: isMobile ? '32px' : '52px',
            padding: '0 2rem',
          }}
        >
          <h2
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: 'clamp(2rem, 5vw, 4.5rem)',
              color: '#0f172a',
              lineHeight: 1.1,
              fontWeight: 400,
              margin: 0,
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
              2
            </span>
            Organize at the speed of AI.
          </h2>

          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 'clamp(0.9rem, 1.4vw, 1.05rem)',
              color: '#94a3b8',
              margin: '12px 0 0',
            }}
          >
            Every voice note becomes a structured entry in the right place.
          </p>
        </div>

        {/* ── Phone strip ─────────────────────────────────────────────────── */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            overflow: 'visible',
          }}
        >
          <motion.div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: GAP,
              x,
              // First phone starts centered in viewport
              paddingLeft: `calc(50vw - ${phoneW / 2}px)`,
              willChange: 'transform',
            }}
          >
            {APPS.map((app, i) => (
              <PhoneMockup
                key={i}
                label={app.label}
                image={app.image}
                color={app.color}
                mobile={isMobile}
              />
            ))}
            {/* Trailing spacer so last phone can reach centre */}
            <div style={{ width: `calc(50vw - ${phoneW / 2}px)`, flexShrink: 0 }} />
          </motion.div>
        </div>

        {/* ── Progress dots ────────────────────────────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            bottom: '36px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            zIndex: 20,
            alignItems: 'center',
          }}
        >
          {APPS.map((app, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === activeIndex ? 24 : 8,
                backgroundColor:
                  i === activeIndex ? APPS[activeIndex].color : 'rgba(0,0,0,0.15)',
              }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              style={{ height: 8, borderRadius: 4 }}
            />
          ))}
        </div>

        {/* ── Scroll hint (only on first phone) ───────────────────────────── */}
        <motion.div
          animate={{ opacity: activeIndex === 0 ? 0.7 : 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'absolute',
            bottom: '28px',
            right: isMobile ? '24px' : '48px',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#94a3b8',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.78rem',
            pointerEvents: 'none',
          }}
        >
          <span>scroll to explore</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
};

export default OrganizeSection;
