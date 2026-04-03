import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar';
import { ArrowRight } from 'lucide-react';

const fade = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

/*
  FORMAT: Case study.
  Creatives respond to stories and portfolios — not feature lists.
  Tell Marte's story as if it's a real case study.
*/

const CreativeBusinesses: React.FC = () => (
  <div className="min-h-screen bg-white">
    <Navbar />

    <main className="pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">

        <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
          <p className="text-sm font-semibold text-pink-600 tracking-widest uppercase mb-4">Solutions &mdash; Creative Businesses</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
            Spend your time creating.<br className="hidden md:block" /> Not administrating.
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed mb-4">
            Client management, project tracking, proposals, invoicing, and team coordination &mdash; handled.
          </p>
          <p className="text-base text-slate-400 mb-16">
            Agencies, studios, photographers, videographers, freelance writers, event planners, architects, and any business where the work is creative but everything around it is a grind.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fade}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-slate-700 leading-relaxed [&>p]:mb-6 [&>h2]:mt-16 [&>h2]:mb-4 [&>h3]:mt-12 [&>h3]:mb-3 [&>hr]:my-16"
        >
          <p className="text-sm font-semibold text-slate-400 tracking-widest uppercase">Case Study</p>
          <h2 className="text-2xl font-serif text-slate-900 mt-2">How a 6-person agency in Bergen got 12 hours back per week</h2>

          <p>
            Marte runs a digital agency. Six people. Branding, social media, web design. Her clients are mid-size Norwegian companies who expect fast communication and high-quality creative work. Her problem wasn&rsquo;t the creative work. It was everything else.
          </p>

          <h3 className="text-xl font-serif text-slate-900">The before</h3>
          <p>
            Monday mornings started with a two-hour status meeting. Not because the team was slow &mdash; because nobody could see where any project stood without asking. Asana had task lists. Notion had meeting notes. Toggl had hours. The CRM had client details. Slack had the actual conversations. Getting a full picture of any project meant checking five tools.
          </p>
          <p>
            A client would reply to a proposal at 11pm. Before Marte could write three sentences back, she needed to check the original proposal in Google Docs, the budget in a spreadsheet, and her team&rsquo;s availability in Asana. Four tabs. Fifteen minutes. For a three-sentence email.
          </p>
          <p>
            Invoicing was the worst. Hours were in Toggl. Deliverables were in Asana. Contract terms were in an email attachment from three months ago. The invoices ended up approximate. She was either undercharging or having awkward conversations.
          </p>
          <p>
            And prospective clients? When someone asked &ldquo;can you send examples of similar work?&rdquo; &mdash; finding case studies across Google Drive, Dropbox, and old email threads took forty-five minutes. She&rsquo;d promise to send by end of day and deliver two days later.
          </p>

          <h3 className="text-xl font-serif text-slate-900">The turning point</h3>
          <p>
            Marte switched to HABOS. Not because of a single feature, but because she was tired of being a systems administrator instead of a creative director.
          </p>
          <p>
            The first thing that changed was client calls. HABOS generates a meeting brief before each call &mdash; previous notes, project status, outstanding decisions. During the call, live transcription captures everything. Afterward: action items extracted automatically, assigned to the right people, linked to the project. The client gets a follow-up email summarizing decisions, drafted in Marte&rsquo;s voice, within ten minutes.
          </p>

          <div className="not-prose my-8">
            <div className="bg-pink-50 rounded-2xl p-6 border border-pink-100">
              <p className="text-sm font-semibold text-pink-700 uppercase tracking-wider mb-3">The moment that sold her</p>
              <p className="text-base text-slate-800 font-medium italic leading-relaxed mb-3">
                &ldquo;VOIS, find me everything from projects similar to the Andersson inquiry &mdash; social media campaigns for food brands, last two years.&rdquo;
              </p>
              <p className="text-sm text-pink-700">
                Three seconds. Two case studies, a proposal template, and a timeline from a comparable project. All found across documents, project records, proposals, and meeting transcripts.
              </p>
            </div>
          </div>

          <h3 className="text-xl font-serif text-slate-900">The after</h3>
          <p>
            The Monday status meeting is gone. Replaced by a five-minute dashboard check. Every project shows its health, blockers, and next milestones. The meeting that replaced it is twenty-five minutes of actual decisions.
          </p>
          <p>
            Invoicing takes minutes, not hours. Time tracking is linked to projects. Deliverables are checked off in milestones. Contract terms live in the CRM record. The invoice generates with the correct line items, billable hours, and payment terms. One tap to send.
          </p>
          <p>
            Proposals that used to take a day now take an hour. Describe the project in a voice note, and HABOS drafts a proposal pulling from past project data and pricing.
          </p>
          <p>
            Clients noticed the difference before Marte&rsquo;s team did. Faster responses. Better follow-through. A client portal where they can see project progress, approve deliverables, and message the team directly. No more &ldquo;can you send me an update?&rdquo; emails.
          </p>

          <h3 className="text-xl font-serif text-slate-900">The results</h3>
          <div className="not-prose my-10">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                ['12 hrs', 'saved per week on admin'],
                ['90%', 'faster proposal turnaround'],
                ['$200+', 'saved monthly on tools'],
                ['0', 'lost project knowledge'],
              ].map(([value, label]) => (
                <div key={label} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-slate-900">{value}</p>
                  <p className="text-xs text-slate-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <blockquote className="border-l-4 border-pink-400 pl-6 my-12 not-prose">
            <p className="text-xl font-serif italic text-slate-700 leading-relaxed mb-4">
              &ldquo;We used to spend Monday mornings in a 2-hour status meeting just to figure out where every project stood. Now we check the dashboard in 5 minutes and get straight to work. The AI meeting notes alone saved us 6 hours a week &mdash; and our clients noticed we reply faster.&rdquo;
            </p>
            <p className="text-sm text-slate-500">
              &mdash; Marte, 34 &middot; Digital agency &middot; 6 people &middot; Bergen
            </p>
          </blockquote>

          <div className="not-prose text-center py-12">
            <p className="text-2xl md:text-3xl font-serif text-slate-900 mb-6 leading-tight">
              Get back to the work you actually started this business to do.
            </p>
            <a
              href="/#waitlist"
              className="inline-flex items-center gap-2 bg-slate-900 text-white rounded-full px-8 py-4 text-base font-medium hover:bg-slate-800 transition-colors"
            >
              Join the waitlist <ArrowRight size={16} />
            </a>
          </div>
        </motion.div>
      </div>
    </main>
  </div>
);

export default CreativeBusinesses;
