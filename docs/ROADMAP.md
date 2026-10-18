# Roadmap

> **Proposal.** Written during the handoff setup as a starting point for the two maintainers to agree on. Edit freely; record changes of direction in `docs/DECISIONS.md`. Live status is in `docs/STATUS.md`.

## Where we are

Front-end prototype: discovery with filters, 3-step Monkey Match, transparent ranking, local shortlist + voting + winner screen. Fictional data, in-memory state, no backend, dead ticket button. 31 unit tests on pure logic; no CI until this setup PR.

## Phases

### Phase 0 — Foundation (this PR)
Agent docs, contracts, CI, PR workflow, project skills. **Done when:** merged and both maintainers can start independent branches.

### Phase 1 — Make it real for one group (the core promise)
Goal: two phones can vote on the same plan.
- **Done in PR1 (`feat/backend-foundation`):** Supabase schema + RLS + RPCs, guest auth, plans / members / shortlist / votes / invite links / organizer close with explicit tie-break, live updates, external event adapters (Ticketmaster, demo) with `/api/events`, ticket link-out, docs and contracts (D-006…D-010).
- **PR2:** i18n `/sv` `/en` with toggle (D-011).
- **PR3:** accounts (magic link + Google), friends, comment threads with reactions on plans and events, moderation basics (D-008, D-012).
- **Needs a key/decision:** Göteborg & Co adapter; verify Ticketmaster against the live API; enable anonymous sign-ins + CAPTCHA.

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
| 1 | ~~Vote ties resolve silently~~ | — | Fixed in PR1: organizer must break a tie (`close_plan`, `voting.ts`) |
| 2 | ~~Hard-coded "4 vänner" / "Fredag kväll"~~ | — | Fixed in PR1: derived from the plan |
| 3 | ~~Fabricated seed votes~~ | — | Removed in PR1 |
| 4 | ~~"Köp biljetter" does nothing~~ | — | Now links to the seller when the source provides a URL; demo events have none |
| 5 | ~~Invalid `?event=` ids~~ | — | `NewPlan` only offers an event found in the catalogue |
| 6 | No `test` script / CI existed; tests need Node ≥ 22.18 | `package.json` | Fixed in Phase 0 |
| 11 | Anonymous sign-in has no CAPTCHA; guests are cheap to create | Supabase Auth | Enable Turnstile/hCaptcha before launch |
| 12 | Ticketmaster adapter not verified on a live response; Göteborg & Co adapter missing | `lib/events/sources` | Add key, run, fix mapping |
| 7 | README says "Tailwind CSS" but styling is mostly hand-written token CSS | `README.md`, `globals.css` | Document (done in `ARCHITECTURE.md`); decide whether to converge |
| 8 | Distance is from a fixed city-centre point, not the user's location | `lib/events/geo.ts` | Phase 2 (user location, multi-city) |
| 9 | Plain `<img>` instead of `next/image`; images are not optimised | many components | Switch when images become dynamic |
| 10 | No lint/format tooling | repo | Add ESLint (next config) + Prettier once both maintainers agree on style |

## Open questions (need a human decision)

1. **Brand & permission.** The README says this is an unaffiliated concept built for a job application, yet the repo ships VIP Monkey's name and logo (`public/images/`). Before we productise or promote it: do we have VIP Monkey's blessing, or do we rename/rebrand the product ("Monkey Match" as its own brand)? Until answered, keep the disclaimer in the README.
2. **Who is the customer?** A white-label feature for VIP Monkey, or an independent product that links out to tickets (any provider)?
3. **Backend choice** (Phase 1) and hosting/cost ownership.
4. **Licence** for the public repo (none today ⇒ all rights reserved by default).
5. **Analytics & consent** approach (GDPR; Swedish audience).
6. **Roles:** who owns what area (see `.github/CODEOWNERS`), and who merges.
