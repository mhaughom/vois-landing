import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Copy,
  Send,
  Eye,
  History,
} from 'lucide-react';
import { api } from '../lib/api';
import type {
  ArtifactType,
  GenerationHistoryEntry,
  PersonalizedProspect,
  ProspectCategory,
  ResearchDossier,
} from '../lib/types';

// ─── Static config ────────────────────────────────────────────────────────

type DossierKey =
  | 'overview_md'
  | 'leadership_md'
  | 'products_md'
  | 'positioning_md'
  | 'stack_md'
  | 'news_md';

const DOSSIER_TABS: Array<{ key: DossierKey; label: string }> = [
  { key: 'overview_md', label: 'Overview' },
  { key: 'leadership_md', label: 'Leadership' },
  { key: 'products_md', label: 'Products' },
  { key: 'positioning_md', label: 'Positioning' },
  { key: 'stack_md', label: 'Stack' },
  { key: 'news_md', label: 'News' },
];

const CATEGORY_OPTIONS: ProspectCategory[] = [
  'investor',
  'blue-collar',
  'white-collar',
  'hybrid',
];

const STALENESS_THRESHOLD_DAYS = 60;

type PipelineAction =
  | 'classify'
  | 'generate-hero'
  | 'generate-email'
  | 'send-email'
  | 'publish'
  | null;

// ─── Helpers ──────────────────────────────────────────────────────────────

function relativeTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days >= 1) return `${days}d ago`;
  const hours = Math.floor(ms / (1000 * 60 * 60));
  if (hours >= 1) return `${hours}h ago`;
  const mins = Math.floor(ms / (1000 * 60));
  return `${Math.max(mins, 1)}m ago`;
}

function daysSince(iso: string | null | undefined): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Main component ───────────────────────────────────────────────────────

export default function ProspectDetail() {
  const { id = '' } = useParams<{ id: string }>();
  const [prospect, setProspect] = useState<PersonalizedProspect | null>(null);
  const [activeTab, setActiveTab] = useState<DossierKey>('overview_md');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [heroSaving, setHeroSaving] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);
  const [pipelineBusy, setPipelineBusy] = useState<PipelineAction>(null);

  // Local editable copy of the dossier markdown sections.
  // Rendered directly from the current prospect.dossier; saved onBlur per section.
  const [dossierLocal, setDossierLocal] = useState<Record<DossierKey, string>>({
    overview_md: '',
    leadership_md: '',
    products_md: '',
    positioning_md: '',
    stack_md: '',
    news_md: '',
  });
  const [dossierSectionSaving, setDossierSectionSaving] = useState<DossierKey | null>(null);
  const [dossierPreview, setDossierPreview] = useState(false);

  // Local editable copies of the hero + email fields
  const [hero, setHero] = useState({
    hero_eyebrow: '',
    hero_headline: '',
    hero_subline: '',
    hero_cta_label: 'Book a walkthrough',
    hero_cta_url: '',
    hero_image_url: '',
    hero_video_url: '',
  });

  const [emailDraft, setEmailDraft] = useState({
    recipient_email: '',
    email_subject: '',
    email_body: '',
  });

  // Generation history
  const [heroHistory, setHeroHistory] = useState<GenerationHistoryEntry[]>([]);
  const [emailHistory, setEmailHistory] = useState<GenerationHistoryEntry[]>([]);
  const [showHeroHistory, setShowHeroHistory] = useState(false);
  const [showEmailHistory, setShowEmailHistory] = useState(false);

  const syncFromProspect = (p: PersonalizedProspect) => {
    const d = p.dossier || {};
    setDossierLocal({
      overview_md: d.overview_md || '',
      leadership_md: d.leadership_md || '',
      products_md: d.products_md || '',
      positioning_md: d.positioning_md || '',
      stack_md: d.stack_md || '',
      news_md: d.news_md || '',
    });
    setHero({
      hero_eyebrow: p.hero_eyebrow ?? '',
      hero_headline: p.hero_headline ?? '',
      hero_subline: p.hero_subline ?? '',
      hero_cta_label: p.hero_cta_label || 'Book a walkthrough',
      hero_cta_url: p.hero_cta_url ?? '',
      hero_image_url: p.hero_image_url ?? '',
      hero_video_url: p.hero_video_url ?? '',
    });
    setEmailDraft({
      recipient_email: p.recipient_email ?? '',
      email_subject: p.email_subject ?? '',
      email_body: p.email_body ?? '',
    });
  };

  const loadProspect = useCallback(async () => {
    try {
      const data = await api.getProspect(id);
      setProspect(data);
      syncFromProspect(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadHistory = useCallback(async (type: ArtifactType) => {
    try {
      const entries = await api.getHistory(id, type);
      if (type === 'hero') setHeroHistory(entries);
      else setEmailHistory(entries);
    } catch (err) {
      // Non-fatal
      console.error('[ProspectDetail] history load error', err);
    }
  }, [id]);

  useEffect(() => {
    loadProspect();
    loadHistory('hero');
    loadHistory('email');
  }, [loadProspect, loadHistory]);

  // ─── Approval ───────────────────────────────────────────────────────────

  const isApproved = !!prospect?.dossier_approved_at;
  const approvalAgeDays = prospect?.dossier_approved_at
    ? daysSince(prospect.dossier_approved_at)
    : null;

  const toggleApproval = async () => {
    if (!prospect) return;
    setError('');
    try {
      const updated = await api.updateProspect(prospect.id, {
        dossier_approved_at: isApproved ? null : new Date().toISOString(),
      } as any);
      setProspect(updated);
      syncFromProspect(updated);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ─── Dossier editing ────────────────────────────────────────────────────

  const saveDossierSection = async (key: DossierKey, value: string) => {
    if (!prospect) return;
    const currentSaved = (prospect.dossier?.[key] as string | undefined) || '';
    if (value === currentSaved) return; // no-op
    setDossierSectionSaving(key);
    setError('');
    try {
      const mergedDossier: ResearchDossier = {
        ...(prospect.dossier || {}),
        [key]: value,
      };
      const updated = await api.updateProspect(prospect.id, {
        dossier: mergedDossier,
      } as any);
      setProspect(updated);
      // Don't re-sync dossierLocal — user may still be editing
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDossierSectionSaving(null);
    }
  };

  // ─── Staleness ──────────────────────────────────────────────────────────

  const dossierAgeDays = useMemo(() => {
    const ts = prospect?.dossier?.dossier_generated_at;
    return ts ? daysSince(ts) : null;
  }, [prospect?.dossier?.dossier_generated_at]);

  const isStale = dossierAgeDays !== null && dossierAgeDays > STALENESS_THRESHOLD_DAYS;

  // ─── Category ───────────────────────────────────────────────────────────

  const runClassify = async () => {
    if (!prospect) return;
    setPipelineBusy('classify');
    setError('');
    try {
      await api.pipelineClassify(prospect.id);
      await loadProspect();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPipelineBusy(null);
    }
  };

  const setCategory = async (category: ProspectCategory) => {
    if (!prospect) return;
    setError('');
    try {
      const updated = await api.updateProspect(prospect.id, { category });
      setProspect(updated);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ─── Hero pipeline ──────────────────────────────────────────────────────

  const runGenerateHero = async () => {
    if (!prospect) return;
    setPipelineBusy('generate-hero');
    setError('');
    try {
      await api.pipelineGenerateHero(prospect.id);
      await loadProspect();
      await loadHistory('hero');
    } catch (err: any) {
      setError(formatError(err));
    } finally {
      setPipelineBusy(null);
    }
  };

  const saveHero = async () => {
    if (!prospect) return;
    setHeroSaving(true);
    setError('');
    try {
      const updated = await api.updateProspect(prospect.id, hero);
      setProspect(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setHeroSaving(false);
    }
  };

  // ─── Email pipeline ─────────────────────────────────────────────────────

  const saveEmailDraft = async () => {
    if (!prospect) return;
    setEmailSaving(true);
    setError('');
    try {
      const updated = await api.updateProspect(prospect.id, emailDraft);
      setProspect(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEmailSaving(false);
    }
  };

  const runGenerateEmail = async () => {
    if (!prospect) return;
    setPipelineBusy('generate-email');
    setError('');
    try {
      await api.pipelineGenerateEmail(prospect.id);
      await loadProspect();
      await loadHistory('email');
    } catch (err: any) {
      setError(formatError(err));
    } finally {
      setPipelineBusy(null);
    }
  };

  const runSendEmail = async () => {
    if (!prospect) return;
    // Save any unsaved edits first so Resend sends the latest text
    if (
      emailDraft.recipient_email !== (prospect.recipient_email ?? '') ||
      emailDraft.email_subject !== (prospect.email_subject ?? '') ||
      emailDraft.email_body !== (prospect.email_body ?? '')
    ) {
      await saveEmailDraft();
    }
    if (!confirm(`Send this email to ${emailDraft.recipient_email}?`)) return;
    setPipelineBusy('send-email');
    setError('');
    try {
      await api.pipelineSendEmail(prospect.id);
      await loadProspect();
    } catch (err: any) {
      setError(formatError(err));
    } finally {
      setPipelineBusy(null);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Tiny transient feedback via error state (reusing the error banner)
      setError(`Copied ${label} to clipboard.`);
      setTimeout(() => setError(''), 2000);
    } catch {
      setError('Copy failed — browser blocked clipboard access.');
    }
  };

  // ─── Publish ────────────────────────────────────────────────────────────

  const runPublish = async () => {
    if (!prospect) return;
    setPipelineBusy('publish');
    setError('');
    try {
      await api.pipelinePublish(prospect.id);
      await loadProspect();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPipelineBusy(null);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  if (loading) return <div className="p-10 text-slate-500">Loading…</div>;
  if (error && !prospect) return <div className="p-10 text-red-600">{error}</div>;
  if (!prospect) return null;

  const publicUrl = `https://habos.ai/for/${prospect.slug}`;
  const activeDossierValue = dossierLocal[activeTab];
  const generateBlocked = !isApproved;

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-10">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeft size={14} /> Back
      </Link>

      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-4 mb-6">
        {prospect.company_logo_url ? (
          <img
            src={prospect.company_logo_url}
            alt=""
            className="w-16 h-16 rounded-xl object-contain bg-white border border-slate-200 p-2"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-2xl font-semibold">
            {prospect.company_name[0]?.toUpperCase() ?? '?'}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">
            {prospect.company_name}
          </h1>
          <p className="text-slate-500">
            {prospect.company_domain || '—'} · {prospect.industry || '—'} ·{' '}
            {prospect.company_size || '—'}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              {prospect.status}
            </span>
            {(prospect.view_count ?? 0) > 0 && (
              <span className="text-xs text-slate-500">
                {prospect.view_count} views
              </span>
            )}
            {prospect.email_status === 'sent' && prospect.email_sent_at && (
              <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                <Send size={10} /> Sent {relativeTime(prospect.email_sent_at)}
              </span>
            )}
          </div>
        </div>
        {prospect.status === 'published' && (
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline shrink-0"
          >
            View public page <ExternalLink size={14} />
          </a>
        )}
      </div>

      {/* ─── Error banner ───────────────────────────────────────────────── */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      {/* ─── Staleness banner ──────────────────────────────────────────── */}
      {isStale && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
          <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-800">
            <strong>Dossier is {dossierAgeDays} days old.</strong> Consider re-running
            Gather before sending new outbound — company details may have changed.
          </div>
        </div>
      )}

      {/* ─── Approval card ─────────────────────────────────────────────── */}
      <div
        className={`border rounded-2xl p-5 mb-6 ${
          isApproved
            ? 'bg-green-50 border-green-200'
            : 'bg-amber-50 border-amber-200'
        }`}
      >
        <div className="flex items-start gap-3">
          {isApproved ? (
            <ShieldCheck size={20} className="text-green-600 mt-0.5" />
          ) : (
            <ShieldAlert size={20} className="text-amber-600 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="font-semibold text-slate-900">
              {isApproved ? 'Dossier approved' : 'Dossier not yet approved'}
            </div>
            <p className="text-sm text-slate-600 mt-0.5">
              {isApproved
                ? `Approved ${approvalAgeDays === 0 ? 'today' : `${approvalAgeDays}d ago`}. Hero and email generation are unlocked.`
                : 'Review and edit the dossier below. Generation is blocked until you approve.'}
            </p>
          </div>
          <button
            onClick={toggleApproval}
            className={`px-4 py-2 rounded-full text-sm font-semibold shrink-0 ${
              isApproved
                ? 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isApproved ? 'Unapprove' : 'Approve dossier'}
          </button>
        </div>
      </div>

      {/* ─── Category ──────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-900">Category</h2>
          <button
            onClick={runClassify}
            disabled={pipelineBusy === 'classify'}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 disabled:opacity-50"
          >
            {pipelineBusy === 'classify' ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <RefreshCw size={12} />
            )}
            {prospect.category ? 'Re-classify' : 'Classify'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {CATEGORY_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                prospect.category === c
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        {prospect.category_reason && (
          <p className="text-sm text-slate-500 italic">{prospect.category_reason}</p>
        )}
      </div>

      {/* ─── Dossier tabs (editable) ───────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl mb-6 overflow-hidden">
        <div className="border-b border-slate-200 flex items-center justify-between">
          <div className="flex overflow-x-auto">
            {DOSSIER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition ${
                  activeTab === tab.key
                    ? 'border-b-2 border-slate-900 text-slate-900'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-4">
            {dossierSectionSaving === activeTab && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Loader2 size={10} className="animate-spin" /> Saving
              </span>
            )}
            <button
              onClick={() => setDossierPreview((v) => !v)}
              className="text-xs text-slate-500 hover:text-slate-700 inline-flex items-center gap-1"
            >
              <Eye size={12} /> {dossierPreview ? 'Edit' : 'Preview'}
            </button>
          </div>
        </div>
        <div className="p-6">
          {dossierPreview ? (
            <div className="prose prose-slate max-w-none">
              {activeDossierValue ? (
                <ReactMarkdown>{activeDossierValue}</ReactMarkdown>
              ) : (
                <p className="text-slate-400 italic">No content for this section yet.</p>
              )}
            </div>
          ) : (
            <textarea
              value={activeDossierValue}
              onChange={(e) =>
                setDossierLocal({ ...dossierLocal, [activeTab]: e.target.value })
              }
              onBlur={(e) => saveDossierSection(activeTab, e.target.value)}
              placeholder="Markdown content for this section…"
              rows={14}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:border-slate-400 focus:outline-none resize-y"
            />
          )}
        </div>
      </div>

      {/* ─── Hero editor ───────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4 gap-3">
          <div>
            <h2 className="font-semibold text-slate-900">Hero content</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              The only thing that's custom on the public page. Everything else is the normal landing page.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {heroHistory.length > 0 && (
              <button
                onClick={() => setShowHeroHistory((v) => !v)}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
              >
                <History size={12} /> History ({heroHistory.length})
              </button>
            )}
            <button
              onClick={runGenerateHero}
              disabled={pipelineBusy === 'generate-hero' || generateBlocked}
              title={generateBlocked ? 'Approve the dossier first' : 'Generate hero copy with Claude'}
              className="inline-flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 disabled:opacity-50 px-3 py-1.5 rounded-full font-medium"
            >
              {pipelineBusy === 'generate-hero' ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Sparkles size={12} />
              )}
              Generate with Claude
            </button>
          </div>
        </div>

        {generateBlocked && (
          <div className="mb-4 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
            Generation is blocked until the dossier is approved.
          </div>
        )}

        {showHeroHistory && (
          <HistoryDropdown
            entries={heroHistory}
            render={(e) => {
              const o = e.outputs as { hero_headline?: string };
              return o.hero_headline || '(empty)';
            }}
            onClose={() => setShowHeroHistory(false)}
          />
        )}

        <div className="space-y-3">
          <Field
            label="Eyebrow"
            value={hero.hero_eyebrow}
            onChange={(v) => setHero({ ...hero, hero_eyebrow: v })}
            placeholder={`For ${prospect.company_name}`}
          />
          <Field
            label="Headline"
            value={hero.hero_headline}
            onChange={(v) => setHero({ ...hero, hero_headline: v })}
            placeholder="Big bold headline"
            textarea
          />
          <Field
            label="Subline"
            value={hero.hero_subline}
            onChange={(v) => setHero({ ...hero, hero_subline: v })}
            placeholder="Supporting sentence"
            textarea
          />
          <Field
            label="CTA label"
            value={hero.hero_cta_label}
            onChange={(v) => setHero({ ...hero, hero_cta_label: v })}
            placeholder="Book a walkthrough"
          />
          <Field
            label="CTA URL (Calendly)"
            value={hero.hero_cta_url}
            onChange={(v) => setHero({ ...hero, hero_cta_url: v })}
            placeholder="https://calendly.com/…"
          />
          <Field
            label="Hero image URL (optional)"
            value={hero.hero_image_url}
            onChange={(v) => setHero({ ...hero, hero_image_url: v })}
            placeholder="https://…"
          />
          <Field
            label="Hero video URL (optional — e.g. Kling output)"
            value={hero.hero_video_url}
            onChange={(v) => setHero({ ...hero, hero_video_url: v })}
            placeholder="https://…"
          />
        </div>

        <button
          onClick={saveHero}
          disabled={heroSaving}
          className="mt-5 bg-slate-900 text-white rounded-xl px-5 py-2.5 font-semibold hover:bg-slate-800 disabled:opacity-50 transition"
        >
          {heroSaving ? 'Saving…' : 'Save hero'}
        </button>
      </div>

      {/* ─── Email editor ──────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4 gap-3">
          <div>
            <h2 className="font-semibold text-slate-900">Outbound email</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Plain text, sent from{' '}
              <code className="bg-slate-100 px-1 rounded text-[10px]">mathias@habos.ai</code> via Resend.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {emailHistory.length > 0 && (
              <button
                onClick={() => setShowEmailHistory((v) => !v)}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
              >
                <History size={12} /> History ({emailHistory.length})
              </button>
            )}
            <button
              onClick={runGenerateEmail}
              disabled={pipelineBusy === 'generate-email' || generateBlocked}
              title={generateBlocked ? 'Approve the dossier first' : 'Generate email with Claude'}
              className="inline-flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 disabled:opacity-50 px-3 py-1.5 rounded-full font-medium"
            >
              {pipelineBusy === 'generate-email' ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Sparkles size={12} />
              )}
              Generate with Claude
            </button>
          </div>
        </div>

        {showEmailHistory && (
          <HistoryDropdown
            entries={emailHistory}
            render={(e) => {
              const o = e.outputs as { subject?: string };
              return o.subject || '(empty)';
            }}
            onClose={() => setShowEmailHistory(false)}
          />
        )}

        <div className="space-y-3">
          <Field
            label="Recipient email"
            value={emailDraft.recipient_email}
            onChange={(v) => setEmailDraft({ ...emailDraft, recipient_email: v })}
            placeholder="name@company.com"
          />
          <Field
            label="Subject"
            value={emailDraft.email_subject}
            onChange={(v) => setEmailDraft({ ...emailDraft, email_subject: v })}
            placeholder="Subject line"
          />
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">
              Body (plain text)
            </label>
            <textarea
              value={emailDraft.email_body}
              onChange={(e) => setEmailDraft({ ...emailDraft, email_body: e.target.value })}
              placeholder="Hi…"
              rows={14}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:border-slate-400 focus:outline-none resize-y"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={saveEmailDraft}
            disabled={emailSaving}
            className="bg-slate-900 text-white rounded-xl px-5 py-2.5 font-semibold hover:bg-slate-800 disabled:opacity-50 transition"
          >
            {emailSaving ? 'Saving…' : 'Save draft'}
          </button>
          <button
            onClick={() =>
              copyToClipboard(
                `Subject: ${emailDraft.email_subject}\n\n${emailDraft.email_body}`,
                'email',
              )
            }
            disabled={!emailDraft.email_subject && !emailDraft.email_body}
            className="inline-flex items-center gap-1 bg-white text-slate-700 border border-slate-200 rounded-xl px-5 py-2.5 font-semibold hover:border-slate-300 disabled:opacity-50 transition"
          >
            <Copy size={14} /> Copy
          </button>
          <button
            onClick={runSendEmail}
            disabled={
              pipelineBusy === 'send-email' ||
              !emailDraft.recipient_email ||
              !emailDraft.email_subject ||
              !emailDraft.email_body
            }
            className="inline-flex items-center gap-1 bg-green-600 text-white rounded-xl px-5 py-2.5 font-semibold hover:bg-green-700 disabled:opacity-50 transition ml-auto"
          >
            {pipelineBusy === 'send-email' ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            {prospect.email_status === 'sent' ? 'Send again' : 'Send via Resend'}
          </button>
        </div>
      </div>

      {/* ─── Publish ──────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-semibold text-slate-900 mb-2">Publish landing page</h2>
        <p className="text-sm text-slate-500 mb-4">
          Flips status to{' '}
          <code className="bg-slate-100 px-1 rounded text-xs">published</code>. The page
          becomes live at{' '}
          <code className="bg-slate-100 px-1 rounded text-xs">
            habos.ai/for/{prospect.slug}
          </code>
          .
        </p>
        <button
          onClick={runPublish}
          disabled={pipelineBusy === 'publish' || prospect.status === 'published'}
          className="inline-flex items-center gap-2 bg-green-600 text-white rounded-xl px-5 py-2.5 font-semibold hover:bg-green-700 disabled:opacity-50 transition"
        >
          {pipelineBusy === 'publish' ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <CheckCircle2 size={16} />
          )}
          {prospect.status === 'published' ? 'Already published' : 'Publish'}
        </button>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────

function formatError(err: any): string {
  // Parse 409 research_required errors into a friendly message
  const msg = err?.message || String(err);
  if (msg.includes('research_required')) {
    return 'Dossier must be reviewed and approved first. Scroll up and click "Approve dossier".';
  }
  return msg;
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}

function Field({ label, value, onChange, placeholder, textarea }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">
        {label}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
        />
      )}
    </div>
  );
}

interface HistoryDropdownProps {
  entries: GenerationHistoryEntry[];
  render: (e: GenerationHistoryEntry) => string;
  onClose: () => void;
}

function HistoryDropdown({ entries, render, onClose }: HistoryDropdownProps) {
  return (
    <div className="mb-4 border border-slate-200 rounded-lg bg-slate-50 divide-y divide-slate-200">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Generation history (read-only)
        </span>
        <button onClick={onClose} className="text-xs text-slate-500 hover:text-slate-700">
          Close
        </button>
      </div>
      <div className="max-h-60 overflow-y-auto">
        {entries.map((e) => (
          <div key={e.id} className="px-3 py-2 text-xs">
            <div className="flex items-center gap-2">
              {e.is_current && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
              )}
              <span className="text-slate-500">
                {new Date(e.generated_at).toLocaleString()}
              </span>
              {e.brief?.category && (
                <span className="text-slate-400">· {e.brief.category}</span>
              )}
            </div>
            <div className="mt-1 text-slate-700 truncate">{render(e)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
