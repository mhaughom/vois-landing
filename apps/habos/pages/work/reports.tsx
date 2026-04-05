import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, FileText, Mic, Clock, CheckSquare } from 'lucide-react';
import ReportsDemo from './features/ReportsDemo';
import { Navbar } from '@li/shared/components/Navbar';

const featureIcons = [Mic, FileText, Clock, CheckSquare] as const;

const Reports: React.FC = () => {
  const { t } = useTranslation('work-reports');

  const features = (t('features', { returnObjects: true }) as Array<{
    title: string;
    desc: string;
  }>).map((f, i) => ({ ...f, icon: featureIcons[i] }));

  const useCaseItems = t('useCases.items', { returnObjects: true }) as Array<{
    title: string;
    desc: string;
  }>;

  const exampleSteps = t('example.steps', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-2 bg-slate-200 text-slate-700 rounded-full text-sm font-medium mb-6">
              {t('badge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-8">
              {t('hero.description')}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mx-auto mb-16 text-center">
            <p className="text-lg text-slate-600 leading-relaxed">
              {t('intro')}
            </p>
          </motion.div>

          {/* Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-20 rounded-3xl border border-slate-200 overflow-hidden shadow-lg bg-white"
          >
            <div className="p-2 md:p-4">
              <ReportsDemo />
            </div>
          </motion.div>

          {/* The Problem */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-8 mb-16"
          >
            <h3 className="text-xl font-semibold text-amber-900 mb-3 text-center">{t('problem.title')}</h3>
            <p className="text-amber-800 leading-relaxed text-center">
              {t('problem.body')}
            </p>
          </motion.div>

          {/* Key Features */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
              >
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                  <f.icon size={24} className="text-violet-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Use Cases */}
          <div className="mb-20">
            <h2 className="text-3xl font-serif text-slate-900 mb-8 text-center">{t('useCases.heading')}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {useCaseItems.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 + i * 0.1 }}
                  className="bg-slate-50 rounded-xl p-6 text-center"
                >
                  <h4 className="font-semibold text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Example Workflow */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="bg-slate-950 rounded-3xl p-10 md:p-14 text-white mb-20"
          >
            <h2 className="text-3xl font-serif mb-6 text-center">{t('example.title')}</h2>
            <div className="space-y-4 text-slate-300 text-lg leading-relaxed">
              {exampleSteps.map((step, i) => (
                <p key={i} className={i === exampleSteps.length - 1 ? 'text-white font-semibold pt-4' : ''}>
                  {step}
                </p>
              ))}
            </div>
          </motion.div>

          {/* Integration */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="bg-indigo-50 border border-indigo-200 rounded-2xl p-10 mb-20"
          >
            <h3 className="text-2xl font-serif text-indigo-900 mb-4 text-center">
              {t('integration.title')}
            </h3>
            <p className="text-indigo-800 leading-relaxed text-center">
              {t('integration.body')}
            </p>
          </motion.div>

          {/* Status */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-center bg-slate-50 rounded-2xl p-10"
          >
            <h3 className="text-2xl font-serif text-slate-900 mb-4">
              {t('status.title')}
            </h3>
            <p className="text-slate-600 mb-2">
              {t('status.body')}
            </p>
            <p className="text-slate-500 text-sm">
              {t('status.note')}
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Reports;
