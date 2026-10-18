# Architecture

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 + token-driven hand-written CSS · lucide-react icons · Supabase (Postgres, Auth, Realtime) via `@supabase/supabase-js`. Hosted on Vercel.

## Routes

| Route | File | Rendering | Purpose |
|---|---|---|---|
| `/` · `/en` | `src/app/[locale]/page.tsx` | `force-dynamic`: catalogue loaded on the server, client sections | Front door: live sentence, tonight, how it works, all events, closing CTA |
| `/match` | `src/app/[locale]/match/page.tsx` | static shell, client `PreferenceFlow` | 3-step guided flow (`/monkey-match` redirects) |
| `/match/results` | `src/app/[locale]/match/results/page.tsx` | static shell, client `MatchResults` | Top-3 ranked matches + reasons (`/matches` redirects) |
| `/design` | `src/app/[locale]/design/page.tsx` | static, noindex | Token and component gallery |
| `/events/[id]` | `src/app/[locale]/events/[id]/page.tsx` | `force-dynamic` (server) | Event detail from the catalogue; ticket link to the seller |
| `/plan` | `src/app/[locale]/plan/page.tsx` | client `PlansList` | Your plans |
| `/plan/new?event=` | `src/app/[locale]/plan/new/page.tsx` | client `NewPlan` | Create a plan from an event, or add it to an open plan |
| `/plan/[code]` | `src/app/[locale]/plan/[code]/page.tsx` | client `PlanRoom` (noindex) | Join via invite code, shortlist, live voting, organizer closes, winner |
| `/api/events` | `src/app/api/events/route.ts` | route handler | Merged event catalogue + per-source status |

Every page route lives under `src/app/[locale]/` and exists in two languages (`/plan` and `/en/plan`; the table shows the Swedish URL). `src/app/api/` and `icon.svg` stay outside it. Pages are thin; behaviour lives in components and `src/lib`.

## Layers

```
types/        Event, EventSourceId, Preferences, DateSelection, Mood, EventCategory
data/         events.ts (fictional demo seeds + getEvents(now)), match-options.ts (defaults)
lib/          matching · dates · discovery · voting · format       (pure, tested)
lib/events/   source.ts (interface, enabledSources) · catalog.ts · geo.ts · sources/{ticketmaster,demo}.ts
lib/plans/    api.ts (Supabase data access, realtime) · snapshot.ts · displayName.ts
lib/supabase/ client.ts (browser client, guest session) · database.types.ts (generated)
lib/useEvents.ts   client hooks over /api/events (demo events localized here)
lib/i18n/     locale.ts (Locale, Translator, intlLocale) · labels.ts · reasons.ts · events.ts   (pure, tested)
i18n/         routing.ts · navigation.ts · request.ts · page.ts (config; messages are in ../messages)
proxy.ts      next-intl middleware (Next 16 name), strips Accept-Language
messages/     sv.json · en.json (every UI string, typed from sv.json)
components/   feature folders; ui/ = primitives (Button, Chip, DatePicker, …)
app/          routes, layout (fonts, theme, providers, header/footer/nav)
styles/       tokens.css (semantic roles, 2 themes, scales) · base.css · components.css · screens.css
supabase/     migrations (schema source of truth) · tests/plans_rls.test.sql
```

### Languages

`next-intl` with `/en` prefixed and Swedish unprefixed (`docs/CONTRACTS.md` §16, D-011, D-022). Server components use `getTranslations`, client components `useTranslations`; the root layout passes the active locale's messages to `NextIntlClientProvider`. Pure `src/lib` helpers receive the locale/translator as arguments so they stay testable.

Dependency direction: `app → components → lib/data → types`. `lib` must not import from `components` or `app`. Pure modules under test import siblings with a `.ts` extension (Node runs the tests directly).

## Data flow

```
Ticketmaster API ─┐                                     (server, cached 10 min per upstream fetch)
Göteborg & Co  ───┼─► sources/*.ts ─► Event[] ─► catalog.loadCatalog() ─► GET /api/events
demo seeds ───────┘   (normalize or drop)         merge · dedupe by id · sort          │
                                                                                      ▼
                                          useCatalog() in the browser (focus + every 5 min)
                                                 │
                    ┌────────────────────────────┴────────────────────────┐
                    ▼                                                     ▼
        lib/discovery.filterEvents                        lib/matching.matchEvents(events, prefs, { now })
        (home)                                            (/matches, first 3)
```

`/events/[id]` calls `findEvent` on the server per request.

### Plans

```
browser ── supabase-js (publishable key, guest or account session) ──► Postgres + RLS
   │            RPCs: create_plan · join_plan · close_plan · get_plan_preview
   │            tables: plans · plan_members · plan_events(snapshot) · votes
   └─ Realtime (votes, plan_events, plan_members, plans) ─► usePlanRoom reloads
```

A guest session is created lazily (`ensureUser`) when someone acts; listing "your plans" never creates one.

## State

- `PreferencesProvider` (context, in-memory): the Match draft. Reload resets it.
- Plan state is server state: loaded by `usePlanRoom(code)`, kept fresh by Realtime, written through `lib/plans/api.ts`. Votes update optimistically then reload to mirror what the database accepted.
- Convenience only in `localStorage`: your last display name.

## Matching engine (`src/lib/matching.ts`)

`matchEvents(events, preferences, { now })` → `Recommendation[]` (`{ event, reasons }`), sorted. Steps: validate preferences → hard filters → score (mood 60, time 20, budget 10, distance 10) → deterministic tie-break → strip scores. Rules: `docs/CONTRACTS.md` §3.

## Styling

- **Tokens** (`src/styles/tokens.css`): primitives (raw values) → semantic roles per theme (`--bg`, `--surface-1..3`, `--ink`, `--ink-muted`, `--accent`, `--paper`, …) → scales (five type steps, space, motion, layers). **Dark is the default theme**; `data-theme="light"` swaps the roles. The file mirrors `docs/brand/GUIDELINES.md`.
- **Fonts:** Anton (display, caps) and Work Sans (text) through `next/font/google` (downloaded at build, self-hosted).
- **CSS:** `base.css` (reset, element defaults, layout helpers, entrance motion), `components.css` (shared components), `screens.css` (per-screen layout). BEM-ish class names. Tailwind v4 is imported as a base layer and bridged to the tokens (`@theme inline`) but components do not use utility classes.
- **Rules baked in:** square corners, no hairlines or shadows at rest, nothing under 13px, body 16px+, one accent action, no eyebrow labels. Checked by the skill's inspector (`docs/design/QA.md`).
- **Motion:** content is visible without script. `[data-reveal]` elements reveal on scroll (`RevealObserver`); `.enter` containers animate on load with CSS only; the hero slot has the one signature move (image shutter). `prefers-reduced-motion` drops travel.
- **Reference:** the running gallery at `/design`.

## Testing

`node:test` on pure logic (`src/**/*.test.mjs`) importing `.ts` directly (Node ≥ 22.18). Language guards: `src/i18n/messages.test.mjs` (sv/en parity) and `src/i18n/hardcoded.test.mjs` (no Swedish copy in code). Database rules: `supabase/tests/plans_rls.test.sql`. No component, e2e or visual tests yet.

## CI / deploy

GitHub Actions (`.github/workflows/ci.yml`): typecheck, test, build on PRs and `main`; the build needs no secrets (without env the plan pages show a notice and events fall back to demo). Vercel hosts the site; its environment variables must match `.env.example` (`docs/BACKEND.md`).

## Where to put new things

| Adding… | Put it in… |
|---|---|
| A rule that decides/ranks/filters | `src/lib/<name>.ts` + `<name>.test.mjs` |
| A new event source | `src/lib/events/sources/<name>.ts` (export a pure `normalize…` + an `EventSource`), register in `catalog.ts` and `SOURCE_IDS`, tests on sample payloads |
| A database change | a new file in `supabase/migrations/`, apply, regenerate types, extend `plans_rls.test.sql`, update `CONTRACTS.md` §12 |
| A new domain type | `src/types/` |
| A new screen | `src/app/<route>/page.tsx` + `src/components/<feature>/` (see `new-screen` skill) |
| A reusable primitive | `src/components/ui/` |
| Cross-cutting client state | a provider in `src/components/<feature>/`, mounted in `layout.tsx` |
