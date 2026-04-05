import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@li/shared/components/Navbar';
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

/* ── icon maps ─────────────────────────────────────────────────────────── */

const widgetIcons = [ShoppingCart, Calendar, ShoppingCart, CreditCard, FileText, Megaphone];
const benefitIcons = [Copy, Layers, RotateCcw];
const benefitAccents = [
  'bg-blue-50 border-blue-100',
  'bg-violet-50 border-violet-100',
  'bg-emerald-50 border-emerald-100',
];
const benefitIconColors = ['text-blue-600', 'text-violet-600', 'text-emerald-600'];

/* ── service card colors ───────────────────────────────────────────────── */

const serviceColors = [
  'bg-red-50 border-red-100',
  'bg-amber-50 border-amber-100',
  'bg-blue-50 border-blue-100',
];

/* ── tech strip items ──────────────────────────────────────────────────── */

const techItemsStatic = [
  'VibeSDK on Cloudflare Workers',
  'Multi-page React Router',
  'Brand token injection',
  'Web component widgets',
  'Custom domain support',
];

/* ── page component ────────────────────────────────────────────────────── */

const WebsiteBuilder: React.FC = () => {
  const { t } = useTranslation('work-website-builder');

  const widgets = t('widgets', { returnObjects: true }) as Array<{ label: string }>;
  const benefits = t('benefits', { returnObjects: true }) as Array<{ title: string; body: string }>;
  const techItems = t('techItems', { returnObjects: true }) as string[];

  const mockNavLinks = t('mockSite.navLinks', { returnObjects: true }) as string[];
  const mockServices = t('mockSite.services', { returnObjects: true }) as Array<{ name: string }>;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

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
                {t('badge')}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6, ease: easeOutExpo }}
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]"
            >
              {t('hero.title')}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
            >
              {t('hero.description')}
            </motion.p>
          </motion.section>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mx-auto mb-16">
            <p className="text-lg text-slate-600 leading-relaxed text-center">
              {t('body')}
            </p>
          </motion.div>

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
                    {t('mockSite.urlBar')}
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
                    <span className="font-semibold text-sm text-slate-900">{t('mockSite.brandName')}</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-6 text-xs text-slate-500">
                    {mockNavLinks.map((link) => (
                      <span key={link}>{link}</span>
                    ))}
                  </div>
                  <div className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg">
                    {t('mockSite.bookButton')}
                  </div>
                </div>

                {/* Mock hero */}
                <div className="bg-gradient-to-br from-blue-50 to-slate-50 px-6 py-10 md:py-14 text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                    {t('mockSite.brandName')}
                  </h2>
                  <p className="text-sm text-slate-500">{t('mockSite.tagline')}</p>
                </div>

                {/* Mock service cards */}
                <div className="grid grid-cols-3 gap-3 md:gap-4 px-4 md:px-6 py-6 md:py-8">
                  {mockServices.map((svc, i) => (
                    <div
                      key={svc.name}
                      className={`rounded-xl border p-3 md:p-4 text-center ${serviceColors[i]}`}
                    >
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white mx-auto mb-2 md:mb-3" />
                      <p className="text-xs md:text-sm font-medium text-slate-800">{svc.name}</p>
                    </div>
                  ))}
                </div>

                {/* Mock book button */}
                <div className="flex justify-center pb-8">
                  <div className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-full shadow-md shadow-blue-200">
                    {t('mockSite.bookButton')}
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
              {t('caption.prefix')}<span className="italic text-slate-600">{t('caption.prompt')}</span>
              {t('caption.suffix')}
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
            {benefits.map((card, i) => {
              const Icon = benefitIcons[i];
              return (
                <motion.div
                  key={card.title}
                  variants={fadeUp}
                  transition={{ duration: 0.5 }}
                  className={`rounded-2xl border p-6 ${benefitAccents[i]}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm mb-4">
                    <Icon size={22} className={benefitIconColors[i]} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{card.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{card.body}</p>
                </motion.div>
              );
            })}
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
              {t('widgetsLabel')}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {widgets.map((w, i) => {
                const Icon = widgetIcons[i];
                return (
                  <motion.div
                    key={w.label}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 bg-blue-50 text-blue-700 rounded-lg px-3 py-2 text-sm font-medium"
                  >
                    <Icon size={15} />
                    {w.label}
                  </motion.div>
                );
              })}
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
                <h3 className="text-lg font-semibold leading-snug">{t('scenario.heading')}</h3>
              </div>
              <p className="text-slate-300 leading-relaxed text-base md:text-lg max-w-3xl">
                {t('scenario.body')}
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
              {t('cta.heading')}
            </h2>

            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="mt-6 inline-flex items-center gap-2 px-8 py-3 bg-slate-900 text-white text-sm font-medium rounded-full shadow-md hover:bg-slate-800 transition-colors"
              >
                {t('cta.button')}
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
