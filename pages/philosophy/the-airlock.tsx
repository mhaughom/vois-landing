import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Wifi, Server, WifiOff, ShieldCheck } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { useTranslation } from 'react-i18next';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const TheAirlock: React.FC = () => {
  const { t } = useTranslation('philosophy-airlock');
  const comparison = t('comparison', { returnObjects: true }) as Array<{ action: string; auto: string; airlock: string }>;
  const deploymentOptions = t('deploymentOptions', { returnObjects: true }) as Array<{ title: string; body: string; badges: string[] }>;
  const securityItems = t('securityItems', { returnObjects: true }) as Array<{ title: string; body: string }>;

  const securityColors = ['text-amber-500', 'text-emerald-500', 'text-blue-500', 'text-violet-500'];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          {/* Hero text */}
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">{t('category')}</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-4 leading-tight">
              {t('title')}
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-12">
              {t('tagline')}
            </p>
          </motion.div>

          <motion.img
            src="/philosophy/the-airlock.jpg"
            alt={t('heroAlt')}
            className="w-full rounded-2xl mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          />

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-slate prose-lg max-w-none"
          >
            <h2 className="text-2xl font-serif text-slate-900 mt-0">{t('section1.heading')}</h2>
            <p>{t('section1.body1')}</p>
            <p>{t('section1.body2')}</p>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">{t('section2.heading')}</h2>

            {/* Comparison table */}
            <div className="not-prose my-10">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 pr-4 font-semibold text-slate-900">{t('tableHeaders.action')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-red-600">{t('tableHeaders.auto')}</th>
                      <th className="text-left py-3 pl-4 font-semibold text-emerald-600">{t('tableHeaders.airlock')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((row) => (
                      <tr key={row.action} className="border-b border-slate-100">
                        <td className="py-4 pr-4 font-medium text-slate-900 align-top whitespace-nowrap">{row.action}</td>
                        <td className="py-4 px-4 text-slate-500 align-top">{row.auto}</td>
                        <td className="py-4 pl-4 text-slate-700 align-top">{row.airlock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">{t('section3.heading')}</h2>
            <p>{t('section3.body')}</p>

            <blockquote className="border-l-4 border-slate-900 pl-6 my-12 text-xl font-serif italic text-slate-700">
              {t('quote')}
            </blockquote>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">{t('section4.heading')}</h2>
            <p>{t('section4.body')}</p>

            {/* Deployment options */}
            <div className="not-prose my-10 grid md:grid-cols-3 gap-5">
              {deploymentOptions.map((opt, i) => {
                const iconProps = { size: 18 };
                const iconWrapperColors = ['bg-blue-100', 'bg-emerald-100', 'bg-violet-100'];
                const iconColors = ['text-blue-600', 'text-emerald-600', 'text-violet-600'];
                const icons = [
                  <Wifi {...iconProps} className={iconColors[0]} />,
                  <Server {...iconProps} className={iconColors[1]} />,
                  <WifiOff {...iconProps} className={iconColors[2]} />,
                ];
                return (
                  <div key={opt.title} className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                    <div className={`w-10 h-10 rounded-xl ${iconWrapperColors[i]} flex items-center justify-center mb-4`}>
                      {icons[i]}
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm mb-2">{opt.title}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed mb-3">{opt.body}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {opt.badges.map((badge) => (
                        <span key={badge} className="text-[10px] px-2 py-1 rounded-full bg-slate-200 text-slate-600">{badge}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">{t('section5.heading')}</h2>
            <div className="not-prose my-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {securityItems.map((item, i) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <ShieldCheck size={16} className={`${securityColors[i]} mt-1 flex-shrink-0`} />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-500">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-20 pt-12 border-t border-slate-100 flex justify-end"
          >
            <a href="/philosophy/everything-in-one-place" className="group flex items-center gap-3 text-right">
              <div>
                <p className="text-sm text-slate-400 mb-1">{t('nav.nextLabel')}</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">{t('nav.nextTitle')}</p>
              </div>
              <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default TheAirlock;
