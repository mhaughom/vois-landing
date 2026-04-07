import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/* ─── Category image map ───────────────────────────────────────────────── */
/* Categories that need a slight zoom to crop out paper edges */
const zoomedCategories = new Set([
  'AI & Intelligence',
  'Content & Files',
  'Money',
  'Projects & Tasks',
  'Communication & Support',
]);

/* Variants for each category — 3 options to pick from */
const categoryVariants: Record<string, string[]> = {
  'Communication & Support': ['/category-communication.png'],
  'Scheduling & Bookings': ['/category-scheduling.png'],
  'Jobs & Field Work': ['/category-field-work.png'],
  'Projects & Tasks': ['/category-projects-v1.png', '/category-projects-v2.png', '/category-projects-v3.png'],
  'Sales & CRM': ['/category-sales-v1.png'],
  'Money': ['/category-money-v3.png'],
  'Voice & Capture': ['/category-voice-v2.png'],
  'AI & Intelligence': ['/category-ai-v2.png'],
  'Team & Workspace': ['/category-team-v1.png'],
  'Website & Marketing': ['/category-marketing-v1.png'],
  'Content & Files': ['/category-content-v2.png'],
};

/* ─── Types (mirrors AppGridBox) ───────────────────────────────────────── */
type AppItem = {
  label: string;
  color: string;
  icon?: string;
  video?: string;
  href?: string;
  desc: string;
  replaces: string;
  price?: number;
  W?: React.FC<{ c: string; h?: boolean }>;
};

type Category = {
  category: string;
  items: AppItem[];
};


/* ─── Animation variants ───────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariant = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

/* ─── App card ─────────────────────────────────────────────────────────── */
const AppCard: React.FC<{
  app: AppItem;
  isHovered: boolean;
  onHover: (label: string | null) => void;
}> = ({ app, isHovered, onHover }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('app-grid-box');
  const displayLabel = t(`apps.${app.label}`, { defaultValue: app.label });

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    onHover(app.label);
    if (app.video) {
      const container = e.currentTarget.querySelector('.icon-container');
      if (container && !container.querySelector('video')) {
        const vid = document.createElement('video');
        vid.src = app.video;
        vid.autoplay = true;
        vid.muted = true;
        vid.playsInline = true;
        vid.className = 'absolute object-contain';
        vid.style.left = '50%';
        vid.style.top = '45%';
        vid.style.transform = 'translate(-50%, -50%)';
        vid.style.maxWidth = '70%';
        vid.style.maxHeight = '70%';
        vid.style.zIndex = '2';
        const img = container.querySelector('img');
        if (img) img.style.visibility = 'hidden';
        container.appendChild(vid);
        vid.play().catch(() => {});
        let loops = 0;
        vid.addEventListener('ended', () => { loops++; if (loops < 2) { vid.currentTime = 0; vid.play().catch(() => {}); } });
      }
    }
  }, [app.label, app.video, onHover]);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    onHover(null);
    const container = e.currentTarget.querySelector('.icon-container');
    if (container) {
      const vid = container.querySelector('video');
      if (vid) { vid.pause(); vid.remove(); }
      const img = container.querySelector('img');
      if (img) img.style.visibility = '';
    }
  }, [onHover]);

  return (
    <motion.div
      variants={cardVariant}
      className="relative select-none"
      style={{ width: 'clamp(64px, 14vw, 100px)', zIndex: isHovered ? 50 : 1 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => app.href && navigate(app.href)}
    >
      <div
        className="w-full aspect-square rounded-xl overflow-hidden border bg-white shadow-sm cursor-pointer transition-all group/card hover:scale-105 hover:shadow-md"
        style={{
          borderColor: `${app.color}20`,
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        }}
      >
        {app.icon ? (
          <div className="icon-container w-full h-full flex items-center justify-center px-1.5 pt-1 pb-4 relative overflow-hidden transition-[filter] duration-300" style={{ filter: isHovered ? 'saturate(0.7) brightness(1.05)' : 'saturate(0.35) brightness(1.12)' }}>
            <img src={app.icon} alt={displayLabel} className="object-contain max-w-[70%] max-h-[70%]" draggable={false} />
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: `radial-gradient(circle at 50% 45%, ${app.color}12 0%, transparent 70%)` }}
            />
          </div>
        ) : app.W ? (
          <app.W c={app.color} h={isHovered} />
        ) : null}
        <div
          className="absolute bottom-0 inset-x-0 text-center font-semibold pb-1.5 truncate px-1 rounded-b-xl"
          style={{ color: app.color, background: 'linear-gradient(to top, white 60%, transparent)', fontSize: 'clamp(8px, 0.65vw, 10px)', filter: isHovered ? 'saturate(0.8) brightness(1)' : 'saturate(0.35) brightness(1.12)', transition: 'filter 0.3s' }}
        >
          {displayLabel}
        </div>
      </div>

    </motion.div>
  );
};

/* ─── Single category section ──────────────────────────────────────────── */
const CategorySection: React.FC<{
  cat: Category;
  index: number;
}> = ({ cat, index }) => {
  const { t } = useTranslation(['app-grid-box', 'work-home']);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const variants = categoryVariants[cat.category];
  const [variantIdx, setVariantIdx] = useState(0);
  const imageLeft = index % 2 === 0;
  const imgSrc = variants ? variants[variantIdx] : undefined;

  // hoveredLabel stores the English key; look up the data item the same way
  const hoveredApp = hoveredLabel ? cat.items.find(a => a.label === hoveredLabel) : null;

  const shouldZoom = zoomedCategories.has(cat.category);
  const categoryDisplayName = t(`categories.${cat.category}`, { ns: 'app-grid-box', defaultValue: cat.category });
  const replacesLabel = t('categoryShowcase.replaces', { ns: 'work-home', defaultValue: 'Replaces:' });

  const imageBlock = (
    <motion.div variants={fadeUp} className="flex-1 min-w-0 relative overflow-hidden rounded-2xl">
      {imgSrc && (
        <img
          src={imgSrc}
          alt={categoryDisplayName}
          className="w-full"
          style={{ filter: 'saturate(0.85) brightness(1.06)', ...(shouldZoom ? { transform: 'scale(1.15)', transformOrigin: 'center' } : {}) }}
        />
      )}
      {/* Film grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '300px 300px',
        }}
      />
      {/* Hover overlay — shows app info on top of the category image */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <AnimatePresence>
          {hoveredApp && (
            <motion.div
              key={hoveredApp.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col justify-center p-6 md:p-8"
            >
              <h4 className="text-xl font-semibold text-slate-900 mb-2">
                {t(`apps.${hoveredApp.label}`, { ns: 'app-grid-box', defaultValue: hoveredApp.label })}
              </h4>
              <p className="text-xs text-slate-400 mb-3">
                {hoveredApp.replaces ? `${replacesLabel} ${t(`appReplaces.${hoveredApp.label}`, { ns: 'app-grid-box', defaultValue: hoveredApp.replaces })}` : ''}
                {hoveredApp.replaces && hoveredApp.price ? ' — ' : ''}
                {hoveredApp.price ? `~$${hoveredApp.price}/mo` : ''}
              </p>
              {hoveredApp.desc && (
                <p className="text-sm text-slate-600 leading-relaxed">
                  {t(`appDescs.${hoveredApp.label}`, { ns: 'app-grid-box', defaultValue: hoveredApp.desc })}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  const contentBlock = (
    <motion.div variants={fadeUp} className="flex-1 min-w-0">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          {categoryDisplayName}
        </h3>
        {variants && variants.length > 1 && (
          <div className="flex items-center gap-1.5">
            {variants.map((_, i) => (
              <button
                key={i}
                onClick={() => setVariantIdx(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === variantIdx ? 'bg-slate-600 scale-125' : 'bg-slate-300 hover:bg-slate-400'}`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-wrap justify-center md:justify-start" style={{ gap: 'clamp(6px, 1vw, 12px)' }}>
        {cat.items.map(app => (
          <AppCard
            key={app.label}
            app={app}
            isHovered={hoveredLabel === app.label}
            onHover={setHoveredLabel}
          />
        ))}
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={stagger}
      className="flex flex-col md:flex-row items-center gap-10 md:gap-16"
    >
      {/* On mobile: always content (title+icons) first, image below.
           On desktop: alternate left/right image placement. */}
      <div className="contents md:hidden">
        {contentBlock}
        {imageBlock}
      </div>
      <div className="hidden md:contents">
        {imageLeft ? <>{imageBlock}{contentBlock}</> : <>{contentBlock}{imageBlock}</>}
      </div>
    </motion.div>
  );
};

/* ─── Main component ───────────────────────────────────────────────────── */
export const CategoryShowcase: React.FC<{ categories: Category[] }> = ({ categories }) => {
  const { t } = useTranslation('work-home');
  const total = categories.reduce((n, c) => n + c.items.length, 0);

  return (
    <div className="py-24 md:py-36 px-6 md:px-12">
      <div className="text-center mb-20">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-900 mb-4">
          {t('categoryShowcase.heading')} <span className="italic">{t('categoryShowcase.headingItalic')}</span>
        </h2>
        <p className="text-lg text-slate-500 max-w-xl mx-auto">
          {t('categoryShowcase.description', { count: total })}
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-14 md:space-y-32">
        {categories.map((cat, i) => (
          <CategorySection key={cat.category} cat={cat} index={i} />
        ))}
      </div>

    </div>
  );
};
