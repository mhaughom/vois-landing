# Life Intelligence Monorepo

Two marketing sites — **VOIS** (tryvois.com) and **HABOS** (habos.ai) — that were split out of a single SPA. Same stack, shared component package, separate builds and separate Vercel projects.

## Layout
- `apps/vois/` — Vite + React 19 SPA. Entry: `App.tsx` (~1,950 LOC landing). Uses OpenAI + Deepgram.
- `apps/habos/` — Vite + React 19 SPA. Entry: `pages/Work.tsx` (~1,730 LOC landing). Uses Anthropic + Calendly.
- `packages/shared/` — `@li/shared`. Components, lib, api helpers, styles. Imported via Vite alias (not built).
- `public/locales/` — i18n JSON, **16 languages**, shared across both apps.
- `public/` (root) — shared static assets. Each app has its own `public/` that merges on top at build time via the `copy-app-overrides` Vite plugin in `apps/*/vite.config.ts`.
- `supabase/migrations/` — Supabase schema (waitlist, conversations).

Not Next.js. Not Tailwind. Plain CSS + `index.css` per app.

## Commands (from repo root)
```
npm run dev:vois      # Vite dev @ :3100 (proxies /api → :3101 for vercel dev)
npm run dev:habos     # Vite dev @ :3000 (in-process /api handler via vite plugin)
npm run build         # Build all workspaces
npm run typecheck     # tsc --noEmit in all workspaces
```
No lint script, no test suite. Don't invent commands that don't exist. Each app also has `npm run vercel` inside its workspace for `vercel dev` against local functions.

## VOIS vs HABOS divergence — READ BEFORE EDITING SHARED CODE
The physical split is done (`apps/vois` + `apps/habos` with separate `package.json`, `vercel.json`, API routes). But some shared surfaces are **not product-neutral yet**:

- **Chat is HABOS-flavored.** `packages/shared/components/ChatPanel.tsx` hardcodes HABOS `/work/*` navigation actions and HABOS copy. Editing it affects VOIS too — verify both render correctly.
- **Different AI providers.** VOIS deps: `openai`, `@deepgram/sdk`. HABOS deps: `@anthropic-ai/sdk`, `react-calendly`. `apps/*/api/chat.ts` are separate per app and use different SDKs. Don't assume symmetry.
- **Shared Supabase client** (`packages/shared/lib/supabase.ts`) writes a `product` field to the waitlist. Be careful adding new waitlist fields.
- **Shared analytics** (`packages/shared/lib/analytics.ts`) mixes generic and HABOS-specific events. Don't add VOIS events there without thinking about attribution.

Full context: `VOIS-HABOS-SEPARATION-PLAN.md`. **Heads up: its "Current State" section pre-dates the `apps/` split** — the code has moved on. Treat it as the rationale/goals doc, not a current snapshot.

## Editing `@li/shared`
Changes are live (no build step). A shared component change = both apps change. Typecheck both: `npm run typecheck`.

Shared has: `components/` (Navbar, ChatPanel, WaitlistModal, etc), `lib/` (analytics, supabase, i18n, consent, visitorProfile, websocketManager), `api/` (`_cors.ts`, `geo.ts`), `styles/`.

## Deployment
Two separate Vercel projects, linked from `apps/vois` and `apps/habos`. Each `vercel.json` only sets video cache headers + SPA rewrite. API routes at `apps/*/api/*.ts` deploy as Vercel Functions per app.

## Don't
- Don't edit stale root docs (`BACKEND_EXTRACTION_PROMPT.md`, `STREAMING_*.md`, `ORGANIZE_CAROUSEL.md`, `PLACEHOLDER_IMAGES.md`, `TESTING_GUIDE.md`, `WAITLIST_SETUP.md`) — they're one-off prompts from before the `apps/` split and may contradict current reality.
- Don't detect product by `window.location.hostname` — that pattern was removed; don't reintroduce it.
- Don't put product-specific assets in root `public/` — use `apps/*/public/`.
- Don't assume `packages/shared` code is neutral just because it's shared. Check ChatPanel, analytics, and supabase first.

## See also
- `VOIS-HABOS-SEPARATION-PLAN.md` — why the split exists, what's still coupled
- `PRODUCT_CONTENT.md` — marketing copy source of truth
