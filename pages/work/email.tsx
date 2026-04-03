import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, MessageSquare, Zap } from 'lucide-react';
import MailDemo from './features/MailDemo';
import { Navbar } from '../../components/Navbar';

const Email: React.FC = () => {
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
            <div className="inline-block px-4 py-2 bg-sky-100 text-sky-700 rounded-full text-sm font-medium mb-6">
              Voice Email
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6">
              Clear Your Inbox by Talking.
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Say "read my inbox" while driving. Dictate replies. AI generates 3 tone options per
              email. Send the one you like.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mx-auto mb-16"><p className="text-lg text-slate-600 leading-relaxed">Say 'read my inbox' while driving. HABOS summarizes your most important emails, reads the urgent ones aloud, and generates three reply drafts in different tones — Short & Direct, Warm & Professional, and Executive. You say 'send the second one' and it's done. Every email also gets AI-extracted action items: deadlines become tasks, meeting requests become calendar events, and follow-ups get flagged — all without you typing a single word.</p></motion.div>

          {/* Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-20 rounded-3xl border border-slate-200 overflow-hidden shadow-lg bg-white"
          >
            <div className="p-2 md:p-4">
              <MailDemo />
            </div>
          </motion.div>

          {/* Mock Voice Email Session */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-sky-50/50 rounded-3xl p-8 mb-16"
          >
            <div className="max-w-xl mx-auto space-y-4">
              {/* User bubble */}
              <div className="flex justify-end">
                <div className="bg-sky-600 text-white rounded-2xl px-5 py-3 max-w-sm">
                  <p className="text-sm">What's in my inbox?</p>
                </div>
              </div>

              {/* AI bubble */}
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 max-w-sm">
                  <p className="text-sm text-slate-700">
                    You have 5 new emails. The most important is from Sarah Henderson about
                    the renovation timeline — she needs confirmation by end of day. Want me to
                    read it?
                  </p>
                </div>
              </div>

              {/* User bubble */}
              <div className="flex justify-end">
                <div className="bg-sky-600 text-white rounded-2xl px-5 py-3 max-w-sm">
                  <p className="text-sm">Yes, and draft a reply</p>
                </div>
              </div>

              {/* AI bubble with draft cards */}
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 max-w-sm">
                  <p className="text-sm text-slate-700 mb-3">Here are 3 options:</p>
                  <div className="space-y-2">
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-slate-500 mb-1">Short & Direct</p>
                      <p className="text-sm text-slate-700">
                        Hi Sarah, confirmed — we're on track for the March timeline. I'll send
                        the updated schedule by tomorrow.
                      </p>
                    </div>
                    <div className="bg-white border border-sky-300 rounded-lg p-3 ring-1 ring-sky-200">
                      <p className="text-xs font-semibold text-sky-600 mb-1">Warm & Professional</p>
                      <p className="text-sm text-slate-700">
                        Hi Sarah, thanks for checking in. Happy to confirm we're on schedule.
                        I'll have the detailed timeline over to you by tomorrow morning.
                      </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-slate-500 mb-1">Executive</p>
                      <p className="text-sm text-slate-700">
                        Sarah — Confirmed for March. Updated schedule to follow tomorrow. Let me
                        know if you need anything else.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* User bubble */}
              <div className="flex justify-end">
                <div className="bg-sky-600 text-white rounded-2xl px-5 py-3 max-w-sm">
                  <p className="text-sm">Send the second one</p>
                </div>
              </div>

              {/* Confirmation text */}
              <p className="text-center text-sm text-slate-400 pt-2">
                Email sent. Zero typing. Zero screen time.
              </p>
            </div>
          </motion.div>

          {/* Three Benefit Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white border border-slate-200 rounded-2xl p-5"
            >
              <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
                <Clock size={20} className="text-sky-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                30 emails &rarr; 5 minutes
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Voice mode reads the important ones, skips the noise, and lets you reply in
                your natural voice. The commute becomes productive.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white border border-slate-200 rounded-2xl p-5"
            >
              <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare size={20} className="text-sky-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                3 tone options per reply
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Short & Direct, Warm & Professional, Executive. Pick the one that fits, or
                tell the AI to adjust. Your voice, polished.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white border border-slate-200 rounded-2xl p-5"
            >
              <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
                <Zap size={20} className="text-sky-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Actions extracted automatically
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                When an email mentions a deadline, meeting, or task — action cards appear. Tap
                to create without leaving your inbox.
              </p>
            </motion.div>
          </div>

          {/* Scenario Callout */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-slate-900 text-white rounded-3xl p-8 mb-16"
          >
            <p className="text-lg md:text-xl leading-relaxed text-slate-200">
              It's 7:45 AM. You're driving to the first job site. You say "read my inbox."
              HABOS summarizes 5 emails, reads the urgent one from your client, and drafts a
              reply in your tone. You say "send it." By the time you park, your inbox is clear
              and your client has a response. You never touched your phone.
            </p>
          </motion.div>

          {/* Integration Strip */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-sky-50 border border-sky-200 rounded-2xl px-8 py-4 mb-16"
          >
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <span className="text-sm font-medium text-sky-700">Gmail</span>
              <span className="text-sky-300">&middot;</span>
              <span className="text-sm font-medium text-sky-700">Outlook</span>
              <span className="text-sky-300">&middot;</span>
              <span className="text-sm font-medium text-sky-700">Workspace email</span>
              <span className="text-sky-300">&middot;</span>
              <span className="text-sm font-medium text-sky-700">Unified inbox</span>
              <span className="text-sky-300">&middot;</span>
              <span className="text-sm font-medium text-sky-700">Action items auto-extracted</span>
            </div>
          </motion.div>

          {/* Closing */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center"
          >
            <p className="text-xl md:text-2xl font-serif text-slate-900 mb-8 max-w-2xl mx-auto">
              Other email apps want you to type faster. HABOS lets you stop typing entirely.
            </p>
            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-slate-900 text-white rounded-full font-medium text-base shadow-lg hover:bg-slate-800 transition-colors"
              >
                Join Waitlist
              </motion.button>
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Email;
