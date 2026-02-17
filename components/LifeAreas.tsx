import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Heart, Lightbulb, Users, Dumbbell, GraduationCap, Home, Rocket } from 'lucide-react';

const areas = [
  { icon: Briefcase, label: 'Work', color: 'bg-blue-50 text-blue-600 border-blue-100', notes: 12 },
  { icon: Rocket, label: 'Side Project', color: 'bg-violet-50 text-violet-600 border-violet-100', notes: 8 },
  { icon: Heart, label: 'Relationships', color: 'bg-rose-50 text-rose-600 border-rose-100', notes: 5 },
  { icon: Dumbbell, label: 'Health', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', notes: 7 },
  { icon: GraduationCap, label: 'Learning', color: 'bg-amber-50 text-amber-600 border-amber-100', notes: 4 },
  { icon: Lightbulb, label: 'Ideas', color: 'bg-yellow-50 text-yellow-600 border-yellow-100', notes: 15 },
  { icon: Home, label: 'Home', color: 'bg-teal-50 text-teal-600 border-teal-100', notes: 3 },
  { icon: Users, label: 'Team', color: 'bg-indigo-50 text-indigo-600 border-indigo-100', notes: 9 },
];

export const LifeAreas: React.FC = () => {
  return (
    <section className="py-24 md:py-32 px-6 md:px-16 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
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
                Vois organizes everything across <em className="text-slate-900 font-medium">work and life</em>—projects, health goals, relationships, side hustles—so nothing falls through the cracks.
              </p>
              <p className="text-slate-700 font-medium">
                One place for every area of your life. Automatically sorted, always searchable.
              </p>
            </div>
          </motion.div>

          {/* Right: Areas grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {areas.map((area, i) => (
                <motion.div
                  key={area.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
                  className={`relative rounded-2xl border p-5 md:p-6 ${area.color} cursor-default hover:scale-[1.03] transition-transform`}
                >
                  <area.icon size={24} className="mb-3" />
                  <p className="text-base font-semibold mb-1">{area.label}</p>
                  <p className="text-xs opacity-70">{area.notes} notes</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
