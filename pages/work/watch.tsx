import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const timelineEntries = [
  {
    time: '7:45 AM',
    text: 'Driving to first job. Raise wrist: "What\'s my schedule today?" Watch reads back 4 appointments.',
  },
  {
    time: '9:15 AM',
    text: 'Between jobs. "Just finished the Henderson water heater, used two flex connectors, took 3 hours." Watch creates job record, updates inventory, logs time.',
  },
  {
    time: '11:00 AM',
    text: 'On site. "Remind me to order more flex connectors and follow up with Sarah about the renovation." Two tasks created, zero typing.',
  },
  {
    time: '12:30 PM',
    text: 'Lunch break. Switches to text mode in quiet restaurant. Types: "How are receivables this month?" Gets a full financial summary.',
  },
];

const techPills = [
  'WebSocket relay',
  'OpenAI Realtime V2',
  'NECP-compliant (no 35s timeout)',
  '37 Swift files',
  'Dual mode: voice + text',
];

const WatchAssistant: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'circOut' }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-6 md:px-12 bg-white/80 backdrop-blur-xl border-b border-slate-100"
        style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}
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
              <img src="/Logo/vois-logo.svg" alt="Vois" className="h-8 w-8" />
              <span className="font-semibold text-sm tracking-tight text-slate-900">VOIS</span>
            </motion.div>
          </a>
        </div>

        <div className="w-32" />
      </motion.nav>

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* Hero */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <div className="inline-block px-4 py-2 bg-emerald-500/10 text-emerald-700 rounded-full text-sm font-medium mb-6">
              Core Feature
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-5 leading-tight">
              Your Entire Business.<br />On Your Wrist.
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Not a notification mirror. A full AI assistant with voice,
              tools, and sub-300ms responses.
            </p>
          </motion.div>

          {/* Stat Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {[
              {
                number: '<300ms',
                label: 'Speech-to-speech response time. Faster than pulling out your phone.',
              },
              {
                number: '8 Tools',
                label: 'Create tasks, check calendar, search data, draft emails — all from your wrist.',
              },
              {
                number: '0 Apps Opened',
                label: 'Dictate a 30-second update between jobs. It becomes tasks, events, and notes automatically.',
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.number}
                {...fadeUp}
                transition={{ duration: 0.5, delay: 0.15 * i }}
                className="bg-emerald-50 rounded-2xl p-8 text-center"
              >
                <div className="text-5xl font-bold text-emerald-600 mb-4">
                  {stat.number}
                </div>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Day in the Life */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-slate-50 rounded-3xl p-8 md:p-12 mb-20"
          >
            <h2 className="text-2xl md:text-3xl font-serif font-medium text-slate-900 mb-10 text-center">
              A Morning in the Field
            </h2>

            <div className="max-w-3xl mx-auto relative">
              {/* Connecting line */}
              <div className="absolute left-[4.5rem] md:left-[5.5rem] top-2 bottom-2 w-px bg-emerald-200" />

              <div className="space-y-8">
                {timelineEntries.map((entry, i) => (
                  <motion.div
                    key={entry.time}
                    {...fadeUp}
                    transition={{ duration: 0.4, delay: 0.3 + 0.1 * i }}
                    className="flex gap-6 items-start relative"
                  >
                    <div className="flex-shrink-0 w-[4.5rem] md:w-[5.5rem] text-right">
                      <span className="font-mono font-semibold text-emerald-600 text-sm">
                        {entry.time}
                      </span>
                    </div>
                    <div className="relative flex-shrink-0 w-2.5 h-2.5 mt-1.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                    <p className="text-slate-700 leading-relaxed text-[15px] flex-1">
                      {entry.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Two-Column Feature Block */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-2 gap-12 md:gap-16 mb-20 max-w-4xl mx-auto"
          >
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Suggestion Cards
              </h3>
              <p className="text-slate-600 leading-relaxed">
                After every exchange, action cards appear on the watch face.
                &ldquo;Create task: Follow up with Sarah&rdquo; or &ldquo;Schedule:
                Site visit Tuesday 2pm&rdquo;. Tap to confirm, swipe to dismiss.
                No tiny keyboard needed.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Seamless Handoff
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Start a conversation on your watch, pick it up on your phone or
                Mac. Voice notes recorded on the watch flow through the Smart
                Router &mdash; the office team sees updates in real-time without
                you touching your phone.
              </p>
            </div>
          </motion.div>

          {/* Technical Credibility Strip */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-slate-900 text-white rounded-2xl px-8 py-5 mb-20"
          >
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm">
              {techPills.map((pill, i) => (
                <React.Fragment key={pill}>
                  {i > 0 && (
                    <span className="text-slate-500 select-none">&middot;</span>
                  )}
                  <span className="text-slate-300 font-medium">{pill}</span>
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          {/* Closing */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center"
          >
            <p className="text-lg text-slate-400 italic mb-8">
              Other watch apps show notifications. VOIS puts your entire business on your wrist.
            </p>
            <a href="/work#waitlist">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-slate-900 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                Join Waitlist
              </motion.button>
            </a>
          </motion.div>

        </div>
      </main>
    </div>
  );
};

export default WatchAssistant;
