/**
 * Category-tuned prompt guidance for the four pitch categories.
 *
 * Extracted from generate-hero.ts so generate-email.ts (and any future
 * category-aware step) can reuse the same tone rules. These are the ONLY
 * pre-configured part of the generation pipeline — the hero/email copy
 * itself is fully per-prospect.
 *
 * Rule when editing: keep each category's guidance under 60 words. Longer
 * prompts dilute the category signal and Claude starts averaging across them.
 */

export type Category = 'investor' | 'blue-collar' | 'white-collar' | 'hybrid';

export const CATEGORY_GUIDANCE: Record<Category, string> = {
  investor: `Write for an institutional investor or strategic partner. Lead with category thesis and why-now. Use confident, forward-looking language. Reference traction, team, or market expansion if the dossier supports it. Avoid operational minutiae and feature lists. Speak about the business HABOS is building, not the product tour.`,

  'blue-collar': `Write for a hands-on trades operator (plumber, electrician, HVAC, contractor, landscaper). Plain-spoken, no jargon, no hype words. Every claim should land in hours or dollars. Acknowledge they're busy. Speak directly to them as an individual. Short sentences. No SaaS-speak.`,

  'white-collar': `Write for a knowledge-worker ops lead at an SMB or mid-market company. Consultative, outcome-focused, credible. Reference their existing processes respectfully — they already have systems, HABOS consolidates them. Focus on leverage and team workflow.`,

  hybrid: `Write for a founder or operator who spans multiple worlds. Balanced, honest, exploratory tone. Acknowledge complexity. Invite discovery rather than sell. If the dossier is ambiguous, lean into that openly instead of picking a side.`,
};

export function isCategory(value: unknown): value is Category {
  return (
    value === 'investor' ||
    value === 'blue-collar' ||
    value === 'white-collar' ||
    value === 'hybrid'
  );
}
