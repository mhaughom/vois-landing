import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mic, Wine, Star, StickyNote, Check } from 'lucide-react';

const appElements = [
  { label: 'Wine Name', value: 'Château Margaux 2018', type: 'text' },
  { label: 'Rating', value: '★★★★☆', type: 'rating' },
  { label: 'Tasting Notes', value: 'Dark cherry, cedar, long finish with silky tannins', type: 'text' },
  { label: 'Price', value: '$85', type: 'text' },
];

const CustomAppsDemo: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.4 });
  const [phase, setPhase] = useState(0);
  const [fieldCount, setFieldCount] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (!isInView) { setPhase(0); setFieldCount(0); return; }
    const t: ReturnType<typeof setTimeout>[] = [];
    t.push(setTimeout(() => setPhase(1), 300));
    t.push(setTimeout(() => setPhase(2), 1500));
    appElements.forEach((_, i) => {
      t.push(setTimeout(() => setFieldCount(i + 1), 2200 + i * 500));
    });
    t.push(setTimeout(() => setPhase(3), 2200 + appElements.length * 500 + 300));
    t.push(setTimeout(() => { setPhase(0); setFieldCount(0); setCycle(c => c + 1); }, 2200 + appElements.length * 500 + 3500));
    return () => t.forEach(clearTimeout);
  }, [isInView, cycle]);

  return (
    <div ref={ref} className="p-5 md:p-7 min-h-[320px] flex flex-col">
      {/* Voice prompt */}
      <motion.div
        className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100"
        animate={{ opacity: phase >= 1 ? 1 : 0.4 }}
      >
        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${phase === 1 ? 'bg-red-100' : 'bg-slate-100'}`}>
          <Mic size={13} className={phase === 1 ? 'text-red-500' : 'text-slate-400'} />
        </div>
        <motion.span
          className="text-[11px] text-slate-600 italic flex-1"
          animate={{ opacity: phase >= 1 ? 1 : 0 }}
        >
          {phase >= 2 ? '"Create a wine tasting tracker..."' : '"I want an app to track wines I taste..."'}
        </motion.span>
      </motion.div>

      {/* Generated app */}
      <motion.div
        className="flex-1 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden"
        animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 12 }}
        transition={{ duration: 0.4 }}
      >
        {/* App header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
            <Wine size={14} className="text-purple-600" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-900 block">Wine Tasting Log</span>
            <span className="text-[9px] text-slate-400">Custom App</span>
          </div>
        </div>

        {/* Fields */}
        <div className="p-3 space-y-2">
          {appElements.map((el, i) => (
            <motion.div
              key={el.label}
              animate={{
                opacity: fieldCount > i ? 1 : 0,
                y: fieldCount > i ? 0 : 8,
              }}
              transition={{ duration: 0.25 }}
            >
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                {el.label}
              </span>
              <div className="bg-white rounded-lg px-2.5 py-1.5 border border-slate-200 text-[11px] text-slate-700">
                {el.type === 'rating' ? (
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star
                        key={s}
                        size={12}
                        className={s <= 4 ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}
                      />
                    ))}
                  </div>
                ) : (
                  el.value
                )}
              </div>
            </motion.div>
          ))}

          {/* Save button */}
          <motion.div
            className="flex items-center justify-center gap-1.5 bg-purple-600 text-white rounded-lg py-2 mt-2"
            animate={{ opacity: phase >= 3 ? 1 : 0, y: phase >= 3 ? 0 : 6 }}
            transition={{ duration: 0.3 }}
          >
            <Check size={12} />
            <span className="text-[11px] font-semibold">Save Entry</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomAppsDemo;
