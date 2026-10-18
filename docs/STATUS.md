# Status

Living handoff note. **Update it at the end of any session that leaves work open** (the `handoff` skill does this). Keep it short; history lives in git.

_Last updated: 2026-10-18 by Eralp (with Claude) — backend foundation branch._

## Now

- `main` has the handoff foundation (docs, contracts, CI, skills).
- Branch `feat/backend-foundation` (PR1, **not opened yet**) adds: Supabase backend (schema, RLS, RPCs, Realtime), guest auth, real plans with invite links / shortlist / live voting / organizer close with explicit tie-break, external event adapters (Ticketmaster + demo fallback) behind `/api/events`, ticket link-out, docs (`BACKEND.md`, contracts §6/§11/§12, decisions D-006…D-012).
- Supabase project `monkey-match` (`uryyxixgdhomhddnanvh`, eu-north-1) exists with both migrations applied; the RLS test passes there.

## In flight

| Branch / PR | Owner | What | State |
|---|---|---|---|
| `feat/backend-foundation` | Eralp | PR1: backend + event sources + plans | Implemented and committed locally; not pushed. Waiting for the owner's go-ahead to push and open the PR |
| (next) i18n `/sv` `/en` + toggle | Eralp | PR2, D-011 | Not started |
| (next) accounts, friends, comment threads | Eralp | PR3, D-008, D-012 | Not started |
| (next) UI/UX/IA audit → tokenized design system | Eralp | separate PR after the audit | Not started |

## Next up

1. Anonymous sign-ins are now enabled on the `monkey-match` project (done 2026-10-18). Add CAPTCHA before launch (`docs/BACKEND.md`).
2. Add `TICKETMASTER_API_KEY` to `.env.local` (and Vercel) and check the adapter against the live API; fix the mapping where real payloads differ.
3. Set the Supabase env vars on Vercel (`docs/BACKEND.md`).
4. Obtain a Göteborg & Co key; write the adapter.

## Blocked / waiting on a human

- Before launch: CAPTCHA for anonymous sign-ins.
- Ticketmaster key; Göteborg & Co subscription key.
- Brand permission & naming; licence (see `docs/ROADMAP.md` open questions).

## Verification notes

- `npm run check` (typecheck, 50 unit tests, build) passes on Node 24.
- Database rules verified by `supabase/tests/plans_rls.test.sql` on the live project (rolled back). Security advisor: only the four intentional client RPCs are flagged.
- Browser (desktop + mobile, dev server), using two throwaway password users that were deleted afterwards: create plan from an event, add a second event to an open plan, a second user joining and voting (the organizer's screen updated live), your own vote, a tie → organizer must choose, close → winner card, voting locked, join screen for a non-member. The **guest path** was verified too once anonymous sign-ins were enabled (guest creates a plan and votes; test data deleted). **Not verified:** two real browsers/devices at once, the Ticketmaster adapter against the live API.
- Ticketmaster adapter verified on documented sample payloads only.
