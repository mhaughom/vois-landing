import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Car, MapPin, Eye, Route, Users, Gauge } from 'lucide-react';
import { Navbar } from '@li/shared/components/Navbar';
import { useTranslation } from 'react-i18next';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

/* ── Pin data ─────────────────────────────────────────────────────────── */

type PinStatus = 'on-site' | 'driving' | 'available';

interface MapPin_ {
  name: string;
  status: PinStatus;
  label: string;
  sublabel?: string;
  speed: number;
  color: string; // tailwind dot color class
  dotBg: string; // raw hex for the pulsing dot
  top: string;
  left: string;
}

/* ── Faux road network (purely decorative SVG lines) ──────────────────── */

const RoadNetwork = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    preserveAspectRatio="none"
    viewBox="0 0 800 500"
  >
    {/* Horizontal roads */}
    <line x1="0" y1="120" x2="800" y2="120" stroke="#475569" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.4" />
    <line x1="0" y1="260" x2="800" y2="260" stroke="#475569" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.4" />
    <line x1="0" y1="380" x2="800" y2="380" stroke="#475569" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.4" />
    {/* Vertical roads */}
    <line x1="200" y1="0" x2="200" y2="500" stroke="#475569" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.4" />
    <line x1="450" y1="0" x2="450" y2="500" stroke="#475569" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.4" />
    <line x1="650" y1="0" x2="650" y2="500" stroke="#475569" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.4" />
    {/* Diagonal / curved connector */}
    <path d="M200,120 Q350,190 450,260" stroke="#475569" strokeWidth="1" fill="none" strokeDasharray="6 8" opacity="0.25" />
    <path d="M450,260 Q550,320 650,380" stroke="#475569" strokeWidth="1" fill="none" strokeDasharray="6 8" opacity="0.25" />
  </svg>
);

/* ── Component ────────────────────────────────────────────────────────── */

const pinPositions = [
  { status: 'on-site' as PinStatus, color: 'bg-emerald-400', dotBg: '#34d399', top: '22%', left: '28%' },
  { status: 'driving' as PinStatus, color: 'bg-amber-400', dotBg: '#fbbf24', top: '48%', left: '62%' },
  { status: 'on-site' as PinStatus, color: 'bg-emerald-400', dotBg: '#34d399', top: '65%', left: '35%' },
  { status: 'available' as PinStatus, color: 'bg-sky-400', dotBg: '#38bdf8', top: '38%', left: '78%' },
];

const TeamMap: React.FC = () => {
  const { t } = useTranslation('work-team-map');

  const groupTabs = t('groupTabs', { returnObjects: true }) as string[];
  const [activeTab, setActiveTab] = useState<string>(groupTabs[0] ?? 'All');

  const pinsData = t('pins', { returnObjects: true }) as Array<{
    name: string;
    label: string;
    sublabel?: string;
    speed: number;
  }>;

  const pins: MapPin_[] = pinsData.map((p, i) => ({
    name: p.name,
    status: pinPositions[i]?.status ?? 'available',
    label: p.label,
    sublabel: p.sublabel,
    speed: p.speed,
    color: pinPositions[i]?.color ?? 'bg-slate-400',
    dotBg: pinPositions[i]?.dotBg ?? '#94a3b8',
    top: pinPositions[i]?.top ?? '50%',
    left: pinPositions[i]?.left ?? '50%',
  }));

  const techItems = t('techStrip.items', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ─── Content ─── */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ━━━ 1. Hero ━━━ */}
          <motion.section {...fadeUp()} className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500/10 text-sky-700 rounded-full text-sm font-medium mb-6">
              <Eye size={14} />
              {t('badge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
              {t('hero.description')}
            </p>
          </motion.section>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mx-auto mb-16">
            <p className="text-lg text-slate-600 leading-relaxed text-center">
              {t('body')}
            </p>
          </motion.div>

          {/* ━━━ 2. Mock map ━━━ */}
          <motion.section {...fadeUp(0.15)} className="mb-20">
            <div className="bg-slate-800 rounded-3xl p-6 md:p-8 text-white">
              {/* Map area */}
              <div className="relative bg-slate-700 rounded-2xl p-6 overflow-hidden" style={{ minHeight: '420px' }}>
                <RoadNetwork />

                {/* Group-by tabs — top right */}
                <div className="absolute top-4 right-4 z-10 flex gap-1 bg-slate-800/70 backdrop-blur-sm rounded-full p-1">
                  {groupTabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                        activeTab === tab
                          ? 'bg-white text-slate-900'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Pins */}
                {pins.map((pin) => (
                  <motion.div
                    key={pin.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="absolute"
                    style={{ top: pin.top, left: pin.left }}
                  >
                    <div className="bg-slate-600/80 backdrop-blur-sm rounded-lg p-2.5 text-xs min-w-[140px] shadow-lg border border-slate-500/30">
                      <div className="flex items-center gap-2 mb-1">
                        {/* Pulsing dot */}
                        <span className="relative flex h-2.5 w-2.5 shrink-0">
                          <span
                            className="absolute inline-flex h-full w-full rounded-full opacity-40 animate-ping"
                            style={{ backgroundColor: pin.dotBg }}
                          />
                          <span
                            className="relative inline-flex h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: pin.dotBg }}
                          />
                        </span>
                        <span className="font-semibold text-white">{pin.name}</span>
                        {pin.status === 'driving' && (
                          <Car size={11} className="text-amber-400 ml-auto" />
                        )}
                      </div>
                      <p className="text-slate-300 leading-snug">{pin.label}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-slate-400">{pin.speed} km/h</span>
                        {pin.sublabel && (
                          <span className="text-slate-500 text-[10px]">{pin.sublabel}</span>
                        )}
                      </div>
                    </div>
                    {/* Pin tail */}
                    <div className="flex justify-center">
                      <div
                        className="w-0.5 h-3 rounded-full"
                        style={{ backgroundColor: pin.dotBg }}
                      />
                    </div>
                    <div className="flex justify-center">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: pin.dotBg }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Caption */}
              <p className="text-xs text-slate-400 text-center mt-5">
                {t('mapCaption')}
              </p>
            </div>
          </motion.section>

          {/* ━━━ 3. Three benefit cards ━━━ */}
          <motion.section {...fadeUp(0.25)} className="mb-20">
            <div className="grid md:grid-cols-3 gap-6">
              {/* 5 grouping modes */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 bg-sky-100 rounded-lg flex items-center justify-center">
                    <Users size={18} className="text-sky-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">{t('benefits.grouping.title')}</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {t('benefits.grouping.description')}
                </p>
              </div>

              {/* Driving detection */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 bg-sky-100 rounded-lg flex items-center justify-center">
                    <Gauge size={18} className="text-sky-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">{t('benefits.driving.title')}</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {t('benefits.driving.description')}
                </p>
              </div>

              {/* Route overlay */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 bg-sky-100 rounded-lg flex items-center justify-center">
                    <Route size={18} className="text-sky-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">{t('benefits.route.title')}</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {t('benefits.route.description')}
                </p>
              </div>
            </div>
          </motion.section>

          {/* ━━━ 4. Scenario callout ━━━ */}
          <motion.section {...fadeUp(0.35)} className="mb-20">
            <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-10">
              <p className="text-lg md:text-xl leading-relaxed text-slate-300">
                A client calls: <span className="text-white font-medium">&ldquo;{t('scenario.quote1')}&rdquo;</span> {t('scenario.narrative1')} <span className="text-white font-medium">&ldquo;{t('scenario.quote2')}&rdquo;</span> {t('scenario.narrative2')} <span className="text-white font-medium">&ldquo;{t('scenario.quote3')}&rdquo;</span> {t('scenario.narrative3')}
              </p>
            </div>
          </motion.section>

          {/* ━━━ 5. Tech strip ━━━ */}
          <motion.section {...fadeUp(0.4)} className="mb-20">
            <div className="bg-sky-50 border border-sky-200 rounded-2xl px-8 py-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sky-700 text-sm font-medium">
              {techItems.map((item, i) => (
                <React.Fragment key={item}>
                  {i > 0 && <span className="text-sky-300">&middot;</span>}
                  <span>{item}</span>
                </React.Fragment>
              ))}
            </div>
          </motion.section>

          {/* ━━━ 6. Closing ━━━ */}
          <motion.section {...fadeUp(0.45)} className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-serif font-medium text-slate-900 mb-6 leading-snug">
              {t('cta.heading')}
            </h2>
            <a href="/work">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3.5 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
              >
                {t('cta.button')}
              </motion.button>
            </a>
          </motion.section>

        </div>
      </main>
    </div>
  );
};

export default TeamMap;
