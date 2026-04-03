import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar';
import {
  ArrowLeft,
  LayoutGrid,
  ShieldCheck,
  OctagonX,
  Layers,
  CheckCircle2,
  ArrowDown,
  Clock,
  MessageSquare,
  Mail,
  Zap,
} from 'lucide-react';

/* ── animation helpers ─────────────────────────────────────────────────── */

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

/* ── benefit cards data ────────────────────────────────────────────────── */

const benefits = [
  {
    icon: ShieldCheck,
    title: 'Consent-first',
    desc: 'Email and SMS gated by explicit consent. STOP keywords revoke globally. First operational message has legal safe harbor \u2014 follow-ups require opt-in.',
  },
  {
    icon: OctagonX,
    title: 'Smart stop rules',
    desc: 'Funnels auto-stop when the lead replies (SMS or email), reaches a terminal CRM stage (won/lost/booked), or unsubscribes. No over-contacting.',
  },
  {
    icon: Layers,
    title: '7 strategies built in',
    desc: 'Warm lead follow-up, cold B2B outreach, form nurture, booking reminders, reactivation, customer upsell, and custom. Each fine-tuned for its use case.',
  },
];

/* ── tech strip items ─────────────────────────────────────────────────── */

const techItems = [
  'Psychology-backed messaging',
  'Quiet hours + timezone',
  'Inbound reply detection',
  'CRM stage sync',
  'Multi-step orchestration',
];

/* ── component ─────────────────────────────────────────────────────────── */

const Funnels: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ─── Content ─── */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ━━━ 1. Hero ━━━ */}
          <motion.section {...fadeUp()} className="max-w-3xl mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-700 rounded-full text-sm font-medium mb-6">
              <LayoutGrid size={14} />
              Marketing Automation
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]">
              Leads Come In.<br />
              Revenue Comes Out.
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-2xl">
              Form submission &rarr; AI-generated nurture sequence &rarr; SMS and email &rarr; booking or sale.
              Psychology-backed, consent-first, and smart enough to stop when the lead responds.
            </p>
          </motion.section>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mb-16">
            <p className="text-lg text-slate-600 leading-relaxed">
              When a form submission arrives, leads automatically flow into AI-generated nurture sequences. All content follows a proven four-step persuasion framework: personalization, authority with specific numbers, a quantified offer with risk reversal, and a specific call to action. Funnels auto-stop when the lead replies, reaches a terminal CRM stage, or unsubscribes — preventing over-contact. Email and SMS sends are gated by explicit consent, with STOP keywords revoking globally.
            </p>
          </motion.div>

          {/* ━━━ 2. Mock funnel flow ━━━ */}
          <motion.section {...fadeUp(0.15)} className="mb-20">
            <div className="bg-amber-50/50 rounded-3xl p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-6">
                Nurture Sequence
              </p>

              {/* Flow visualization */}
              <div className="flex flex-col items-center max-w-lg mx-auto">

                {/* Step 1 — Form submitted */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                  className="w-full"
                >
                  <div className="bg-slate-200/80 rounded-full px-5 py-3 text-center">
                    <span className="text-sm font-medium text-slate-600">Form submitted</span>
                  </div>
                </motion.div>

                {/* Arrow */}
                <div className="flex flex-col items-center py-2">
                  <div className="w-px h-4 bg-slate-300" />
                  <ArrowDown size={14} className="text-slate-400 -mt-0.5" />
                </div>

                {/* Step 2 — Welcome SMS */}
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                  className="w-full"
                >
                  <div className="bg-amber-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare size={14} className="text-amber-700" />
                      <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Instant: Welcome SMS</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed italic">
                      &ldquo;Hi Sarah, thanks for your inquiry about our HVAC services! I&rsquo;m Mike from Henderson...&rdquo;
                    </p>
                  </div>
                </motion.div>

                {/* Arrow + wait label */}
                <div className="flex flex-col items-center py-2">
                  <div className="w-px h-3 bg-slate-300" />
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1 my-1">
                    <Clock size={11} className="text-slate-400" />
                    <span className="text-[11px] text-slate-500 font-medium">Wait 2 hours</span>
                  </div>
                  <div className="w-px h-1 bg-slate-300" />
                  <ArrowDown size={14} className="text-slate-400 -mt-0.5" />
                </div>

                {/* Step 3 — Email: Authority + proof */}
                <motion.div
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                  className="w-full"
                >
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail size={14} className="text-slate-500" />
                      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Email: Authority + proof</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed italic">
                      &ldquo;Subject: 94% of our customers save $200+ on energy bills...&rdquo;
                    </p>
                  </div>
                </motion.div>

                {/* Arrow + wait label */}
                <div className="flex flex-col items-center py-2">
                  <div className="w-px h-3 bg-slate-300" />
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1 my-1">
                    <Clock size={11} className="text-slate-400" />
                    <span className="text-[11px] text-slate-500 font-medium">Wait 1 day</span>
                  </div>
                  <div className="w-px h-1 bg-slate-300" />
                  <ArrowDown size={14} className="text-slate-400 -mt-0.5" />
                </div>

                {/* Step 4 — SMS: Offer + CTA */}
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.65, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                  className="w-full"
                >
                  <div className="bg-amber-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare size={14} className="text-amber-700" />
                      <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">SMS: Offer + CTA</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed italic">
                      &ldquo;Spring special: $99 AC tune-up (regular $149). Book before Friday &rarr; habos.app/s/henderson-ac&rdquo;
                    </p>
                  </div>
                </motion.div>

                {/* Arrow */}
                <div className="flex flex-col items-center py-2">
                  <div className="w-px h-4 bg-slate-300" />
                  <ArrowDown size={14} className="text-slate-400 -mt-0.5" />
                </div>

                {/* Step 5 — Auto-stop */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                  className="w-full"
                >
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start gap-3">
                    <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-emerald-700">Auto-stop</span>
                      <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                        Lead replied / booked / won &rarr; sequence stops automatically
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Summary line */}
              <p className="text-sm text-slate-500 mt-8 leading-relaxed text-center max-w-lg mx-auto">
                4-step persuasion framework: <span className="font-medium text-slate-700">Personalization &rarr; Authority &rarr; Offer &rarr; CTA.</span>{' '}
                7 preset strategies ready to deploy.
              </p>
            </div>
          </motion.section>

          {/* ━━━ 3. Three benefit cards ━━━ */}
          <motion.section {...fadeUp(0.25)} className="mb-20">
            <div className="grid md:grid-cols-3 gap-4">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="bg-white border border-slate-200 rounded-2xl p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
                      <b.icon size={18} className="text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">{b.title}</h3>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ━━━ 4. Before/After ━━━ */}
          <motion.section {...fadeUp(0.35)} className="mb-20">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Without HABOS */}
              <div className="bg-slate-100 rounded-3xl p-6 md:p-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
                  Without HABOS
                </p>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Lead fills out form. You see it 3 hours later. Draft an email. Send it. Wait.
                  Follow up manually. Forget about 40% of leads.
                </p>
                <div className="flex items-center gap-2 bg-white/80 rounded-full px-4 py-2 w-fit">
                  <Clock size={14} className="text-slate-400" />
                  <span className="text-sm font-medium text-slate-500">Average response time: 3+ hours</span>
                </div>
              </div>

              {/* With HABOS */}
              <div className="bg-amber-50 rounded-3xl p-6 md:p-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-4">
                  With HABOS
                </p>
                <p className="text-slate-700 leading-relaxed mb-6">
                  Lead fills out form. Instant welcome SMS. Authority email 2 hours later.
                  Offer next day. If they reply or book &mdash; sequence stops.
                </p>
                <div className="flex items-center gap-2 bg-white/80 rounded-full px-4 py-2 w-fit">
                  <Zap size={14} className="text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">Response time: instant</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* ━━━ 5. Tech strip ━━━ */}
          <motion.section {...fadeUp(0.45)} className="mb-20">
            <div className="bg-slate-950 rounded-2xl py-5 px-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
              {techItems.map((item, i) => (
                <React.Fragment key={item}>
                  {i > 0 && <span className="text-slate-600">&middot;</span>}
                  <span>{item}</span>
                </React.Fragment>
              ))}
            </div>
          </motion.section>

          {/* ━━━ 6. Closing CTA ━━━ */}
          <motion.section {...fadeUp(0.55)} className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-slate-900 mb-5 leading-tight">
              Other automation tools send messages.<br />
              HABOS nurtures relationships.
            </h2>
            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 px-8 py-3.5 bg-amber-600 text-white rounded-full font-medium text-sm shadow-lg shadow-amber-600/20 hover:bg-amber-700 transition-colors"
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

export default Funnels;
