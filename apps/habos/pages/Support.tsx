import React, { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Mail, Clock, ChevronDown,
  Zap, Users, CreditCard, Shield, Smartphone,
  Bot, Wrench, CalendarCheck,
} from 'lucide-react';
import { Navbar } from '@li/shared/components/Navbar';
import { Footer } from '../components/Footer';

// ── FAQ category config ──

const FAQ_CATEGORIES = [
  { key: 'gettingStarted', icon: <Zap size={16} />, color: 'bg-indigo-50 text-indigo-600' },
  { key: 'operations',     icon: <Wrench size={16} />, color: 'bg-amber-50 text-amber-600' },
  { key: 'scheduling',     icon: <CalendarCheck size={16} />, color: 'bg-sky-50 text-sky-600' },
  { key: 'ai',             icon: <Bot size={16} />, color: 'bg-violet-50 text-violet-600' },
  { key: 'team',           icon: <Users size={16} />, color: 'bg-emerald-50 text-emerald-600' },
  { key: 'billing',        icon: <CreditCard size={16} />, color: 'bg-rose-50 text-rose-600' },
  { key: 'security',       icon: <Shield size={16} />, color: 'bg-slate-100 text-slate-600' },
  { key: 'mobile',         icon: <Smartphone size={16} />, color: 'bg-cyan-50 text-cyan-600' },
] as const;

// ── Accordion item ──

const AccordionItem = ({ question, answer, isOpen, onToggle }: {
  question: string;
  answer: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}) => (
  <div className="border-b border-slate-100 last:border-0">
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full text-left py-4 px-1 group"
    >
      <span className="font-medium text-sm text-slate-900 pr-4">{question}</span>
      <ChevronDown
        size={16}
        className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
    <motion.div
      initial={false}
      animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div className="pb-4 px-1 text-sm text-slate-600 leading-relaxed">
        {answer}
      </div>
    </motion.div>
  </div>
);

// ── Page ──

const Support = () => {
  const { t } = useTranslation('support');
  const [activeCategory, setActiveCategory] = useState('gettingStarted');
  const [openItem, setOpenItem] = useState<string | null>(null);

  // Get items for active category
  const items: { question: string; answer: React.ReactNode }[] = [];
  for (let i = 0; i < 10; i++) {
    const q = t(`faq.categories.${activeCategory}.items.${i}.question`, { defaultValue: '' });
    if (!q) break;

    const key = `faq.categories.${activeCategory}.items.${i}.answer`;
    const raw = t(key, { defaultValue: '' });
    // If answer contains component markers, use Trans
    const hasComponents = raw.includes('<email>') || raw.includes('<privacy>') || raw.includes('<refund>');
    const answer = hasComponents ? (
      <Trans
        i18nKey={key}
        t={t}
        components={{
          email: <a href="mailto:hello@habos.ai" className="text-blue-600 hover:underline" />,
          privacy: <Link to="/Privacy" className="text-blue-600 hover:underline" />,
          refund: <Link to="/legal#refund" className="text-blue-600 hover:underline" />,
        }}
      />
    ) : raw;

    items.push({ question: q, answer });
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-serif text-slate-900 mb-4">{t('hero.heading')}</h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            {t('hero.description')}
          </p>
        </motion.div>

        {/* Contact cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16"
        >
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-start gap-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
              <Mail size={18} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900 text-sm mb-1">{t('contact.email.label')}</h3>
              <a href={`mailto:${t('contact.email.address')}`} className="text-blue-600 hover:underline text-sm">
                {t('contact.email.address')}
              </a>
              <p className="text-slate-500 text-xs mt-1">{t('contact.email.note')}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-start gap-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
              <Clock size={18} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900 text-sm mb-1">{t('contact.responseTime.label')}</h3>
              <p className="text-slate-700 text-sm">{t('contact.responseTime.value')}</p>
              <p className="text-slate-500 text-xs mt-1">{t('contact.responseTime.note')}</p>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-16"
        >
          <h2 className="text-xl font-serif text-slate-900 mb-6">{t('faq.heading')}</h2>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {FAQ_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => { setActiveCategory(cat.key); setOpenItem(null); }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  <span className={isActive ? '' : cat.color.split(' ')[1]}>{cat.icon}</span>
                  {t(`faq.categories.${cat.key}.label`)}
                </button>
              );
            })}
          </div>

          {/* FAQ list */}
          <div className="bg-white rounded-2xl border border-slate-200 px-6">
            {items.map((item, i) => (
              <AccordionItem
                key={`${activeCategory}-${i}`}
                question={item.question}
                answer={item.answer}
                isOpen={openItem === `${activeCategory}-${i}`}
                onToggle={() => setOpenItem(openItem === `${activeCategory}-${i}` ? null : `${activeCategory}-${i}`)}
              />
            ))}
          </div>
        </motion.div>

        {/* Company Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="border-t border-slate-200 pt-12"
        >
          <h2 className="text-xl font-serif text-slate-900 mb-6">{t('company.heading')}</h2>
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
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

      <Footer />
    </div>
  );
};

export default Support;
