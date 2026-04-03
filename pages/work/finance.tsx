import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar';
import {
  ArrowLeft,
  Landmark,
  Mic,
  FileText,
  BarChart3,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

const metrics: {
  label: string;
  value: string;
  color: string;
  bg: string;
  border: string;
}[] = [
  { label: 'Invoiced', value: '$47,250', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  { label: 'Received', value: '$38,100', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  { label: 'Outstanding', value: '$9,150', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  { label: 'Overdue', value: '$2,300', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
];

const moneyIn: {
  client: string;
  amount: string;
  status: string;
  statusColor: string;
  icon: React.FC<{ size?: number; className?: string }>;
}[] = [
  { client: 'Henderson Reno', amount: '$12,500', status: 'Paid', statusColor: 'text-green-600', icon: CheckCircle2 },
  { client: 'Baker HVAC', amount: '$8,200', status: 'Outstanding', statusColor: 'text-amber-600', icon: Clock },
  { client: 'Wilson Plumb', amount: '$2,300', status: 'Overdue (14 days)', statusColor: 'text-red-600', icon: AlertTriangle },
];

const moneyOut: {
  item: string;
  amount: string;
  status: string;
  statusColor: string;
}[] = [
  { item: 'Tile supplies', amount: '$1,850', status: 'Paid', statusColor: 'text-green-600' },
  { item: 'Vehicle fuel', amount: '$420', status: 'Voice captured', statusColor: 'text-blue-600' },
  { item: 'Subcontractor', amount: '$3,200', status: 'Pending', statusColor: 'text-amber-600' },
];

const Finance: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* --- Content --- */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* 1. Hero */}
          <motion.section {...fadeUp()} className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-700 rounded-full text-sm font-medium mb-6">
              <Landmark size={14} />
              Financial Command Center
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]">
              Money In. Money Out. One Truth.
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
              Receivables from your accounting platform, operational expenses from HABOS,
              voice-captured costs from the field &mdash; all reconciled in one dashboard.
            </p>
          </motion.section>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mx-auto mb-16">
            <p className="text-lg text-slate-600 leading-relaxed text-center">
              The Finance module provides a unified view of all money flowing through the business. Receivables sync from your accounting platform with invoice status tracking — draft, sent, partially paid, paid, overdue. Expenses are captured by voice: say 'spent $45 on tile adhesive at the hardware store' and the Smart Router creates an expense record with merchant, amount, and project allocation. Monthly revenue snapshots rebuild automatically for cash flow visibility.
            </p>
          </motion.div>

          {/* 2. Mock finance dashboard */}
          <motion.section {...fadeUp(0.15)} className="mb-20">
            <div className="bg-green-50/50 rounded-3xl p-6 md:p-8">

              {/* Top row: 4 metric cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {metrics.map((m) => (
                  <div
                    key={m.label}
                    className={`${m.bg} ${m.border} border rounded-xl p-4 text-center`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      {m.label}
                    </p>
                    <p className={`text-2xl md:text-3xl font-bold ${m.color}`}>{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Two columns: Money In / Money Out */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {/* Money In */}
                <div>
                  <p className="font-semibold text-slate-900 mb-3">Money In</p>
                  <div className="space-y-1.5">
                    {moneyIn.map((row) => (
                      <div
                        key={row.client}
                        className="bg-white rounded-lg p-3 border border-slate-200 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <row.icon size={15} className={row.statusColor} />
                          <span className="text-sm text-slate-700 truncate">{row.client}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-sm font-medium text-slate-900">{row.amount}</span>
                          <span className={`text-xs font-semibold ${row.statusColor}`}>{row.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Money Out */}
                <div>
                  <p className="font-semibold text-slate-900 mb-3">Money Out</p>
                  <div className="space-y-1.5">
                    {moneyOut.map((row) => (
                      <div
                        key={row.item}
                        className="bg-white rounded-lg p-3 border border-slate-200 flex items-center justify-between gap-3"
                      >
                        <span className="text-sm text-slate-700 truncate">{row.item}</span>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-sm font-medium text-slate-900">{row.amount}</span>
                          <span className={`text-xs font-semibold ${row.statusColor}`}>{row.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 text-center mt-4">
                Receivables sync from your accounting platform. Expenses captured by voice, receipt, or manual entry.
                Monthly revenue snapshots rebuild automatically.
              </p>
            </div>
          </motion.section>

          {/* 3. Three benefit cards */}
          <motion.section {...fadeUp(0.25)} className="mb-20">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Voice expense capture */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                    <Mic size={18} className="text-green-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Voice expense capture</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Say &ldquo;spent $180 on tile at Home Depot&rdquo; while driving. HABOS creates
                  the expense, auto-matches the merchant, and suggests the account code.
                </p>
              </div>

              {/* Invoice automation */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText size={18} className="text-green-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Invoice automation</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Turn HABOS orders and time entries into accounting invoices. Smart entity resolution
                  maps CRM clients to accounting contacts automatically.
                </p>
              </div>

              {/* Monthly snapshots */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                    <BarChart3 size={18} className="text-green-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Monthly snapshots</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Invoiced, received, outstanding, and overdue totals rebuild monthly. See cash flow
                  trends without a spreadsheet.
                </p>
              </div>
            </div>
          </motion.section>

          {/* 4. Scenario callout */}
          <motion.section {...fadeUp(0.35)} className="mb-20">
            <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-10">
              <p className="text-lg md:text-xl leading-relaxed text-slate-200">
                End of month. Your accountant asks: &ldquo;What&rsquo;s the outstanding balance and
                which clients are overdue?&rdquo; Instead of exporting from 3 systems and
                cross-referencing in Excel &mdash; you open HABOS Finance.{' '}
                <span className="text-white font-semibold">
                  $9,150 outstanding, $2,300 overdue from Wilson Plumbing (14 days). One screen,
                  real numbers from your accounting platform, zero reconciliation.
                </span>
              </p>
            </div>
          </motion.section>

          {/* 5. Tech strip */}
          <motion.section {...fadeUp(0.45)} className="mb-20">
            <div className="bg-slate-950 rounded-2xl py-5 px-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
              <span>Accounting platform sync</span>
              <span className="text-slate-600">&middot;</span>
              <span>Entity resolution</span>
              <span className="text-slate-600">&middot;</span>
              <span>Idempotent operations</span>
              <span className="text-slate-600">&middot;</span>
              <span>Voice expense capture</span>
              <span className="text-slate-600">&middot;</span>
              <span>Monthly revenue rebuild</span>
            </div>
          </motion.section>

          {/* 6. Closing CTA */}
          <motion.section {...fadeUp(0.55)} className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-slate-900 mb-5 leading-tight">
              Other dashboards show estimates.<br />
              HABOS shows accounting truth.
            </h2>
            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 px-8 py-3.5 bg-green-600 text-white rounded-full font-medium text-sm shadow-lg shadow-green-600/20 hover:bg-green-700 transition-colors"
              >
                Join Waitlist
              </motion.button>
            </a>
          </motion.section>

        </div>
      </main>
    </div>
  );
};

export default Finance;
