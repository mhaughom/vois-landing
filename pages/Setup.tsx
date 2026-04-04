import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// VOIS LOGO — The 3-pillar icon (SVG version for web)
// ═══════════════════════════════════════════════════════════════════════════

function VoisLogo({ size = 32, color = '#FFF' }: { size?: number; color?: string }) {
  const barW = size * 0.18;
  const barR = barW / 2;
  const gap = size * 0.08;
  const tallH = size * 0.65;
  const shortH = size * 0.45;
  const cx = size / 2;
  const tallY = (size - tallH) / 2;
  const shortY = (size - shortH) / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x={cx - barW * 1.5 - gap} y={shortY} width={barW} height={shortH} rx={barR} fill={color} />
      <rect x={cx - barW / 2} y={tallY} width={barW} height={tallH} rx={barR} fill={color} />
      <rect x={cx + barW * 0.5 + gap} y={shortY} width={barW} height={shortH} rx={barR} fill={color} />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP NAVIGATION — Prev / dots / Next
// ═══════════════════════════════════════════════════════════════════════════

function StepNav({ step, total, onPrev, onNext }: { step: number; total: number; onPrev: () => void; onNext: () => void }) {
  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      <button
        onClick={onPrev}
        disabled={step === 0}
        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={16} />
      </button>
      <div className="flex gap-2">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-5 bg-slate-900' : 'w-2 bg-slate-300'}`} />
        ))}
      </div>
      <button
        onClick={onNext}
        disabled={step === total - 1}
        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WATCH FACE WALKTHROUGH — Manual step-by-step
// ═══════════════════════════════════════════════════════════════════════════

function WatchFaceWalkthrough({ step }: { step: number }) {
  const isCompMode = step >= 2;

  const renderTargetSlot = () => {
    if (step === 3) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-[38px] h-[38px] rounded-full bg-[#1C1C1E] flex items-center justify-center border-2 border-[#34C759]"
        >
          <VoisLogo size={24} color="#FFF" />
        </motion.div>
      );
    }
    if (step === 2) {
      return (
        <motion.div
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-[38px] h-[38px] rounded-full bg-[#1C1C1E] flex items-center justify-center border-2 border-[#FF9F0A]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="#FF9F0A" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.div>
      );
    }
    return (
      <div className="w-[38px] h-[38px] rounded-full bg-[#1C1C1E] flex items-center justify-center" style={step === 0 ? { opacity: 0.5 } : undefined}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF453A" strokeWidth="2" strokeLinecap="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>
    );
  };

  const renderFace = (small?: boolean) => {
    const timeSize = small ? 'text-[32px]' : 'text-[56px]';
    const timeLh = small ? 'leading-[34px]' : 'leading-[60px]';
    const dateDaySize = small ? 'text-[7px]' : 'text-[9px]';
    const dateNumSize = small ? 'text-[11px]' : 'text-[15px]';
    const sz = small ? 'w-[28px] h-[28px]' : 'w-[38px] h-[38px]';
    const iconSz = small ? 11 : 16;

    return (
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="flex justify-between w-full">
          <div className={`${sz} rounded-full bg-[#1C1C1E] flex items-center justify-center ${isCompMode ? 'border-[1.5px] border-[#48484A]' : ''}`}>
            <svg width={iconSz} height={iconSz} viewBox="0 0 24 24" fill="none" stroke="#E5E5EA" strokeWidth="2" strokeLinecap="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <div className={`${sz} rounded-full bg-[#1C1C1E] flex flex-col items-center justify-center ${isCompMode ? 'border-[1.5px] border-[#48484A]' : ''}`}>
            <span className={`${dateDaySize} font-semibold text-[#FF453A] tracking-wider`}>TUE</span>
            <span className={`${dateNumSize} font-bold text-white -mt-0.5`}>10</span>
          </div>
          <div className={`${sz} rounded-full bg-[#1C1C1E] flex items-center justify-center ${isCompMode ? 'border-[1.5px] border-[#48484A]' : ''}`}>
            <svg width={iconSz} height={iconSz} viewBox="0 0 16 16" fill="#E5E5EA">
              <circle cx="3" cy="3" r="1.5" /><circle cx="8" cy="3" r="1.5" /><circle cx="13" cy="3" r="1.5" />
              <circle cx="3" cy="8" r="1.5" /><circle cx="8" cy="8" r="1.5" /><circle cx="13" cy="8" r="1.5" />
              <circle cx="3" cy="13" r="1.5" /><circle cx="8" cy="13" r="1.5" /><circle cx="13" cy="13" r="1.5" />
            </svg>
          </div>
        </div>

        <span className={`${timeSize} font-light text-white text-center tracking-[2px] ${timeLh} ${step === 0 ? 'opacity-30' : ''}`}>
          10:09
        </span>

        <div className="flex justify-between w-full">
          {small ? (
            <div className={`${sz} rounded-full bg-[#1C1C1E] flex items-center justify-center ${step === 3 ? 'border-2 border-[#34C759]' : isCompMode ? 'border-[1.5px] border-[#48484A]' : ''}`}>
              {step === 3 ? <VoisLogo size={16} color="#FFF" /> : (
                <svg width={iconSz} height={iconSz} viewBox="0 0 24 24" fill="none" stroke="#FF453A" strokeWidth="2" strokeLinecap="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              )}
            </div>
          ) : renderTargetSlot()}
          <div className={`${sz} rounded-full bg-[#1C1C1E] flex items-center justify-center ${isCompMode ? 'border-[1.5px] border-[#48484A]' : ''}`}>
            <svg width={iconSz} height={iconSz} viewBox="0 0 24 24" fill="none" stroke="#FF453A" strokeWidth="2" strokeLinecap="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <div className={`${sz} rounded-full bg-[#1C1C1E] flex items-center justify-center ${isCompMode ? 'border-[1.5px] border-[#48484A]' : ''}`}>
            <svg width={iconSz} height={iconSz} viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="5" r="3" /><path d="M6 20v-2a4 4 0 0 1 2-3.5l1-1.5 3 3 3-3 1 1.5a4 4 0 0 1 2 3.5v2" />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <AnimatePresence>
        {isCompMode && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-[13px] font-extrabold text-slate-900 tracking-wider mb-2"
          >
            COMPLICATIONS
          </motion.p>
        )}
      </AnimatePresence>
      {!isCompMode && <div className="h-5" />}

      <div className="relative w-[180px] h-[220px]">
        <div className="absolute -right-[7px] top-[28%] w-2 h-[30px] rounded-[3px] bg-[#3A3A3C]" />
        <div className="absolute -right-[6px] top-[50%] w-[6px] h-4 rounded-sm bg-[#3A3A3C]" />
        <div className="w-full h-full bg-black rounded-[46px] border-[3px] border-[#3A3A3C] overflow-hidden">
          <div className="flex-1 h-full px-4 pt-4 pb-3 flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col relative">
                  {renderFace()}
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center rounded-[40px]">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                      <circle cx="12" cy="14" r="1.5" fill="rgba(255,255,255,0.7)" stroke="none" />
                      <circle cx="12" cy="17.5" r="1" fill="rgba(255,255,255,0.5)" stroke="none" />
                      <circle cx="12" cy="20.5" r="0.6" fill="rgba(255,255,255,0.3)" stroke="none" />
                    </svg>
                  </div>
                </motion.div>
              )}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-between py-1">
                  <p className="text-[12px] font-semibold text-[#E5E5EA] text-center">Modular Ultra</p>
                  <div className="w-[80%] scale-75 origin-center">
                    {renderFace(true)}
                  </div>
                  <div className="bg-[#3A3A3C] rounded-full py-1.5 px-6">
                    <span className="text-[13px] font-semibold text-white">Edit</span>
                  </div>
                </motion.div>
              )}
              {isCompMode && (
                <motion.div key="step23" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
                  {renderFace()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WATCH APP INSTALL MOCKUP
// ═══════════════════════════════════════════════════════════════════════════

function WatchAppMockup({ availableAppsLabel, installButton }: { availableAppsLabel: string; installButton: string }) {
  return (
    <div className="bg-black rounded-2xl p-4 overflow-hidden">
      <div className="opacity-20 space-y-3.5 mb-3.5">
        {[55, 50, 40].map((w, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="w-[26px] h-[26px] rounded-md bg-[#3A3A3C]" />
            <div className="h-2.5 rounded bg-[#3A3A3C]" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>

      <div className="h-px bg-[#38383A] mb-2.5" />

      <p className="text-[13px] font-semibold text-[#FF9F0A] uppercase tracking-wider mb-2.5">{availableAppsLabel}</p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-3 bg-[#1C1C1E] rounded-[10px] py-2.5 px-3 border border-[#FF9F0A]"
      >
        <div className="w-[34px] h-[34px] rounded-lg bg-[#1A1A1A] flex items-center justify-center">
          <VoisLogo size={22} color="#FFF" />
        </div>
        <span className="flex-1 text-[16px] font-semibold text-white">VOIS</span>
        <span className="text-[13px] font-bold text-[#FF9F0A] border border-[#FF9F0A] rounded-full py-1 px-3.5 tracking-wide">
          {installButton}
        </span>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LOCK SCREEN WALKTHROUGH — Manual step-by-step
// ═══════════════════════════════════════════════════════════════════════════

function LockScreenWalkthrough({ step }: { step: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[170px] h-[340px] bg-black rounded-[28px] border-2 border-[#3A3A3C] overflow-hidden">
        {/* Dynamic Island */}
        <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[60px] h-[18px] rounded-[10px] bg-[#1C1C1E] z-20" />

        {/* Bottom icons — always visible on every step */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-between px-5 z-30">
          <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
            </svg>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0: Long-press */}
          {step === 0 && (
            <motion.div key="ls0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full relative">
              <div className="h-full flex flex-col items-center pt-10 pb-14">
                <span className="text-[10px] font-medium text-[#E5E5EA] tracking-wide">Monday, February 10</span>
                <span className="text-[48px] font-extralight text-white tracking-[2px] leading-[52px] mt-1">9:41</span>
              </div>
              <div className="absolute inset-0 bg-black/35 flex items-center justify-center z-10">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <circle cx="12" cy="14" r="1.5" fill="rgba(255,255,255,0.7)" stroke="none" />
                  <circle cx="12" cy="17.5" r="1" fill="rgba(255,255,255,0.5)" stroke="none" />
                  <circle cx="12" cy="20.5" r="0.6" fill="rgba(255,255,255,0.3)" stroke="none" />
                </svg>
              </div>
            </motion.div>
          )}

          {/* Step 1: Customize */}
          {step === 1 && (
            <motion.div key="ls1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center">
              <div className="flex-1 flex items-center justify-center">
                <div className="w-[110px] h-[180px] bg-black rounded-2xl overflow-hidden border border-[#3A3A3C]">
                  <div className="h-full flex flex-col items-center justify-between pt-6 pb-2">
                    <span className="text-[7px] font-medium text-[#E5E5EA] tracking-wide opacity-60">Monday, February 10</span>
                    <span className="text-[28px] font-extralight text-white tracking-[2px] leading-[30px] opacity-60">9:41</span>
                    <div />
                  </div>
                </div>
              </div>
              <div className="bg-[#3A3A3C] rounded-full py-1.5 px-5 mb-[4.5rem]">
                <span className="text-[12px] font-semibold text-white">Customize</span>
              </div>
            </motion.div>
          )}

          {/* Step 2: Add Widgets */}
          {step === 2 && (
            <motion.div key="ls2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center pt-10 pb-14">
              <span className="text-[10px] font-medium text-[#E5E5EA] tracking-wide">Monday, February 10</span>
              <span className="text-[48px] font-extralight text-white tracking-[2px] leading-[52px] mt-1">9:41</span>

              <div className="flex-1" />

              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="flex items-center gap-1 border-[1.5px] border-dashed border-[#FF9F0A] rounded-[10px] py-2 px-3.5"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2v10M2 7h10" stroke="#FF9F0A" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="text-[9px] font-bold text-[#FF9F0A] tracking-wider">ADD WIDGETS</span>
              </motion.div>
            </motion.div>
          )}

          {/* Step 3: VOIS placed */}
          {step === 3 && (
            <motion.div key="ls3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center pt-10 pb-14">
              <span className="text-[10px] font-medium text-[#E5E5EA] tracking-wide">Monday, February 10</span>
              <span className="text-[48px] font-extralight text-white tracking-[2px] leading-[52px] mt-1">9:41</span>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-center mt-4"
              >
                <div className="w-9 h-9 rounded-full bg-[#1C1C1E] border-[1.5px] border-[#34C759] flex items-center justify-center">
                  <VoisLogo size={22} color="#FFF" />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SETUP PAGE — Main component
// ═══════════════════════════════════════════════════════════════════════════

const Setup = () => {
  const { t } = useTranslation('setup');
  const [watchFaceStep, setWatchFaceStep] = useState(0);
  const [lockScreenStep, setLockScreenStep] = useState(0);

  const watchInstallSteps = t('watch.installSteps', { returnObjects: true }) as Array<{ number: number; text: string }>;
  const watchFaceSteps = t('watch.faceSteps', { returnObjects: true }) as string[];
  const lockScreenSteps = t('lockScreen.steps', { returnObjects: true }) as string[];

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 60%, #FAFCFF 70%, #FFE8F0 80%, #FFF4E8 90%, #F0E8FF 100%)' }}
    >
      {/* Floating nav */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4" style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}>
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Link
            to="/"
            className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors flex-shrink-0 shadow-sm"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-2.5 bg-white/80 backdrop-blur-sm rounded-full pl-1.5 pr-4 py-1.5 border border-slate-100 shadow-sm">
            <img src="/Logo/vois-logo.svg" alt={t('nav.logoAlt')} className="h-6 w-6" />
            <span className="font-semibold text-sm text-slate-900">{t('nav.title')}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl md:text-4xl font-serif text-slate-900 mb-4">
            {t('hero.heading')}
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            {t('hero.description')}
          </p>
        </motion.div>

        {/* ─── APPLE WATCH SECTION ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-serif text-slate-900 mb-8">{t('watch.sectionHeading')}</h2>

          {/* Step 1: Install */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-100 p-6 md:p-10 mb-6">
            <h3 className="text-xl font-serif text-slate-900 mb-6">
              {t('watch.step1.heading')}
            </h3>
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="space-y-0">
                {watchInstallSteps.map((s, i) => (
                  <div key={i} className={`flex items-start gap-4 py-4 ${i < watchInstallSteps.length - 1 ? 'border-b border-slate-200' : ''}`}>
                    <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-white" style={{ transform: 'scaleY(1.8)', display: 'inline-block' }}>{s.number}</span>
                    </div>
                    <p className="text-[15px] font-medium text-slate-900">{s.text}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                <div className="w-full max-w-[280px]">
                  <WatchAppMockup
                    availableAppsLabel={t('watch.availableAppsLabel')}
                    installButton={t('watch.installButton')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Add to watch face */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-100 p-6 md:p-10">
            <h3 className="text-xl font-serif text-slate-900 mb-6">
              {t('watch.step2.heading')}
            </h3>
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="space-y-0">
                {watchFaceSteps.map((text, i) => (
                  <button
                    key={i}
                    onClick={() => setWatchFaceStep(i)}
                    className={`flex items-start gap-4 py-4 w-full text-left transition-colors ${i < watchFaceSteps.length - 1 ? 'border-b border-slate-200' : ''} ${watchFaceStep === i ? '' : 'opacity-40'}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${watchFaceStep === i ? 'bg-slate-900' : 'bg-slate-300'}`}>
                      <span className="text-sm font-bold text-white" style={{ transform: 'scaleY(1.8)', display: 'inline-block' }}>{i + 1}</span>
                    </div>
                    <p className="text-[15px] font-medium text-slate-900">{text}</p>
                  </button>
                ))}
              </div>
              <div className="flex flex-col items-center">
                <WatchFaceWalkthrough step={watchFaceStep} />
                <StepNav
                  step={watchFaceStep}
                  total={watchFaceSteps.length}
                  onPrev={() => setWatchFaceStep((s) => Math.max(0, s - 1))}
                  onNext={() => setWatchFaceStep((s) => Math.min(watchFaceSteps.length - 1, s + 1))}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── LOCK SCREEN SECTION ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="text-2xl font-serif text-slate-900 mb-8">{t('lockScreen.sectionHeading')}</h2>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-100 p-6 md:p-10">
            <h3 className="text-xl font-serif text-slate-900 mb-6">
              {t('lockScreen.step.heading')}
            </h3>
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="space-y-0">
                {lockScreenSteps.map((text, i) => (
                  <button
                    key={i}
                    onClick={() => setLockScreenStep(i)}
                    className={`flex items-start gap-4 py-4 w-full text-left transition-colors ${i < lockScreenSteps.length - 1 ? 'border-b border-slate-200' : ''} ${lockScreenStep === i ? '' : 'opacity-40'}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${lockScreenStep === i ? 'bg-slate-900' : 'bg-slate-300'}`}>
                      <span className="text-sm font-bold text-white" style={{ transform: 'scaleY(1.8)', display: 'inline-block' }}>{i + 1}</span>
                    </div>
                    <p className="text-[15px] font-medium text-slate-900">{text}</p>
                  </button>
                ))}
              </div>
              <div className="flex flex-col items-center">
                <LockScreenWalkthrough step={lockScreenStep} />
                <StepNav
                  step={lockScreenStep}
                  total={lockScreenSteps.length}
                  onPrev={() => setLockScreenStep((s) => Math.max(0, s - 1))}
                  onNext={() => setLockScreenStep((s) => Math.min(lockScreenSteps.length - 1, s + 1))}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Setup;
