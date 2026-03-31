import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, MapPin, Pause, Bell, Shield, Timer } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

const days: {
  day: string;
  range: string;
  hours: string;
  badge: string;
  badgeColor: string;
}[] = [
  { day: 'Mon', range: '7:00 AM \u2192 3:30 PM', hours: '8.0 hrs', badge: 'Regular', badgeColor: 'bg-green-100 text-green-700' },
  { day: 'Tue', range: '6:45 AM \u2192 4:15 PM', hours: '9.0 hrs', badge: '1.0 OT', badgeColor: 'bg-amber-100 text-amber-700' },
  { day: 'Wed', range: '7:00 AM \u2192 5:00 PM', hours: '9.5 hrs', badge: '1.5 OT', badgeColor: 'bg-amber-100 text-amber-700' },
  { day: 'Thu', range: '7:15 AM \u2192 3:45 PM', hours: '8.0 hrs', badge: 'Regular', badgeColor: 'bg-green-100 text-green-700' },
  { day: 'Fri', range: '7:00 AM \u2192 1:30 PM', hours: '6.5 hrs', badge: 'Half day', badgeColor: 'bg-blue-100 text-blue-700' },
];

const TimeTracking: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* ─── Navigation ─── */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'circOut' }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-5 md:px-12 bg-white/80 backdrop-blur-xl border-b border-slate-100"
        style={{ paddingTop: 'calc(1.25rem + env(safe-area-inset-top, 0px))' }}
      >
        <a href="/work">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 px-4 py-2 rounded-full border border-slate-100 shadow-sm"
          >
            <ArrowLeft size={16} className="text-slate-600" />
            <span className="font-medium text-sm text-slate-600">Back to Work</span>
          </motion.div>
        </a>

        <div className="absolute left-1/2 -translate-x-1/2">
          <a href="/">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 px-4 py-2 rounded-full border border-slate-100 shadow-sm"
            >
              <img src="/Logo/habos-icon.svg" alt="HABOS" className="h-8 w-8" />
              <span className="font-semibold text-sm tracking-tight text-slate-900">HABOS</span>
            </motion.div>
          </a>
        </div>

        <div className="w-32" />
      </motion.nav>

      {/* ─── Content ─── */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ━━━ 1. Hero ━━━ */}
          <motion.section {...fadeUp()} className="max-w-3xl mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-700 rounded-full text-sm font-medium mb-6">
              <Clock size={14} />
              Time &amp; Payroll
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]">
              Clock In. We Handle the Math.
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-2xl">
              GPS-verified time tracking with automatic overtime calculation, break tracking,
              and payroll-ready billing &mdash; no timesheets, no spreadsheets.
            </p>
          </motion.section>

          {/* ━━━ 2. Mock timecard ━━━ */}
          <motion.section {...fadeUp(0.15)} className="mb-20">
            <div className="bg-orange-50/50 rounded-3xl p-6 md:p-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
                <p className="font-semibold text-slate-900">Mike Torres &mdash; This Week</p>
                <p className="text-sm text-slate-500">
                  36.5 hrs regular &middot; 4.5 hrs overtime
                </p>
              </div>

              {/* Day rows */}
              <div className="space-y-1 mb-4">
                {days.map((d) => (
                  <div
                    key={d.day}
                    className="bg-white rounded-lg p-3 border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 w-8 shrink-0">
                        {d.day}
                      </span>
                      <span className="text-sm text-slate-700">{d.range}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-medium text-slate-900">{d.hours}</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${d.badgeColor}`}>
                        {d.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary row */}
              <div className="bg-orange-100 rounded-lg p-3">
                <p className="text-sm text-orange-900 font-medium leading-relaxed">
                  <span className="font-semibold">Total: 41.0 hrs</span>
                  <span className="mx-2 text-orange-400">|</span>
                  Regular: 36.5 &times; $45/hr = $1,642.50
                  <span className="mx-2 text-orange-400">|</span>
                  OT: 4.5 &times; $67.50/hr = $303.75
                  <span className="mx-2 text-orange-400">|</span>
                  <span className="font-semibold">Total: $1,946.25</span>
                </p>
              </div>

              <p className="text-xs text-slate-400 text-center mt-4">
                Overtime auto-calculated per calendar day. Manager notified when daily threshold exceeded.
              </p>
            </div>
          </motion.section>

          {/* ━━━ 3. Three benefit cards ━━━ */}
          <motion.section {...fadeUp(0.25)} className="mb-20">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Privacy-first GPS */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Shield size={18} className="text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Privacy-first GPS</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Location tracking only activates during a work session. No session = no GPS
                  access. Workers control when they&rsquo;re tracked.
                </p>
              </div>

              {/* Pause/resume */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Pause size={18} className="text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Pause/resume</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Record breaks within a session. System computes regular vs paused time
                  automatically. No manual deductions needed.
                </p>
              </div>

              {/* Manager alerts */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Bell size={18} className="text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Manager alerts</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Clock-out triggers async overtime check. If daily hours exceed the threshold
                  (default 8h), the manager gets notified via org chart hierarchy.
                </p>
              </div>
            </div>
          </motion.section>

          {/* ━━━ 4. Scenario callout ━━━ */}
          <motion.section {...fadeUp(0.35)} className="mb-20">
            <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-10">
              <p className="text-lg md:text-xl leading-relaxed text-slate-200">
                End of the month. Instead of collecting paper timesheets, fixing math errors,
                and cross-referencing with job logs &mdash; you pull up HABOS. Every team
                member&rsquo;s hours are already calculated, overtime split out, billing amounts
                computed. Export to payroll in one click.{' '}
                <span className="text-white font-semibold">
                  That&rsquo;s 4 hours of admin work, gone.
                </span>
              </p>
            </div>
          </motion.section>

          {/* ━━━ 5. Tech strip ━━━ */}
          <motion.section {...fadeUp(0.45)} className="mb-20">
            <div className="bg-slate-950 rounded-2xl py-5 px-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
              <span>GPS-gated sessions</span>
              <span className="text-slate-600">&middot;</span>
              <span>Haversine mileage</span>
              <span className="text-slate-600">&middot;</span>
              <span>Per-day overtime calc</span>
              <span className="text-slate-600">&middot;</span>
              <span>1.5&times; default OT rate</span>
              <span className="text-slate-600">&middot;</span>
              <span>Payroll-ready export</span>
            </div>
          </motion.section>

          {/* ━━━ 6. Closing CTA ━━━ */}
          <motion.section {...fadeUp(0.55)} className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-slate-900 mb-5 leading-tight">
              Other time trackers make your accountant cry.<br />
              HABOS makes payroll painless.
            </h2>
            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 px-8 py-3.5 bg-orange-600 text-white rounded-full font-medium text-sm shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-colors"
              >
                Join Waitlist
              </motion.button>
            </a>
          </motion.section>

        </div>
      </main>
    </div>
  );
};

export default TimeTracking;
