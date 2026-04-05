import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { videoScenarios, getVideoScenario, type VideoScenarioItem } from '../lib/videoSyncTimeline';

// ─── Label-based color scheme ────────────────────────────────────────────────

function getLabelColor(label: string): string {
  const map: Record<string, string> = {
    Calendar: '#3B82F6',
    Note:     '#CA8A04',
    Task:     '#22C55E',
    Email:    '#8B5CF6',
    Idea:     '#EAB308',
    Insight:  '#EAB308',
    Shopping: '#7C3AED',
  };
  return map[label] ?? '#6366F1';
}

function getLabelCardBg(label: string): string {
  const map: Record<string, string> = {
    Calendar: 'rgba(37, 99, 235, 0.06)',
    Note:     'rgba(202, 138, 4, 0.06)',
    Task:     'rgba(22, 163, 74, 0.06)',
    Email:    'rgba(124, 58, 237, 0.06)',
    Idea:     'rgba(202, 138, 4, 0.06)',
    Insight:  'rgba(202, 138, 4, 0.06)',
    Shopping: 'rgba(124, 58, 237, 0.06)',
  };
  return map[label] ?? 'rgba(100, 100, 100, 0.04)';
}

// Card type label (uppercase top-left) — use item.label directly
function getCardTypeLabel(item: VideoScenarioItem): string {
  return item.label.toUpperCase();
}

// Life vs work badge
function getLifeWorkBadge(item: VideoScenarioItem): { label: string; color: string } {
  const workCategories = ['work', 'messages', 'finance', 'ideas'];
  if (workCategories.includes(item.category)) {
    return { label: 'WORK', color: '#6366F1' };
  }
  // Some events are work-related
  if (item.category === 'events') {
    const workEvents = ['Cancel 3pm with David', 'Client presentation → Thursday AM', 'Set up 1:1 this week'];
    if (workEvents.includes(item.content)) {
      return { label: 'WORK', color: '#6366F1' };
    }
  }
  return { label: 'PERSONAL', color: '#10B981' };
}

// Generate contextual subtitle for each card
function getSubtitle(item: VideoScenarioItem): string {
  const map: Record<string, Record<string, string>> = {
    'Cancel 3pm with David': { sub: 'Cancel and notify David.' },
    'Client presentation → Thursday AM': { sub: 'Reschedule to Thursday morning.' },
    'Call accountant re: tax return': { sub: 'Before Friday deadline.' },
    'Pitch went well — want Q3 numbers': { sub: 'Save key takeaways from meeting.' },
    'Send Q3 numbers by Thursday': { sub: 'High priority. Due this week.' },
    'Follow-up: revenue deck by Wednesday': { sub: 'Send updated deck to the team.' },
    'Optimize for clarity, not productivity': { sub: 'Insight from podcast episode.' },
    'Position as platform, not tool': { sub: 'Reframe positioning strategy.' },
    'Pick up dry cleaning': { sub: 'Tomorrow morning errand.' },
    'Kids soccer at 3pm': { sub: "Don't forget the kids' game." },
    'Reply to landlord email': { sub: 'Outstanding since last week.' },
    "Dinner Saturday — Henrik's parents": { sub: 'Plan menu and prep.' },
    'Lamb, rosemary, red wine': { sub: 'For Saturday dinner.' },
    'Jonas ready to lead': { sub: 'Note for team planning.' },
    'Give Sarah feedback on presentations': { sub: 'Honest, constructive feedback needed.' },
    'Set up 1:1 this week': { sub: 'Schedule before end of week.' },
  };
  return map[item.content]?.sub ?? '';
}

// Extra detail line (time, date, etc.)
function getDetailLine(item: VideoScenarioItem): string | null {
  if (item.category === 'events') {
    const details: Record<string, string> = {
      'Cancel 3pm with David': '📅 TODAY  ·  🕐 3:00 PM',
      'Client presentation → Thursday AM': '📅 THURSDAY  ·  🕐 9:00 AM  ·  ⏱ 1 hr',
      'Kids soccer at 3pm': '📅 TOMORROW  ·  🕐 3:00 PM  ·  ⏱ 1 hr',
      "Dinner Saturday — Henrik's parents": '📅 SATURDAY  ·  🕐 6:00 PM',
      'Set up 1:1 this week': '📅 THIS WEEK',
    };
    return details[item.content] ?? null;
  }
  return null;
}

// Button color for + Add (uses label)
function getAddButtonColor(label: string): string {
  return getLabelColor(label);
}

// ─── Single Action Card ─────────────────────────────────────────────────────

interface CardData {
  item: VideoScenarioItem;
  scenarioId: number;
  revealedChars: number;
  index: number;
}

function ActionCard({ item, revealedChars }: { item: VideoScenarioItem; revealedChars: number }) {
  const color = getLabelColor(item.label);
  const badge = getLifeWorkBadge(item);
  const subtitle = getSubtitle(item);
  const detailLine = getDetailLine(item);
  const revealed = item.content.slice(0, revealedChars);
  const cursor = revealedChars < item.content.length;
  const done = revealedChars >= item.content.length;
  const addColor = getAddButtonColor(item.label);

  return (
    <div
      style={{
        background: getLabelCardBg(item.label),
        borderRadius: 18,
        padding: '16px 18px',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 4px 20px rgba(0,0,0,0.04)',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header: type label + badge */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: color,
            letterSpacing: '0.08em',
          }}
        >
          {getCardTypeLabel(item)}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: badge.color,
              background: `${badge.color}12`,
              border: `1px solid ${badge.color}25`,
              padding: '3px 8px',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: badge.color, display: 'inline-block' }} />
            {badge.label}
          </span>
          <span style={{ color: '#ccc', fontSize: 14, cursor: 'pointer' }}>×</span>
        </div>
      </motion.div>

      {/* Title with icon + typewriter */}
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#1a1a1a',
          lineHeight: 1.3,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          marginBottom: subtitle ? 4 : 0,
        }}
      >
        <span style={{ marginRight: 6 }}>{item.icon}</span>
        {revealed}
        {cursor && (
          <span
            style={{
              display: 'inline-block',
              width: 2,
              height: 16,
              background: color,
              marginLeft: 2,
              verticalAlign: 'text-bottom',
              animation: 'mobilecardBlink 0.8s step-end infinite',
            }}
          />
        )}
      </div>

      {/* Subtitle — slides in after typing */}
      <AnimatePresence>
        {done && subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ fontSize: 13, color: '#666', lineHeight: 1.4, marginBottom: detailLine ? 8 : 0, marginTop: 2 }}
          >
            {subtitle}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Detail line — slides in after subtitle */}
      <AnimatePresence>
        {done && detailLine && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15, ease: 'easeOut' }}
            style={{ fontSize: 11, color: '#888', fontWeight: 500, letterSpacing: '0.02em', marginBottom: 0 }}
          >
            {detailLine}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Action buttons — slide up after details */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: detailLine ? 0.3 : 0.15, ease: 'easeOut' }}
            style={{ display: 'flex', gap: 8, marginTop: 14 }}
          >
            <button
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#EF4444',
                background: 'rgba(239,68,68,0.08)',
                border: 'none',
                borderRadius: 10,
                padding: '7px 14px',
                cursor: 'pointer',
              }}
            >
              × Dismiss
            </button>
            <button
              style={{
                flex: 1,
                fontSize: 12,
                fontWeight: 600,
                color: '#fff',
                background: addColor,
                border: 'none',
                borderRadius: 10,
                padding: '7px 14px',
                cursor: 'pointer',
              }}
            >
              + Add
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

interface MobileVideoCardsProps {
  onClose: () => void;
}

export const MobileVideoCards: React.FC<MobileVideoCardsProps> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef(0);
  const [cards, setCards] = useState<CardData[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const cardTimersRef = useRef<Map<string, { startTime: number }>>(new Map());
  const shownItemsRef = useRef<Set<string>>(new Set());
  const globalIndexRef = useRef(0);

  const tick = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.paused) return;

    const t = video.currentTime;
    const scenario = getVideoScenario(t);

    if (scenario) {
      const progress = Math.min(1, (t - scenario.startTime) / (scenario.endTime - scenario.startTime));

      scenario.items.forEach((item, idx) => {
        const key = `${scenario.id}-${idx}`;
        const itemThreshold = (idx + 0.3) / scenario.items.length;

        if (progress >= itemThreshold && !shownItemsRef.current.has(key)) {
          shownItemsRef.current.add(key);
          cardTimersRef.current.set(key, { startTime: t });
          const cardIndex = globalIndexRef.current++;
          setCards(prev => [{ item, scenarioId: scenario.id, revealedChars: 0, index: cardIndex }, ...prev]);
        }
      });

      setCards(prev =>
        prev.map(card => {
          const sc = videoScenarios.find(s => s.id === card.scenarioId);
          if (!sc) return card;
          const idx = sc.items.indexOf(card.item);
          const key = `${card.scenarioId}-${idx}`;
          const timer = cardTimersRef.current.get(key);
          if (!timer) return card;

          const elapsed = t - timer.startTime;
          const newChars = Math.min(card.item.content.length, Math.floor(elapsed * 30));
          if (newChars !== card.revealedChars) {
            return { ...card, revealedChars: newChars };
          }
          return card;
        })
      );
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => {
      setIsPlaying(true);
      rafRef.current = requestAnimationFrame(tick);
    };
    const onPause = () => {
      setIsPlaying(false);
      cancelAnimationFrame(rafRef.current);
    };
    const onEnded = () => {
      setIsPlaying(false);
      cancelAnimationFrame(rafRef.current);
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      cancelAnimationFrame(rafRef.current);
    };
  }, [tick]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.play().catch(() => {});
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: '#EFEFF4',
      }}
    >
      <style>{`
        @keyframes mobilecardBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes idleFloat0 { 0%, 100% { transform: rotate(-0.3deg) translateY(0px); } 50% { transform: rotate(0.2deg) translateY(-1px); } }
        @keyframes idleFloat1 { 0%, 100% { transform: rotate(0.3deg) translateY(0px); } 50% { transform: rotate(-0.2deg) translateY(-1.2px); } }
        @keyframes idleFloat2 { 0%, 100% { transform: rotate(-0.15deg) translateY(-0.5px); } 50% { transform: rotate(0.25deg) translateY(0.5px); } }
        @keyframes idleFloat3 { 0%, 100% { transform: rotate(0.2deg) translateY(0.5px); } 50% { transform: rotate(-0.3deg) translateY(-0.8px); } }
        @keyframes idleFloat4 { 0%, 100% { transform: rotate(-0.4deg) translateY(0px); } 50% { transform: rotate(0.15deg) translateY(-0.5px); } }
      `}</style>

      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[60] w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white"
        style={{ marginTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <X size={18} />
      </button>

      {/* Video — rounded window, 4:5 ratio */}
      <div className="px-3 pt-3">
        <div
          className="w-full relative overflow-hidden rounded-2xl"
          style={{ aspectRatio: '16 / 10', background: '#000' }}
        >
          <video
            ref={videoRef}
            src="/videos/Situations.mp4"
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Action cards feed */}
      <div className="px-3 pt-3 pb-8">
        <AnimatePresence>
          {cards.length === 0 && isPlaying && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="text-center text-slate-400 text-sm py-6"
            >
              Listening...
            </motion.p>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {cards.map((card) => {
              const floatAnim = `idleFloat${card.index % 5} ${3 + (card.index % 3) * 0.5}s ease-in-out infinite`;

              return (
                <motion.div
                  key={`${card.scenarioId}-${card.item.content}`}
                  initial={{ opacity: 0, y: -40, scale: 0.92 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      type: 'spring',
                      stiffness: 260,
                      damping: 22,
                      mass: 0.9,
                    },
                  }}
                  layout
                  style={{ animation: floatAnim }}
                >
                  <ActionCard
                    item={card.item}
                    revealedChars={card.revealedChars}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
