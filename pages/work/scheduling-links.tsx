import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Shield,
  UserX,
  Zap,
  Timer,
  UserCheck,
} from 'lucide-react';

/* -- animation helpers --------------------------------------------------- */

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

/* -- calendar data ------------------------------------------------------- */

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;

type SlotStatus = 'available' | 'unavailable' | 'selected';

interface TimeSlot {
  time: string;
  status: SlotStatus;
}

const calendarSlots: Record<string, TimeSlot[]> = {
  Mon: [
    { time: '9:00', status: 'available' },
    { time: '9:30', status: 'available' },
    { time: '10:00', status: 'unavailable' },
    { time: '10:30', status: 'unavailable' },
    { time: '11:00', status: 'available' },
  ],
  Tue: [
    { time: '9:00', status: 'available' },
    { time: '9:30', status: 'unavailable' },
    { time: '10:00', status: 'selected' },
    { time: '10:30', status: 'available' },
    { time: '11:00', status: 'available' },
  ],
  Wed: [
    { time: '9:00', status: 'unavailable' },
    { time: '9:30', status: 'unavailable' },
    { time: '10:00', status: 'available' },
    { time: '10:30', status: 'available' },
    { time: '11:00', status: 'unavailable' },
  ],
  Thu: [
    { time: '9:00', status: 'available' },
    { time: '9:30', status: 'available' },
    { time: '10:00', status: 'available' },
    { time: '10:30', status: 'unavailable' },
    { time: '11:00', status: 'available' },
  ],
  Fri: [
    { time: '9:00', status: 'unavailable' },
    { time: '9:30', status: 'available' },
    { time: '10:00', status: 'available' },
    { time: '10:30', status: 'available' },
    { time: '11:00', status: 'unavailable' },
  ],
} as const;

/* -- benefit cards data -------------------------------------------------- */

const benefits = [
  {
    icon: Zap,
    title: 'Smart slot generation',
    desc: 'Duration, business hours, buffer time, and existing calendar events all factor in. Only truly available slots are shown \u2014 no back-and-forth.',
  },
  {
    icon: Timer,
    title: '15-min buffer built in',
    desc: 'Configurable pre and post-meeting padding blocks overlapping slots automatically. No more back-to-back calls with no break.',
  },
  {
    icon: UserCheck,
    title: 'Guest self-service',
    desc: 'Confirmation email includes a one-click cancel link. Guests cancel or reschedule without contacting you. You get notified.',
  },
] as const;

/* -- tech strip items ---------------------------------------------------- */

const techItems = [
  'Smart slot generation',
  'Buffer time management',
  'Race condition protection',
  'Self-cancellation links',
  'Product integration',
] as const;

/* -- component ----------------------------------------------------------- */

const SchedulingLinks: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* --- Content --- */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* 1. Hero */}
          <motion.section {...fadeUp()} className="max-w-3xl mx-auto text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/10 text-pink-700 rounded-full text-sm font-medium mb-6">
              Scheduling Links
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]">
              Your Own Calendly.<br />Built In.
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
              Create shareable booking links that let anyone schedule time with you &mdash; with smart
              slot generation, buffer time, and race condition protection.
            </p>
          </motion.section>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mx-auto mb-16">
            <p className="text-lg text-slate-600 leading-relaxed text-center">
              Create unlimited scheduling links — URLs like habos.app/s/mathias-30min — where guests book with zero friction and no account required. Smart slot generation considers duration, business hours, buffer time, and existing calendar events. Configurable pre and post-meeting padding blocks overlapping slots automatically. Server-side re-checks prevent double-bookings even under concurrent requests. Guests get confirmation emails with one-click cancel links.
            </p>
          </motion.div>

          {/* 2. Mock scheduling link preview */}
          <motion.section {...fadeUp(0.1)} className="mb-20">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl max-w-lg mx-auto">
              {/* Top: Avatar + Name + Meeting type */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  M
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Mathias Haughom</p>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5">
                    <Clock size={13} className="text-slate-400" />
                    30 Minute Consultation
                  </p>
                </div>
              </div>

              {/* URL preview */}
              <div className="bg-slate-50 rounded-xl px-4 py-2.5 mb-6">
                <p className="text-sm text-slate-400 font-mono">habos.app/s/mathias-30min</p>
              </div>

              {/* Mini weekly calendar */}
              <div className="mb-6">
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {weekDays.map((day) => (
                    <div key={day} className="text-center">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        {day}
                      </p>
                      <div className="space-y-1.5">
                        {calendarSlots[day].map((slot) => (
                          <div
                            key={`${day}-${slot.time}`}
                            className={`text-xs font-medium rounded-lg py-1.5 transition-colors ${
                              slot.status === 'selected'
                                ? 'bg-pink-600 text-white shadow-sm shadow-pink-600/20'
                                : slot.status === 'available'
                                ? 'bg-pink-50 text-pink-700 border border-pink-200'
                                : 'bg-slate-100 text-slate-300'
                            }`}
                          >
                            {slot.time}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected time label */}
                <div className="text-center mb-4">
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-pink-700 bg-pink-50 px-3 py-1.5 rounded-full">
                    <Clock size={13} />
                    Tuesday 10:00 AM
                  </span>
                </div>
              </div>

              {/* Confirm button */}
              <button className="w-full bg-pink-600 text-white rounded-full py-3 font-medium text-sm hover:bg-pink-700 transition-colors shadow-lg shadow-pink-600/20">
                Confirm Booking
              </button>
            </div>

            {/* Annotation below card */}
            <p className="text-sm text-slate-500 text-center max-w-xl mx-auto mt-6 leading-relaxed">
              Share the link anywhere &mdash; email signature, website, social bio. Guests book without
              creating an account.
            </p>
          </motion.section>

          {/* 3. Three benefit cards */}
          <motion.section {...fadeUp(0.2)} className="mb-20">
            <div className="grid md:grid-cols-3 gap-5">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
                >
                  <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center mb-4">
                    <b.icon size={20} className="text-pink-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-3">{b.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* 4. Before / After */}
          <motion.section {...fadeUp(0.3)} className="mb-20">
            <div className="grid md:grid-cols-2 gap-5">
              {/* Without HABOS */}
              <div className="bg-slate-100 rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <UserX size={18} className="text-slate-400" />
                  <h3 className="font-semibold text-slate-700">Without HABOS</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Pay $12/mo for Calendly. Copy availability from your calendar. Hope it syncs.
                  Manually add the booking to your CRM. Send the invoice separately.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-200 text-slate-600 rounded-full text-xs font-semibold">
                  3 tools, $12/mo extra
                </div>
              </div>

              {/* With HABOS */}
              <div className="bg-pink-50 rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={18} className="text-pink-600" />
                  <h3 className="font-semibold text-pink-900">With HABOS</h3>
                </div>
                <p className="text-sm text-pink-800/70 leading-relaxed mb-6">
                  Create a scheduling link. Share it. Guest books. Calendar, CRM, order, and
                  notification all update automatically. Already included in your plan.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-pink-200/60 text-pink-700 rounded-full text-xs font-semibold">
                  1 tool, $0 extra
                </div>
              </div>
            </div>
          </motion.section>

          {/* 5. Tech strip */}
          <motion.section {...fadeUp(0.4)} className="mb-20">
            <div className="bg-pink-50 border border-pink-200 rounded-2xl px-8 py-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-pink-700">
              {techItems.map((item, i) => (
                <React.Fragment key={item}>
                  {i > 0 && <span className="text-pink-300">&middot;</span>}
                  <span>{item}</span>
                </React.Fragment>
              ))}
            </div>
          </motion.section>

          {/* 6. Closing CTA */}
          <motion.section {...fadeUp(0.5)} className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-slate-900 mb-5 leading-tight">
              Other scheduling tools are a separate subscription.<br />
              HABOS scheduling is built in.
            </h2>
            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 inline-flex items-center gap-2 px-8 py-3.5 bg-pink-600 text-white rounded-full font-medium text-sm shadow-lg shadow-pink-600/20 hover:bg-pink-700 transition-colors"
              >
                Join Waitlist
                <ArrowRight size={18} />
              </motion.button>
            </a>
          </motion.section>

        </div>
      </main>
    </div>
  );
};

export default SchedulingLinks;
