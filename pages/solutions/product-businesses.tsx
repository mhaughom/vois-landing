import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar';
import { ArrowRight } from 'lucide-react';

const fade = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

/*
  FORMAT: The math.
  Product business owners think in margins, costs, and time-per-order.
  Lead with the numbers. Show the waste. Then show the fix.
*/

const ProductBusinesses: React.FC = () => (
  <div className="min-h-screen bg-white">
    <Navbar />

    <main className="pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">

        {/* Hero */}
        <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
          <p className="text-sm font-semibold text-emerald-600 tracking-widest uppercase mb-4">Solutions &mdash; Product Businesses</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
            Your entire shop in one place.
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed mb-4">
            Products, orders, inventory, website, marketing, and customer service &mdash; without the app switching.
          </p>
          <p className="text-base text-slate-400 mb-16">
            Online shops, retail stores, handmade goods, food producers, wholesale, subscription boxes, and anyone who sells physical or digital products.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fade}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-slate-700 leading-relaxed [&>p]:mb-6 [&>h2]:mt-16 [&>h2]:mb-4 [&>h3]:mt-12 [&>h3]:mb-3 [&>hr]:my-16"
        >
          {/* The cost breakdown */}
          <h2 className="text-2xl font-serif text-slate-900 mt-0">Do the math on your current stack</h2>
          <p>
            Shopify: $39/month. Mailchimp: $20/month. Later for social: $25/month. Gorgias for support: $60/month. A spreadsheet you maintain by hand for &ldquo;real&rdquo; inventory numbers. Squarespace for the website you update separately from your actual product catalog. A sticky note reminding you to reorder packaging from a supplier whose number is in your phone contacts.
          </p>
          <p>
            That&rsquo;s $144 a month in software &mdash; before accounting for the time you spend moving data between all of them.
          </p>

          <h2 className="text-2xl font-serif text-slate-900">Where the time goes</h2>
          <p>
            Four minutes to answer one &ldquo;where&rsquo;s my order?&rdquo; email. Check Shopify for the order, the shipping site for tracking, compose the reply in Gmail with the tracking number pasted in. Multiply by twelve customers a day. That&rsquo;s forty-eight minutes on a task that could be handled by an AI that already knows the order status and the tracking number.
          </p>
          <p>
            An entire afternoon to run a promotion. Your email list is in Mailchimp. Your purchase history is in Shopify. Your social content is managed through Later. A 15%-off campaign for returning customers means exporting data from one tool, importing it into another, and manually coordinating across a third.
          </p>
          <p>
            A popular item goes out of stock because the reorder reminder was an email you buried last week. Now you&rsquo;re expediting at double the shipping cost and losing sales in the meantime.
          </p>

          <h2 className="text-2xl font-serif text-slate-900">What changes with HABOS</h2>
          <p>
            One dashboard. Orders, stock levels, and customer messages in the same view. When a shipping inquiry comes in, the AI already has the order status and tracking number &mdash; it drafts the reply overnight. You review three of them in thirty seconds over your morning coffee.
          </p>
          <p>
            When stock runs low, HABOS flags it three days before you&rsquo;d notice. A purchase order is drafted with your usual supplier at the usual quantity. You approve it on your phone while walking to lunch.
          </p>

          <div className="not-prose my-8">
            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
              <p className="text-base text-slate-800 font-medium italic leading-relaxed mb-3">
                &ldquo;VOIS, create a campaign for returning customers &mdash; 15% off, email and Instagram, running next week.&rdquo;
              </p>
              <p className="text-sm text-emerald-700">
                AI pulls repeat customers from CRM. Drafts email copy in your brand voice. Suggests Instagram caption with your best-selling product photo. You tweak the subject line, tap approve. Five minutes.
              </p>
            </div>
          </div>

          <p>
            Your website is generated from your actual product catalog. Change a price, it updates on the site. Add a product, it appears. No separate CMS to maintain. No sync issues. No &ldquo;the website says $24.99 but it&rsquo;s actually $29.99 now.&rdquo;
          </p>

          <h2 className="text-2xl font-serif text-slate-900">The new math</h2>

          <div className="not-prose my-10">
            <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-slate-100">
                <div className="p-6 text-center">
                  <p className="text-sm text-slate-400 uppercase tracking-wider mb-2">Before</p>
                  <p className="text-3xl font-bold text-slate-300">$144+<span className="text-base font-normal">/mo</span></p>
                  <p className="text-sm text-slate-400 mt-1">6 tools, none connected</p>
                </div>
                <div className="p-6 text-center">
                  <p className="text-sm text-emerald-600 uppercase tracking-wider mb-2">After</p>
                  <p className="text-3xl font-bold text-slate-900">$35<span className="text-base font-normal">/mo</span></p>
                  <p className="text-sm text-slate-500 mt-1">Everything, connected</p>
                </div>
              </div>
              <div className="border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
                {[
                  ['8 hrs', 'saved on support/week'],
                  ['5 hrs', 'saved on marketing/week'],
                  ['0', 'stockouts from missed reorders'],
                  ['30 sec', 'to answer a shipping inquiry'],
                ].map(([value, label]) => (
                  <div key={label} className="p-4 text-center">
                    <p className="text-xl font-bold text-slate-900">{value}</p>
                    <p className="text-xs text-slate-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <blockquote className="border-l-4 border-emerald-400 pl-6 my-12 not-prose">
            <p className="text-xl font-serif italic text-slate-700 leading-relaxed mb-4">
              &ldquo;I was living in Shopify, Mailchimp, and Google Sheets simultaneously. Now I check one dashboard in the morning and everything is there. The AI replied to 6 customer emails while I was packing orders. My returns dropped because customers get instant answers instead of waiting a day.&rdquo;
            </p>
            <p className="text-sm text-slate-500">
              &mdash; Ingrid, 29 &middot; Nordic skincare brand &middot; 2 part-time employees
            </p>
          </blockquote>

          <div className="not-prose text-center py-12">
            <p className="text-2xl md:text-3xl font-serif text-slate-900 mb-6 leading-tight">
              Spend tomorrow making products, not managing software.
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

export default ProductBusinesses;
