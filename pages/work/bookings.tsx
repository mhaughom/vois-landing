import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  UserPlus,
  Bell,
  Package,
  Globe,
  Lock,
  CheckCircle2,
  X as XIcon,
  Calendar,
  Zap,
  Link2,
  Shield,
} from 'lucide-react';

/* ── animation helpers ─────────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.10 } },
};

const springPop = { type: 'spring', stiffness: 400, damping: 22 } as const;

/* ── slot data ─────────────────────────────────────────────────────────── */

type SlotState = 'available' | 'selected' | 'booked';

interface Slot {
  day: string;
  dayShort: string;
  time: string;
  state: SlotState;
}

const initialSlots: Slot[] = [
  // Monday
  { day: 'Monday',    dayShort: 'Mon', time: '9:00 AM',  state: 'booked' },
  { day: 'Monday',    dayShort: 'Mon', time: '10:30 AM', state: 'available' },
  { day: 'Monday',    dayShort: 'Mon', time: '1:00 PM',  state: 'available' },
  // Tuesday
  { day: 'Tuesday',   dayShort: 'Tue', time: '9:00 AM',  state: 'available' },
  { day: 'Tuesday',   dayShort: 'Tue', time: '10:30 AM', state: 'selected' },
  { day: 'Tuesday',   dayShort: 'Tue', time: '1:00 PM',  state: 'available' },
  // Wednesday
  { day: 'Wednesday', dayShort: 'Wed', time: '9:00 AM',  state: 'available' },
  { day: 'Wednesday', dayShort: 'Wed', time: '10:30 AM', state: 'booked' },
  { day: 'Wednesday', dayShort: 'Wed', time: '1:00 PM',  state: 'available' },
  // Thursday
  { day: 'Thursday',  dayShort: 'Thu', time: '9:00 AM',  state: 'available' },
  { day: 'Thursday',  dayShort: 'Thu', time: '10:30 AM', state: 'available' },
  { day: 'Thursday',  dayShort: 'Thu', time: '1:00 PM',  state: 'booked' },
  // Friday
  { day: 'Friday',    dayShort: 'Fri', time: '9:00 AM',  state: 'available' },
  { day: 'Friday',    dayShort: 'Fri', time: '10:30 AM', state: 'available' },
  { day: 'Friday',    dayShort: 'Fri', time: '1:00 PM',  state: 'available' },
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

const confirmationSteps = [
  { icon: CheckCircle2, text: 'Booking confirmed' },
  { icon: ShoppingCart, text: 'Order #1248 created' },
  { icon: UserPlus,     text: 'Sarah Henderson added to CRM' },
  { icon: Bell,         text: 'Team notified' },
];

/* ── page component ────────────────────────────────────────────────────── */

const Bookings: React.FC = () => {
  const [slots, setSlots] = useState(initialSlots);
  const [confirmed, setConfirmed] = useState(false);

  const handleSlotClick = (idx: number) => {
    if (slots[idx].state === 'booked') return;
    setSlots((prev) =>
      prev.map((s, i) => ({
        ...s,
        state: i === idx ? 'selected' : s.state === 'selected' ? 'available' : s.state,
      }))
    );
    setConfirmed(false);
  };

  const selectedSlot = slots.find((s) => s.state === 'selected');

  const handleConfirm = () => {
    if (!selectedSlot) return;
    setConfirmed(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── Nav ───────────────────────────────────────────────────────── */}
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
              <img src="/Logo/habos-icon.svg" alt="HABOS" className="h-8 w-8" />
              <span className="font-semibold text-sm tracking-tight text-slate-900">HABOS</span>
            </motion.div>
          </a>
        </div>

        <div className="w-32" />
      </motion.nav>

      {/* ── Main ──────────────────────────────────────────────────────── */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ── 1. Hero ───────────────────────────────────────────────── */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="mb-20 max-w-3xl"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <span className="inline-block px-4 py-1.5 bg-violet-500/10 text-violet-700 rounded-full text-sm font-medium mb-6">
                Bookings
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]"
            >
              Zero Double-Bookings.<br />
              Guaranteed.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-lg md:text-xl text-slate-500 max-w-2xl leading-relaxed"
            >
              Customers pick a slot, the system locks it atomically, creates the order,
              upserts the CRM contact, and notifies your team — all in one transaction.
            </motion.p>
          </motion.section>

          {/* ── 2. Mock Availability Grid ─────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mb-20"
          >
            <div className="bg-violet-50/50 rounded-3xl p-6 md:p-8">
              {/* Service header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Calendar size={20} className="text-violet-600" />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-900">HVAC Maintenance</p>
                  <p className="text-sm text-slate-500">60 min &middot; $150</p>
                </div>
              </div>

              {/* Weekly grid */}
              <div className="bg-white/60 rounded-2xl border border-slate-100 overflow-hidden">
                {/* Day headers */}
                <div className="grid grid-cols-5 border-b border-slate-100">
                  {days.map((d) => (
                    <div key={d} className="text-center py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <span className="hidden sm:inline">{d}</span>
                      <span className="sm:hidden">{d.slice(0, 3)}</span>
                    </div>
                  ))}
                </div>

                {/* Time rows */}
                {[0, 1, 2].map((row) => (
                  <div key={row} className={`grid grid-cols-5 ${row < 2 ? 'border-b border-slate-50' : ''}`}>
                    {days.map((day, di) => {
                      const slotIdx = di * 3 + row;
                      const slot = slots[slotIdx];
                      const isSelected = slot.state === 'selected';
                      const isBooked = slot.state === 'booked';

                      return (
                        <div key={`${day}-${row}`} className="flex items-center justify-center py-3 px-1">
                          <motion.button
                            onClick={() => handleSlotClick(slotIdx)}
                            whileHover={!isBooked ? { scale: 1.08 } : {}}
                            whileTap={!isBooked ? { scale: 0.95 } : {}}
                            transition={springPop}
                            disabled={isBooked}
                            className={`
                              px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors
                              ${isSelected
                                ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                                : isBooked
                                  ? 'bg-slate-100 text-slate-400 line-through cursor-not-allowed'
                                  : 'bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer'
                              }
                            `}
                          >
                            {slot.time}
                          </motion.button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Confirm / result area */}
              <div className="mt-6">
                {selectedSlot && !confirmed && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row items-center gap-3 justify-center"
                  >
                    <span className="text-sm text-slate-600">
                      Selected: <strong className="text-violet-700">{selectedSlot.day} {selectedSlot.time}</strong>
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleConfirm}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-full shadow-sm hover:bg-violet-700 transition-colors"
                    >
                      <Lock size={14} />
                      Confirm Booking
                    </motion.button>
                  </motion.div>
                )}

                {confirmed && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Confirmation steps */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                      {confirmationSteps.map((step, i) => (
                        <React.Fragment key={step.text}>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.15, ...springPop }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-green-200 text-sm text-green-700 font-medium shadow-sm"
                          >
                            <step.icon size={14} />
                            {step.text}
                          </motion.div>
                          {i < confirmationSteps.length - 1 && (
                            <ArrowRight size={14} className="text-slate-300 shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Advisory lock explanation */}
              <div className="mt-6 pt-6 border-t border-violet-100/60">
                <p className="text-sm text-slate-500 leading-relaxed max-w-2xl mx-auto text-center">
                  PostgreSQL advisory locks prevent double-booking even under extreme concurrent
                  load. If two people click the same slot at the same millisecond, one wins — the
                  other sees "slot taken" instantly.
                </p>
              </div>
            </div>
          </motion.section>

          {/* ── 3. Three Benefit Cards ────────────────────────────────── */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20"
          >
            {[
              {
                icon: <ShoppingCart size={22} className="text-violet-600" />,
                title: 'Book \u2192 order \u2192 CRM',
                body: 'One booking creates everything: order with line items, CRM contact upsert, staff notification, and customer confirmation email. Zero manual steps.',
                accent: 'bg-violet-50 border-violet-100',
              },
              {
                icon: <Package size={22} className="text-amber-600" />,
                title: 'Smart stock reservation',
                body: 'Inventory tracked across pending \u2192 confirmed \u2192 completed flow. No overselling, no manual stock checks.',
                accent: 'bg-amber-50 border-amber-100',
              },
              {
                icon: <Globe size={22} className="text-emerald-600" />,
                title: 'Public + internal APIs',
                body: 'Staff book from the dashboard. Customers book from your website or scheduling links. Same atomic protection, same availability pool.',
                accent: 'bg-emerald-50 border-emerald-100',
              },
            ].map((card) => (
              <motion.div
                key={card.title}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className={`rounded-2xl border p-6 ${card.accent}`}
              >
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm mb-4">
                  {card.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{card.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{card.body}</p>
              </motion.div>
            ))}
          </motion.section>

          {/* ── 4. Before / After ─────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
            className="mb-20"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Without */}
              <div className="bg-slate-100 rounded-3xl p-8">
                <div className="flex items-center gap-2 mb-4">
                  <XIcon size={18} className="text-slate-400" />
                  <h3 className="text-lg font-semibold text-slate-700">Without HABOS</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Customer emails to book. You check your calendar. Reply with available times.
                  They pick one. You create the appointment, the invoice, and add them to your
                  contacts. 8 steps, 3 apps.
                </p>
                <div className="inline-block px-4 py-2 bg-slate-200/80 rounded-full text-sm font-medium text-slate-600">
                  ~15 min per booking
                </div>
              </div>

              {/* With */}
              <div className="bg-violet-50 rounded-3xl p-8">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 size={18} className="text-violet-600" />
                  <h3 className="text-lg font-semibold text-slate-900">With HABOS</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Customer picks a slot on your website. Done. Order, CRM entry,
                  notification, and confirmation email happen automatically.
                </p>
                <div className="inline-block px-4 py-2 bg-violet-100 rounded-full text-sm font-medium text-violet-700">
                  ~30 seconds (their time, not yours)
                </div>
              </div>
            </div>
          </motion.section>

          {/* ── 5. Tech Strip ─────────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-20"
          >
            <div className="bg-slate-900 rounded-2xl px-6 py-5">
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                {[
                  { icon: <Shield size={14} />,    label: 'PostgreSQL advisory locks' },
                  { icon: <Lock size={14} />,      label: 'Atomic slot protection' },
                  { icon: <ShoppingCart size={14} />, label: 'Auto-order creation' },
                  { icon: <Zap size={14} />,       label: 'Race condition safe' },
                  { icon: <Link2 size={14} />,     label: 'Self-cancellation links' },
                ].map((item) => (
                  <span key={item.label} className="flex items-center gap-1.5 text-sm text-slate-300">
                    <span className="text-slate-500">{item.icon}</span>
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </motion.section>

          {/* ── 6. Closing ────────────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-serif font-medium text-slate-900 mb-4">
              Other booking tools are a separate calendar.<br />
              HABOS bookings are wired into your entire business.
            </h2>

            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="mt-6 inline-flex items-center gap-2 px-8 py-3 bg-slate-900 text-white text-sm font-medium rounded-full shadow-md hover:bg-slate-800 transition-colors"
              >
                Join Waitlist
                <ArrowRight size={16} />
              </motion.button>
            </a>
          </motion.section>
        </div>
      </main>
    </div>
  );
};

export default Bookings;
