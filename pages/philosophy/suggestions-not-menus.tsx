import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const SuggestionsNotMenus: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">Philosophy</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              Suggestions, Not Menus
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-12">
              Read. Tap. Done.
            </p>
          </motion.div>

          {/* Image left + content right on desktop, stacked on mobile */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col md:flex-row gap-10 mb-16"
          >
            <img
              src="/philosophy/suggestions-not-menus.jpg"
              alt="Suggestion cards replacing complex menus"
              className="w-full md:w-[45%] rounded-2xl object-cover flex-shrink-0"
            />

            <div className="prose prose-slate prose-lg max-w-none">
              <p>
                A business owner stares at a task board trying to figure out what matters right now. A sales rep reads an email and thinks "I should create a follow-up" — but doesn't, because it means switching apps, finding the right project, filling six fields. The thought dies in the gap between recognizing what needs doing and actually doing it.
              </p>

              <p>
                <strong>Email reschedule request arrives.</strong> VOIS reads it and surfaces three tappable options: move to Friday 10am (slot is free), push to next week (3 open slots shown), or decline and suggest a call instead. One tap. Meeting moved, calendars updated, confirmation sent.
              </p>

              <p>
                <strong>Meeting ends.</strong> VOIS extracts four action items from the transcript. Each appears as a card — assignee suggested from who said what, due date inferred from the conversation, project linked automatically. Review in 30 seconds, adjust one assignee, tap confirm. Four tasks created, four people notified, zero forms filled.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="prose prose-slate prose-lg max-w-none"
          >
            <p className="not-prose text-center text-lg font-medium text-slate-700 bg-slate-50 rounded-2xl border border-slate-100 py-5 px-6 my-12">
              Traditional: <span className="text-red-500">3 minutes per action.</span> Suggestions: <span className="text-emerald-600">5 seconds.</span> Across 20 daily actions, that's <strong>60 minutes back.</strong>
            </p>

            <blockquote className="border-l-4 border-slate-900 pl-6 my-12 text-xl font-serif italic text-slate-700">
              "You shouldn't have to operate your business software. It should operate itself and ask for your judgment."
            </blockquote>
          </motion.div>

          {/* Prev / Next */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-20 pt-12 border-t border-slate-100 flex justify-between"
          >
            <a href="/philosophy/built-for-teams" className="group flex items-center gap-3">
              <ArrowLeft size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              <div>
                <p className="text-sm text-slate-400 mb-1">Previous</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">Built for Teams</p>
              </div>
            </a>
            <a href="/philosophy/two-interfaces" className="group flex items-center gap-3 text-right">
              <div>
                <p className="text-sm text-slate-400 mb-1">Next</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">Two Interfaces, One System</p>
              </div>
              <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SuggestionsNotMenus;
