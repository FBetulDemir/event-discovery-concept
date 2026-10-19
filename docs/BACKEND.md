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

## Sign-in setup

Accounts are email + password (`docs/CONTRACTS.md` §14). One dashboard setting decides whether any email is sent:

1. **Authentication → Sign In / Providers → Email:** switch **Confirm email OFF** for sign-up without email. With it ON, every sign-up sends a confirmation link, which the built-in mailer only delivers to project team members (a few per hour).
2. **Authentication → Sign In / Providers:** keep **Allow anonymous sign-ins** ON (guests).
3. Password reset ("glömt lösenord") is **not built**: it needs a custom SMTP provider (Authentication → SMTP Settings) and a reset page. Until then a lost password means a new account.
4. Before launch: CAPTCHA (Turnstile) on sign-ups and anonymous sign-ins.

## Migrations

SQL files in `supabase/migrations/` (timestamp-prefixed), applied in order. They are the source of truth: change the schema by adding a new file, apply it, then regenerate `src/lib/supabase/database.types.ts`.

| Migration | What |
|---|---|
| `20261018150000_plans_votes_invites` | profiles, plans, plan_members, plan_events, votes; RLS; `create_plan`, `join_plan`, `close_plan`, `get_plan_preview`; Realtime |
| `20261018151500_private_rls_helpers` | RLS helper functions moved to the non-exposed `private` schema; missing index |
| `20261018170000_plan_date_preview_comments` | `plans.plan_date` + `update_plan`; richer `get_plan_preview` (members, options); `comments`, `comment_reactions`, `comment_reports` with `add_comment` / `delete_comment`; Realtime |
| `20261018190000_notifications_friends` | `plan_members.last_seen_at`, `mark_plan_seen`, `my_unread`; `profiles.friend_code`, `friendships`, `plan_invites`; `set_display_name`, `my_friend_code`, `friend_preview`, `add_friend`, `respond_friend`, `remove_friend`, `my_friends`, `invite_friend`, `my_invites`, `accept_invite`, `decline_invite`; `private.require_account` |

After applying, run Supabase's advisors (security + performance). Expected warnings: the intentional client RPCs (`create_plan`, `join_plan`, `close_plan`, `get_plan_preview`, `update_plan`, `add_comment`, `delete_comment`), "anonymous access policies" on every table (guests are `authenticated` by design; the `anon` role has nothing), and "leaked password protection" (we have no passwords).

## Testing the database rules

`supabase/tests/plans_rls.test.sql` (membership, voting, ties, closing, `anon`) `supabase/tests/friends_notifications.test.sql` (unread counts, friends, invitations) and `supabase/tests/comments.test.sql` (plan date, invite preview, threads, permissions, reactions, delete, rate limit, reports) use throwaway users and roll everything back. Run it in the SQL editor; a result of `ALL_OK: …` means every check passed, any other message names the failing check.

## Event sources

| Source | Status | Notes |
|---|---|---|
| `ticketmaster` | **live-verified 2026-10-18** (key in `.env.local`) | Free key, ~5,000 calls/day. Göteborg query (40 km, next 90 days, Music + Comedy) returned 70 mappable events: 61 live music, 6 stand-up, 3 club, at venues like Scandinavium, Filmstudion, Park Lane, plus Kungsbacka/Partille. **Ticketmaster publishes no prices for Sweden** (0 of 178 events had `priceRanges`), so `price` is always `null`; `ageRestrictions` is absent too; descriptions (`info`) are present. Few clubs: club nights mostly come as Music/Rock, so only 3 are `Klubb`. Items that are not music or comedy (47 "Spectacular", theatre, holiday, food) are dropped; so are events with no start time (`timeTBA`). |
| `goteborgco` | not written | Göteborg & Co GraphQL API; needs a subscription key and its schema. Reuse/licensing terms unknown. |
| `demo` | fictional | Fallback and tests. Weekly recurring seeds in `src/data/events.ts`. |

Before storing any provider data beyond the plan snapshot, check that provider's terms.

## Data model (short)

`profiles(id → auth.users)` · `plans(invite_code, organizer_id, status, decided_plan_event_id)` · `plan_members(plan_id, user_id, role)` · `plan_events(plan_id, source, external_id, snapshot)` · `votes(plan_id, user_id → one row, plan_event_id)`.

## Language and auth redirects

Auth is email + password, so no Supabase redirect URL depends on the language. If a magic-link or confirmation-email flow is added later, build `emailRedirectTo` with `getPathname` from `@/i18n/navigation` so it returns the person to their own language, and add both `/…` and `/en/…` to the dashboard's redirect allow-list. Database error codes are language-neutral; the UI maps them to messages (`plan.errors.*`, `friends.errors.*`, `comments.errors.*`, `account.problems.*`).

