import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar';
import { ArrowRight } from 'lucide-react';

const fade = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

/*
  FORMAT: Day-in-the-life narrative.
  No section headers. No feature grids. Just Lars's day, told as a story,
  weaving HABOS in naturally. Tradespeople think in "my day," not feature lists.
*/

const ServiceBusinesses: React.FC = () => (
  <div className="min-h-screen bg-white">
    <Navbar />

    <main className="pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">

        {/* Hero */}
        <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
          <p className="text-sm font-semibold text-amber-600 tracking-widest uppercase mb-4">Solutions &mdash; Service Businesses</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
            Run your service business with your voice.
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed mb-4">
            From the job site to the invoice &mdash; without touching a keyboard.
          </p>
          <p className="text-base text-slate-400 mb-16">
            Plumbers, electricians, cleaners, consultants, therapists, accountants, coaches, and anyone who sells time, expertise, or labor.
          </p>
        </motion.div>

        {/* The story */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fade}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-slate-700 leading-relaxed [&>p]:mb-6 [&>h2]:mt-16 [&>h2]:mb-4 [&>h3]:mt-12 [&>h3]:mb-3 [&>hr]:my-16"
        >
          <p className="text-sm font-semibold text-slate-400 tracking-widest uppercase">Lars&rsquo;s Tuesday</p>
          <h2 className="text-2xl font-serif text-slate-900 mt-2">7:30 AM &mdash; Coffee and the plan</h2>
          <p>
            Lars is a master plumber in Troms&oslash;. Four employees. Before HABOS, mornings meant checking Google Calendar, a spreadsheet of job details, and WhatsApp for last-minute cancellations. Today he opens one app. His schedule is there, with client history, addresses, and notes for each job. A client rescheduled overnight via email &mdash; the AI already moved the appointment, adjusted the route, and drafted a confirmation. Lars taps &ldquo;confirm&rdquo; while his coffee is still too hot to drink.
          </p>

          <h2 className="text-2xl font-serif text-slate-900">11:45 AM &mdash; The van</h2>
          <p>
            Lars just finished replacing a shut-off valve at the Johnson house. Before HABOS, this moment was a black hole &mdash; he&rsquo;d text himself &ldquo;Johnson &mdash; replaced valve, order new fitting&rdquo; and never get around to invoicing it properly. Now he raises his wrist:
          </p>

          <div className="not-prose my-8">
            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
              <p className="text-base text-slate-800 font-medium italic leading-relaxed mb-3">
                &ldquo;VOIS, Johnson job done. Replaced the shut-off valve and the supply line. Need to order a Grohe mixer tap from Backer, 3,200 kroner. Quote them 4,800 installed.&rdquo;
              </p>
              <p className="text-sm text-amber-700">
                Twenty seconds. Job report filed. CRM updated. Purchase order drafted. Quote ready for review.
              </p>
            </div>
          </div>

          <p>
            He&rsquo;s walking to the van. That&rsquo;s it. The system parsed his voice into structured data &mdash; parts used, costs, follow-ups, client sentiment &mdash; and routed each piece to the right place. No typing. No laptop. No &ldquo;I&rsquo;ll do it tonight.&rdquo;
          </p>

          <h2 className="text-2xl font-serif text-slate-900">3:20 PM &mdash; On the road</h2>
          <p>
            Lars is driving. A new inquiry lands in the shared inbox &mdash; a homeowner asking about a bathroom renovation. Before HABOS, this email would sit unanswered for hours. By 5pm, the prospect would have booked someone else. Research shows 78% of customers go with the first business that responds.
          </p>
          <p>
            Instead, the AI assesses the inquiry, classifies it as a new lead, and drafts a reply in Lars&rsquo;s voice. At a red light, a notification shows: &ldquo;New lead &mdash; bathroom renovation. Reply ready.&rdquo; Lars glances at the draft: <em>&ldquo;Thanks for reaching out. I&rsquo;d be happy to take a look. I have availability starting mid-May &mdash; would a site visit on the 15th or 16th work?&rdquo;</em> He taps send. Two minutes. The prospect is impressed. Lars&rsquo;s competitor still hasn&rsquo;t opened the email.
          </p>

          <h2 className="text-2xl font-serif text-slate-900">9:15 PM &mdash; The couch</h2>
          <p>
            Before HABOS, this was admin hour. Invoicing from memory. Replying to six emails. Updating the CRM he stopped maintaining in February. Scheduling tomorrow. Two hours of unpaid work, every night.
          </p>
          <p>
            Tonight, Lars is watching TV. The invoice for the Johnson job was drafted from his voice note, reviewed on his phone at 6pm, and sent with one tap. Four emails were handled through notification cards between jobs. Tomorrow&rsquo;s schedule is set. The purchase order for the Grohe mixer is awaiting supplier confirmation.
          </p>
          <p>
            His evening belongs to his family.
          </p>

          {/* Transition to the practical details */}
          <hr className="my-16 border-slate-200" />

          <h2 className="text-2xl font-serif text-slate-900 mt-0">What Lars used to pay for</h2>
          <p>
            Before HABOS, Lars had Calendly for bookings, Fiken for accounting, a half-maintained HubSpot CRM, Todoist for tasks, Gmail for customer emails, WhatsApp for messaging, and was looking at Jobber for dispatch. Combined: over $300 a month in subscriptions, most of them underused.
          </p>
          <p>
            HABOS replaces all of them. Scheduling with Stripe payments and double-booking prevention. Finance with voice expense capture and Norwegian compliance. CRM that builds itself from conversations. Tasks extracted from voice notes. A unified inbox with AI replies in his voice. Dispatch and route planning. One platform. $35 a month.
          </p>

          <h2 className="text-2xl font-serif text-slate-900">What changed for his business</h2>
          <p>
            Admin dropped from fourteen hours a week to four. Average response time on new inquiries went from four hours to five minutes. Last month, his team booked eight jobs from email inquiries they would have lost before &mdash; because HABOS replied while they were still on ladders.
          </p>
          <p>
            Zero invoices forgotten. Zero leads lost to slow response. Zero evenings spent on a laptop.
          </p>

          {/* Testimonial */}
          <blockquote className="border-l-4 border-amber-400 pl-6 my-12 not-prose">
            <p className="text-xl font-serif italic text-slate-700 leading-relaxed mb-4">
              &ldquo;I used to spend every evening doing invoices and emails. Now I talk to my watch after each job and everything is done by dinner. Last month we booked 8 jobs we would have lost &mdash; because HABOS replied in 2 minutes while I was still on a ladder.&rdquo;
            </p>
            <p className="text-sm text-slate-500">
              &mdash; Lars, 41 &middot; Master plumber &middot; 4 employees &middot; Troms&oslash;
            </p>
          </blockquote>

          {/* CTA */}
          <div className="not-prose text-center py-12">
            <p className="text-2xl md:text-3xl font-serif text-slate-900 mb-6 leading-tight">
              Your last evening of unpaid admin starts now.
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

export default ServiceBusinesses;
