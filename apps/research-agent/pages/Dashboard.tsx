import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, ExternalLink, LogOut, Inbox } from 'lucide-react';
import { api } from '../lib/api';
import { clearAuthToken } from '../lib/auth';
import type { PersonalizedProspect, ProspectStatus } from '../lib/types';

const STATUS_BADGE: Record<ProspectStatus, string> = {
  draft: 'bg-slate-100 text-slate-700',
  researching: 'bg-blue-100 text-blue-700',
  ready: 'bg-amber-100 text-amber-700',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-slate-100 text-slate-400',
};

export default function Dashboard() {
  const [prospects, setProspects] = useState<PersonalizedProspect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api
      .listProspects()
      .then(setProspects)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    clearAuthToken();
    navigate('/login', { replace: true });
  };

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Research Agent</h1>
          <p className="text-slate-500 mt-1">
            Prospect dossiers and personalized landing pages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/support')}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 px-3 py-2 rounded-full hover:bg-slate-100 transition"
            title="Support inbox"
          >
            <Inbox size={16} /> Support
          </button>
          <button
            onClick={handleLogout}
            className="text-slate-500 hover:text-slate-700 p-2"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
          <button
            onClick={() => navigate('/new')}
            className="inline-flex items-center gap-2 bg-slate-900 text-white rounded-full px-5 py-2.5 font-semibold hover:bg-slate-800 transition"
          >
            <Plus size={16} /> New prospect
          </button>
        </div>
      </div>

      {loading && <div className="text-slate-500">Loading…</div>}
      {error && (
        <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm">{error}</div>
      )}

      <div className="space-y-2">
        {prospects.map((p) => (
          <Link
            key={p.id}
            to={`/prospects/${p.id}`}
            className="block bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition"
          >
            <div className="flex items-center gap-4">
              {p.company_logo_url ? (
                <img
                  src={p.company_logo_url}
                  alt=""
                  className="w-10 h-10 rounded object-contain bg-slate-50 border border-slate-100"
                />
              ) : (
                <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-400 font-semibold">
                  {p.company_name[0]?.toUpperCase() ?? '?'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {p.company_name}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[p.status]}`}
                  >
                    {p.status}
                  </span>
                  {p.category && (
                    <span className="text-xs text-slate-500">· {p.category}</span>
                  )}
                </div>
                <p className="text-sm text-slate-500 truncate">
                  {p.company_domain || p.industry || '—'}
                </p>
              </div>
              <div className="text-right text-xs text-slate-500 shrink-0">
                <div>{p.view_count ?? 0} views</div>
                {p.status === 'published' && (
                  <a
                    href={`https://habos.ai/for/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline mt-1"
                  >
                    /for/{p.slug} <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          </Link>
        ))}
        {!loading && prospects.length === 0 && !error && (
          <div className="text-center py-20 text-slate-500">
            No prospects yet.{' '}
            <Link to="/new" className="text-blue-600 hover:underline">
              Create your first one
            </Link>
            .
          </div>
        )}
      </div>
    </div>
  );
}
