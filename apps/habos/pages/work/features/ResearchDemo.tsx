import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Search, Headphones, FileText, Globe } from 'lucide-react';

const query = 'competitor pricing strategy';

const results = [
  { source: 'Meeting', sourceColor: '#6366f1', icon: Headphones, title: 'Board Review — Jan 15', snippet: '"...their new enterprise tier is $45/seat, which undercuts us by 20%..."', relevance: 96 },
  { source: 'Document', sourceColor: '#10b981', icon: FileText, title: 'Competitive Analysis Q4.pdf', snippet: 'Pricing comparison table shows 3 competitors dropped prices in Q4...', relevance: 88 },
  { source: 'Web', sourceColor: '#f59e0b', icon: Globe, title: 'TechCrunch — Competitor raises Series C', snippet: 'Company X announced aggressive pricing plans alongside $50M raise...', relevance: 72 },
  { source: 'Voice Note', sourceColor: '#ec4899', icon: Headphones, title: 'Voice memo — Feb 12', snippet: '"Need to rethink our pricing before the March launch..."', relevance: 65 },
];

const ResearchDemo: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.4 });
  const [phase, setPhase] = useState(0);
  const [typed, setTyped] = useState('');
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (!isInView) { setPhase(0); setTyped(''); return; }
    const t: ReturnType<typeof setTimeout>[] = [];
    // Type query
    for (let i = 0; i <= query.length; i++) {
      t.push(setTimeout(() => setTyped(query.slice(0, i)), 200 + i * 45));
    }
    t.push(setTimeout(() => setPhase(1), 200 + query.length * 45 + 300));
    t.push(setTimeout(() => setPhase(2), 200 + query.length * 45 + 800));
    t.push(setTimeout(() => setPhase(3), 200 + query.length * 45 + 1600));
    t.push(setTimeout(() => { setPhase(0); setTyped(''); setCycle(c => c + 1); }, 200 + query.length * 45 + 5500));
    return () => t.forEach(clearTimeout);
  }, [isInView, cycle]);

  return (
    <div ref={ref} className="p-5 md:p-7 min-h-[340px]">
      {/* Search bar */}
      <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3.5 py-2.5 border border-slate-200 mb-4">
        <Search size={14} className="text-slate-400 flex-shrink-0" />
        <span className="text-[12px] text-slate-700 flex-1">
          {typed}
          {typed.length < query.length && (
            <motion.span
              className="inline-block w-0.5 h-3.5 bg-slate-400 ml-0.5 align-middle"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
        </span>
      </div>

      {/* Loading shimmer */}
      {phase === 1 && (
        <div className="space-y-2">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="h-12 rounded-lg bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 bg-[length:200%_100%]"
              animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            />
          ))}
        </div>
      )}

      {/* Results */}
      {phase >= 2 && (
        <div className="space-y-2">
          {results.map((result, i) => (
            <motion.div
              key={result.title}
              className={`rounded-xl p-3 border ${i === 0 && phase >= 3 ? 'border-indigo-200 bg-indigo-50/50 shadow-sm' : 'border-slate-100 bg-slate-50'}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.12 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-4 h-4 rounded flex items-center justify-center"
                  style={{ backgroundColor: result.sourceColor + '15' }}
                >
                  <result.icon size={9} style={{ color: result.sourceColor }} />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: result.sourceColor }}>
                  {result.source}
                </span>
                {i === 0 && phase >= 3 && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[8px] font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-full ml-auto"
                  >
                    Best Match
                  </motion.span>
                )}
                <span className="text-[9px] text-slate-400 ml-auto">{result.relevance}%</span>
              </div>
              <p className="text-[11px] font-medium text-slate-900">{result.title}</p>
              <p className="text-[10px] text-slate-500 leading-snug mt-0.5 line-clamp-1">{result.snippet}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResearchDemo;
