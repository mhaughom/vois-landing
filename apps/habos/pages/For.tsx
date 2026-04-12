import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Work from './Work';
import {
  getPersonalizedPage,
  trackPersonalizedEvent,
  isValidSlug,
  type PersonalizedProspect,
} from '../lib/personalized';

/**
 * /for/:slug — Personalized landing page.
 *
 * Loads a prospect from Supabase and renders the main Work page with the hero
 * replaced by a prospect-specific one. Everything else (features, CTAs, chat,
 * footer, navbar, background) renders identically to the main site — this is
 * deliberate, so prospects see the same HABOS aesthetic, just with a hero that
 * speaks to them.
 *
 * RLS hides drafts; unpublished slugs behave as "not found" → redirect home.
 * The whole route is `noindex, nofollow` so these URLs never appear in search.
 */
export default function For() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [prospect, setProspect] = useState<PersonalizedProspect | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // noindex for the lifetime of this route
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  // Fetch prospect + fire initial view event
  useEffect(() => {
    if (!isValidSlug(slug)) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const data = await getPersonalizedPage(slug);
      if (cancelled) return;
      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setProspect(data);
      setLoading(false);
      document.title = `HABOS for ${data.company_name}`;

      const url = new URL(window.location.href);
      trackPersonalizedEvent(slug, 'view', {
        utm_source: url.searchParams.get('utm_source') || undefined,
        utm_medium: url.searchParams.get('utm_medium') || undefined,
        utm_campaign: url.searchParams.get('utm_campaign') || undefined,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Scroll depth milestones
  useEffect(() => {
    if (!prospect) return;
    const fired = new Set<string>();
    const thresholds: Array<[number, 'scroll_25' | 'scroll_50' | 'scroll_75' | 'scroll_100']> = [
      [0.25, 'scroll_25'],
      [0.5, 'scroll_50'],
      [0.75, 'scroll_75'],
      [1.0, 'scroll_100'],
    ];
    const onScroll = () => {
      const doc = document.documentElement;
      const maxScroll = doc.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      const pct = window.scrollY / maxScroll;
      for (const [t, ev] of thresholds) {
        if (pct >= t && !fired.has(ev)) {
          fired.add(ev);
          trackPersonalizedEvent(slug, ev);
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [prospect, slug]);

  if (loading) return <div className="min-h-screen" />;
  if (notFound || !prospect) return <Navigate to="/" replace />;

  return <Work prospect={prospect} />;
}
