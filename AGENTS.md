# AGENTS.md

Instructions for AI coding agents (Claude Code, Codex, Cursor, …) and a quick orientation for humans.
This file is the single source of truth for how to work in this repo. `CLAUDE.md` imports it.

## What this is

**Monkey Match** — an event-discovery and group-decision app concept for VIP Monkey (Göteborg).
Flow: **Discover → Match → Decide together → Get tickets.**

- Started as a UX/UI + frontend prototype; now being developed into a real product by two people working in parallel.
- Today it is a front-end only app: static seed data, in-memory state, no backend, no auth, no real ticketing.
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

## Repo map

```
src/app/            Next.js App Router routes (thin: compose components, no logic)
  page.tsx            /                 discovery: hero, filters, event grid, Monkey Match promo
  monkey-match/       /monkey-match     3-step preference flow
  matches/            /matches          top-3 ranked matches with reasons
  events/[id]/        /events/:id       event detail (force-dynamic)
  plan/               /plan             shared shortlist + voting
  plan/result/        /plan/result      winner + "Köp biljetter"
  globals.css         design tokens + all component CSS (@layer components)
src/components/     UI by feature: discovery/ events/ layout/ monkey-match/ plan/ ui/
src/lib/            Pure logic + tests: matching, dates, discovery, useEvents hook
src/data/           Seed data (events.ts) and option defaults (match-options.ts)
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
3. **Time is Europe/Stockholm.** Dates are `YYYY-MM-DD` strings, times are `HH:MM–HH:MM` strings. Never use `new Date()` at module load; evaluate "now" at use time (see `getEvents`).
4. **Hydration safety.** Anything time-dependent renders empty/neutral on the server and fills in after mount (`useEvents`, `MatchResults`). Do not call `Date.now()` / `Math.random()` during render.
5. **Event IDs are stable** across weekly rollover. Votes and shortlist reference IDs.
6. **UI language is Swedish; code, comments and docs are English.** `<html lang="sv">`.
7. **Design tokens live in `globals.css`.** Use the CSS variables / `@theme` tokens; do not hard-code colours, spacing or radii in components.
8. **Accessibility is a feature, not polish.** Labels on every control, `aria-live` status for result counts, focus moved to the heading on step change, visible focus ring, skip link, reduced-motion respected. Do not regress these.

Changing a contract = update `docs/CONTRACTS.md` + tests + add an entry to `docs/DECISIONS.md` in the same PR.

## Conventions

- TypeScript strict. Prefer `@/…` imports. Server components by default; add `'use client'` only when state/effects/browser APIs are needed.
- Logic goes in `src/lib` as pure, tested functions; components stay thin. New logic in `src/lib` ships with tests in a sibling `*.test.mjs` (`node:test`, `node:assert/strict`).
- Styling is mostly hand-written CSS with tokens in `src/app/globals.css`, plus Tailwind v4 (`@import "tailwindcss"`, `@theme static`). Follow the existing BEM-ish class naming (`.voting-card__footer`). Do not mix a new styling system in.
- Components: one component per file, PascalCase, props typed inline or via `type XProps`. Reuse `src/components/ui/*` before creating a new primitive.
- Comments explain *why* (constraints, decisions), not what. Keep the existing density.
- Seed data is fictional. Images illustrate atmosphere only (see `public/images/SOURCES.md`). Never present seed venues as real.
- Commit messages: Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`), imperative, ≤72 chars subject.

## Workflow

- `main` is protected by convention: **never push directly to `main`.** Work on a branch (`feat/…`, `fix/…`, `chore/…`, `docs/…`), open a PR, the other person reviews and merges. Details: `CONTRIBUTING.md`.
- Keep PRs small and focused (one concern). Rebase on `main` before opening.
- Definition of done: `npm run check` passes; contracts untouched or updated; docs updated if behaviour changed; a11y checked for any UI change (keyboard + screen-reader labels); `docs/STATUS.md` updated if you leave work open.
- UI changes: check at 390px (mobile) and desktop. Say what you verified in the PR; if you did not run the app, say so.

## Ask first / never

**Ask the humans before:** adding a dependency; adding a backend/DB/auth provider; changing a contract; changing routes or URLs; changing visual identity (logo, palette, wordmark); deleting seed events or tests.

**Never:** commit secrets, API keys or `.env` files (this repo is **public**); push to `main`; rewrite shared history; weaken or delete a test to make it pass; add tracking/analytics without a decision entry; claim a venue/event in seed data is real.

## Handoff protocol

Two people (and their agents) work here in parallel. At the end of any session that leaves work open, run the `handoff` skill (or do it by hand): update `docs/STATUS.md` — what changed, what is in flight, what is blocked, what to do next. Record decisions in `docs/DECISIONS.md`. A fresh agent should be able to continue from `AGENTS.md` + `docs/STATUS.md` alone.

## Known sharp edges

See `docs/ROADMAP.md` → "Known issues". Highlights: vote ties resolve to the first shortlisted item; "4 vänner har gått med" and "Fredag kväll" are hard-coded; "Köp biljetter" is a dead button; the VIP Monkey name/logo are third-party brand assets (see open question in `docs/ROADMAP.md`).
