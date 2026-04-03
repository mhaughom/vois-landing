import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar';
import { ArrowRight } from 'lucide-react';

const fade = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

/*
  FORMAT: A letter.
  "Dear solo founder," — personal and intimate.
  This isn't a product page. It's written by someone who understands.
*/

const SoloFounders: React.FC = () => (
  <div className="min-h-screen bg-white">
    <Navbar />

    <main className="pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">

        <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
          <p className="text-sm font-semibold text-purple-600 tracking-widest uppercase mb-4">Solutions &mdash; Solo Founders</p>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif text-slate-900 mb-6 leading-[1.1]">
            Your first employee costs $35&nbsp;a&nbsp;month.
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed mb-16">
            Freelancers, independent consultants, solo tradespeople, one-person agencies, coaches, solo lawyers, and anyone who is simultaneously the CEO, salesperson, accountant, marketer, and customer service rep.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fade}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-slate-700 leading-relaxed [&>p]:mb-6 [&>h2]:mt-16 [&>h2]:mb-4 [&>h3]:mt-12 [&>h3]:mb-3 [&>hr]:my-16"
        >
          <p className="text-2xl font-serif text-slate-900 mt-0 mb-8">Dear solo founder,</p>

          <p>
            We know what your mornings look like. The alarm goes off at 6:45 and before your feet hit the floor you&rsquo;re checking email. Fourteen messages overnight. Three need replies. Two are invoices you should have sent last week. One is a prospect you&rsquo;ve been meaning to follow up with for days. You feel behind before you&rsquo;re out of bed.
          </p>
          <p>
            We know about the ratio. A thirty-minute client meeting generates fifteen minutes of admin after &mdash; typing notes, creating tasks, emailing a summary. Half your working life is spent on work about the work, instead of the work itself.
          </p>
          <p>
            We know about 2pm. You should be doing billable client work, but you&rsquo;ve spent the last hour on &ldquo;business&rdquo; &mdash; an invoice, four emails, a website update, a LinkedIn post, a rescheduled meeting. None of it is billable. None of it is why you started this.
          </p>
          <p>
            And we know about Sunday evenings. The spreadsheet CRM. The overdue invoices. The follow-up emails you&rsquo;ve been putting off. Two hours of unpaid work on your day off. Every single week.
          </p>

          <hr className="my-16 border-slate-200" />

          <p className="text-2xl font-serif text-slate-900 mb-8">Here&rsquo;s what changes.</p>

          <div className="not-prose my-8">
            <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
              <p className="text-sm font-semibold text-purple-700 uppercase tracking-wider mb-3">6:45 AM &mdash; Your watch</p>
              <p className="text-base text-slate-800 italic leading-relaxed">
                &ldquo;2 invoices overdue &mdash; chase emails drafted. 1 new prospect &mdash; reply ready for review. Today: 10am Sarah Chen (brief prepared &mdash; last meeting notes, outstanding balance, project status), 2pm discovery call (company research completed overnight). 3 tasks due.&rdquo;
              </p>
              <p className="text-sm text-purple-700 mt-3">You tap send on the invoices and approve the prospect reply before getting out of bed.</p>
            </div>
          </div>

          <p>
            Your 9am client meeting? You just listen and talk. HABOS captures the transcript, pulls out three action items, and drafts a follow-up email to the client. You review it on your phone, change one sentence, tap send. Total admin: ninety seconds.
          </p>
          <p>
            At 2pm you&rsquo;re doing billable work. The invoice was sent this morning &mdash; drafted from your project milestones and hourly rate. The four emails were handled between meetings through notification cards &mdash; three were AI-drafted replies you approved with one tap, one was a scheduling request the AI resolved by checking your calendar. The LinkedIn content was drafted from this morning&rsquo;s meeting insights.
          </p>
          <p>
            You didn&rsquo;t &ldquo;do admin&rdquo; today. It happened around you.
          </p>
          <p>
            Sunday evening? You&rsquo;re watching a movie. The CRM maintains itself from your emails and calls. Overdue invoices sent gentle reminders. Follow-up emails are drafted and queued for Monday morning. Your calendar, tasks, and project deadlines are in one system that knows what&rsquo;s next.
          </p>
          <p>
            Sunday evenings are yours again.
          </p>

          {/* Emotional section */}
          <div className="not-prose my-16 bg-slate-900 rounded-2xl px-8 py-12 md:px-12 md:py-16 text-center">
            <p className="text-xl md:text-2xl font-serif text-white leading-relaxed mb-6">
              The loneliest part of running a business alone isn&rsquo;t the work &mdash; it&rsquo;s having nobody to delegate to, nobody to remind you, nobody to catch the balls you drop.
            </p>
            <p className="text-lg md:text-xl font-serif text-slate-300 leading-relaxed">
              VOIS doesn&rsquo;t replace human connection. But it replaces the human admin labor that keeps you from the work you love and the life you started this business to have.
            </p>
          </div>

          <h2 className="text-2xl font-serif text-slate-900">What VOIS replaces</h2>
          <p>
            You probably have some version of this stack: ChatGPT for thinking, Calendly for bookings, Wave or QuickBooks for invoicing, Gmail for everything, Notion or Trello for tasks, Mailchimp for the occasional email blast, and your own memory for keeping track of who you owe a follow-up.
          </p>
          <p>
            HABOS replaces all of it with a single AI assistant that actually knows your business &mdash; your clients, your projects, your schedule, your pricing, your voice. ChatGPT knows the internet. VOIS knows <em>you</em>.
          </p>
          <p>
            It builds your CRM from conversations so you never update a spreadsheet again. It drafts emails in your voice and waits for your approval. It tracks commitments you make in meetings and reminds you before you forget. It gives you five AI Advisors &mdash; Finance, Strategy, Operations, Marketing, Sales &mdash; that disagree on purpose, because solo doesn&rsquo;t have to mean making every decision alone.
          </p>
          <p>
            And it runs on your Apple Watch, so you can check your day, approve an email, or capture an idea between meetings, on a walk, in an elevator.
          </p>

          <p>All for $35 a month.</p>

          <div className="not-prose my-10">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                ['15 hrs', 'freed per week'],
                ['$300+', 'saved monthly'],
                ['0', 'dropped follow-ups'],
                ['0', 'Sunday admin sessions'],
              ].map(([value, label]) => (
                <div key={label} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-slate-900">{value}</p>
                  <p className="text-xs text-slate-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <blockquote className="border-l-4 border-purple-400 pl-6 my-12 not-prose">
            <p className="text-xl font-serif italic text-slate-700 leading-relaxed mb-4">
              &ldquo;I used to spend every Sunday evening doing the admin I couldn&rsquo;t fit into the work week. Now VOIS handles my invoicing, my follow-ups, and my scheduling while I&rsquo;m doing client work. The AI Advisors are surprisingly useful &mdash; last month the Strategy advisor suggested I focus on a niche I hadn&rsquo;t considered. I landed two new clients from it. For the first time in six years of consulting, I feel like I have a team.&rdquo;
            </p>
            <p className="text-sm text-slate-500">
              &mdash; Camilla, 42 &middot; Independent management consultant &middot; Oslo
            </p>
          </blockquote>

          <div className="not-prose text-center py-12">
            <p className="text-2xl md:text-3xl font-serif text-slate-900 mb-6 leading-tight">
              Hire your first employee for $35/month.
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

export default SoloFounders;
