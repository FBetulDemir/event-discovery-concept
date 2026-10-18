# AGENTS.md

Instructions for AI coding agents (Claude Code, Codex, Cursor, …) and a quick orientation for humans.
This file is the single source of truth for how to work in this repo. `CLAUDE.md` imports it.

## What this is

**Gänget** — an event-discovery and group-decision app for friends in Göteborg ("Vad gör vi ikväll?"). An independent product; nothing in it belongs to VIP Monkey.
Flow: **Discover → Match → Decide together → Get tickets.**

- Started as a UX/UI + frontend prototype; now being developed into a real product by two people working in parallel.
- Brand and design: `docs/brand/GUIDELINES.md` (name, mark, colour, type, voice) and `docs/design/` (UX/IA, audit, direction, QA). The running component reference is `/design`.
- Today: a Next.js app with a Supabase backend (plans, members, shortlist, votes, invite links, guest + account auth), events fetched from external sources (Ticketmaster, later Göteborg & Co), and tickets handed off to the seller. Friends, notifications and English (`/en`, language toggle) are built; see `docs/ROADMAP.md`.
- Product intent: `docs/PRODUCT.md`. Where it is going: `docs/ROADMAP.md`. Where it is right now: `docs/STATUS.md`.

## Commands

Node ≥ 22.18 is required (tests import `.ts` files via Node's native type stripping). `.nvmrc` pins 24.

```bash
npm ci               # install
npm run dev          # http://localhost:3000
npm run typecheck    # tsc --noEmit
npm test             # node --test src/lib/*.test.mjs  (pure-logic tests)
npm run build        # next build
npm run check        # typecheck + test + build — run before every commit/PR
```

There is no linter or formatter yet. Match the style of the surrounding code.

### Environment

Copy `.env.example` to `.env.local` (git-ignored) and fill it. Without Supabase variables the plan pages show a notice; without event-source keys the catalogue falls back to fictional demo events (labelled as such by `/api/events` `sources`). Backend setup, migrations and the RLS test: `docs/BACKEND.md`.

## Repo map

```
src/app/            Next.js App Router routes (thin: compose components, no logic); pages live in `[locale]/`, `api/` outside it
  page.tsx            /                 front door: live sentence, tonight, how it works, all events, closing CTA (server-rendered catalogue)
  match/              /match            3-step guided preference flow (/monkey-match redirects here)
  match/results/      /match/results    top-3 ranked matches with reasons (/matches redirects here)
  design/             /design           token + component gallery (noindex)
  events/[id]/        /events/:id       event detail (force-dynamic)
  plan/               /plan             your plans
  plan/new/           /plan/new?event=  create a plan from an event / add it to an open plan
  plan/[code]/        /plan/:inviteCode join, shortlist, live voting, organizer closes, winner + ticket link
  api/events/         /api/events       merged external event catalogue (cached)
  layout.tsx          fonts (Anton, Work Sans), dark theme, providers, header/footer/nav
src/components/     UI by feature: brand/ design/ discovery/ events/ layout/ match/ plan/ ui/
src/styles/         tokens.css (source of truth, mirrors docs/brand/GUIDELINES.md) · base.css · components.css · screens.css
src/lib/            Pure logic + tests: matching, dates, discovery, voting, format, i18n helpers
src/i18n/           next-intl config (routing, navigation, request) and the language guard tests; `src/proxy.ts` is the middleware
messages/           sv.json, en.json: every UI string
src/lib/events/     Event sources behind one adapter interface (sources/ticketmaster, sources/demo), catalog, geo
src/lib/plans/      Client data access for plans (api.ts), snapshot, remembered name
src/lib/supabase/   Browser client, guest session helper, generated DB types
src/data/           Demo seed events (events.ts, fictional) and option defaults (match-options.ts)
supabase/           SQL migrations (source of truth for the schema) and the RLS test
src/types/          Shared domain types (event.ts, preferences.ts)
public/images/      Local images; provenance in SOURCES.md
docs/               Product, architecture, contracts, roadmap, decisions, status
.claude/skills/     Project skills for Claude Code (verify, matching-engine, new-screen, handoff)
```

Full detail: `docs/ARCHITECTURE.md`.

## Contracts (do not break silently)

The full list with rationale is in `docs/CONTRACTS.md`. The ones that bite most often:

1. **Matching is a pure function.** `matchEvents` / `filterCompatibleEvents` in `src/lib/matching.ts` never read the clock; the caller passes `now`. Hard filters run first, then ranking. No scores are exposed to the UI — only human-readable `reasons`.
2. **Matching is transparent.** Every recommendation must be explainable by its `reasons`. No hidden boosts, no sponsored placement. The UI promises "Inga sponsrade placeringar"; keep that true.
3. **Time is Europe/Stockholm.** Dates are `YYYY-MM-DD` strings, times are `HH:MM–HH:MM` strings (the end may be missing: `HH:MM`). Never use `new Date()` at module load; evaluate "now" at use time (see `getEvents`).
4. **Hydration safety.** Anything time-dependent renders empty/neutral on the server and fills in after mount (`useEvents`, `MatchResults`). Do not call `Date.now()` / `Math.random()` during render.
5. **Event IDs are stable and unique across sources** (`tm-…`, `gbg-…`, demo ids as-is). Plans reference an event by `(source, externalId)`.
6. **Events are not stored by us.** They come from source adapters in the one normalized `Event` shape; an adapter drops what it cannot map honestly (no invented prices, times or coordinates). Plans keep only a small snapshot. Never log or return a URL that contains an API key.
7. **Authorization lives in the database.** Every table has RLS; privileged or atomic writes go through `SECURITY DEFINER` RPCs. The browser only ever holds the publishable key. Schema changes are migrations in `supabase/migrations/`, never dashboard edits.
8. **UI language is Swedish (default, unprefixed) and English (`/en`); code, comments and docs are English.** Every UI string comes from `messages/sv.json` and `messages/en.json` (typed keys, parity and no-hard-coded-Swedish tests); data identifiers (categories, moods) stay Swedish and get display labels. Use `@/i18n/navigation` for links and routing. `<html lang>` follows the locale. See `docs/CONTRACTS.md` §16.
9. **Design tokens live in `src/styles/tokens.css`.** Use semantic roles (`--bg`, `--surface-1..3`, `--ink`, `--accent`, `--paper`, …) and the five type steps; no raw hex or off-scale sizes in components. **Dark is the default theme** (`data-theme` on `<html>`), a light theme exists. Square corners, no hairlines or shadows at rest, nothing under 13px, body 16px+, one accent action per screen, no eyebrow labels, no numbered labels. New components go in the `/design` gallery.
10. **Accessibility is a feature, not polish.** Labels on every control, `aria-live` status for result counts, focus moved to the heading on step change, visible focus ring, skip link, reduced-motion respected. Do not regress these.

Changing a contract = update `docs/CONTRACTS.md` + tests + add an entry to `docs/DECISIONS.md` in the same PR.

## Conventions

- TypeScript strict. Prefer `@/…` imports. Server components by default; add `'use client'` only when state/effects/browser APIs are needed.
- Logic goes in `src/lib` as pure, tested functions; components stay thin. New logic in `src/lib` ships with tests in a sibling `*.test.mjs` (`node:test`, `node:assert/strict`).
- Styling: token CSS in `src/styles/*` with BEM-ish class names (`.vote-card__footer`), Tailwind v4 only as the base layer and token bridge. Add component CSS to `components.css` / `screens.css`, not inline styles or ad-hoc utilities. Check UI with the skill's inspector (`docs/design/QA.md`).
- Components: one component per file, PascalCase, props typed inline or via `type XProps`. Reuse `src/components/ui/*` before creating a new primitive.
- Comments explain *why* (constraints, decisions), not what. Keep the existing density.
- Seed data is fictional. Images illustrate atmosphere only (see `public/images/SOURCES.md`). Never present seed venues as real.
- Commit messages: Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`), imperative, ≤72 chars subject.

## Workflow

- `main` is protected by convention: **never push directly to `main`.** Work on a branch (`feat/…`, `fix/…`, `chore/…`, `docs/…`), open a PR, the other person reviews and merges. Details: `CONTRIBUTING.md`.
- Keep PRs small and focused (one concern). Rebase on `main` before opening.
- Definition of done: `npm run check` passes; contracts untouched or updated; docs updated if behaviour changed; a11y checked for any UI change (keyboard + screen-reader labels); `docs/STATUS.md` updated if you leave work open.
- UI changes: check at 390px (mobile) and desktop, and both themes if you touch colour. Run `lint.mjs` / `inspect.mjs` per `docs/design/QA.md`. Say what you verified in the PR; if you did not run the app, say so.

## Ask first / never

**Ask the humans before:** changing brand, colour or type tokens (`docs/brand/GUIDELINES.md`); adding a dependency; changing the database schema or any RLS policy; changing the auth model; changing a contract; changing routes or URLs; changing visual identity (logo, palette, wordmark); deleting seed events or tests.

**Never:** commit secrets, API keys, a Supabase `service_role`/secret key or `.env` files (this repo is **public**); push to `main`; rewrite shared history; weaken or delete a test to make it pass; add tracking/analytics without a decision entry; claim a venue/event in seed data is real.

## Handoff protocol

Two people (and their agents) work here in parallel. At the end of any session that leaves work open, run the `handoff` skill (or do it by hand): update `docs/STATUS.md` — what changed, what is in flight, what is blocked, what to do next. Record decisions in `docs/DECISIONS.md`. A fresh agent should be able to continue from `AGENTS.md` + `docs/STATUS.md` alone.

## Known sharp edges

See `docs/ROADMAP.md` → "Known issues". Highlights: Supabase *anonymous sign-ins* must be enabled in the dashboard or guests cannot join (`docs/BACKEND.md`); the Göteborg & Co adapter is not written yet (needs a key); the Ticketmaster adapter is tested on documented sample data, not yet against the live API; the VIP Monkey name/logo are third-party brand assets (see open question in `docs/ROADMAP.md`).
