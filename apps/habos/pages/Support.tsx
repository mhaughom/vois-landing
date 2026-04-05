import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle, Clock, HelpCircle, RefreshCw, CreditCard, Smartphone, Shield } from 'lucide-react';

const Support = () => {
  const { t } = useTranslation('support');

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 h-16">
            <Link
              to="/"
              className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors flex-shrink-0"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="flex items-center gap-2.5 bg-slate-100 rounded-full pl-1.5 pr-4 py-1.5">
              <img src="/Logo/habos-icon.svg" alt={t('nav.logoAlt')} className="h-6 w-6" />
              <span className="font-semibold text-sm text-slate-900">{t('nav.title')}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl md:text-4xl font-serif text-slate-900 mb-4">{t('hero.heading')}</h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            {t('hero.description')}
          </p>
        </motion.div>

        {/* Contact Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-slate-50 rounded-2xl p-8 mb-16"
        >
          <h2 className="text-xl font-serif text-slate-900 mb-6">{t('contact.heading')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 border border-slate-200">
                <Mail size={18} className="text-slate-700" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900 text-sm mb-1">{t('contact.email.label')}</h3>
                <a href={`mailto:${t('contact.email.address')}`} className="text-blue-600 hover:underline text-sm">
                  {t('contact.email.address')}
                </a>
                <p className="text-slate-500 text-xs mt-1">{t('contact.email.note')}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 border border-slate-200">
                <Clock size={18} className="text-slate-700" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900 text-sm mb-1">{t('contact.responseTime.label')}</h3>
                <p className="text-slate-700 text-sm">{t('contact.responseTime.value')}</p>
                <p className="text-slate-500 text-xs mt-1">{t('contact.responseTime.note')}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-xl font-serif text-slate-900 mb-8">{t('faq.heading')}</h2>
          <div className="space-y-4">
            <FAQItem
              icon={<HelpCircle size={18} />}
              question={t('faq.items.0.question')}
              answer={t('faq.items.0.answer')}
            />
            <FAQItem
              icon={<Smartphone size={18} />}
              question={t('faq.items.1.question')}
              answer={t('faq.items.1.answer')}
            />
            <FAQItem
              icon={<CreditCard size={18} />}
              question={t('faq.items.2.question')}
              answer={t('faq.items.2.answer')}
            />
            <FAQItem
              icon={<RefreshCw size={18} />}
              question={t('faq.items.3.question')}
              answer={t('faq.items.3.answer')}
            />
            <FAQItem
              icon={<CreditCard size={18} />}
              question={t('faq.items.4.question')}
              answer={<Trans i18nKey="faq.items.4.answer" t={t} components={{ email: <a href="mailto:hello@habos.ai" className="text-blue-600 hover:underline" />, refund: <Link to="/legal#refund" className="text-blue-600 hover:underline" /> }} />}
            />
            <FAQItem
              icon={<Shield size={18} />}
              question={t('faq.items.5.question')}
              answer={<Trans i18nKey="faq.items.5.answer" t={t} components={{ privacy: <Link to="/Privacy" className="text-blue-600 hover:underline" /> }} />}
            />
            <FAQItem
              icon={<MessageCircle size={18} />}
              question={t('faq.items.6.question')}
              answer={<Trans i18nKey="faq.items.6.answer" t={t} components={{ email: <a href="mailto:hello@habos.ai" className="text-blue-600 hover:underline" /> }} />}
            />
          </div>
        </motion.div>

        {/* Company Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="border-t border-slate-200 pt-12"
        >
          <h2 className="text-xl font-serif text-slate-900 mb-6">{t('company.heading')}</h2>
          <div className="bg-slate-50 rounded-2xl p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-slate-600">
              <div className="space-y-2">
                <p><span className="font-medium text-slate-900">{t('company.companyLabel')}:</span> {t('company.companyValue')}</p>
                <p><span className="font-medium text-slate-900">{t('company.orgLabel')}:</span> {t('company.orgValue')}</p>
                <p><span className="font-medium text-slate-900">{t('company.locationLabel')}:</span> {t('company.locationValue')}</p>
              </div>
              <div className="space-y-2">
                <p><span className="font-medium text-slate-900">{t('company.emailLabel')}:</span> <a href={`mailto:${t('company.emailValue')}`} className="text-blue-600 hover:underline">{t('company.emailValue')}</a></p>
                <p><span className="font-medium text-slate-900">{t('company.websiteLabel')}:</span> <a href="https://habos.ai" className="text-blue-600 hover:underline">{t('company.websiteValue')}</a></p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} {t('footer.copyright')}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <Link to="/Privacy" className="hover:text-slate-900 transition-colors">{t('footer.privacyPolicy')}</Link>
              <span>&middot;</span>
              <Link to="/Terms" className="hover:text-slate-900 transition-colors">{t('footer.termsOfService')}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FAQItem = ({ icon, question, answer }: { icon: React.ReactNode; question: string; answer: React.ReactNode }) => (
  <details className="group">
    <summary className="flex items-center gap-3 cursor-pointer bg-slate-50 hover:bg-slate-100 rounded-xl px-5 py-4 transition-colors">
      <span className="text-slate-400 group-open:text-slate-700 transition-colors shrink-0">{icon}</span>
      <span className="font-medium text-slate-900 text-sm flex-1">{question}</span>
      <svg
        className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </summary>
    <div className="px-5 pb-4 pt-2 ml-8 text-sm text-slate-600 leading-relaxed">
      {answer}
    </div>
  </details>
);

export default Support;
