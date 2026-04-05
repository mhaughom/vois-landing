# VOIS / HABOS Deep Separation Plan

## Current State

One React SPA (`index.tsx`) serves both products via runtime domain detection:

```tsx
const isHabosDomain = window.location.hostname.includes('habos');
const RootPage = isHabosDomain ? Work : App;
```

Everything else — routing, components, services, API, i18n, build, deploy — is fully shared. There is **no build-time separation**. Both products ship the same JS bundle to every visitor.

---

## Findings From Current Repo

This section is based on the code that exists right now, not just the intended end state.

### Confirmed architecture findings

- The app is currently a **single React/Vite SPA** with one root `package.json`, one `vite.config.ts`, one `vercel.json`, and one rewrite rule sending all non-API routes to the same `index.html`.
- `index.tsx` is the single entry point for both products. It declares **72 routes total**:
  - **47** `/work*` routes
  - **6** `/solutions*` routes
  - **10** `/philosophy*` routes
  - **9** shared/general routes (`/`, `/login`, `/legal`, `/Privacy`, `/Terms`, `/support`, `/setup`, `/success`, `/record-box`)
- Product selection at `/` is still decided at runtime:

```tsx
const isHabosDomain = typeof window !== 'undefined' && window.location.hostname.includes('habos');
const RootPage = isHabosDomain ? Work : App;
```

- `ChatPanel` is mounted **globally outside the route tree**, so both products inherit the same chat surface and the same chat behavior.
- Important correction to the draft below: `index.tsx` is **191 LOC**, not 1,954. The two truly large natural split points are:
  - `App.tsx` = **1,954 LOC** (VOIS landing)
  - `pages/Work.tsx` = **1,750 LOC** (HABOS landing)
- `components/Navbar.tsx` is **1,011 LOC** and contains both brands in one `brandConfig`. `App.tsx` passes `variant="vois"` while `Work.tsx` relies on the default HABOS variant, so brand identity is still being decided inside one shared navbar.
- `components/ChatPanel.tsx` is **1,331 LOC** and is currently **HABOS-oriented**, not product-neutral:
  - hardcoded `/work/*` navigation actions
  - HABOS-specific suggestion copy
  - same-origin `fetch('/api/chat')`
- `api/chat.ts` and `lib/chat-soul.ts` are also **HABOS-only** today:
  - HABOS system prompt
  - HABOS RAG docs
  - HABOS `/work/*` route guidance
  - HABOS Calendly/demo language
  - there is **no `VOIS_SOUL` yet**
- `lib/supabase.ts` still assigns the waitlist `product` field by checking `window.location.hostname.includes('habos')`, so product identity is leaking into shared data code.
- `lib/analytics.ts` is one shared analytics wrapper. It mixes generic events with HABOS/work-specific events such as `work_page_viewed` and `work_video_clicked`, which means analytics attribution is not cleanly separated yet.
- `api/_cors.ts` currently allows:
  - `https://habos.ai`
  - `https://www.habos.ai`
  - localhost dev origins

  `tryvois.com` is not currently listed there, so a truly standalone VOIS-origin API setup would need its own origin handling.
- `public/locales/` currently has **16 languages** and **1,488 JSON files total**, which is **93 namespaces per language**.
- The actual English namespace split is:
  - **53** `work-*`
  - **6** `solutions-*`
  - **18** `philosophy-*`
  - **16** shared/general namespaces
- Important correction to the draft below: VOIS is **not** at zero dedicated namespaces. `home.json` and `try-now-demo.json` are already clear VOIS-specific translation files.
- There are **51** `pages/work/*` modules on disk, **6** `pages/solutions/*`, and **18** `pages/philosophy/*`, but only **10 philosophy routes** are currently wired into `index.tsx`. That means some HABOS content exists in the repo without being fully exposed in routing yet.
- There are **32** top-level files in `components/`, and they currently live in one shared component layer even though a meaningful subset is clearly VOIS-only or HABOS-only.

### What these findings imply for the separation

- The deep coupling is not just router-level. It also exists in navigation, chat behavior, system prompts, waitlist tagging, CORS, analytics, and translation loading.
- The cleanest cut line is already visible in the code: `App.tsx` is the VOIS experience and `pages/Work.tsx` is the HABOS experience. That supports an `apps/vois` + `apps/habos` split very naturally.
- If the goal is for the two sites to behave like genuinely standalone websites, then chat, support/setup/success flows, API routes, env vars, and product config should be treated as **app-owned first** and only moved back to shared if they become truly neutral.

---

## Goal

Two standalone websites that:
- Have independent builds, deploys, and bundles
- Can link to each other via normal `<a>` tags
- Share common code via a local package (not copy-paste)
- Can evolve independently (different design systems, different deps)

---

## Work Items

### 1. Monorepo Structure

**What:** Restructure from a flat single-app into a monorepo with shared packages.

**Target layout:**
```
/
├── apps/
│   ├── vois/              ← tryvois.com
│   │   ├── index.tsx      ← VOIS entry point
│   │   ├── App.tsx        ← current App.tsx (VOIS landing)
│   │   ├── pages/         ← VOIS-only pages (legal, login, support, etc.)
│   │   ├── components/    ← VOIS-only components
│   │   ├── index.css      ← VOIS global styles
│   │   ├── vite.config.ts
│   │   ├── vercel.json
│   │   └── package.json
│   │
│   └── habos/             ← habos.ai
│       ├── index.tsx      ← HABOS entry point
│       ├── pages/         ← Work.tsx + all /work/* + solutions + philosophy
│       ├── components/    ← HABOS-only components
│       ├── index.css      ← HABOS global styles
│       ├── vite.config.ts
│       ├── vercel.json
│       └── package.json
│
├── packages/
│   └── shared/            ← shared code consumed by both apps
│       ├── components/    ← ChatPanel, WaitlistModal, CookieConsent, etc.
│       ├── lib/           ← supabase, analytics, i18n, consent, deepgram
│       ├── api/           ← shared API utils (_cors.ts, etc.)
│       └── package.json
│
├── package.json           ← root workspace config
├── pnpm-workspace.yaml    ← (or npm/yarn workspaces)
└── tsconfig.base.json     ← shared TS config
```

**Tasks:**
- [ ] Initialize monorepo tooling (pnpm workspaces or Turborepo)
- [ ] Create `apps/vois/`, `apps/habos/`, `packages/shared/`
- [ ] Add root `package.json` with workspaces config
- [ ] Add root `tsconfig.base.json` that both apps extend

---

### 2. Split the Router (`index.tsx`)

**What:** The current `index.tsx` is 1,954 lines defining 80+ routes for both products. Split into two separate routers.

**Current coupling:**
- Domain detection picks root page
- All routes (work, solutions, philosophy, legal, login) are in one `<Routes>` block
- `ChatPanel` is rendered globally outside routes
- `Suspense` wraps all lazy imports

**Tasks:**
- [ ] Create `apps/vois/index.tsx` with only VOIS routes:
  - `/` → App.tsx (VOIS landing)
  - `/legal`, `/Privacy`, `/Terms`
  - `/login`, `/support`, `/success`, `/setup`
  - Cross-link to `https://habos.ai/work` for business features
- [ ] Create `apps/habos/index.tsx` with only HABOS routes:
  - `/` → Work.tsx (HABOS landing)
  - `/work/*` (all 54 feature pages)
  - `/solutions/*` (6 solution pages)
  - `/philosophy/*` (10 philosophy pages)
  - `/legal`, `/Privacy`, `/Terms`
  - `/login`, `/support`, `/success`, `/setup`
  - Cross-link to `https://tryvois.com` for personal/consumer product
- [ ] Remove domain detection logic — each app knows what it is
- [ ] Move lazy imports into respective app routers

---

### 3. Split the Navbar (`Navbar.tsx`)

**What:** Currently 1,011 LOC with a `variant` prop and `brandConfig` object. Each site should have its own navbar without runtime branching.

**Options:**
1. **Fork into two components** — simpler but duplicated code
2. **Keep shared but parameterized** — keep in `packages/shared`, each app passes its own config

**Recommended:** Option 2 (keep shared, pass config). The Navbar is complex enough that maintaining two copies would be painful.

**Tasks:**
- [ ] Move `Navbar.tsx` to `packages/shared/components/`
- [ ] Replace `variant` prop with explicit config object (logo, name, tagline, links, CTA)
- [ ] Each app imports Navbar and passes its own brand config
- [ ] Remove `brandConfig` lookup — the app decides, not the component
- [ ] VOIS navbar: link "For Business" → `https://habos.ai`
- [ ] HABOS navbar: link "Personal" → `https://tryvois.com`

---

### 4. Split the ChatPanel & Chat API

**What:** `ChatPanel.tsx` (1,331 LOC) and `/api/chat.ts` are shared. The AI personality differs per product.

**Current coupling:**
- `ChatPanel` calls `/api/chat` (same origin)
- `/api/chat.ts` uses `HABOS_SOUL` from `lib/chat-soul.ts`
- No VOIS soul exists yet

**Tasks:**
- [ ] Create `VOIS_SOUL` in `packages/shared/lib/chat-soul.ts` (or separate files)
- [ ] Each app's `/api/chat.ts` imports the correct soul
- [ ] Move `ChatPanel.tsx` to `packages/shared/components/`
- [ ] ChatPanel accepts config: API endpoint, product name, welcome message
- [ ] Duplicate `/api/chat.ts` into both `apps/vois/api/` and `apps/habos/api/` with product-specific system prompts
- [ ] Shared chat utilities (message formatting, streaming) stay in `packages/shared/lib/`

---

### 5. Split Supabase & Analytics Services

**What:** `lib/supabase.ts` and `lib/analytics.ts` use domain detection at runtime to determine the product.

**Current coupling:**
```tsx
// supabase.ts
product: window.location.hostname.includes('habos') ? 'habos' : 'vois'
```

**Tasks:**
- [ ] Move base Supabase client to `packages/shared/lib/supabase.ts`
- [ ] Each app wraps it with product-specific defaults:
  ```tsx
  // apps/habos/lib/supabase.ts
  import { createWaitlistService } from '@vois/shared/lib/supabase';
  export const waitlistService = createWaitlistService('habos');
  ```
- [ ] Same pattern for analytics — shared PostHog client, product-specific event prefixes
- [ ] Remove all `window.location.hostname` detection from shared code
- [ ] Each app sets its product identity via config, not runtime detection

---

### 6. Split i18n & Translations

**What:** 16 languages × 95 namespaces = 1,520 JSON files, all in one `/public/locales/` directory.

**Current coupling:**
- All translation files ship to both domains
- Namespace naming is product-agnostic (e.g., `work-voice-notes.json`)
- `lib/i18n.ts` loads from `/locales/{{lng}}/{{ns}}.json`

**Tasks:**
- [ ] Categorize namespaces into VOIS-only, HABOS-only, and shared
  - **HABOS-only:** `work-*.json` (54), `solutions-*.json` (6), `philosophy-*.json` (10) = ~70
  - **Shared:** `common.json`, `waitlist-modal.json`, `checkout-modal.json`, `chat-panel.json`, `setup.json`, `legal.json`, etc. = ~20
  - **VOIS-only:** currently 0 dedicated (all VOIS content is in App.tsx, likely not i18n'd yet)
- [ ] Move shared translations to `packages/shared/public/locales/`
- [ ] Move HABOS translations to `apps/habos/public/locales/`
- [ ] Create VOIS translations in `apps/vois/public/locales/`
- [ ] Update i18n config in each app to load from merged paths
- [ ] Each app's build only bundles its own + shared translations (not the other product's)

---

### 7. Split CSS & Styling

**What:** Single `index.css` with global styles. Tailwind is shared.

**Tasks:**
- [ ] Create `apps/vois/index.css` — VOIS-specific global styles, color palette
- [ ] Create `apps/habos/index.css` — HABOS-specific global styles, color palette
- [ ] Move shared base styles (resets, scrollbar, reduced-motion) to `packages/shared/styles/base.css`
- [ ] Each app imports shared base + own overrides
- [ ] Consider separate Tailwind configs if color palettes diverge
- [ ] Evaluate whether VOIS should have a distinct visual identity (it currently inherits HABOS styling)

---

### 8. Split Build & Deploy Configuration

**What:** Single `vite.config.ts`, single `vercel.json`, single Vercel project.

**Tasks:**
- [ ] Create `apps/vois/vite.config.ts` with VOIS-specific build config
  - Alias `@` to VOIS app root
  - Import shared package via workspace resolution
  - Smaller chunk splitting (VOIS may not need Three.js if 3D features move to HABOS)
- [ ] Create `apps/habos/vite.config.ts` with HABOS-specific build config
  - Keep Three.js manual chunking
  - Full chunk config from current setup
- [ ] Create `apps/vois/vercel.json` — SPA rewrite rules for VOIS routes
- [ ] Create `apps/habos/vercel.json` — SPA rewrite rules for HABOS routes
- [ ] **Create two Vercel projects:**
  - `vois-web` → linked to `apps/vois/`, domain: tryvois.com
  - `habos-web` → linked to `apps/habos/`, domain: habos.ai
- [ ] Configure Vercel root directory setting for each project
- [ ] Shared `packages/` is not deployed — only consumed at build time
- [ ] Consider Turborepo for cached builds across both apps

---

### 9. Split API Routes (Serverless Functions)

**What:** `/api/chat.ts`, `/api/conversations.ts`, `/api/webhooks/`, `/api/_cors.ts` — currently all in one `/api/` directory.

**Tasks:**
- [ ] Decide per-endpoint ownership:
  - `/api/chat.ts` → **both** (but with different system prompts)
  - `/api/conversations.ts` → **both** (shared logic)
  - `/api/webhooks/` → decide per webhook
  - `/api/_cors.ts` → `packages/shared/api/`
- [ ] Duplicate product-specific API routes into each app's `/api/` directory
- [ ] Move shared API utilities to `packages/shared/api/`
- [ ] Update CORS origins:
  - VOIS API allows: `tryvois.com`
  - HABOS API allows: `habos.ai`
  - (Consider allowing cross-origin if APIs need to be called from the other site)

---

### 10. Split Environment Variables

**What:** Single `.env` / `.env.local` with all keys for both products.

**Tasks:**
- [ ] Create `apps/vois/.env.example` with VOIS-specific vars
- [ ] Create `apps/habos/.env.example` with HABOS-specific vars
- [ ] Shared vars (Supabase URL, PostHog key) referenced from root or duplicated
- [ ] Separate Vercel env vars per project:
  - `VITE_WEB_APP_URL` → different per site
  - `VITE_API_URL` → different per site
  - Supabase, PostHog, Anthropic keys → may be shared or separate
- [ ] Add `VITE_PRODUCT_NAME` env var so code doesn't need domain detection
- [ ] Pull env vars with `vercel env pull` per project

---

### 11. Decide Shared vs Forked Pages

**What:** Some pages are currently shared but may need product-specific versions.

**Decision matrix:**

| Page | Recommendation | Reason |
|------|---------------|--------|
| `/legal` | **Shared** (package) | Same legal entity, same terms |
| `/login` | **Shared** (package) | Same auth system |
| `/support` | **Fork** | Different product contexts, different support flows |
| `/success` | **Fork** | Different post-signup flows |
| `/setup` | **Fork** | Different onboarding per product |
| `/solutions/*` | **HABOS only** | Business-focused content |
| `/philosophy/*` | **HABOS only** | HABOS brand philosophy |

**Tasks:**
- [ ] Move shared pages to `packages/shared/pages/`
- [ ] Fork product-specific pages into respective app directories
- [ ] Decide if VOIS needs its own philosophy/about section
- [ ] Decide if solutions pages should be accessible from VOIS (via link to habos.ai)

---

### 12. Shared Component Audit

**What:** Determine which of the 36 components belong where.

| Component | Location | Notes |
|-----------|----------|-------|
| `ChatPanel.tsx` | shared | Both products use it |
| `WaitlistModal.tsx` | shared | Both products have waitlist |
| `CookieConsent.tsx` | shared | Legal requirement for both |
| `CheckoutModal.tsx` | shared (or fork) | Tiers may differ per product |
| `LanguageSwitcher.tsx` | shared | Same i18n system |
| `Navbar.tsx` | shared | Parameterized by config |
| `AppGridBox.tsx` | habos | HABOS feature grid |
| `BoxAnimation.tsx` | evaluate | Used by both? Check imports |
| `DeviceScene.tsx` | vois | VOIS 3D hero |
| `WorkHero3D/` | habos | HABOS 3D hero |
| `HeroDiscoveryDock.tsx` | vois | VOIS landing feature |
| `TryNowDemo.tsx` | vois | VOIS streaming demo |
| `MobileVideoCards.tsx` | vois | VOIS mobile showcase |
| `PhoneMockup.tsx` | shared | Used by demos in both |
| `AppleWatchMockup.tsx` | vois | VOIS watch feature |
| `ActionCards.tsx` | evaluate | Check usage |
| `AnimatedHabosIcon.tsx` | habos | HABOS branding |
| `OrganizeSection.tsx` | evaluate | Check usage |

**Tasks:**
- [ ] Audit every component's import graph to determine ownership
- [ ] Move shared components to `packages/shared/components/`
- [ ] Move product-specific components to respective app
- [ ] Remove unused components

---

### 13. Cross-Site Linking Strategy

**What:** Define how users navigate between the two sites.

**Tasks:**
- [ ] VOIS site: "For Business →" links to `https://habos.ai`
- [ ] HABOS site: "Personal →" links to `https://tryvois.com`
- [ ] Shared footer with both product logos and cross-links
- [ ] Login/auth: decide if sessions are shared (SSO) or separate
  - If shared: use a shared auth domain or token exchange
  - If separate: independent auth per site
- [ ] UTM parameters for cross-site analytics tracking
- [ ] Waitlist: shared Supabase table with `product` field (already exists)

---

### 14. Supabase Schema (if applicable)

**What:** Check if database schema needs changes for multi-product support.

**Tasks:**
- [ ] Verify `waitlist` table has `product` column (already confirmed)
- [ ] Verify `conversations` table can distinguish product context
- [ ] Check RLS policies — should VOIS and HABOS data be isolated?
- [ ] Decide if both apps share the same Supabase project or get separate ones
  - **Recommended:** Same Supabase project, product column for filtering
  - Separate projects only if data isolation is legally required

---

### 15. Bundle Size Impact

**What:** Currently both products ship one giant bundle. Splitting means each site only ships what it needs.

**Expected savings:**
- **VOIS bundle:** Drops all 54 work page chunks, solutions, philosophy. Gains: faster load.
- **HABOS bundle:** Drops VOIS 3D hero (DeviceScene, etc.) if not used. Gains: faster load.
- **Three.js:** Currently ~500KB+ gzipped. If only one site uses heavy 3D, the other saves this entirely.
- **Translations:** Each site ships only its own namespace JSONs.

**Tasks:**
- [ ] Measure current bundle size (total and per-chunk)
- [ ] After split, measure each app's bundle
- [ ] Remove unused dependencies per app (e.g., VOIS may not need Deepgram if voice is HABOS-only)
- [ ] Optimize lazy loading per app

---

## Execution Order (Recommended)

| Phase | Items | Risk | Description |
|-------|-------|------|-------------|
| **1** | 1 | Low | Set up monorepo structure (no code moves yet) |
| **2** | 8 | Low | Create per-app Vite/Vercel configs, verify both apps build from root |
| **3** | 2, 12 | Medium | Split router + move components to correct locations |
| **4** | 3, 4, 5 | Medium | Split Navbar, ChatPanel, services (remove domain detection) |
| **5** | 6 | Low | Split translations |
| **6** | 7, 10 | Low | Split CSS, env vars |
| **7** | 9, 11 | Medium | Split API routes, fork pages |
| **8** | 8, 13 | Medium | Deploy as two Vercel projects, set up cross-linking |
| **9** | 14, 15 | Low | DB audit, bundle optimization |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking existing live site during migration | Keep current single-app deploy working until both new apps are verified |
| Shared code diverging between apps | Use `packages/shared` as a real package with versioning or workspace linking |
| SEO impact from URL changes | Set up 301 redirects from old paths if any routes move |
| Duplicated maintenance (security patches, deps) | Monorepo with shared `tsconfig`, shared lint config, Turborepo caching |
| Auth/session confusion between sites | Decide SSO vs separate early (item 13) |
| i18n drift (translations updated in one app but not the other) | Shared translations in `packages/shared` — single source of truth |

---

## Definition of Done

- [ ] `apps/vois` builds and deploys independently to tryvois.com
- [ ] `apps/habos` builds and deploys independently to habos.ai
- [ ] No runtime domain detection (`hostname.includes`) anywhere in the codebase
- [ ] Each site's bundle contains only its own code + shared package
- [ ] Cross-site links work in both directions
- [ ] All 16 language translations work on both sites
- [ ] ChatPanel works on both sites with correct AI personality
- [ ] Waitlist signup works on both sites with correct product tagging
- [ ] Analytics events are correctly attributed per product
- [ ] No regressions on existing functionality
