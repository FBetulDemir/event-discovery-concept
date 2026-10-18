# Status

Living handoff note. **Update it at the end of any session that leaves work open** (the `handoff` skill does this). Keep it short; history lives in git.

_Last updated: 2026-10-18 by Eralp (with Claude) — design system branch._

## Now

- `main` has the handoff foundation (docs, contracts, CI, skills).
- Branch `feat/backend-foundation` (PR1, **not opened**): Supabase backend, real plans with live voting, Ticketmaster events (D-006 to D-010).
- Branch `feat/design-system` (**stacked on PR1, not opened**): new independent brand **Gänget** (D-013), dark-default tokens + light theme, primitives, `/design` gallery, new front door (live sentence), Match, event page, join/plan screens, routes `/match` and `/match/results` (D-014, D-015). Nothing of VIP Monkey remains.
- Skill lint: 0 FAIL. Inspector: front door 0 FAIL; app screens 0 FAIL with documented exceptions; `/plan` and `/plan/new` 1 FAIL each (`still-page`, near-empty screens). See `docs/design/QA.md`.

## In flight

| Branch / PR | Owner | What | State |
|---|---|---|---|
| `feat/backend-foundation` | Eralp | PR1 backend + event sources + plans | Committed locally; not pushed |
| `feat/design-system` | Eralp | Design PR: brand, system, front door, Match, event | Built, committed locally, verified in a production build; not pushed |
| (next) i18n `/sv` `/en` + toggle | Eralp | D-011, on the new components | Not started |
| (next) accounts, friends, comment threads | Eralp | D-008, D-012 | Not started |
| (next) plan room as a full ticket | Eralp | D-014 | Winner card is a ticket; the rest of the room is plain |

## Next up

1. Review both branches; the owner decides when to push and open PRs (PR2 depends on PR1).
2. i18n on the new components.
3. Real Göteborg pictures from open collections and one looping clip for the front door (`assets.mjs`); trademark and domain checks for "Gänget".
4. Göteborg & Co adapter (needs a key); decide the budget-step question (roadmap issue 13).

## Blocked / waiting on a human

- Trademark search (PRV/EUIPO) and a domain for Gänget.
- CAPTCHA for anonymous sign-ins before launch.
- Göteborg & Co subscription key.

## Verification notes

- `npm run check` passes (typecheck, tests, build) on Node 24.
- Production build run on port 3100 and looked at in the browser: front door (desktop and a 375px phone), Match step 1, Match results, event page, `/design` in dark and light. Found and fixed on the way: display leading too tight for Å Ä Ö, mobile hero slot collapsing (now a 3:2 frame between the two lines), an invisible link colour on cards.
- **Not looked at after the redesign:** plan room, join screen, new-plan form, the date picker at 390px with real input (the inspector measured them; no human look yet).
- The Ticketmaster adapter is live-verified; the guest path was verified before the redesign and not re-run since.
