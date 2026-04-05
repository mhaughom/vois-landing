import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Navbar } from '@li/shared/components/Navbar';
import {
  ArrowLeft,
  ArrowRight,
  Phone,
  PhoneIncoming,
  MessageSquare,
  FileAudio,
  ShieldCheck,
  ChevronDown,
  Calendar,
  Ticket,
  Bell,
  Send,
  Search,
  Lock,
  Cpu,
  Zap,
  Radio,
} from 'lucide-react';
import { Footer } from '../../components/Footer';

/* ── animation helpers ─────────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.10 } },
};

const stepStagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

/* ── page component ────────────────────────────────────────────────────── */

const Telephony: React.FC = () => {
  const { t } = useTranslation('work-telephony');

  interface CallStep {
    label: string;
  }

  const callSteps = t('callFlow.steps', { returnObjects: true }) as CallStep[];
  const techStrip = t('techStrip', { returnObjects: true }) as string[];

  const callStepIcons = [
    <PhoneIncoming size={15} className="text-emerald-600" />,
    <Cpu size={15} className="text-emerald-600" />,
    <Phone size={15} className="text-slate-500" />,
    <Calendar size={15} className="text-emerald-600" />,
    <Cpu size={15} className="text-emerald-600" />,
  ];

  const techStripIcons = [
    <Radio size={14} />,
    <Zap size={14} />,
    <Cpu size={14} />,
    <Lock size={14} />,
    <Search size={14} />,
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

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
              <span className="inline-block px-4 py-1.5 bg-emerald-500/10 text-emerald-700 rounded-full text-sm font-medium mb-6">
                {t('badge')}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6, ease: easeOutExpo }}
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]"
            >
              {t('hero.title').split('\n').map((line, i, arr) => (
                <React.Fragment key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </React.Fragment>
              ))}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6, ease: easeOutExpo }}
              className="text-lg md:text-xl text-slate-500 max-w-2xl leading-relaxed"
            >
              {t('hero.description')}
            </motion.p>
          </motion.section>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mb-16">
            <p className="text-lg text-slate-600 leading-relaxed">
              {t('body')}
            </p>
          </motion.div>

          {/* ── 2. Mock Call Flow ─────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: easeOutExpo }}
            className="mb-20"
          >
            <div className="bg-emerald-50/50 rounded-3xl p-6 md:p-8">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={stepStagger}
                className="space-y-1"
              >
                {callSteps.map((step, i) => (
                  <React.Fragment key={i}>
                    <motion.div
                      variants={fadeUp}
                      transition={{ duration: 0.45, ease: easeOutExpo }}
                      className="bg-white rounded-lg p-3 border border-slate-100 flex items-start gap-3"
                    >
                      <div className="flex-shrink-0 mt-0.5">{callStepIcons[i]}</div>
                      <p className="text-sm text-slate-700 leading-snug">{step.label}</p>
                    </motion.div>
                    {i < callSteps.length - 1 && (
                      <div className="flex justify-center py-0.5">
                        <ChevronDown size={14} className="text-emerald-400" />
                      </div>
                    )}
                  </React.Fragment>
                ))}

                {/* Arrow into result */}
                <div className="flex justify-center py-0.5">
                  <ChevronDown size={14} className="text-emerald-400" />
                </div>

                {/* Result card */}
                <motion.div
                  variants={fadeUp}
                  transition={{ duration: 0.5, ease: easeOutExpo }}
                  className="bg-emerald-600 text-white rounded-lg p-4 border border-emerald-700"
                >
                  <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} /> {t('callFlow.resultItems.booking')}
                    </span>
                    <span className="text-emerald-300">&middot;</span>
                    <span className="flex items-center gap-1.5">
                      <Ticket size={14} /> {t('callFlow.resultItems.ticket')}
                    </span>
                    <span className="text-emerald-300">&middot;</span>
                    <span className="flex items-center gap-1.5">
                      <Bell size={14} /> {t('callFlow.resultItems.notify')}
                    </span>
                    <span className="text-emerald-300">&middot;</span>
                    <span className="flex items-center gap-1.5">
                      <Send size={14} /> {t('callFlow.resultItems.sms')}
                    </span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Explanation */}
              <p className="text-sm text-slate-500 mt-6 leading-relaxed text-center max-w-xl mx-auto">
                {t('callFlow.caption')}
              </p>
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
                icon: <MessageSquare size={22} className="text-emerald-600" />,
                title: t('benefits.sms.title'),
                body: t('benefits.sms.body'),
                accent: 'bg-emerald-50 border-emerald-100',
              },
              {
                icon: <FileAudio size={22} className="text-blue-600" />,
                title: t('benefits.recording.title'),
                body: t('benefits.recording.body'),
                accent: 'bg-blue-50 border-blue-100',
              },
              {
                icon: <ShieldCheck size={22} className="text-amber-600" />,
                title: t('benefits.approval.title'),
                body: t('benefits.approval.body'),
                accent: 'bg-amber-50 border-amber-100',
              },
            ].map((card) => (
              <motion.div
                key={card.title}
                variants={fadeUp}
                transition={{ duration: 0.5, ease: easeOutExpo }}
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

          {/* ── 4. Scenario Callout ───────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: easeOutExpo }}
            className="mb-20"
          >
            <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12">
              <p className="text-lg md:text-xl leading-relaxed text-slate-200">
                {t('scenario')}
              </p>
            </div>
          </motion.section>

          {/* ── 5. Tech Strip ─────────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
            className="mb-20"
          >
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 px-6 py-5 bg-slate-50 rounded-2xl">
              {techStrip.map((label, i) => (
                <span key={label} className="flex items-center gap-1.5 text-sm text-slate-600">
                  <span className="text-slate-400">{techStripIcons[i]}</span>
                  {label}
                </span>
              ))}
            </div>
          </motion.section>

          {/* ── 6. Closing ────────────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-serif font-medium text-slate-900 mb-4">
              {t('closing.title').split('\n').map((line, i, arr) => (
                <React.Fragment key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </React.Fragment>
              ))}
            </h2>

            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="mt-6 inline-flex items-center gap-2 px-8 py-3 bg-slate-900 text-white text-sm font-medium rounded-full shadow-md hover:bg-slate-800 transition-colors"
              >
                {t('closing.cta')}
                <ArrowRight size={16} />
              </motion.button>
            </a>
          </motion.section>
        </div>
      </main>
    <Footer />
    </div>
  );
};

export default Telephony;
