import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Inbox } from 'lucide-react';
import { api } from '../lib/api';
import type { SupportThread, SupportThreadStatus } from '../lib/types';

const STATUS_TABS: Array<{ key: SupportThreadStatus | 'all'; label: string }> = [
  { key: 'unread', label: 'Unread' },
  { key: 'open', label: 'Open' },
  { key: 'waiting', label: 'Waiting' },
  { key: 'closed', label: 'Closed' },
  { key: 'all', label: 'All' },
];

const STATUS_BADGE: Record<SupportThreadStatus, string> = {
  unread: 'bg-blue-100 text-blue-700',
  open: 'bg-amber-100 text-amber-700',
  waiting: 'bg-slate-100 text-slate-600',
  closed: 'bg-slate-100 text-slate-400',
};

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days >= 1) return `${days}d`;
  const hours = Math.floor(ms / (1000 * 60 * 60));
  if (hours >= 1) return `${hours}h`;
  const mins = Math.floor(ms / (1000 * 60));
  return `${Math.max(mins, 1)}m`;
}

export default function Support() {
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<SupportThreadStatus | 'all'>('unread');
  const navigate = useNavigate();

  const load = async (tab: SupportThreadStatus | 'all') => {
    setLoading(true);
    setError('');
    try {
      const data = await api.listSupportThreads(tab === 'all' ? undefined : tab);
      setThreads(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(activeTab);
  }, [activeTab]);

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-2"
          >
            <ArrowLeft size={14} /> Prospects
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Inbox size={24} /> Support inbox
          </h1>
          <p className="text-slate-500 mt-1">
            Inbound email to habos.ai addresses, with AI-drafted replies
          </p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
              activeTab === tab.key
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      {loading && <div className="text-slate-500">Loading…</div>}

      <div className="space-y-2">
        {threads.map((t) => (
          <button
            key={t.id}
            onClick={() => navigate(`/support/${t.id}`)}
            className="w-full text-left block bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition"
          >
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_BADGE[t.status]}`}
                  >
                    {t.status}
                  </span>
                  <h3 className="font-semibold text-slate-900 truncate">
                    {t.from_name || t.from_email}
                  </h3>
                  <span className="text-xs text-slate-500 truncate">{t.from_email}</span>
                </div>
                <p className="text-sm text-slate-600 truncate mt-1">
                  {t.subject || '(no subject)'}
                </p>
              </div>
              <div className="text-xs text-slate-500 shrink-0">
                {relativeTime(t.last_message_at)}
              </div>
            </div>
          </button>
        ))}
        {!loading && threads.length === 0 && !error && (
          <div className="text-center py-20 text-slate-500">
            No threads in <strong>{activeTab}</strong>.
          </div>
        )}
      </div>
    </div>
  );
}
