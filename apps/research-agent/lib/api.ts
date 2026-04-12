import { getAuthToken, clearAuthToken } from './auth';
import type {
  ArtifactType,
  GenerationHistoryEntry,
  PersonalizedProspect,
  ProspectCategory,
  SupportThread,
  SupportThreadStatus,
  SupportThreadWithMessages,
} from './types';

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((init.headers as Record<string, string>) || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, { ...init, headers });

  if (res.status === 401) {
    clearAuthToken();
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // ─── CRUD ────────────────────────────────────────────────────────────────
  listProspects: () => request<PersonalizedProspect[]>('/api/prospects/list'),

  getProspect: (id: string) =>
    request<PersonalizedProspect>(`/api/prospects/get?id=${encodeURIComponent(id)}`),

  updateProspect: (id: string, patch: Partial<PersonalizedProspect>) =>
    request<PersonalizedProspect>('/api/prospects/update', {
      method: 'POST',
      body: JSON.stringify({ id, patch }),
    }),

  // ─── Pipeline ────────────────────────────────────────────────────────────
  pipelineGather: (company_url: string, company_name?: string) =>
    request<PersonalizedProspect>('/api/pipeline/gather', {
      method: 'POST',
      body: JSON.stringify({ company_url, company_name }),
    }),

  pipelineClassify: (id: string) =>
    request<{ category: ProspectCategory; reason: string }>(
      '/api/pipeline/classify',
      {
        method: 'POST',
        body: JSON.stringify({ id }),
      },
    ),

  pipelineGenerateHero: (id: string, user_instructions?: string) =>
    request<PersonalizedProspect>('/api/pipeline/generate-hero', {
      method: 'POST',
      body: JSON.stringify({ id, user_instructions }),
    }),

  pipelineGenerateEmail: (id: string, user_instructions?: string) =>
    request<PersonalizedProspect>('/api/pipeline/generate-email', {
      method: 'POST',
      body: JSON.stringify({ id, user_instructions }),
    }),

  pipelineSendEmail: (id: string) =>
    request<PersonalizedProspect>('/api/pipeline/send-email', {
      method: 'POST',
      body: JSON.stringify({ id }),
    }),

  pipelinePublish: (id: string) =>
    request<PersonalizedProspect>('/api/pipeline/publish', {
      method: 'POST',
      body: JSON.stringify({ id }),
    }),

  // ─── Generation history ──────────────────────────────────────────────────
  getHistory: (id: string, type: ArtifactType) =>
    request<GenerationHistoryEntry[]>(
      `/api/prospects/history?id=${encodeURIComponent(id)}&type=${type}`,
    ),

  // ─── Support inbox ───────────────────────────────────────────────────────
  listSupportThreads: (status?: SupportThreadStatus) =>
    request<SupportThread[]>(
      `/api/support/list${status ? `?status=${status}` : ''}`,
    ),

  getSupportThread: (id: string) =>
    request<SupportThreadWithMessages>(
      `/api/support/get?id=${encodeURIComponent(id)}`,
    ),

  updateSupportThreadStatus: (id: string, status: SupportThreadStatus) =>
    request<SupportThread>('/api/support/status', {
      method: 'POST',
      body: JSON.stringify({ id, status }),
    }),

  suggestSupportReply: (messageId: string) =>
    request<{ suggested_reply: string }>('/api/support/suggest-reply', {
      method: 'POST',
      body: JSON.stringify({ message_id: messageId }),
    }),

  sendSupportReply: (
    thread_id: string,
    subject: string,
    body: string,
    recipient_email: string,
  ) =>
    request<{ ok: true; sent_at: string }>('/api/support/send-reply', {
      method: 'POST',
      body: JSON.stringify({
        thread_id,
        subject,
        body,
        recipient_email,
      }),
    }),
};
