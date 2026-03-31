import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  Layers,
  Copy,
  RotateCcw,
  ShoppingCart,
  Calendar,
  CreditCard,
  FileText,
  Megaphone,
  MessageSquare,
} from 'lucide-react';

/* ── animation helpers ─────────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.10 } },
};

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

/* ── widget data ───────────────────────────────────────────────────────── */

const widgets = [
  { icon: ShoppingCart, label: 'Product catalog' },
  { icon: Calendar, label: 'Booking calendar' },
  { icon: ShoppingCart, label: 'Shopping cart' },
  { icon: CreditCard, label: 'Checkout' },
  { icon: FileText, label: 'Contact form' },
  { icon: Megaphone, label: 'Campaign offers' },
];

const techItems = [
  'VibeSDK on Cloudflare Workers',
  'Multi-page React Router',
  'Brand token injection',
  'Web component widgets',
  'Custom domain support',
];

/* ── page component ────────────────────────────────────────────────────── */

const WebsiteBuilder: React.FC = () => {
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
            className="mb-20 text-center max-w-3xl mx-auto"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <span className="inline-block px-4 py-1.5 bg-blue-500/10 text-blue-700 rounded-full text-sm font-medium mb-6">
                AI Website Builder
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6, ease: easeOutExpo }}
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]"
            >
              Describe Your Site.<br />
              It Builds Itself.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
            >
              Tell HABOS what you need. AI generates a complete multi-page React site
              with your brand, products, bookings, and forms — deployed to a live URL instantly.
            </motion.p>
          </motion.section>

          {/* ── 2. Mock Website Preview ───────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: easeOutExpo }}
            className="mb-20"
          >
            {/* Browser chrome card */}
            <div className="bg-slate-900 rounded-3xl p-2 shadow-2xl">
              {/* Top bar */}
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Traffic lights */}
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                {/* URL bar */}
                <div className="flex-1 flex justify-center">
                  <div className="bg-slate-800 rounded-lg px-4 py-1.5 text-sm text-slate-400 font-mono">
                    henderson-plumbing.habos.site
                  </div>
                </div>
                <div className="w-[54px]" />
              </div>

              {/* Content area */}
              <div className="bg-white rounded-2xl overflow-hidden">
                {/* Mock nav */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600" />
                    <span className="font-semibold text-sm text-slate-900">Henderson Plumbing</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-6 text-xs text-slate-500">
                    <span>Services</span>
                    <span>About</span>
                    <span>Contact</span>
                  </div>
                  <div className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg">
                    Book Now
                  </div>
                </div>

                {/* Mock hero */}
                <div className="bg-gradient-to-br from-blue-50 to-slate-50 px-6 py-10 md:py-14 text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                    Henderson Plumbing
                  </h2>
                  <p className="text-sm text-slate-500">Licensed &amp; Insured Since 1985</p>
                </div>

                {/* Mock service cards */}
                <div className="grid grid-cols-3 gap-3 md:gap-4 px-4 md:px-6 py-6 md:py-8">
                  {[
                    { name: 'Emergency Repair', color: 'bg-red-50 border-red-100' },
                    { name: 'Water Heater', color: 'bg-amber-50 border-amber-100' },
                    { name: 'Bathroom Reno', color: 'bg-blue-50 border-blue-100' },
                  ].map((svc) => (
                    <div
                      key={svc.name}
                      className={`rounded-xl border p-3 md:p-4 text-center ${svc.color}`}
                    >
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white mx-auto mb-2 md:mb-3" />
                      <p className="text-xs md:text-sm font-medium text-slate-800">{svc.name}</p>
                    </div>
                  ))}
                </div>

                {/* Mock book button */}
                <div className="flex justify-center pb-8">
                  <div className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-full shadow-md shadow-blue-200">
                    Book Now
                  </div>
                </div>
              </div>
            </div>

            {/* Caption below browser */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="text-sm text-slate-500 leading-relaxed mt-6 text-center max-w-2xl mx-auto"
            >
              Generated from: <span className="italic text-slate-600">"Build a plumbing company website with our services and a booking widget."</span>
              {' '}Brand colors, products, and availability pulled from your workspace automatically.
            </motion.p>
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
                icon: <Copy size={22} className="text-blue-600" />,
                title: 'Clone & improve',
                body: "Enter a competitor's URL. HABOS captures screenshots, extracts design tokens, and rebuilds it as a modern React app with your branding and live commerce widgets.",
                accent: 'bg-blue-50 border-blue-100',
              },
              {
                icon: <Layers size={22} className="text-violet-600" />,
                title: '10 enrichment layers',
                body: 'Brand tokens, product catalog, booking widgets, shop components, form embeds, campaign surfaces, asset manifest — all injected before the AI builds.',
                accent: 'bg-violet-50 border-violet-100',
              },
              {
                icon: <RotateCcw size={22} className="text-emerald-600" />,
                title: 'One-click rollback',
                body: 'Create unlimited versions. Preview before publishing. Roll back to any previous version instantly. Your live site is never at risk.',
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

          {/* ── 4. Widget Showcase ────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="mb-20 text-center"
          >
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
              Live widgets that connect to your backend
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {widgets.map((w) => (
                <motion.div
                  key={w.label}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 bg-blue-50 text-blue-700 rounded-lg px-3 py-2 text-sm font-medium"
                >
                  <w.icon size={15} />
                  {w.label}
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ── 5. Scenario Callout ───────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
            className="mb-20"
          >
            <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={20} className="text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold leading-snug">How it works in practice</h3>
              </div>
              <p className="text-slate-300 leading-relaxed text-base md:text-lg max-w-3xl">
                A new client signs up and enters their current website URL. HABOS scrapes the
                site — captures design, content, images, and brand tokens. In under 2 minutes,
                a rebuilt version appears with HABOS commerce, booking, and forms wired in.
                Products added in the dashboard appear on the website automatically. Bookings
                flow into the calendar. Form submissions create tickets. One data layer, everywhere.
              </p>
            </div>
          </motion.section>

          {/* ── 6. Tech Strip ─────────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-20"
          >
            <div className="bg-slate-900 rounded-2xl px-6 py-5">
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                {techItems.map((item, i) => (
                  <span key={item} className="flex items-center gap-1.5 text-sm text-slate-300">
                    {i > 0 && <span className="text-slate-600 mr-1">&middot;</span>}
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </motion.section>

          {/* ── 7. Closing ────────────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-serif font-medium text-slate-900 mb-4">
              Other website builders are drag-and-drop.<br />
              HABOS builds it for you.
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

export default WebsiteBuilder;
