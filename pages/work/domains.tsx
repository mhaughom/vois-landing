import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar';
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  Check,
  Shield,
  Mail,
  Lock,
} from 'lucide-react';

/* -- animation helpers --------------------------------------------------- */

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

/* -- benefit cards data -------------------------------------------------- */

const benefits = [
  {
    title: 'Domain + email + SSL',
    desc: 'No separate domain registrar, email provider, and SSL certificate. Everything configured in one place, one dashboard, one bill.',
  },
  {
    title: 'Professional email',
    desc: 'Send emails from your domain \u2014 invoices, confirmations, marketing. Not from noreply@some-platform.com. Your brand, everywhere.',
  },
  {
    title: 'Enterprise infrastructure',
    desc: "Cloudflare\u2019s global edge network serves your site. Enterprise-grade DDoS protection, CDN, and SSL certificate management included.",
  },
] as const;

/* -- tech strip items ---------------------------------------------------- */

const techItems = [
  'Cloudflare Workers',
  'Auto SSL provisioning',
  'Workspace email routing',
  'DNS verification',
  'Global CDN',
] as const;

/* -- domain setup rows --------------------------------------------------- */

const domainRows = [
  { label: 'Website', value: 'hendersonplumbing.com' },
  { label: 'Email', value: 'mike@hendersonplumbing.com' },
  { label: 'Booking', value: 'hendersonplumbing.com/book' },
] as const;

/* -- component ----------------------------------------------------------- */

const Domains: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* --- Content --- */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* 1. Hero */}
          <motion.section {...fadeUp()} className="max-w-3xl mx-auto text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-500/10 text-slate-700 rounded-full text-sm font-medium mb-6">
              <Globe size={14} />
              Custom Domains
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]">
              Your Domain. Your Email.<br />One Setup.
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
              Connect your custom domain, get workspace email addresses, and automatic SSL &mdash;
              all backed by Cloudflare&rsquo;s enterprise infrastructure.
            </p>
          </motion.section>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mx-auto mb-16 text-center">
            <p className="text-lg text-slate-600 leading-relaxed">
              One domain purchase gives you a website, email addresses for your team, and a complete email system with deliverability tracking, bounce and complaint handling, and AI reply suggestions — all managed from one settings page. Cloudflare auto-provisions SSL and custom hostnames. AWS SES handles email identity with DKIM for authenticated sending. Inbound email routes through receipt rules to the HABOS mail system where it's parsed, threaded, and searchable.
            </p>
          </motion.div>

          {/* 2. Mock domain setup card */}
          <motion.section {...fadeUp(0.1)} className="mb-20">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl max-w-lg mx-auto">
              {/* Domain name */}
              <p className="font-mono text-lg text-slate-900 font-semibold mb-5">
                hendersonplumbing.com
              </p>

              {/* Status badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200">
                  Domain <Check size={12} /> Connected
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200">
                  SSL <Check size={12} /> Active
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200">
                  Email <Check size={12} /> Configured
                </span>
              </div>

              {/* Configuration list */}
              <div className="space-y-3 mb-6">
                {domainRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-green-600" />
                    </div>
                    <span className="text-slate-400 w-16 flex-shrink-0">{row.label}</span>
                    <span className="text-slate-400">&rarr;</span>
                    <span className="font-mono text-slate-700">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-100 mb-4" />

              {/* Annotation */}
              <p className="text-xs text-slate-400 leading-relaxed">
                DNS propagation typically completes in under 5 minutes with Cloudflare.
              </p>
            </div>
          </motion.section>

          {/* 3. Three benefit cards */}
          <motion.section {...fadeUp(0.2)} className="mb-20">
            <div className="grid md:grid-cols-3 gap-5">
              {benefits.map((b, i) => {
                const icons = [Lock, Mail, Shield];
                const Icon = icons[i];
                return (
                  <div
                    key={b.title}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
                  >
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-4 border border-slate-100">
                      <Icon size={20} className="text-slate-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-3">{b.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
                  </div>
                );
              })}
            </div>
          </motion.section>

          {/* 4. Before / After */}
          <motion.section {...fadeUp(0.3)} className="mb-20">
            <div className="grid md:grid-cols-2 gap-5">
              {/* Without HABOS */}
              <div className="bg-slate-100 rounded-2xl p-6 md:p-8">
                <h3 className="font-semibold text-slate-700 mb-4">Without HABOS</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Buy domain ($12/yr). Set up DNS. Get SSL cert. Configure email hosting ($6/mo).
                  Point everything. Pray it works. Debug DNS propagation.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-200 text-slate-600 rounded-full text-xs font-semibold">
                  3 services, 2+ hours setup
                </div>
              </div>

              {/* With HABOS */}
              <div className="bg-slate-50 rounded-2xl p-6 md:p-8 border border-slate-300">
                <h3 className="font-semibold text-slate-900 mb-4">With HABOS</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Enter your domain. Add DNS records. Done. Email, SSL, and website routing
                  configured automatically.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-200/60 text-slate-700 rounded-full text-xs font-semibold">
                  1 service, 5 minutes
                </div>
              </div>
            </div>
          </motion.section>

          {/* 5. Tech strip */}
          <motion.section {...fadeUp(0.4)} className="mb-20">
            <div className="bg-slate-100 border border-slate-200 rounded-2xl px-8 py-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-700">
              {techItems.map((item, i) => (
                <React.Fragment key={item}>
                  {i > 0 && <span className="text-slate-300">&middot;</span>}
                  <span>{item}</span>
                </React.Fragment>
              ))}
            </div>
          </motion.section>

          {/* 6. Closing CTA */}
          <motion.section {...fadeUp(0.5)} className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-slate-900 mb-5 leading-tight">
              Other platforms make you manage 3 services.<br />
              HABOS handles it all.
            </h2>
            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-full font-medium text-sm shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-colors"
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

export default Domains;
