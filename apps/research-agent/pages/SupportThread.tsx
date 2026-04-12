import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  MailOpen,
} from 'lucide-react';
import { api } from '../lib/api';
import type {
  SupportMessage,
  SupportThreadStatus,
  SupportThreadWithMessages,
} from '../lib/types';

const STATUS_BADGE: Record<SupportThreadStatus, string> = {
  unread: 'bg-blue-100 text-blue-700',
  open: 'bg-amber-100 text-amber-700',
  waiting: 'bg-slate-100 text-slate-600',
  closed: 'bg-slate-100 text-slate-400',
};

export default function SupportThread() {
  const { threadId = '' } = useParams<{ threadId: string }>();
  const [thread, setThread] = useState<SupportThreadWithMessages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [suggestingReply, setSuggestingReply] = useState(false);
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Reply composer
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');

  const loadThread = useCallback(async () => {
    try {
      const data = await api.getSupportThread(threadId);
      setThread(data);
      // Pre-fill reply subject with "Re: …" if not already prefixed
      const baseSubject = data.subject || '';
      setReplySubject(/^re:\s/i.test(baseSubject) ? baseSubject : `Re: ${baseSubject}`);
      // Auto-mark unread threads as open on first view
      if (data.status === 'unread') {
        await api.updateSupportThreadStatus(threadId, 'open');
        setThread({ ...data, status: 'open' });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    loadThread();
  }, [loadThread]);

  const latestInbound: SupportMessage | null =
    thread?.messages
      ?.slice()
      .reverse()
      .find((m) => m.direction === 'inbound') || null;

  const suggestReply = async () => {
    if (!latestInbound) return;
    setSuggestingReply(true);
    setError('');
    try {
      // Reuse cached suggestion if present; otherwise call Claude
      if (latestInbound.ai_suggested_reply) {
        setReplyBody(latestInbound.ai_suggested_reply);
      } else {
        const { suggested_reply } = await api.suggestSupportReply(latestInbound.id);
        setReplyBody(suggested_reply);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSuggestingReply(false);
    }
  };

  const regenerateReply = async () => {
    if (!latestInbound) return;
    setSuggestingReply(true);
    setError('');
    try {
      // Force regen by calling suggest even if cached exists
      const { suggested_reply } = await api.suggestSupportReply(latestInbound.id);
      setReplyBody(suggested_reply);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSuggestingReply(false);
    }
  };

  const sendReply = async () => {
    if (!thread) return;
    if (!replySubject.trim() || !replyBody.trim()) {
      setError('Subject and body are required');
      return;
    }
    if (!confirm(`Send this reply to ${thread.from_email}?`)) return;
    setSending(true);
    setError('');
    try {
      await api.sendSupportReply(thread.id, replySubject, replyBody, thread.from_email);
      await loadThread();
      setReplyBody('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const changeStatus = async (status: SupportThreadStatus) => {
    if (!thread) return;
    setUpdatingStatus(true);
    try {
      const updated = await api.updateSupportThreadStatus(thread.id, status);
      setThread({ ...thread, status: updated.status });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) return <div className="p-10 text-slate-500">Loading…</div>;
  if (error && !thread) return <div className="p-10 text-red-600">{error}</div>;
  if (!thread) return null;

  return (
    <div className="mx-auto max-w-4xl p-6 md:p-10">
      <Link
        to="/support"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeft size={14} /> Inbox
      </Link>

      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">
              {thread.subject || '(no subject)'}
            </h1>
            <p className="text-slate-500 mt-1">
              {thread.from_name ? `${thread.from_name} · ` : ''}
              <span className="font-mono text-sm">{thread.from_email}</span>
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[thread.status]}`}
              >
                {thread.status}
              </span>
              {thread.prospect && (
                <Link
                  to={`/prospects/${thread.prospect.id}`}
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                >
                  Linked: {thread.prospect.company_name}
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => changeStatus('open')}
              disabled={updatingStatus || thread.status === 'open'}
              title="Mark as open"
              className="p-2 text-slate-500 hover:text-slate-700 disabled:opacity-40"
            >
              <MailOpen size={16} />
            </button>
            <button
              onClick={() => changeStatus('closed')}
              disabled={updatingStatus || thread.status === 'closed'}
              title="Close thread"
              className="p-2 text-slate-500 hover:text-slate-700 disabled:opacity-40"
            >
              <XCircle size={16} />
            </button>
            <button
              onClick={() => changeStatus('unread')}
              disabled={updatingStatus || thread.status === 'unread'}
              title="Mark unread"
              className="p-2 text-slate-500 hover:text-slate-700 disabled:opacity-40"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      {/* ─── Message thread ────────────────────────────────────────────── */}
      <div className="space-y-3 mb-8">
        {thread.messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>

      {/* ─── Reply composer ────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-900">Reply</h2>
          <div className="flex items-center gap-2">
            {latestInbound && (
              <>
                <button
                  onClick={suggestReply}
                  disabled={suggestingReply}
                  className="inline-flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 disabled:opacity-50 px-3 py-1.5 rounded-full font-medium"
                >
                  {suggestingReply ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Sparkles size={12} />
                  )}
                  {latestInbound.ai_suggested_reply ? 'Use AI draft' : 'Draft with Claude'}
                </button>
                {latestInbound.ai_suggested_reply && (
                  <button
                    onClick={regenerateReply}
                    disabled={suggestingReply}
                    title="Regenerate suggestion"
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 disabled:opacity-50"
                  >
                    <RotateCcw size={12} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">
              Subject
            </label>
            <input
              type="text"
              value={replySubject}
              onChange={(e) => setReplySubject(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">
              Body (plain text)
            </label>
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Type or click 'Draft with Claude' above to pre-fill."
              rows={12}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:border-slate-400 focus:outline-none resize-y"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={sendReply}
            disabled={sending || !replyBody.trim() || !replySubject.trim()}
            className="inline-flex items-center gap-1 bg-green-600 text-white rounded-xl px-5 py-2.5 font-semibold hover:bg-green-700 disabled:opacity-50 transition"
          >
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Send reply
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────

function MessageBubble({ message }: { message: SupportMessage }) {
  const isInbound = message.direction === 'inbound';
  return (
    <div
      className={`rounded-2xl p-5 border ${
        isInbound
          ? 'bg-white border-slate-200'
          : 'bg-slate-50 border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-slate-500">
          <span className="font-semibold text-slate-700">
            {isInbound ? `${message.from_email}` : 'Mathias'}
          </span>
          {message.subject && isInbound && (
            <span className="ml-2 text-slate-400">{message.subject}</span>
          )}
        </div>
        <div className="text-xs text-slate-400">
          {new Date(message.received_at).toLocaleString()}
        </div>
      </div>
      <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
        {message.body_text}
      </pre>
      {message.ai_suggested_reply && isInbound && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400 flex items-center gap-1">
          <CheckCircle2 size={10} /> AI reply drafted
        </div>
      )}
    </div>
  );
}
