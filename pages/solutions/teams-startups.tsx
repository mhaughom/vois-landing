import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar';
import { ArrowRight } from 'lucide-react';

const fade = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

/*
  FORMAT: The app graveyard.
  Startup founders feel the SaaS bloat pain viscerally.
  Start with the pile of subscriptions. Make them feel the weight. Then lift it.
*/

const apps = [
  { name: 'Slack', cost: '$12/user/mo', replaces: 'Communication' },
  { name: 'Asana', cost: '$11/user/mo', replaces: 'Projects & Tasks' },
  { name: 'Notion', cost: '$10/user/mo', replaces: 'Documents & Brain' },
  { name: 'Google Workspace', cost: '$12/user/mo', replaces: 'Calendar, Docs, Email' },
  { name: 'HubSpot', cost: '$45/mo', replaces: 'CRM' },
  { name: 'Calendly', cost: '$12/mo', replaces: 'Scheduling' },
  { name: 'Zapier', cost: '$20/mo', replaces: 'Automations' },
  { name: 'Loom', cost: '$13/user/mo', replaces: 'Voice + Meeting Notes' },
];

const TeamsStartups: React.FC = () => (
  <div className="min-h-screen bg-white">
    <Navbar />

    <main className="pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">

        <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
          <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">Solutions &mdash; Teams &amp; Startups</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
            One platform for your whole company.
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed mb-4">
            Replace the 10 apps you adopted one at a time with one workspace that actually works together.
          </p>
          <p className="text-base text-slate-400 mb-16">
            Tech startups, growing agencies, professional services firms, and any company of 2&ndash;50 people drowning in tools.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fade}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-slate-700 leading-relaxed [&>p]:mb-6 [&>h2]:mt-16 [&>h2]:mb-4 [&>h3]:mt-12 [&>h3]:mb-3 [&>hr]:my-16"
        >
          <h2 className="text-2xl font-serif text-slate-900 mt-0">Count your subscriptions</h2>
          <p>
            Slack for chat. Asana for tasks. Notion for documents. Google Workspace for email and calendar. HubSpot for the CRM. Calendly for scheduling. Zapier to glue them together. Loom for async video. Maybe Toggl for time tracking. Maybe Intercom for support.
          </p>
          <p>
            A 9-person startup paying per-seat for all of these is looking at $4,200 a month. More than most office rents. And none of these tools talk to each other without Zapier holding them together with duct tape.
          </p>

          {/* The app list */}
          <div className="not-prose my-10">
            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-slate-100 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <div className="col-span-4">App</div>
                <div className="col-span-3">Cost</div>
                <div className="col-span-5">HABOS replaces with</div>
              </div>
              {apps.map((app, i) => (
                <div
                  key={app.name}
                  className={`grid grid-cols-12 gap-2 px-5 py-3 text-sm ${i < apps.length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  <div className="col-span-4 text-slate-400 line-through">{app.name}</div>
                  <div className="col-span-3 text-slate-400">{app.cost}</div>
                  <div className="col-span-5 text-blue-700 font-medium">{app.replaces}</div>
                </div>
              ))}
              <div className="px-5 py-4 bg-blue-50 border-t border-blue-100 flex justify-between items-center">
                <span className="text-sm text-slate-600">HABOS &mdash; everything above, connected</span>
                <span className="text-lg font-bold text-slate-900">$35<span className="text-sm font-normal text-slate-400">/user/mo</span></span>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-serif text-slate-900">But the money isn&rsquo;t the real problem</h2>
          <p>
            The real cost is fragmentation. Your CEO spends 45 minutes every morning scanning Slack, Gmail, Asana, and the CRM just to figure out what&rsquo;s happening. Three messages need responses, and the context for each one lives in a different tool.
          </p>
          <p>
            Your weekly team meeting is 45 minutes long, and half of it is status updates &mdash; everyone reporting what they&rsquo;re working on because there&rsquo;s no shared view. The other half generates action items that someone writes on a whiteboard. Two are forgotten by 2pm.
          </p>
          <p>
            A new hire takes weeks to become productive &mdash; not because the work is hard, but because they need access to ten tools and have to learn which source of truth to check for which type of information.
          </p>
          <p>
            And when the CEO asks &ldquo;what&rsquo;s the status of the Henderson deal?&rdquo; &mdash; three people check three tools and give three different answers.
          </p>

          <h2 className="text-2xl font-serif text-slate-900">What one platform changes</h2>

          <div className="not-prose my-8">
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <p className="text-sm font-semibold text-blue-700 uppercase tracking-wider mb-3">The Monday morning briefing</p>
              <p className="text-base text-slate-800 italic leading-relaxed">
                &ldquo;3 tasks overdue &mdash; 2 waiting on the Henderson contract review. 2 emails need your decision. Revenue this week is 12% above forecast. One team member flagged a blocker yesterday at 6pm.&rdquo;
              </p>
              <p className="text-sm text-blue-700 mt-3">Five minutes. Full picture. Zero app switching.</p>
            </div>
          </div>

          <p>
            Team meetings drop from 45 minutes to 25. A pre-meeting brief is auto-generated from actual project data. Live transcription captures everything. Action items are extracted and assigned based on role and workload. Nobody spends time on status updates &mdash; the dashboard already shows everything.
          </p>
          <p>
            New employees get one login and a role-specific dashboard on day one. When they ask VOIS &ldquo;what&rsquo;s the usual process for onboarding a new client?&rdquo; &mdash; it finds the Playbook, the last three client onboarding projects, and a meeting transcript where the team discussed improvements. One question, one answer, full context.
          </p>
          <p>
            When the CEO asks about the Henderson deal, there&rsquo;s one CRM record with one truth: deal stage, last communication, project completion, outstanding invoice, and an AI assessment &mdash; &ldquo;at risk, client hasn&rsquo;t confirmed pricing, call today.&rdquo;
          </p>
          <p>
            Five AI Advisors &mdash; Finance, Strategy, Operations, Marketing, Sales &mdash; offer perspectives that intentionally disagree. Because real business decisions have tradeoffs, and consensus from a single AI is just a confident guess.
          </p>

          <div className="not-prose my-10">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                ['$300-500', 'saved monthly in SaaS'],
                ['5 hrs/wk', 'saved per person'],
                ['3 hrs/wk', 'saved on meetings'],
                ['Days', 'to onboard (not weeks)'],
              ].map(([value, label]) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-bold text-slate-900">{value}</p>
                  <p className="text-xs text-slate-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <blockquote className="border-l-4 border-blue-400 pl-6 my-12 not-prose">
            <p className="text-xl font-serif italic text-slate-700 leading-relaxed mb-4">
              &ldquo;We were paying more for software subscriptions than our office rent. Slack, Notion, Asana, HubSpot, Calendly, Toggl, Google Workspace, Zapier &mdash; $4,200 a month. HABOS replaced all of them for $315. But the real win isn&rsquo;t the money &mdash; it&rsquo;s that when I ask a question about a client, I get one answer instead of three.&rdquo;
            </p>
            <p className="text-sm text-slate-500">
              &mdash; Anders, 31 &middot; Co-founder &middot; 9-person SaaS startup &middot; Oslo
            </p>
          </blockquote>

          <div className="not-prose text-center py-12">
            <p className="text-2xl md:text-3xl font-serif text-slate-900 mb-6 leading-tight">
              One platform for your whole team. Finally.
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

export default TeamsStartups;
