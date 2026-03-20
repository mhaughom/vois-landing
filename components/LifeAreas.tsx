import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ListTodo, Sparkle, BookOpen, Users, Lightbulb, Rocket, Brain, Briefcase, Heart } from 'lucide-react';

const categories = [
  {
    title: 'Personal',
    icon: Heart,
    // green
    bg: 'linear-gradient(135deg, rgba(5,150,105,0.12) 0%, rgba(52,211,153,0.06) 50%, rgba(5,150,105,0.10) 100%)',
    hoverBg: 'linear-gradient(135deg, rgba(5,150,105,0.20) 0%, rgba(52,211,153,0.12) 50%, rgba(5,150,105,0.16) 100%)',
    border: 'rgba(5,150,105,0.16)',
    hoverBorder: 'rgba(5,150,105,0.28)',
    glow: 'rgba(5,150,105,0.08)',
    shine: 'rgba(110,231,183,0.40)',
    items: [
      { icon: BookOpen, label: 'Diary', desc: 'private',
        color: 'rgba(219,39,119,0.60)' },
      { icon: Users, label: 'People', desc: 'connected',
        color: 'rgba(185,28,28,0.60)' },
      { icon: Brain, label: 'Wisdom', desc: 'remembered',
        color: 'rgba(180,83,9,0.60)' },
      { icon: Lightbulb, label: 'Inspiration', desc: 'always there',
        color: 'rgba(6,182,212,0.60)' },
    ],
  },
  {
    title: 'Work',
    icon: Briefcase,
    // cool blue
    bg: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(96,165,250,0.06) 50%, rgba(37,99,235,0.10) 100%)',
    hoverBg: 'linear-gradient(135deg, rgba(37,99,235,0.20) 0%, rgba(96,165,250,0.12) 50%, rgba(37,99,235,0.16) 100%)',
    border: 'rgba(37,99,235,0.16)',
    hoverBorder: 'rgba(37,99,235,0.28)',
    glow: 'rgba(37,99,235,0.08)',
    shine: 'rgba(147,197,253,0.40)',
    items: [
      { icon: Calendar, label: 'Calendar', desc: 'auto-filled',
        color: 'rgba(37,99,235,0.60)' },
      { icon: ListTodo, label: 'Tasks', desc: 'organized',
        color: 'rgba(5,150,105,0.60)' },
      { icon: Sparkle, label: 'Ideas', desc: 'searchable',
        color: 'rgba(202,138,4,0.60)' },
      { icon: Rocket, label: 'Business Ideas', desc: 'captured',
        color: 'rgba(100,116,139,0.60)' },
    ],
  },
];

export const LifeAreas: React.FC = () => {
  return (
    <section className="py-24 md:py-32 px-6 md:px-16 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              Your whole life,<br />not just your job.
            </h2>
            <div className="space-y-4 text-lg md:text-xl text-slate-600 leading-relaxed">
              <p>
                Most productivity tools only care about work. But your best ideas don't clock in at 9.
              </p>
              <p>
                Vois organizes everything across <em className="text-slate-900 font-medium">work and personal</em>—projects, health goals, relationships, side hustles—so nothing falls through the cracks.
              </p>
              <p className="text-slate-700 font-medium">
                One place for every area of your life. Automatically sorted, always searchable.
              </p>
            </div>
          </motion.div>

          {/* Right: Two main categories with sub-items */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {categories.map((cat, catIdx) => (
              <div key={cat.title} className="flex flex-col gap-3">
                {/* Main category card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 + catIdx * 0.1 }}
                  className="group relative rounded-2xl p-6 md:p-7 cursor-default
                             backdrop-blur-xl overflow-hidden"
                  style={{
                    background: cat.bg,
                    border: `1px solid ${cat.border}`,
                    boxShadow: `
                      0 2px 8px rgba(0,0,0,0.04),
                      0 8px 24px ${cat.glow},
                      inset 0 1px 1px ${cat.shine},
                      inset 0 -1px 2px rgba(0,0,0,0.03)
                    `,
                    transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = cat.hoverBg;
                    e.currentTarget.style.borderColor = cat.hoverBorder;
                    e.currentTarget.style.boxShadow = `
                      0 4px 12px rgba(0,0,0,0.06),
                      0 16px 40px ${cat.glow},
                      0 0 0 1px ${cat.border},
                      inset 0 1px 2px ${cat.shine},
                      inset 0 -1px 2px rgba(0,0,0,0.04)
                    `;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = cat.bg;
                    e.currentTarget.style.borderColor = cat.border;
                    e.currentTarget.style.boxShadow = `
                      0 2px 8px rgba(0,0,0,0.04),
                      0 8px 24px ${cat.glow},
                      inset 0 1px 1px ${cat.shine},
                      inset 0 -1px 2px rgba(0,0,0,0.03)
                    `;
                  }}
                >
                  {/* Top-edge highlight */}
                  <div
                    className="absolute top-0 left-[10%] right-[10%] h-[1px]"
                    style={{ background: `linear-gradient(90deg, transparent, ${cat.shine}, transparent)` }}
                  />

                  {/* Soft radial glow */}
                  <div
                    className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-300"
                    style={{ background: `radial-gradient(circle, ${cat.shine} 0%, transparent 70%)` }}
                  />

                  <div className="relative z-10">
                    <cat.icon size={28} strokeWidth={1.3} className="text-slate-800 mb-3" />
                    <p className="text-xl font-semibold text-slate-900 tracking-[-0.01em]">
                      {cat.title}
                    </p>
                  </div>
                </motion.div>

                {/* Sub-items */}
                {cat.items.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: 0.2 + catIdx * 0.1 + i * 0.05 }}
                    whileHover={{ y: -2, scale: 1.01 }}
                    className="group relative rounded-xl px-4 py-3 cursor-default
                               backdrop-blur-lg overflow-hidden"
                    style={{
                      background: 'rgba(255,255,255,0.5)',
                      border: '1px solid rgba(0,0,0,0.06)',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.8)',
                      transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.7)';
                      e.currentTarget.style.borderColor = 'rgba(0,0,0,0.10)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.5)';
                      e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
                      e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.8)';
                    }}
                  >
                    <div className="relative z-10 flex items-center gap-3">
                      <item.icon size={17} strokeWidth={1.5} style={{ color: item.color }} />
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-slate-900 leading-tight tracking-[-0.01em]">
                          {item.label}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
