import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const VoiceFirst: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">Philosophy</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              Your Voice, Not Ours
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-16">
              AI doesn't have to make everyone sound the same. HABOS learns your writing style, your tone, your quirks — so every draft, every email, every reply sounds like you. Not a corporate chatbot. You.
            </p>
          </motion.div>

          {/* Hero image placeholder */}
          <motion.div
            initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6, delay: 0.15 }}
            className="w-full aspect-[2/1] rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200/60 flex items-center justify-center mb-16"
          >
            <span className="text-sm text-slate-400 font-medium">Hero illustration</span>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-slate prose-lg max-w-none"
          >
            <h2 className="text-2xl font-serif text-slate-900 mt-0">The keyboard is a bottleneck</h2>
            <p>
              Typing was invented for typewriters. Tapping was invented for phones. Neither was invented for running a business. When a field technician finishes a job, the last thing they want to do is sit in the van filling out four different apps. When a founder has an idea at 11pm, they don't want to open a laptop and navigate three menus.
            </p>
            <p>
              Voice is the fastest, lowest-friction way to capture intent. You speak at roughly 150 words per minute. You type at 40. That's not a small difference — it's a 4x multiplier on input speed, and the gap between having an idea and losing it.
            </p>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">Not transcription. Understanding.</h2>
            <p>
              Most voice products transcribe your speech into text and stop there. You get a wall of words and the same amount of work ahead of you. HABOS does something fundamentally different.
            </p>
            <p>
              The Smart Router takes a single voice recording and classifies every sentence into intents — tasks, calendar events, CRM updates, inventory notes, messages, research requests — then extracts structured data for each one and routes them to the right destination. All in under three seconds.
            </p>

            {/* Example scenario */}
            <div className="not-prose my-12 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs font-medium text-slate-500">30-second voice note</span>
              </div>
              <div className="p-6 md:p-8">
                <p className="text-slate-600 italic leading-relaxed text-base mb-6">
                  "Done at Fjordview. Unit 3 compressor showing early wear, recommend replacement within six months. Need to order filters for units 1 and 5, the SKU is 4427-B. Also remind me to talk to the hotel manager about renewing their maintenance contract."
                </p>
                <div className="grid gap-3">
                  {[
                    { color: '#22c55e', label: 'Report', text: 'HVAC inspection auto-filled with findings' },
                    { color: '#3b82f6', label: 'Purchase order', text: 'Filters SKU 4427-B → purchasing queue' },
                    { color: '#f59e0b', label: 'Task', text: 'Follow up with manager re: contract renewal' },
                    { color: '#8b5cf6', label: 'CRM note', text: 'Compressor finding logged on client record' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3 bg-white rounded-xl px-4 py-3 border border-slate-100">
                      <span className="mt-0.5 w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <div>
                        <span className="text-sm font-semibold text-slate-900">{item.label}</span>
                        <span className="text-sm text-slate-500 ml-2">{item.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-400 mt-4">4 taps to approve. 40 seconds total. Would have been 20 minutes across 4 apps.</p>
              </div>
            </div>

            {/* Mid-content image placeholder */}
            <div className="not-prose w-full aspect-[16/9] rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100/60 flex items-center justify-center my-12">
              <span className="text-sm text-amber-300 font-medium">Voice surfaces overview</span>
            </div>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">Every surface speaks</h2>
            <p>
              Voice isn't limited to one feature. It's a first-class input across the entire platform:
            </p>
            <ul>
              <li><strong>iPhone & Apple Watch</strong> — record voice notes on the go, get action cards on your wrist, confirm with a tap or a word</li>
              <li><strong>Realtime conversation</strong> — bidirectional voice with the AI assistant, sub-300ms speech-to-speech latency</li>
              <li><strong>Voice email</strong> — answer your entire inbox by speaking: "Reply to Lars, tell him I'm available Thursday"</li>
              <li><strong>Voice reports</strong> — fill structured forms by conversation instead of clicking through fields</li>
              <li><strong>Meeting transcription</strong> — live notes, action items, and suggested questions, all generated in real-time</li>
            </ul>

            {/* Mid-content image placeholder */}
            <div className="not-prose w-full aspect-[16/9] rounded-2xl bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-100/60 flex items-center justify-center my-12">
              <span className="text-sm text-indigo-300 font-medium">Voice flow diagram</span>
            </div>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">Context-aware routing</h2>
            <p>
              The Smart Router is duration-aware. A 2-minute recording mentioning "meeting" is classified as scheduling a meeting. A 15-minute recording mentioning "meeting" is classified as meeting notes. The system understands that short recordings are commands and long recordings are content.
            </p>
            <p>
              It also maps word-level indices — so the mobile UI can highlight exactly which words became which actions. Tap <em>"schedule a site visit next Tuesday at 2pm"</em> in the transcript and it opens the calendar event that was created from those exact words.
            </p>

            <blockquote className="border-l-4 border-slate-900 pl-6 my-12 text-xl font-serif italic text-slate-700">
              "The closest analog is a human executive assistant who listens to your rambling update and creates four different items in four different systems. Except HABOS does it in under three seconds."
            </blockquote>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-20 pt-12 border-t border-slate-100 flex justify-between"
          >
            <a href="/philosophy/one-brain" className="group flex items-center gap-3">
              <ArrowLeft size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              <div>
                <p className="text-sm text-slate-400 mb-1">Previous</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">One Brain</p>
              </div>
            </a>
            <a href="/philosophy/advisors-that-disagree" className="group flex items-center gap-3 text-right">
              <div>
                <p className="text-sm text-slate-400 mb-1">Next</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">Advisors That Disagree</p>
              </div>
              <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default VoiceFirst;
