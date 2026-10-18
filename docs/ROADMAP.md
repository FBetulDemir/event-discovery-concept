# Roadmap

> **Proposal.** Written during the handoff setup as a starting point for the two maintainers to agree on. Edit freely; record changes of direction in `docs/DECISIONS.md`. Live status is in `docs/STATUS.md`.

## Where we are

Front-end prototype: discovery with filters, 3-step Monkey Match, transparent ranking, local shortlist + voting + winner screen. Fictional data, in-memory state, no backend, dead ticket button. 31 unit tests on pure logic; no CI until this setup PR.

## Phases

### Phase 0 — Foundation (this PR)
Agent docs, contracts, CI, PR workflow, project skills. **Done when:** merged and both maintainers can start independent branches.

### Phase 1 — Make it real for one group (the core promise)
Goal: two phones can vote on the same plan.
- Pick backend (leading candidate: Supabase — Postgres + Realtime + anonymous auth). *Decision needed.*
- `Plan`, `Member`, `Vote` data model; create plan from a match; shareable invite link (`/plan/<id>`); anonymous join with a display name; one vote per member; live tally.
- Deterministic tie rule + explicit "close voting" by the organiser.
- Remove hard-coded "4 vänner" / "Fredag kväll"; derive from plan data (name + date).
- Contract §6 rewritten for the real model; tests for tally/tie logic in `src/lib`.

### Phase 2 — Real events
- Event source: VIP Monkey API/feed if available, otherwise a CMS/seed pipeline we own. *Needs a conversation with VIP Monkey (see open questions).*
- Real geography: city list, geocoding/distance from a user location (permission-based) instead of `distanceKm` seeds.
- Multi-city; mood taxonomy beyond four moods; "available" and sold-out states.
- Move `getEvents`/matching behind a server boundary if the catalogue is large.

### Phase 3 — Tickets
- Winner → ticket CTA deep-links to the ticket provider (with plan/event context); later, group purchase ("everyone pays for their own" first).
- Handle event changed/cancelled after a vote.

### Phase 4 — Quality, measurement, growth
- Component + e2e tests (Playwright) for the three journeys; visual regression; Lighthouse/a11y gate in CI.
- Privacy-friendly analytics for the funnel in `docs/PRODUCT.md` (needs a decision entry + consent approach).
- i18n (sv/en), SEO/OG images for event pages, PWA/share targets.
- Persist preferences (local first, account later).

## Known issues (found while documenting)

| # | Issue | Where | Suggested fix |
|---|---|---|---|
| 1 | Vote ties resolve to the earliest shortlisted event, silently | `ResultExperience.tsx` (`reduce` with `>`) | Explicit tie rule + UI ("lika många röster") |
| 2 | "4 vänner har gått med" and "Fredag kväll" are hard-coded | `PlanExperience.tsx`, `ResultExperience.tsx` | Derive from plan state (Phase 1) |
| 3 | Seed votes are fabricated so the demo looks alive | `ShortlistProvider.tsx` | Remove with real plans; keep behind a demo flag if needed |
| 4 | "Köp biljetter" does nothing | `ResultExperience.tsx` | Phase 3 |
| 5 | Shortlist may contain IDs that disappear (e.g. `?event=` typo) and are silently dropped from the list but kept in state | `PlanExperience.tsx` | Validate ID against catalogue before adding |
| 6 | No `test` script / CI existed; tests need Node ≥ 22.18 | `package.json` | Fixed in Phase 0 |
| 7 | README says "Tailwind CSS" but styling is mostly hand-written token CSS | `README.md`, `globals.css` | Document (done in `ARCHITECTURE.md`); decide whether to converge |
| 8 | `distanceKm` is a static number, not computed | `events.ts` | Phase 2 |
| 9 | Plain `<img>` instead of `next/image`; images are not optimised | many components | Switch when images become dynamic |
| 10 | No lint/format tooling | repo | Add ESLint (next config) + Prettier once both maintainers agree on style |

## Open questions (need a human decision)

1. **Brand & permission.** The README says this is an unaffiliated concept built for a job application, yet the repo ships VIP Monkey's name and logo (`public/images/`). Before we productise or promote it: do we have VIP Monkey's blessing, or do we rename/rebrand the product ("Monkey Match" as its own brand)? Until answered, keep the disclaimer in the README.
2. **Who is the customer?** A white-label feature for VIP Monkey, or an independent product that links out to tickets (any provider)?
3. **Backend choice** (Phase 1) and hosting/cost ownership.
4. **Licence** for the public repo (none today ⇒ all rights reserved by default).
5. **Analytics & consent** approach (GDPR; Swedish audience).
6. **Roles:** who owns what area (see `.github/CODEOWNERS`), and who merges.
