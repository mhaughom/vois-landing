import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

export default function NewProspect() {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setError('');
    try {
      const prospect = await api.pipelineGather(url.trim(), name.trim() || undefined);
      navigate(`/prospects/${prospect.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to gather research');
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6 md:p-10">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeft size={14} /> Back to dashboard
      </Link>

      <h1 className="text-3xl font-bold text-slate-900 mb-2">New prospect</h1>
      <p className="text-slate-500 mb-8">
        Paste their website. The research agent will scrape the site, build a
        dossier, and fetch their logo.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Company URL <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="acme.com"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-slate-400 focus:outline-none"
            disabled={loading}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Company name (optional)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Acme Corp"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-slate-400 focus:outline-none"
            disabled={loading}
          />
          <p className="text-xs text-slate-500 mt-1">
            Leave blank to auto-detect from the site.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading || !url}
          className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 text-white rounded-xl py-3 font-semibold hover:bg-slate-800 disabled:opacity-50 transition"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Researching…' : 'Gather research'}
        </button>

        {loading && (
          <p className="text-center text-sm text-slate-500">
            Scraping site, fetching logo, synthesizing dossier — this usually
            takes 20-40 seconds.
          </p>
        )}
      </form>
    </div>
  );
}
