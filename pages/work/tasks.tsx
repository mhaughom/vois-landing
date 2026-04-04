import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Mic, Video, Mail, Bot } from 'lucide-react';
import TasksDemo from './features/TasksDemo';
import { Navbar } from '../../components/Navbar';
import { useTranslation } from 'react-i18next';

const sourceIcons = [Mic, Video, Mail, Bot];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

interface TaskItem {
  dot: string;
  title: string;
  source: string;
  imp: string;
  urg: string;
}

const dotColors = ['bg-red-500', 'bg-amber-500', 'bg-amber-500', 'bg-emerald-500'];

const Tasks: React.FC = () => {
  const { t } = useTranslation('work-tasks');

  const tasks = t('tasks', { returnObjects: true }) as Array<{ title: string; source: string }>;
  const taskItems: TaskItem[] = tasks.map((task, i) => ({
    dot: dotColors[i] ?? 'bg-slate-400',
    title: task.title,
    source: task.source,
    imp: ['0.95', '0.78', '0.71', '0.45'][i] ?? '0.50',
    urg: ['0.91', '0.72', '0.65', '0.30'][i] ?? '0.50',
  }));

  const sourceLabels = t('sources.labels', { returnObjects: true }) as string[];
  const factors = t('scoring.factors', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">

          {/* 1. Hero */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="inline-block px-4 py-1.5 bg-emerald-500/10 text-emerald-700 rounded-full text-sm font-medium mb-6">
              {t('badge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-5 leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl leading-relaxed">
              {t('hero.description')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mb-16">
              {t('body')}
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
              <TasksDemo />
            </div>
          </motion.div>

          {/* 2. Mock task list */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-emerald-50/50 rounded-3xl p-6 md:p-8 mb-16"
          >
            <div className="space-y-2">
              {taskItems.map((task, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-4"
                >
                  <div className={`w-3 h-3 rounded-full shrink-0 ${task.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{task.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{task.source}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap">
                      Imp: {task.imp}
                    </span>
                    <span className="bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap">
                      Urg: {task.urg}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-5 leading-relaxed">
              {t('taskList.note')}
            </p>
          </motion.div>

          {/* 3. Where tasks come from */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-serif font-medium text-slate-900 mb-6 text-center">
              {t('sources.heading')}
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {sourceLabels.map((label, i) => {
                const Icon = sourceIcons[i];
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700"
                  >
                    {Icon && <Icon size={16} className="text-slate-500" />}
                    {label}
                  </div>
                );
              })}
              <ArrowRight size={20} className="text-slate-400 mx-2" />
              <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-full text-sm font-semibold shadow-sm">
                {t('sources.destinationLabel')}
              </div>
            </div>
          </motion.div>

          {/* 4. Three benefit blocks */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid md:grid-cols-3 gap-4 mb-16"
          >
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h3 className="text-base font-semibold text-slate-900 mb-2">{t('benefits.capture.title')}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {t('benefits.capture.description')}
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h3 className="text-base font-semibold text-slate-900 mb-2">{t('benefits.sorting.title')}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {t('benefits.sorting.description')}
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                {t('benefits.meeting.title')}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {t('benefits.meeting.description')}
              </p>
            </div>
          </motion.div>

          {/* 5. Scoring breakdown strip */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-slate-900 text-white rounded-2xl px-8 py-6 mb-20"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
              {t('scoring.label')}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {factors.map((f, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-slate-600">&rarr;</span>}
                  <span className="flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="text-slate-200">{f}</span>
                  </span>
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          {/* 6. Closing */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center"
          >
            <p className="text-2xl md:text-3xl font-serif font-medium text-slate-900 mb-8">
              {t('cta.heading')}
            </p>
            <a href="/work#pricing">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-slate-900 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                {t('cta.button')}
              </motion.button>
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Tasks;
