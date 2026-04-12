# Life Intelligence

Monorepo for two marketing sites:

- **VOIS** — [tryvois.com](https://tryvois.com) — `apps/vois`
- **HABOS** — [habos.ai](https://habos.ai) — `apps/habos`

Shared component package at `packages/shared` (`@li/shared`). Stack: Vite + React 19 + TypeScript, Supabase, i18next, PostHog. Plain CSS, no Tailwind. Deployed as two separate Vercel projects.

## Develop

```bash
npm install
npm run dev:vois      # localhost:3100
npm run dev:habos     # localhost:3000
```

Environment variables live in `.env` (see `.env.example`). VOIS needs `OPENAI_API_KEY` + `DEEPGRAM_API_KEY`; HABOS needs `ANTHROPIC_API_KEY`. Both need Supabase keys.

## Build / typecheck

```bash
npm run build         # all workspaces
npm run typecheck     # tsc --noEmit in all workspaces
```

## Layout

```
apps/vois/            # VOIS marketing SPA
apps/habos/           # HABOS marketing SPA
packages/shared/      # Shared components, lib, api helpers, styles
public/locales/       # i18n (16 languages), shared across apps
public/               # Shared static assets
supabase/migrations/  # Database migrations
```

## For AI agents

See `CLAUDE.md` / `AGENTS.md` at the repo root. In particular: read the **VOIS vs HABOS divergence** section before editing anything in `packages/shared` — the split is physical but some shared surfaces (ChatPanel, analytics, supabase waitlist) are still product-biased.
