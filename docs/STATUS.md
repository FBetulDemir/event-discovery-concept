# Status

Living handoff note. **Update it at the end of any session that leaves work open** (the `handoff` skill does this). Keep it short; history lives in git.

_Last updated: 2026-10-21 by Codex — comment action feedback on `fix/comment-actions`._

Account login follow-up (local commit on `fix/comment-actions`; not pushed): `/konto` defaults to login, guests can switch between login and account creation, and the heading/button follow the selected mode. This fixes guest sessions hiding the existing-account option after opening event comments. `npm run check` passes (85 tests, typecheck, build); browser checks with mocked Supabase verify guest mode switching and the password-login request, with English mobile/desktop layouts. No live account login was attempted. Next: push the follow-up and update PR #5.

Comment action fix (`fix/comment-actions`, ready for PR review): event replies still require an account (D-016); guest Reply now focuses explicit sign-in guidance, and account Reply focuses the composer. Missing-profile reaction failures prompt for a name using the existing `set_display_name` RPC, then retry the reaction. Duplicate reactions refresh normally; reports show confirmation, including already-reported comments. Action errors are visible to guests too. No schema, RLS, or auth-model changes.

Verification: `npm run check` passes (85 tests, typecheck, build). Fixed the existing Windows URL-to-path bug in the hard-coded-copy test without relaxing its assertions. Browser checks against the local dev app with mocked Supabase responses cover guest reply guidance, profile setup and like/unlike, duplicate reaction/report handling, account keyboard reply and parent id, and Swedish/English at 390px and desktop. The design skill's `lint.mjs`/`inspect.mjs` are not installed at the documented path; no live Supabase writes or screen-reader session were performed. Next: review/merge the PR and verify the deployed flow with a fresh guest session. The user's reported HTTP 409 fits the reproduced profile/duplicate cases; its actual response body was not available.

`fix/ticketmaster-supabase-secret` is stacked on `feat/i18n`. Ticketmaster now goes through `supabase/functions/ticketmaster-events`, with its key read from Supabase Edge Function Secrets (D-023). The function was deployed to `monkey-match` on 2026-10-19; the owner added the secret, and the old `TICKETMASTER_API_KEY` line was removed from `.env.local`. If the key is also set in the Next hosting environment, remove it there. The code is not yet merged or deployed with the Next app.

Verification for this branch: `npm test` (83 passing), `npm run typecheck`, `npm run build`. With the secret present, the hosted function returned HTTP 200 and 102 raw events; the local production `/api/events` endpoint returned `ticketmaster: ok` (70 mapped events, 50 within the catalogue's 20 km limit) without the local key.

## Now

- `main` has the handoff foundation (docs, contracts, CI, skills).
- Branch `feat/backend-foundation` (PR1, **not opened**): Supabase backend, real plans with live voting, Ticketmaster events (D-006 to D-010).
- Branch `feat/design-system` (**stacked on PR1, not opened**): new independent brand **Gänget** (D-013), dark-default tokens + light theme, primitives, `/design` gallery, new front door (live sentence), Match, event page, join/plan screens, routes `/match` and `/match/results` (D-014, D-015). Nothing of VIP Monkey remains.
- Skill lint: 0 FAIL. Inspector: front door 0 FAIL; app screens 0 FAIL with documented exceptions; `/plan` and `/plan/new` 1 FAIL each (`still-page`, near-empty screens). See `docs/design/QA.md`.

## Honest status

The core loop is now a social tool: invitee screen that shows the options, a plan room with who-voted-what, date, add-event and a two-level comment thread with reactions, accounts by email + password (guest upgrade keeps plans), friends and invitations (`/vanner`), notifications (nav badge), richer plan list, catalogue quality gates. **Still missing:** a second event source and prices. English (`/en`) and the language toggle are built (D-011, D-021, D-022). **Needs you:** switch *Confirm email* off in the Supabase dashboard (password sign-up otherwise sends mail outsiders never get); custom SMTP is only needed later for password reset (`docs/BACKEND.md`). Full review with screenshots (Turkish): [`design/REVIEW.md`](design/REVIEW.md).

## In flight

| Branch / PR | Owner | What | State |
|---|---|---|---|
| `feat/backend-foundation` | Eralp | PR1 backend + event sources + plans | Committed locally; not pushed |
| `feat/design-system` | Eralp | Design PR: brand, system, front door, Match, event | Built, committed locally, verified in a production build; not pushed |
| `feat/design-system` (same branch) | Eralp | Notifications, friends (`/vanner`), invite-a-friend, password accounts, `/integritet` (D-018, D-019) | Built; verified in a production build with 3 test accounts; not committed at time of writing |
| `feat/i18n` (cut from `feat/design-system`) | Eralp | i18n `/sv` `/en` + toggle (D-011, D-021, D-022) | Built, committed locally; not pushed. Needs a human read of the English copy, especially `/integritet` |
| (next) plan room as a full ticket | Eralp | D-014 | Winner card is a ticket; the rest of the room is plain |

## Next up

0. Decide D-020 (Ticketmaster snapshot retention) and build the purge; add a privacy contact on `/integritet`.
1. Review both branches; the owner decides when to push and open PRs (PR2 depends on PR1).
2. Read the English copy (`messages/en.json`), above all the privacy text, before launch.
3. Real Göteborg pictures from open collections and one looping clip for the front door (`assets.mjs`); trademark and domain checks for "Gänget".
4. Göteborg & Co adapter (needs a key); decide the budget-step question (roadmap issue 13).

## Blocked / waiting on a human

- Trademark search (PRV/EUIPO) and a domain for Gänget.
- CAPTCHA for anonymous sign-ins before launch.
- Göteborg & Co subscription key.
- Supabase dashboard: **Confirm email OFF** (Authentication → Sign In / Providers → Email), otherwise password sign-up sends mail that outsiders never receive.

## Verification notes

- **i18n:** `npm run check` and the skill lint (0 FAIL) pass; production build on port 3100. Looked at in both languages at 390px and desktop: home, Match (3 steps + results), plan list, plan room (guest session), `/konto` and `/vanner` in their guest states, 404. Language toggle keeps page and query string; `curl` confirmed redirects (`/monkey-match`, `/en/matches`, `/sv`), `html lang`, hreflang `Link` header, cookie behaviour and that `Accept-Language: en` does not redirect. **Not verified:** the signed-in states of `/konto` and `/vanner` (friends list, requests) and the account sign-up in English, because that needs a real Supabase account and none was created; the messages are type-checked and the strings are covered by the parity test. English copy was written by Claude and has had no human read.

- `npm run check` passes (typecheck, tests, build) on Node 24.
- Production build run on port 3100 and looked at in the browser: front door (desktop and a 375px phone), Match step 1, Match results, event page, `/design` in dark and light. Found and fixed on the way: display leading too tight for Å Ä Ö, mobile hero slot collapsing (now a 3:2 frame between the two lines), an invisible link colour on cards.
- Friends and notifications: flow run end to end in a production build on port 3100 (sign in, name, friend link, request, accept, invite to plan, accept invite, badge appears and clears, plan-list "Nytt" line, mobile bottom-nav badge). SQL test `friends_notifications.test.sql` passes. Test users deleted afterwards. Not verified: password sign-**up** from scratch, keyboard/screen-reader pass of the new screens, light theme on `/vanner`.
- **Not looked at after the redesign:** plan room, join screen, new-plan form, the date picker at 390px with real input (the inspector measured them; no human look yet).
- The Ticketmaster adapter is live-verified; the guest path was verified before the redesign and not re-run since.
