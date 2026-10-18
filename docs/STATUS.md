# Status

Living handoff note. **Update it at the end of any session that leaves work open** (the `handoff` skill does this). Keep it short; history lives in git.

_Last updated: 2026-10-18 by Eralp (with Claude) — design system branch._

## Now

- `main` has the handoff foundation (docs, contracts, CI, skills).
- Branch `feat/backend-foundation` (PR1, **not opened**): Supabase backend, real plans with live voting, Ticketmaster events (D-006 to D-010).
- Branch `feat/design-system` (**stacked on PR1, not opened**): new independent brand **Gänget** (D-013), dark-default tokens + light theme, primitives, `/design` gallery, new front door (live sentence), Match, event page, join/plan screens, routes `/match` and `/match/results` (D-014, D-015). Nothing of VIP Monkey remains.
- Skill lint: 0 FAIL. Inspector: front door 0 FAIL; app screens 0 FAIL with documented exceptions; `/plan` and `/plan/new` 1 FAIL each (`still-page`, near-empty screens). See `docs/design/QA.md`.

## Honest status

The core loop is now a social tool: invitee screen that shows the options, a plan room with who-voted-what, date, add-event and a two-level comment thread with reactions, accounts by email link (guest upgrade keeps plans), richer plan list, catalogue quality gates. **Still missing:** friends list, notifications, English, a second event source and prices. **Needs you:** Supabase redirect URLs and custom SMTP before real people can sign in (`docs/BACKEND.md`). Full review with screenshots (Turkish): [`design/REVIEW.md`](design/REVIEW.md).

## In flight

| Branch / PR | Owner | What | State |
|---|---|---|---|
| `feat/backend-foundation` | Eralp | PR1 backend + event sources + plans | Committed locally; not pushed |
| `feat/design-system` | Eralp | Design PR: brand, system, front door, Match, event | Built, committed locally, verified in a production build; not pushed |
| `feat/design-system` (same branch) | Eralp | Notifications, friends (`/vanner`), invite-a-friend, password accounts, `/integritet` (D-018, D-019) | Built; verified in a production build with 3 test accounts; not committed at time of writing |
| (next) i18n `/sv` `/en` + toggle | Eralp | D-011, last in the order | Not started |
| (next) plan room as a full ticket | Eralp | D-014 | Winner card is a ticket; the rest of the room is plain |

## Next up

0. Decide D-020 (Ticketmaster snapshot retention) and build the purge; add a privacy contact on `/integritet`.
1. Review both branches; the owner decides when to push and open PRs (PR2 depends on PR1).
2. i18n on the new components.
3. Real Göteborg pictures from open collections and one looping clip for the front door (`assets.mjs`); trademark and domain checks for "Gänget".
4. Göteborg & Co adapter (needs a key); decide the budget-step question (roadmap issue 13).

## Blocked / waiting on a human

- Trademark search (PRV/EUIPO) and a domain for Gänget.
- CAPTCHA for anonymous sign-ins before launch.
- Göteborg & Co subscription key.
- Supabase dashboard: **Confirm email OFF** (Authentication → Sign In / Providers → Email), otherwise password sign-up sends mail that outsiders never receive.

## Verification notes

- `npm run check` passes (typecheck, tests, build) on Node 24.
- Production build run on port 3100 and looked at in the browser: front door (desktop and a 375px phone), Match step 1, Match results, event page, `/design` in dark and light. Found and fixed on the way: display leading too tight for Å Ä Ö, mobile hero slot collapsing (now a 3:2 frame between the two lines), an invisible link colour on cards.
- Friends and notifications: flow run end to end in a production build on port 3100 (sign in, name, friend link, request, accept, invite to plan, accept invite, badge appears and clears, plan-list "Nytt" line, mobile bottom-nav badge). SQL test `friends_notifications.test.sql` passes. Test users deleted afterwards. Not verified: password sign-**up** from scratch, keyboard/screen-reader pass of the new screens, light theme on `/vanner`.
- **Not looked at after the redesign:** plan room, join screen, new-plan form, the date picker at 390px with real input (the inspector measured them; no human look yet).
- The Ticketmaster adapter is live-verified; the guest path was verified before the redesign and not re-run since.
