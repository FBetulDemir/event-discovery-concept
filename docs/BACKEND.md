# Backend

Supabase (Postgres, Auth, Realtime) for plans, plus server-side fetching of external events. Contracts: `docs/CONTRACTS.md` §6, §11, §12.

## One-time setup (per environment)

1. **Project.** Production uses the Supabase project `monkey-match` (ref `uryyxixgdhomhddnanvh`, region `eu-north-1`). For a separate environment create another project and apply the migrations in order.
2. **Allow anonymous sign-ins** — Dashboard → *Authentication → Sign In / Providers → Anonymous Sign-Ins* → on. Without it guests cannot create or join plans (`anonymous_provider_disabled`, HTTP 422).
   Recommended before launch: enable CAPTCHA (Auth → Attack Protection) because anonymous sign-in is open to scripts.
3. **Env vars** (`.env.local` locally; Vercel → Project → Settings → Environment Variables for the deployed site). See `.env.example`.
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — browser-safe, access is enforced by RLS.
   - `TICKETMASTER_API_KEY` — server only. `GOTEBORGCO_API_KEY` — server only, adapter not written yet.
   - `EVENT_SOURCES` — optional, e.g. `ticketmaster,demo` to show fictional events next to real ones.
   - Never add a `service_role` / secret key to the browser env or the repo.

## Migrations

SQL files in `supabase/migrations/` (timestamp-prefixed), applied in order. They are the source of truth: change the schema by adding a new file, apply it, then regenerate `src/lib/supabase/database.types.ts`.

| Migration | What |
|---|---|
| `20261018150000_plans_votes_invites` | profiles, plans, plan_members, plan_events, votes; RLS; `create_plan`, `join_plan`, `close_plan`, `get_plan_preview`; Realtime |
| `20261018151500_private_rls_helpers` | RLS helper functions moved to the non-exposed `private` schema; missing index |

After applying, run Supabase's advisors (security + performance). The only expected security warnings are the four intentional client RPCs listed above.

## Testing the database rules

`supabase/tests/plans_rls.test.sql` exercises membership, voting, ties, closing and the `anon` role with throwaway users and rolls everything back. Run it in the SQL editor; a result of `ALL_OK: …` means every check passed, any other message names the failing check.

## Event sources

| Source | Status | Notes |
|---|---|---|
| `ticketmaster` | adapter written, unit-tested on documented sample data | Needs `TICKETMASTER_API_KEY`. Free key, ~5,000 calls/day. Not yet verified against a live response; Göteborg coverage of small clubs/bars is unknown until tried. Only Music and Comedy are requested; items that are not club / live music / stand-up are dropped. Price only when quoted in SEK. |
| `goteborgco` | not written | Göteborg & Co GraphQL API; needs a subscription key and its schema. Reuse/licensing terms unknown. |
| `demo` | fictional | Fallback and tests. Weekly recurring seeds in `src/data/events.ts`. |

Before storing any provider data beyond the plan snapshot, check that provider's terms.

## Data model (short)

`profiles(id → auth.users)` · `plans(invite_code, organizer_id, status, decided_plan_event_id)` · `plan_members(plan_id, user_id, role)` · `plan_events(plan_id, source, external_id, snapshot)` · `votes(plan_id, user_id → one row, plan_event_id)`.
