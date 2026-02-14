import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, FileText, ChevronDown, X, Users, Check, Plus, Hourglass } from 'lucide-react';

export const ActionCards: React.FC = () => {
  return (
    <section id="action-cards" className="py-24 md:py-32 px-6 md:px-16 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:pr-8"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              Can I trust AI?
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed mb-6">
              You shouldn't trust AI blindly. That's why every action VOIS suggests comes as a card you can verify, edit, or decline.
            </p>
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed mb-6">
              Our action cards are extremely accurate, beautifully designed, and give you complete control. Nothing happens without your approval.
            </p>
            <p className="text-lg md:text-xl text-slate-600 italic leading-relaxed">
              Every suggestion is editable. Every action requires your approval. Complete control, zero effort.
            </p>
          </motion.div>

          {/* Right: Action Cards Stack */}
          <div className="space-y-6">
          {/* Task Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative rounded-[32px] p-7 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(236, 252, 241, 0.98) 0%, rgba(209, 250, 223, 0.98) 40%, rgba(167, 243, 208, 0.98) 100%)',
              backdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(34, 197, 94, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
            }}
          >
            {/* Glass overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/20 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-tr from-green-50/40 to-transparent pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
              {/* Header row */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-white/50">
                    <Calendar size={14} className="text-green-600" />
                    <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Fri, Feb 6</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md">
                    <div className="w-3 h-3 bg-white/40 rounded-sm" />
                    <span className="text-xs font-bold uppercase tracking-wider">Personal</span>
                    <ChevronDown size={12} />
                  </div>
                  <button className="w-9 h-9 flex items-center justify-center rounded-full text-slate-600 hover:bg-white/50 hover:text-slate-900 transition-all">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Task title */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🧹</span>
                <h3 className="text-2xl font-semibold text-slate-900">Vacuum the floor</h3>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-2 mb-3">
                <Hourglass size={16} className="text-slate-500" />
                <span className="text-slate-600">30 min</span>
                <ChevronDown size={14} className="text-slate-400" />
              </div>

              {/* Description */}
              <p className="text-slate-600 mb-6">
                Need to vacuum the floor by the end of this week.
              </p>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-md text-slate-700 font-semibold hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-sm border border-white/40">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-md text-slate-700 font-semibold hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-sm border border-white/40">
                  <Check size={14} />
                  Done
                </button>
                <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-green-500/30">
                  <Plus size={14} />
                  Add
                </button>
              </div>
            </div>
          </motion.div>

          {/* People Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative rounded-[32px] p-7 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(236, 254, 255, 0.98) 0%, rgba(207, 250, 254, 0.98) 40%, rgba(165, 243, 252, 0.98) 100%)',
              backdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(6, 182, 212, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
            }}
          >
            {/* Glass overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/20 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-50/40 to-transparent pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
              {/* Header row */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/80 backdrop-blur-md text-cyan-600 text-xs font-bold uppercase tracking-wider shadow-sm border border-white/50 hover:bg-white transition-all">
                    <Users size={14} />
                    New Person
                  </button>
                  <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/80 backdrop-blur-md text-cyan-600 text-xs font-bold uppercase tracking-wider shadow-sm border border-white/50 hover:bg-white transition-all">
                    <div className="w-3 h-3 bg-cyan-500/40 rounded-sm" />
                    List
                    <ChevronDown size={12} />
                  </button>
                </div>
                <button className="w-9 h-9 flex items-center justify-center rounded-full text-slate-600 hover:bg-white/50 hover:text-slate-900 transition-all">
                  <X size={20} />
                </button>
              </div>

              {/* Category pill */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 text-white shadow-md">
                  <Users size={14} />
                  <span className="text-xs font-bold uppercase tracking-wider">Professional</span>
                  <ChevronDown size={12} />
                </div>
              </div>

              {/* Person info */}
              <div className="flex items-start gap-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-orange-400 flex items-center justify-center text-2xl font-semibold text-white shadow-lg ring-4 ring-white/50">
                    DJ
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center border-3 border-white shadow-md">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-2xl font-semibold text-slate-900 mb-1.5 leading-tight">Deborah J. Trouw</h3>
                  <p className="text-slate-500 text-sm">Name on business card</p>
                </div>
              </div>

              <p className="text-slate-600 mb-6">
                Financial advisor business card
              </p>

              {/* Action button */}
              <button className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 text-white font-semibold hover:from-cyan-500 hover:to-cyan-600 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-cyan-400/30">
                <Users size={16} />
                Add to Directory
              </button>
            </div>
          </motion.div>

          {/* Calendar Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative rounded-[32px] p-7 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.98) 0%, rgba(224, 242, 254, 0.98) 40%, rgba(186, 230, 253, 0.98) 100%)',
              backdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(59, 130, 246, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
            }}
          >
            {/* Glass overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/20 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/40 to-transparent pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
              {/* Header row */}
              <div className="flex items-center justify-between mb-5">
                <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/80 backdrop-blur-md text-blue-600 text-xs font-bold uppercase tracking-wider shadow-sm border border-white/50 hover:bg-white transition-all">
                  <Calendar size={14} />
                  Sun, Feb 8
                  <ChevronDown size={12} />
                </button>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md">
                    <Calendar size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">Personal</span>
                    <ChevronDown size={12} />
                  </div>
                  <button className="w-9 h-9 flex items-center justify-center rounded-full text-slate-600 hover:bg-white/50 hover:text-slate-900 transition-all">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Event title */}
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">Car Service</h3>

              {/* Time and duration */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-blue-500" />
                  <span className="text-slate-600">12:00 PM</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </div>
                <span className="text-slate-400">•</span>
                <div className="flex items-center gap-2">
                  <Hourglass size={16} className="text-blue-500" />
                  <span className="text-slate-600">1 hr</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </div>
              </div>

              {/* Location */}
              <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl bg-white/40 backdrop-blur-sm text-slate-500 hover:bg-white/60 transition-all mb-3 group">
                <MapPin size={18} className="text-blue-500 flex-shrink-0" />
                <span className="flex-1 text-left">Add location</span>
                <ChevronDown size={16} className="text-slate-400 group-hover:text-slate-600" />
              </button>

              {/* Note */}
              <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl bg-white/40 backdrop-blur-sm text-slate-600 hover:bg-white/60 transition-all mb-6 group">
                <FileText size={18} className="text-blue-500 flex-shrink-0" />
                <span className="flex-1 text-left">Taking the car for service.</span>
                <ChevronDown size={16} className="text-slate-400 group-hover:text-slate-600" />
              </button>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-md text-blue-600 font-semibold hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-sm border border-blue-200/50">
                  Edit
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-md text-blue-600 font-semibold hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-sm border border-blue-200/50">
                  <Calendar size={14} />
                  Schedule
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/30">
                  Add to Calendar
                </button>
              </div>
            </div>
          </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
