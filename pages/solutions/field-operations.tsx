import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar';
import { ArrowRight } from 'lucide-react';

const fade = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

/*
  FORMAT: Problem → Solution pairs.
  Field ops people want direct answers. No storytelling fluff.
  State the problem. State the fix. Move on.
*/

const FieldOperations: React.FC = () => (
  <div className="min-h-screen bg-white">
    <Navbar />

    <main className="pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">

        <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
          <p className="text-sm font-semibold text-red-600 tracking-widest uppercase mb-4">Solutions &mdash; Field Operations</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
            Field to office in 30 seconds.
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed mb-4">
            A voice note on site becomes a completed report, an updated project, and a sent invoice &mdash; before the van leaves the driveway.
          </p>
          <p className="text-base text-slate-400 mb-16">
            Construction, delivery, property management, installation, inspection, landscaping, solar, pest control, and any business where the gap between field and office is your biggest source of waste.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fade}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-slate-700 leading-relaxed [&>p]:mb-6 [&>h2]:mt-16 [&>h2]:mb-4 [&>h3]:mt-12 [&>h3]:mb-3 [&>hr]:my-16"
        >
          <h2 className="text-2xl font-serif text-slate-900 mt-0">Six problems. Six fixes.</h2>

          {/* Problem 1 */}
          <div className="not-prose my-8 border-l-4 border-red-200 pl-6">
            <p className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-1">Problem</p>
            <p className="text-base text-slate-700 leading-relaxed">
              The dispatcher has a whiteboard and a phone that won&rsquo;t stop ringing. A job gets rescheduled overnight via email. Nobody sees it. Technician 2 drives to the wrong address. Forty minutes wasted.
            </p>
          </div>
          <div className="not-prose my-8 border-l-4 border-emerald-200 pl-6">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-1">Fix</p>
            <p className="text-base text-slate-700 leading-relaxed">
              HABOS processes the reschedule email overnight. Job moved. Customer notified. Route recalculated. Each technician sees their optimized route on their phone at 7am. No calls. No whiteboard.
            </p>
          </div>

          {/* Problem 2 */}
          <div className="not-prose my-8 border-l-4 border-red-200 pl-6">
            <p className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-1">Problem</p>
            <p className="text-base text-slate-700 leading-relaxed">
              Technician finishes a job. Takes photos on their personal phone. Texts the office &ldquo;Johnson done, took longer than expected.&rdquo; No structured data. Photos stay on their phone for weeks.
            </p>
          </div>
          <div className="not-prose my-8 border-l-4 border-emerald-200 pl-6">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-1">Fix</p>
            <p className="text-base text-slate-700 leading-relaxed mb-3">
              Tap &ldquo;Complete job&rdquo; in HABOS. Take photos &mdash; stored in the job record. Record a thirty-second voice note:
            </p>
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <p className="text-sm text-slate-800 italic leading-relaxed">
                &ldquo;Installation done. Had to replace the mounting bracket &mdash; used a Hilti KB-TZ instead, 340 kroner. Customer is happy, but the trim on the south wall needs a follow-up next week.&rdquo;
              </p>
            </div>
            <p className="text-sm text-slate-500 mt-3">
              Parsed into: job complete, parts logged (340 NOK), follow-up visit created, sentiment positive. Office sees it in real time.
            </p>
          </div>

          {/* Problem 3 */}
          <div className="not-prose my-8 border-l-4 border-red-200 pl-6">
            <p className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-1">Problem</p>
            <p className="text-base text-slate-700 leading-relaxed">
              Customer calls: &ldquo;Where is the technician?&rdquo; Dispatcher calls the technician &mdash; no answer, they&rsquo;re on a roof. Calls customer back: &ldquo;They should be there soon.&rdquo; Customer is frustrated. Technician was five minutes away.
            </p>
          </div>
          <div className="not-prose my-8 border-l-4 border-emerald-200 pl-6">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-1">Fix</p>
            <p className="text-base text-slate-700 leading-relaxed">
              Dispatcher glances at the team GPS map. Green dot, two streets away, ETA four minutes. &ldquo;They&rsquo;ll be with you in about five minutes.&rdquo; Done. No phone tag.
            </p>
          </div>

          {/* Problem 4 */}
          <div className="not-prose my-8 border-l-4 border-red-200 pl-6">
            <p className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-1">Problem</p>
            <p className="text-base text-slate-700 leading-relaxed">
              5:30 PM. Project manager spends ninety minutes transcribing texts and notes. Half the data is missing. Three photos never got sent. One job has no record at all. Tomorrow&rsquo;s schedule is built from memory.
            </p>
          </div>
          <div className="not-prose my-8 border-l-4 border-emerald-200 pl-6">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-1">Fix</p>
            <p className="text-base text-slate-700 leading-relaxed">
              Every job has a voice report, photos, timestamps, and parts used. Tomorrow&rsquo;s dispatch is built from AI-optimized routing. Three invoices drafted from completed jobs &mdash; reviewed and sent in ten minutes.
            </p>
          </div>

          {/* Problem 5 */}
          <div className="not-prose my-8 border-l-4 border-red-200 pl-6">
            <p className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-1">Problem</p>
            <p className="text-base text-slate-700 leading-relaxed">
              Routes are planned by gut feel. Crew 1 crisscrosses the city. Crew 3 drives past Crew 2&rsquo;s next job on the way to their own. You lose an hour a day to bad routing.
            </p>
          </div>
          <div className="not-prose my-8 border-l-4 border-emerald-200 pl-6">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-1">Fix</p>
            <p className="text-base text-slate-700 leading-relaxed">
              HABOS assigns jobs by skill, location, and availability. Routes calculated automatically. Crew 1 gets the northside loop, Crew 2 city center, Crew 3 southside. 15&ndash;20% more efficient than manual scheduling.
            </p>
          </div>

          {/* Problem 6 */}
          <div className="not-prose my-8 border-l-4 border-red-200 pl-6">
            <p className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-1">Problem</p>
            <p className="text-base text-slate-700 leading-relaxed">
              Driving hours aren&rsquo;t logged. Billable time is estimated. Nobody knows who clocked in where. Compliance is a headache.
            </p>
          </div>
          <div className="not-prose my-8 border-l-4 border-emerald-200 pl-6">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-1">Fix</p>
            <p className="text-base text-slate-700 leading-relaxed">
              GPS clock-in when they arrive on site. Clock-out when they leave. Driving hours logged automatically. Billable hours calculated and linked to invoicing.
            </p>
          </div>

          <hr className="my-16 border-slate-200" />

          <h2 className="text-2xl font-serif text-slate-900">What it costs</h2>
          <p>
            ServiceTitan starts at $145/month. Jobber at $69. Add Routific for routing, Toggl for time tracking, and Dropbox for job photos and you&rsquo;re well past $250.
          </p>
          <p>
            HABOS does all of it for $35 a month. Dispatch, routing, voice reports, GPS tracking, time logging, invoicing, and a customer portal &mdash; in one system.
          </p>

          <div className="not-prose my-10">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                ['2 hrs/day', 'saved on data entry'],
                ['90 min/day', 'saved on dispatch'],
                ['15-20%', 'more efficient routes'],
                ['0', 'lost job records'],
              ].map(([value, label]) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-bold text-slate-900">{value}</p>
                  <p className="text-xs text-slate-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <blockquote className="border-l-4 border-red-400 pl-6 my-12 not-prose">
            <p className="text-xl font-serif italic text-slate-700 leading-relaxed mb-4">
              &ldquo;Before HABOS, I spent hours every evening calling technicians to find out what happened today. Now I look at the dashboard at 5pm and every job has a voice report with photos. We went from 6 jobs a day to 7 because the routing is smarter and nobody wastes time on paperwork.&rdquo;
            </p>
            <p className="text-sm text-slate-500">
              &mdash; Erik, 45 &middot; Construction company &middot; 12 field workers &middot; Stavanger
            </p>
          </blockquote>

          <div className="not-prose text-center py-12">
            <p className="text-2xl md:text-3xl font-serif text-slate-900 mb-6 leading-tight">
              Close the gap between your field and your office &mdash; permanently.
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

export default FieldOperations;
