import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const SOURCES = [
  'Voice recordings', 'Documents', 'Email threads', 'Contacts',
  'Chat history', 'Playbooks & SOPs', 'Products', 'Orders',
  'Bookings', 'CRM clients', 'Support tickets', 'Form submissions',
  'Jobs & visits', 'Routes', 'Websites', 'Social posts',
  'Presentations', 'Projects', 'Calendar events',
];

const OneBrain: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">Philosophy</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              One Brain
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-16">
              Without this, "we do everything" sounds like Zoho. With this, it sounds like compound intelligence. The CRM knows about the voice note. The voice note knows about the calendar. Every feature is smarter than it could be alone.
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
            <h2 className="text-2xl font-serif text-slate-900 mt-0">The fragmentation tax</h2>
            <p>
              In a traditional tool stack, your calendar doesn't know your tasks. Your meeting notes don't feed your project tracker. Your voice memos sit unprocessed. Your email is an island. Your CRM has no idea what was said in meetings.
            </p>
            <p>
              Every time you switch apps to find context, you pay a tax — in time, in attention, and in decisions made without the full picture. The average knowledge worker switches between apps 1,200 times per day. That's not productivity. That's friction masquerading as work.
            </p>

            <h2 className="text-2xl font-serif text-slate-900">One database. Shared understanding.</h2>
            <p>
              HABOS stores everything in one unified data layer. One SQL query can join CRM contacts with meeting transcripts, order line items with support tickets, calendar events with task dependencies, email threads with project milestones, and voice note transcripts with playbook SOPs.
            </p>
            <p>
              This means when the AI prepares you for a meeting, it doesn't just check your calendar. It pulls the client's purchase history, their open tickets, what was discussed in the last three meetings, what your sales playbook says to do at this deal stage, and a voice note you recorded walking your dog where you mentioned their CEO.
            </p>

            {/* Source grid */}
            <div className="not-prose my-12">
              <p className="text-sm font-semibold text-slate-400 tracking-widest uppercase mb-4">19 sources. One search.</p>
              <div className="flex flex-wrap gap-2">
                {SOURCES.map((s) => (
                  <span key={s} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-sm text-slate-600">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Mid-content image placeholder */}
            <div className="not-prose w-full aspect-[16/9] rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100/60 flex items-center justify-center my-12">
              <span className="text-sm text-violet-300 font-medium">Data flow diagram</span>
            </div>

            {/* Mid-content image placeholder */}
            <div className="not-prose w-full aspect-[16/9] rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100/60 flex items-center justify-center my-12">
              <span className="text-sm text-violet-300 font-medium">Brain search visualization</span>
            </div>

            <h2 className="text-2xl font-serif text-slate-900">What this looks like in practice</h2>
            <p>
              You ask: <em>"What's going on with Nordic Fishing?"</em>
            </p>
            <p>
              Within three seconds you get: their CRM status (negotiation stage), their last three orders ($47K total), the open support ticket about delivery timing, what Lars said about expansion in the last meeting, and a reminder that the contract renewal is coming up in April. Every piece of information links back to its source. You didn't open five different apps.
            </p>

            <h2 className="text-2xl font-serif text-slate-900">Semantic, not just keyword</h2>
            <p>
              The Brain uses 512-dimensional vector embeddings across every data source. Searching for "revenue projections" finds a voice note titled "Q3 financial outlook." Searching for "that HVAC thing Jonas mentioned" finds the meeting transcript where he talked about compressor wear at the Fjordview Hotel.
            </p>
            <p>
              All 19 sources are queried concurrently. Typical latency: under one second for a full cross-platform search. The AI doesn't just keyword-match — it <em>understands</em> your data semantically.
            </p>

            <h2 className="text-2xl font-serif text-slate-900">The moat that deepens</h2>
            <p>
              Competitors can move data between apps. They can build API bridges and sync pipelines. What they cannot replicate is shared understanding — the ability for every part of the system to reason over every other part, because it was all designed to live together.
            </p>
            <p>
              The longer your team uses HABOS, the more powerful this becomes. After six months, the AI knows patterns no human could track across that many systems: which clients reorder predictably, which operations consistently drift, which playbooks are never followed.
            </p>

            <blockquote className="border-l-4 border-slate-900 pl-6 my-12 text-xl font-serif italic text-slate-700">
              "Other platforms can sync your data. Only one platform can think across it."
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
            <a href="/philosophy/ai-native" className="group flex items-center gap-3">
              <ArrowLeft size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              <div>
                <p className="text-sm text-slate-400 mb-1">Previous</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">The End of Data Entry</p>
              </div>
            </a>
            <a href="/philosophy/voice-first" className="group flex items-center gap-3 text-right">
              <div>
                <p className="text-sm text-slate-400 mb-1">Next</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">Your Voice, Not Ours</p>
              </div>
              <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default OneBrain;
