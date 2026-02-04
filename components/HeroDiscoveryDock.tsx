import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, Car, BedDouble, Dumbbell, Plane, ShowerHead,
  Calendar, ListTodo, Lightbulb, BookOpen, Heart, Mic, Brain,
  Coffee, Baby, Briefcase, Train, Bike, Bath, Sofa, Utensils, Moon,
  Sparkles, FileText, MessageSquare, Target, TrendingUp, Wallet, Users, Plus,
  ShoppingCart, Activity
} from 'lucide-react';

export type DiscoveryMode = 'when' | 'how' | 'why' | null;

interface HeroDiscoveryDockProps {
  activeMode: DiscoveryMode;
  onModeChange: (mode: DiscoveryMode) => void;
}

// All "When" moments - 18 total
const allWhenMoments = [
  { icon: ShowerHead, label: 'In the shower', desc: 'Ideas flow freely' },
  { icon: Car, label: 'Driving to work', desc: 'Hands-free capture' },
  { icon: BedDouble, label: 'Sleepless at 3am', desc: 'Brain dump & rest' },
  { icon: Dumbbell, label: 'While running', desc: 'Don\'t break stride' },
  { icon: Plane, label: 'At the airport', desc: 'Travel chaos sorted' },
  { icon: Mic, label: 'Walking the dog', desc: 'Multitask naturally' },
  { icon: Coffee, label: 'Morning coffee', desc: 'Plan your day' },
  { icon: Train, label: 'On the train', desc: 'Commute productively' },
  { icon: Baby, label: 'With the kids', desc: 'Capture moments' },
  { icon: Briefcase, label: 'After meetings', desc: 'Quick follow-ups' },
  { icon: Bike, label: 'Cycling home', desc: 'Clear your head' },
  { icon: Bath, label: 'In the bath', desc: 'Relaxed thinking' },
  { icon: Sofa, label: 'On the couch', desc: 'Evening wind-down' },
  { icon: Utensils, label: 'Cooking dinner', desc: 'Hands are busy' },
  { icon: Moon, label: 'Before sleep', desc: 'Empty your mind' },
  { icon: Users, label: 'At a party', desc: 'Remember names' },
  { icon: Target, label: 'At the gym', desc: 'Track progress' },
  { icon: TrendingUp, label: 'On a walk', desc: 'Think out loud' },
];

// Card component for carousel items
const WhenCard: React.FC<{ item: typeof allWhenMoments[0] }> = ({ item }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100 min-w-[160px] flex-shrink-0">
    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
      <item.icon size={18} className="text-slate-600" strokeWidth={1.5} />
    </div>
    <div className="min-w-0">
      <p className="text-sm font-medium text-slate-800 leading-tight">{item.label}</p>
      <p className="text-xs text-slate-500 leading-tight">{item.desc}</p>
    </div>
  </div>
);

// Smooth carousel row component with feathered edges
const CarouselRow: React.FC<{ 
  items: typeof allWhenMoments; 
  direction: 'left' | 'right';
  duration?: number;
}> = ({ items, direction, duration = 60 }) => {
  // Duplicate items for seamless loop
  const duplicatedItems = [...items, ...items];
  
  return (
    <div 
      className="overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
      }}
    >
      <motion.div
        className="flex gap-3"
        animate={{
          x: direction === 'left' ? [0, -50 * items.length * 3.5] : [-50 * items.length * 3.5, 0]
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: duration,
            ease: 'linear',
          },
        }}
      >
        {duplicatedItems.map((item, i) => (
          <WhenCard key={`${item.label}-${i}`} item={item} />
        ))}
      </motion.div>
    </div>
  );
};

// Smooth scrolling carousel for When
const WhenContent: React.FC = () => {
  // Split items into two rows
  const topRowItems = allWhenMoments.slice(0, 9);
  const bottomRowItems = allWhenMoments.slice(9, 18);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-serif text-slate-900 leading-tight">
          For moments when you can't (or don't want to) type.
        </h2>
        <p className="text-base text-slate-500 leading-relaxed max-w-md">
          Driving, showering, walking, working out, between meetings—capture it instantly, keep moving.
        </p>
      </div>
      <div className="flex flex-col gap-3 max-w-lg">
        {/* Top row - scrolls RIGHT */}
        <CarouselRow items={topRowItems} direction="right" duration={50} />
        
        {/* Bottom row - scrolls LEFT */}
        <CarouselRow items={bottomRowItems} direction="left" duration={50} />
      </div>
    </motion.div>
  );
};

// The "How" content - Method explanation
const HowContent: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-serif text-slate-900 leading-tight">
          One gesture. Zero friction.
        </h2>
        <p className="text-base text-slate-500 leading-relaxed max-w-md">
          No unlocking, no typing. VOIS listens, turns your words into structured items, and shows a card so you can confirm, edit, or undo.
        </p>
      </div>
      
      {/* Visual steps */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-3 text-lg font-medium text-slate-700"
      >
        <span className="px-3 py-1.5 bg-slate-100 rounded-full text-sm">Tap</span>
        <span className="text-slate-300">→</span>
        <span className="px-3 py-1.5 bg-slate-100 rounded-full text-sm">Speak</span>
        <span className="text-slate-300">→</span>
        <span className="px-3 py-1.5 bg-slate-900 text-white rounded-full text-sm">Done</span>
      </motion.div>
    </motion.div>
  );
};

// UNIFIED COLOR SCHEME - each category has its own distinct color
// Blue=Calendar, Green=Tasks, Orange=Errands, Teal=Finance, Yellow=Ideas, Red=Health, Purple=Shopping, Pink=Social
export const allWhyBenefits = [
  // TEAL - Finance
  { icon: Wallet, label: 'Finance', desc: 'tracked', bg: 'bg-[#ecfeff]', iconBg: 'bg-[#22d3ee]/30', color: 'text-[#0891b2]' },
  // RED - Health
  { icon: Heart, label: 'Health', desc: 'logged', bg: 'bg-[#fef2f2]', iconBg: 'bg-[#fca5a5]/30', color: 'text-[#dc2626]' },
  // PINK - Social/Family
  { icon: Users, label: 'Family', desc: 'captured', bg: 'bg-[#fdf2f8]', iconBg: 'bg-[#f9a8d4]/30', color: 'text-[#db2777]' },
  // GREEN - Tasks
  { icon: FileText, label: 'Meeting Notes', desc: 'summarized', bg: 'bg-[#dcfce7]', iconBg: 'bg-[#4ade80]/30', color: 'text-[#16a34a]' },
  // PINK - Messages
  { icon: MessageSquare, label: 'Quotes', desc: 'saved', bg: 'bg-[#fdf2f8]', iconBg: 'bg-[#f9a8d4]/30', color: 'text-[#db2777]' },
  // YELLOW - Ideas
  { icon: Brain, label: 'Research', desc: 'flagged', bg: 'bg-[#fefce8]', iconBg: 'bg-[#fde047]/30', color: 'text-[#ca8a04]' },
  // BLUE - Calendar
  { icon: Calendar, label: 'Calendar', desc: 'auto-filled', bg: 'bg-[#dbeafe]', iconBg: 'bg-[#60a5fa]/30', color: 'text-[#2563eb]' },
  // GREEN - Tasks
  { icon: ListTodo, label: 'Tasks', desc: 'organized', bg: 'bg-[#dcfce7]', iconBg: 'bg-[#4ade80]/30', color: 'text-[#16a34a]' },
  // YELLOW - Ideas
  { icon: Lightbulb, label: 'Ideas', desc: 'searchable', bg: 'bg-[#fefce8]', iconBg: 'bg-[#fde047]/30', color: 'text-[#ca8a04]' },
  // PURPLE - Shopping/Lists
  { icon: BookOpen, label: 'Journal', desc: 'private', bg: 'bg-[#f5f3ff]', iconBg: 'bg-[#c4b5fd]/30', color: 'text-[#7c3aed]' },
  // GREEN - Tasks
  { icon: Briefcase, label: 'Projects', desc: 'managed', bg: 'bg-[#dcfce7]', iconBg: 'bg-[#4ade80]/30', color: 'text-[#16a34a]' },
  // ORANGE - Errands/Goals
  { icon: Target, label: 'Goals', desc: 'tracked', bg: 'bg-[#fff7ed]', iconBg: 'bg-[#fdba74]/30', color: 'text-[#ea580c]' },
  // ORANGE - Errands/Habits
  { icon: TrendingUp, label: 'Habits', desc: 'streaked', bg: 'bg-[#fff7ed]', iconBg: 'bg-[#fdba74]/30', color: 'text-[#ea580c]' },
  // YELLOW - Ideas
  { icon: Sparkles, label: 'Dreams', desc: 'remembered', bg: 'bg-[#fefce8]', iconBg: 'bg-[#fde047]/30', color: 'text-[#ca8a04]' },
  // PURPLE - Shopping
  { icon: Utensils, label: 'Meals', desc: 'planned', bg: 'bg-[#f5f3ff]', iconBg: 'bg-[#c4b5fd]/30', color: 'text-[#7c3aed]' },
  // RED - Health
  { icon: Moon, label: 'Sleep', desc: 'logged', bg: 'bg-[#fef2f2]', iconBg: 'bg-[#fca5a5]/30', color: 'text-[#dc2626]' },
  // YELLOW - Ideas
  { icon: Coffee, label: 'Gratitude', desc: 'daily', bg: 'bg-[#fefce8]', iconBg: 'bg-[#fde047]/30', color: 'text-[#ca8a04]' },
  // PURPLE - Shopping
  { icon: ShoppingCart, label: 'Shopping', desc: 'listed', bg: 'bg-[#f5f3ff]', iconBg: 'bg-[#c4b5fd]/30', color: 'text-[#7c3aed]' },
  // RED - Health
  { icon: Activity, label: 'Tracking', desc: 'automated', bg: 'bg-[#fef2f2]', iconBg: 'bg-[#fca5a5]/30', color: 'text-[#dc2626]' },
  // PINK - Social
  { icon: Baby, label: 'Memories', desc: 'captured', bg: 'bg-[#fdf2f8]', iconBg: 'bg-[#f9a8d4]/30', color: 'text-[#db2777]' },
];

// Card component for colored carousel items
const WhyCard: React.FC<{ item: typeof allWhyBenefits[0] }> = ({ item }) => (
  <div className={`flex items-center gap-3 p-3 rounded-xl ${item.bg} border border-white/50 min-w-[160px] flex-shrink-0`}>
    <div className={`w-9 h-9 rounded-lg ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
      <item.icon size={18} className={item.color} strokeWidth={1.5} />
    </div>
    <div className="min-w-0">
      <p className={`text-sm font-medium ${item.color} leading-tight`}>{item.label}</p>
      <p className="text-xs text-slate-500 leading-tight">{item.desc}</p>
    </div>
  </div>
);

// Smooth colored carousel row component with feathered edges
const WhyCarouselRow: React.FC<{ 
  items: typeof allWhyBenefits; 
  direction: 'left' | 'right';
  duration?: number;
}> = ({ items, direction, duration = 60 }) => {
  // Duplicate items for seamless loop
  const duplicatedItems = [...items, ...items];
  
  return (
    <div 
      className="overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
      }}
    >
      <motion.div
        className="flex gap-3"
        animate={{
          x: direction === 'left' ? [0, -50 * items.length * 3.5] : [-50 * items.length * 3.5, 0]
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: duration,
            ease: 'linear',
          },
        }}
      >
        {duplicatedItems.map((item, i) => (
          <WhyCard key={`${item.label}-${i}`} item={item} />
        ))}
      </motion.div>
    </div>
  );
};

// Smooth scrolling carousel for Why (with "Build your own" at bottom)
const WhyContent: React.FC = () => {
  // Split items into two rows
  const topRowItems = allWhyBenefits.slice(0, 10);
  const bottomRowItems = allWhyBenefits.slice(10, 20);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-serif text-slate-900 leading-tight">
          One habit powers everything.
        </h2>
        <p className="text-base text-slate-500 leading-relaxed max-w-md">
          Tasks, calendar, notes, lists, people, projects—and custom spaces you can create anytime.
        </p>
      </div>
      
      <div className="flex flex-col gap-3 max-w-lg">
        {/* Top row - scrolls RIGHT */}
        <WhyCarouselRow items={topRowItems} direction="right" duration={50} />
        
        {/* Bottom row - scrolls LEFT */}
        <WhyCarouselRow items={bottomRowItems} direction="left" duration={50} />

        {/* Build your own - static at bottom, rainbow gradient */}
        <div className="flex justify-center mt-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="relative flex items-center gap-3 p-3 rounded-xl cursor-pointer min-w-[160px] overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 15%, #48dbfb 35%, #ff9ff3 55%, #54a0ff 75%, #5f27cd 90%, #ff6b6b 100%)',
              backgroundSize: '200% 200%',
              animation: 'rainbowShift 8s ease infinite',
            }}
          >
            {/* Subtle inner glow overlay */}
            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors" />
            
            <div className="relative w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Plus size={18} className="text-white drop-shadow-sm" strokeWidth={2} />
            </div>
            <div className="relative min-w-0">
              <p className="text-sm font-medium text-white leading-tight drop-shadow-sm">Build your own</p>
              <p className="text-xs text-white/80 leading-tight">Custom spaces</p>
            </div>
          </motion.div>
        </div>
        
        {/* Keyframes for rainbow animation */}
        <style>{`
          @keyframes rainbowShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      </div>
    </motion.div>
  );
};

// The Dock Pills - smaller, more subtle
const DockPill: React.FC<{
  label: string;
  mode: 'when' | 'how' | 'why';
  isActive: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onToggle: () => void;
}> = ({ label, isActive, onHoverStart, onHoverEnd, onToggle }) => {
  return (
    <motion.button
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onClick={() => {
        // Only toggle on touch devices — hover handles desktop
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
          onToggle();
        }
      }}
      className={`
        px-3 py-1.5 rounded-full border text-[11px] font-medium uppercase tracking-wide
        transition-colors duration-200 whitespace-nowrap cursor-pointer
        ${isActive 
          ? 'bg-slate-900 text-white border-slate-900' 
          : 'bg-white/60 backdrop-blur-sm text-slate-500 border-slate-200 hover:bg-white hover:border-slate-300 hover:text-slate-700'
        }
      `}
      whileTap={{ scale: 0.98 }}
    >
      {label}
    </motion.button>
  );
};

// Main Dock Component - scrolls with page, centered at bottom of hero
export const HeroDiscoveryDock: React.FC<HeroDiscoveryDockProps> = ({ activeMode, onModeChange }) => {
  const resetTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Debounced reset - gives time to move between pills without flickering
  const handleHoverEnd = React.useCallback(() => {
    resetTimeoutRef.current = setTimeout(() => {
      onModeChange(null);
    }, 150); // Small delay to allow moving between pills
  }, [onModeChange]);

  // Cancel pending reset when hovering a new pill
  const handleHoverStart = React.useCallback((mode: DiscoveryMode) => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
    onModeChange(mode);
  }, [onModeChange]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-3 z-40 pointer-events-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Pills Row - no outer container */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <DockPill
          label="When"
          mode="when"
          isActive={activeMode === 'when'}
          onHoverStart={() => handleHoverStart('when')}
          onHoverEnd={handleHoverEnd}
          onToggle={() => onModeChange(activeMode === 'when' ? null : 'when')}
        />
        <span className="text-slate-300 text-xs">·</span>
        <DockPill
          label="How"
          mode="how"
          isActive={activeMode === 'how'}
          onHoverStart={() => handleHoverStart('how')}
          onHoverEnd={handleHoverEnd}
          onToggle={() => onModeChange(activeMode === 'how' ? null : 'how')}
        />
        <span className="text-slate-300 text-xs">·</span>
        <DockPill
          label="Why"
          mode="why"
          isActive={activeMode === 'why'}
          onHoverStart={() => handleHoverStart('why')}
          onHoverEnd={handleHoverEnd}
          onToggle={() => onModeChange(activeMode === 'why' ? null : 'why')}
        />
      </div>
      
      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="flex items-center gap-2 text-slate-400"
      >
        <motion.div
          animate={{ y: [0, 3, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <ChevronDown size={14} strokeWidth={1.5} />
        </motion.div>
        <span className="text-[10px] uppercase tracking-wider">Scroll</span>
      </motion.div>
    </motion.div>
  );
};

// Content switcher component for the Hero
export const HeroDiscoveryContent: React.FC<{ activeMode: DiscoveryMode }> = ({ activeMode }) => {
  return (
    <AnimatePresence mode="wait">
      {activeMode === 'when' && <WhenContent key="when" />}
      {activeMode === 'how' && <HowContent key="how" />}
      {activeMode === 'why' && <WhyContent key="why" />}
    </AnimatePresence>
  );
};

export default HeroDiscoveryDock;
