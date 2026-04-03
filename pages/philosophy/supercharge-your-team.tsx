import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '../../components/Navbar';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const SuperchargeYourTeam: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">Philosophy</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              Supercharge Your Team
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-16">
              HABOS isn't here to replace your employees — it's here to make each one of them dramatically more capable. The best teams aren't smaller. They're amplified.
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
            <h2 className="text-2xl font-serif text-slate-900 mt-0">One agent per employee</h2>
            <p>
              Every team member gets their own AI assistant — not a shared chatbot, but a personal agent that knows their role, their projects, their writing style, and their history. The technician's agent knows about HVAC systems and inspection protocols. The office manager's agent knows about scheduling conflicts and client preferences. The founder's agent knows everything.
            </p>
            <p>
              This isn't about giving everyone the same tool. It's about giving everyone the right copilot for how <em>they</em> work.
            </p>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">Same meeting, different intelligence</h2>
            <p>
              When your team sits in the same meeting, HABOS generates different AI notes for each person based on their role, responsibilities, and projects. A junior developer and a VP see entirely different suggested questions. The sales lead gets follow-up tasks related to the pipeline. The project manager gets timeline risks highlighted.
            </p>
            <p>
              After the meeting ends, each person gets action items scoped to their domain — pre-assigned, pre-dated, and linked to the right project. Nobody has to figure out "what did that mean for me?" The AI already knows.
            </p>

            {/* Role cards */}
            <div className="not-prose my-12 grid gap-4">
              {[
                {
                  role: 'The Field Technician',
                  before: 'Spends 20 minutes per job on paperwork. Forgets to log follow-ups. Updates the CRM two days late.',
                  after: 'Speaks for 30 seconds. The system creates the job record, updates inventory, flags the follow-up, and logs everything. They\'re already driving to the next job.',
                },
                {
                  role: 'The Office Manager',
                  before: 'Switches between 8 apps all day. Manually checks who\'s available. Forwards emails to the right people.',
                  after: 'Gets a morning briefing of what needs attention. AI handles scheduling conflicts, routes messages, and surfaces the things that actually need a human decision.',
                },
                {
                  role: 'The Sales Lead',
                  before: 'Forgets to follow up. Walks into meetings without prep. Loses track of deal stages across 30 clients.',
                  after: 'Gets AI-generated briefings before every call. CRM is always current because voice notes auto-update it. Stale deals are flagged automatically.',
                },
                {
                  role: 'The Founder',
                  before: 'Drowning in operational detail. Can\'t see the strategic picture. Makes decisions with incomplete information.',
                  after: 'Gets Strategic Council — competing AI perspectives on growth decisions. Morning briefings surface cross-team patterns. Problems find them before they find problems.',
                },
              ].map((item) => (
                <div key={item.role} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">{item.role}</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-base">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 tracking-widest uppercase mb-1">Before</p>
                      <p className="text-slate-500">{item.before}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-green-600 tracking-widest uppercase mb-1">With HABOS</p>
                      <p className="text-slate-700">{item.after}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mid-content image placeholder */}
            <div className="not-prose w-full aspect-[16/9] rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100/60 flex items-center justify-center my-12">
              <span className="text-sm text-rose-300 font-medium">Team amplification visual</span>
            </div>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">Emails that sound like you</h2>
            <p>
              When the AI drafts a reply, it matches <em>your</em> writing style — not a generic corporate tone. HABOS builds a profile from your past messages: formality level, sentence length, emoji usage, how you sign off. The sales lead's drafts sound like the sales lead. The founder's drafts sound like the founder.
            </p>
            <p>
              Three reply options appear — Short & Direct, Warm & Professional, Executive — each matching your voice. You pick one, edit a sentence if you want, and send. What used to take five minutes of staring at a blank compose window takes ten seconds.
            </p>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">Structure that adapts to how people actually work</h2>
            <p>
              Not everyone works the same way. Some people are disciplined with their task lists. Others think in voice notes and scattered ideas. Some thrive with structured schedules. Others need flexibility.
            </p>
            <p>
              HABOS doesn't force a single workflow. The voice-first capture meets people where they are. The AI organizes the chaos afterwards — turning rambling voice notes into structured actions, surfacing the right information at the right time, and gently enforcing the processes that matter without micromanaging the ones that don't.
            </p>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">The multiplier, not the replacement</h2>
            <p>
              The AI industry loves to talk about replacing jobs. We think that misses the point. A great employee with AI assistance doesn't become replaceable — they become irreplaceable. The technician who can do 8 jobs a day instead of 5. The sales lead who never forgets a follow-up. The office manager who catches problems before they escalate.
            </p>
            <p>
              HABOS makes the humans on your team the best version of themselves at work. That's not a feature. That's the whole point.
            </p>

            <blockquote className="border-l-4 border-slate-900 pl-6 my-12 text-xl font-serif italic text-slate-700">
              "The promise was never 'AI will do your job.' The promise is 'AI will make you extraordinary at your job.'"
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
            <a href="/philosophy/small-team-leverage" className="group flex items-center gap-3">
              <ArrowLeft size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              <div>
                <p className="text-sm text-slate-400 mb-1">Previous</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">Small Team Leverage</p>

              </div>
            </a>
            <a href="/work" className="group flex items-center gap-3 text-right">
              <div>
                <p className="text-sm text-slate-400 mb-1">Back to</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">HABOS</p>
              </div>
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SuperchargeYourTeam;
