import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, ExternalLink } from 'lucide-react';
import { Analytics } from '../lib/analytics';

const Success = () => {
  const { t } = useTranslation('success');
  const [searchParams] = useSearchParams();
  const steps = t('steps', { returnObjects: true }) as string[];

  useEffect(() => {
    Analytics.pageView('success');
    Analytics.checkoutCompleted();

    const email = searchParams.get('email');
    const plan = searchParams.get('plan') || 'unknown';
    if (email) {
      Analytics.identifyUser(email, { plan });
    }
  }, [searchParams]);

  return (
    <div
      className="fixed inset-0 min-h-screen flex items-center justify-center px-6 py-12"
      style={{ zIndex: 9999, pointerEvents: 'all', isolation: 'isolate' }}
    >
      <div className="absolute inset-0 bg-white" />
      <div className="absolute inset-0 bg-[#FAFAFA]" />
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-slate-100 p-8 md:p-10">
          {/* Logo */}
          <Link to="/" className="flex justify-center mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
            >
              <img src="/Logo/vois-logo.svg" alt={t('logoAlt')} className="h-12 w-12" />
            </motion.div>
          </Link>

          {/* Headline */}
          <h1 className="text-2xl md:text-3xl font-serif text-slate-900 text-center mb-2">
            {t('headline')}
          </h1>
          <p className="text-slate-400 text-center text-sm mb-8">
            {t('subtitle')}
          </p>

          {/* Next Steps */}
          <div className="space-y-4 mb-8">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">{t('nextStepsHeading')}</h3>
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 text-slate-600 text-sm">
                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={12} className="text-emerald-500" />
                </div>
                <span>{step}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => Analytics.externalLinkClicked('app_store')}
              className="flex items-center justify-center gap-2 w-full bg-black text-white py-4 rounded-full text-base font-medium hover:bg-slate-900 transition-colors"
            >
              {t('downloadButton')}
              <ExternalLink size={16} />
            </a>
            <a
              href="https://discord.gg"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => Analytics.externalLinkClicked('discord')}
              className="flex items-center justify-center gap-2 w-full bg-white text-slate-900 py-4 rounded-full text-base font-medium border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              {t('discordButton')}
              <ExternalLink size={16} />
            </a>
          </div>
        </div>

        {/* Back to home */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-slate-500 text-sm mt-8"
        >
          <Link
            to="/"
            className="text-slate-900 font-medium hover:underline underline-offset-4 transition-all"
          >
            {t('backToHome')}
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Success;
