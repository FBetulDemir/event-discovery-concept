# Contracts

Rules the codebase relies on. Each is enforced by a test where one exists (`test:` lines) — otherwise by review. If you need to change one, change this file, the tests and `docs/DECISIONS.md` in the same PR.

## 1. Event (`src/types/event.ts`)

The one shape every source adapter (§11) must produce.

| Field | Contract |
|---|---|
| `id` | Unique **across sources**, URL-safe, **stable**. Demo ids as-is; external ones prefixed (`tm-<id>`, `gbg-<id>`). |
| `source`, `externalId` | Which source, and its own id. Together they identify the event in `plan_events`. |
| `slug` | URL-friendly name; currently unused for routing. |
| `date` | `YYYY-MM-DD`, a real calendar date, interpreted in **Europe/Stockholm**. For overnight events this is the **start** date. |
| `time` | `HH:MM–HH:MM` (en dash or hyphen) **or just `HH:MM`** when the source publishes no end. 24 h, local. Start = first part. Anything else makes the event ineligible for matching. |
| `city` | Compared case-, whitespace- and Unicode-normalised (`NFC`, `sv-SE`) against `Preferences.location`. Adapters normalise aliases (`Gothenburg` → `Göteborg`). |
| `price` | SEK per person, finite, `≥ 0`, or **`null` = the source does not say**. `0` = free entry. Never converted from another currency, never guessed. |
| `distanceKm` | Finite, `≥ 0`, great-circle km from the city centre (`GOTEBORG_CENTRE`), computed from the source's coordinates. Events without coordinates are dropped by the adapter. |
| `category` | One of `Klubb · Livemusik · Stand-up · Bar & häng`. Implies a mood (§3). Events an adapter cannot map to one of these are dropped. |
| `moods` | Extra mood tags; matched against `Mood`. |
| `ageRestriction` | Years, or `null` = unknown. |
| `available` | `false` ⇒ never shown anywhere (discovery or matching). |
| `ticketUrl` | Link to buy/read at the source, or `null` (fictional demo events). We never sell tickets ourselves. |

Invalid events are **silently excluded** from matching (never thrown). Demo events are fictional.

test: `matching.test.mjs` "invalid event dates, times, prices and distances cannot enter ranking", `ticketmaster.test.mjs`.

## 2. Preferences (`src/types/preferences.ts`)

- `location`: non-empty after trim.
- `distance`: finite km, `≥ 0` (inclusive limit; `0` means "zero km", not "unlimited").
- `budget`: `null` = no limit; `0` = free entry only; otherwise inclusive SEK cap. These three are distinct.
- `moods`: subset of `Dansa · Livemusik · Skratta · Hänga`; empty = no mood preference (neutral, not "match nothing").
- `date`: `flexible` | `single{start}` | `range{start,end}`. A range with a missing or reversed end is **incomplete** ⇒ no results; the UI blocks "Fortsätt" until `dateSelectionComplete`.
- Invalid/incomplete preferences ⇒ `matchEvents` returns `[]`.

test: `matching.test.mjs` "free-only, unlimited budget…", "incomplete/reversed ranges…".

## 3. Matching engine (`src/lib/matching.ts`)

1. **Pure.** No clock, no randomness, no I/O. Time enters only via `options.now` (ISO instant **with** `Z`/offset). A malformed `now` throws `RangeError`. Inputs are never mutated.
2. **Hard filters first, then rank.** An event failing any of these is never returned, whatever its score: `available`, same city, `price ≤ budget` (an **unknown price** stays eligible for a capped budget but never passes a free-only search, and is never claimed to fit: reason `priceUnknown`, no `withinBudget`), `distanceKm ≤ distance`, valid date/time (start-only times are valid), date within selection, **not already started** (only when `now` given).
3. **Score** (relative ranking points, *not* percentages or confidence): mood **60** · soonness **20** · budget headroom **10** · proximity **10**. Mood = fraction of chosen moods the event satisfies; the category's implied mood counts once alongside tags (`Klubb→Dansa`, `Livemusik→Livemusik`, `Stand-up→Skratta`, `Bar & häng→Hänga`). No moods or no budget ⇒ that factor is neutral. Soonness is measured from `now`, else the selected start date, else the earliest eligible event.
4. **Deterministic order.** Ties break by start date/time → distance → price (unknown last) → `id`, independent of input order.
5. **Return everything eligible**; the UI slices the top 3. **No score leaves the engine** — only `reasons: Reason[]`.
6. **Reasons are honest, structured data** (D-021): `{ kind: 'mood', mood }`, `withinBudget`, `free`, `priceUnknown`, `{ distance, km }`, `{ when: 'tonight' | 'today' | 'tomorrow' | 'date', date, time }`, `inRange`. The engine never produces prose; `describeReason` (`src/lib/i18n/reasons.ts`) renders them in the visitor's language (Swedish: `Matchar Dansa`, `Inom din budget`, `Fri entré`, `1,8 km bort`, `Ikväll`; English: `Matches Dance`, `Within your budget`, `Free entry`, `1.8 km away`, `Tonight`). A reason must reflect an actual constraint the user set: `withinBudget` only when a budget was set. Adding a kind means adding it to `Reason`, `describeReason`, both message files and the tests.
7. Without `now`, past-event filtering and relative `when` values (`tonight`, `today`, `tomorrow`) are unavailable by design: the reason falls back to `date`.
8. **Changing weights or adding a factor** is a product decision: update this section, the doc-comment above `matchEvents`, tests, and `docs/DECISIONS.md`.

test: all of `matching.test.mjs`.

## 4. Time & recurrence (`src/data/events.ts`, `src/lib/dates.ts`)

- The canonical zone is **Europe/Stockholm** (DST-aware). Use `todayInGothenburg` / the helpers in `dates.ts`; do not use the browser's local zone for "today".
- `eventTemplates` are weekday-anchored seeds. `getEvents(now)` maps each to its **next occurrence**; an event rolls to next week exactly at its Stockholm start time. Same `id` before and after.
- "Now" is evaluated **at use time**, never at module load (the app may stay open for days; Vercel may cache modules).
- Calendar weeks start on **Monday**.

test: `recurrence.test.mjs`, `dates.test.mjs`.

## 5. Discovery filters (`src/lib/discovery.ts`)

`filterEvents` ANDs: `available`, category (`'Alla event'` = any), exact date (`'all'` = any), free-only, and a case-insensitive (`sv-SE`) substring search over `title venue category city`. Filters combine; none overrides another.

test: `discovery.test.mjs`.

## 6. Plans & voting (`supabase/migrations`, `src/lib/plans`, `src/lib/voting.ts`)

- A **plan** has a private **invite code** (12 hex chars, a capability: it lets you preview and join, nothing else), one organizer, members, a shortlist of events, and at most one vote per member. Status `open → decided`.
- **Guests** (Supabase anonymous sign-in) and **accounts** are both authenticated users. A guest session is created only when a person acts (join / create / vote), never on browsing.
- A plan has an optional **date** (`plan_date`) set by the organizer (`update_plan`, open plans only). The **invite preview** (`get_plan_preview`) returns title, organizer, date, member names and the option snapshots, so an invitee sees what they will vote on before joining; a favourite picked there is cast as their vote on joining.
- Shortlist: any member adds while the plan is open; the adder or the organizer removes while open. An event is `(source, external_id)` plus a small `snapshot` (§12).
- **Votes:** one per member, enforced by the primary key `(plan_id, user_id)`. Voting for the same event again withdraws it; voting for another moves it. A vote for a non-member or for an event not on the plan's shortlist is impossible (composite FKs). Everyone in the plan sees all votes.
- **Closing:** only the organizer, through `close_plan`. The leader wins; **a tie raises `tie` and the organizer must pick** (`close_plan(plan, plan_event)`). No silent tie-breaks. After closing, votes and shortlist changes are refused.
- The client mirrors the tally/tie rule in `src/lib/voting.ts` for display; the database function is the source of truth.
- Live updates: Realtime on `votes`, `plan_events`, `plan_members`, `plans`; clients reload on change.

test: `voting.test.mjs`; `supabase/tests/plans_rls.test.sql` (run against the database, see `docs/BACKEND.md`).

## 7. Design system (`src/styles`, `src/components/ui`, `/design`)

- Colour, space, type, shape, motion and layers come from `src/styles/tokens.css`, which mirrors `docs/brand/GUIDELINES.md`. **Dark is the default theme**, light exists; components read semantic roles only, never raw values.
- Five type steps (display, head, lead, body, small): Anton caps for display/head, Work Sans for text; nothing under 13px, body 16px+.
- House rules: square corners, surfaces by tone step (no hairlines, no outlined boxes), no shadows at rest, no gradients (except a neutral scrim over photos), one accent action per screen, no eyebrow labels, no numbered labels, headings at most two lines at every width.
- The ticket (plan winner) is `--paper` in both themes.
- Primitives are reused, not re-implemented: `Button`/`ButtonLink`, `Chip` (toggle), `Tag`, `Field`, `IconButton`, `BackLink`, `Skeleton`, `EmptyState`, `SelectionCard`, `ProgressBar`, `SectionHeading`, `DatePicker`, `EventCard`. New components are added to the `/design` gallery.
- Mobile-first at **390px**; content max-width `--page-max`.
- `Chip` is a controlled toggle and exposes `aria-pressed`; each route renders `PageContainer` exactly once (the `<main id="main-content">` landmark and skip-link target).
- Verification: `docs/design/QA.md` (lint + inspector, with documented exceptions).

## 8. Accessibility baseline

Must hold on every page:
- Skip link → `#main-content`; one `h1` per page; landmarks labelled.
- Every input has a visible or `sr-only` label.
- Dynamic result counts use `role="status" aria-live="polite" aria-atomic="true"`.
- Multi-step flows move focus to the step heading on change.
- Visible focus ring (`--focus-width`, `--focus-offset`); all actions reachable and operable by keyboard.
- Decorative icons `aria-hidden`; meaningful images have `alt` in the page language. Every `aria-label`, `legend` and `alt` comes from the messages, in both languages.
- Motion respects `prefers-reduced-motion`.
- Colour is never the only signal (selected chips also show a check).

## 9. Content & language

- UI strings: Swedish (default) and English, informal, short, all from `messages/sv.json` and `messages/en.json` (§16). `<html lang>` follows the locale.
- Code, comments, docs, commits, PRs: English.
- Product promises in copy ("Inga sponsrade placeringar" / "No sponsored placements", "Sorterat efter känsla, tid, budget och avstånd" / "Sorted by mood, time, budget and distance") must remain true of the implementation (§3), in both languages.

## 10. Repo & delivery

- Public repo: no secrets, no `.env`, no private data in fixtures.
- `main` is changed only through reviewed PRs; CI (`typecheck`, `test`, `build`) must be green.
- Third-party assets: record provenance (`public/images/SOURCES.md`). Nothing of VIP Monkey's remains (name, logo, mascot, mint look); the brand is Gänget (`docs/brand/GUIDELINES.md`).

## 11. Event sources (`src/lib/events`)

- A source implements `EventSource { id, load(now) → SourceResult }`. `loadCatalog` runs the enabled sources **in parallel**; one failing never breaks the page (`status: 'error' | 'not-configured'`, with a safe `message`).
- Adapters map to the §1 `Event` or **drop** the item. They never fabricate a price, time, coordinate or image.
- Data is fetched server-side, reused for `SOURCE_REVALIDATE_SECONDS` (10 min) and reaches the browser via `/api/events`; a page refresh after that window shows source changes. Plans keep a snapshot so they survive changes at the source.
- `EVENT_SOURCES` (default `ticketmaster,goteborgco`) picks sources. If nothing real returns, the fictional `demo` source fills in and the `sources` field of the response says so. The UI must not present demo events as real.
- Provider API keys stay in server-only environments. Ticketmaster's key is a Supabase Edge Function secret; Next calls that function with its publishable key. Error messages and logs must never include a Ticketmaster request URL (it carries the key).
- Respect each provider's terms (attribution, caching, storage limits) when adding a source; note them in `docs/BACKEND.md`.

test: `ticketmaster.test.mjs`, `handler.test.mjs`, `catalog.test.mjs`.

## 12. Backend & access control (`supabase/`)

- Schema changes are SQL files in `supabase/migrations/`, applied in order; never edit the live schema by hand. Regenerate `src/lib/supabase/database.types.ts` after each one.
- **RLS on every table.** The `anon` role has no privileges; everything goes through `authenticated` (guests are authenticated). Policy helpers live in the non-exposed `private` schema.
- Privileged/atomic writes are `SECURITY DEFINER` functions with `search_path = ''` and an explicit `auth.uid()` check: `create_plan`, `join_plan`, `close_plan`, `get_plan_preview`.
- Snapshots: ≤ 4 KB JSON object, description ≤ 280 chars. They are a reference copy of public listing metadata.
- Never ship a `service_role`/secret key to the browser or the repo.

## 13. Comments and reactions (`supabase/migrations/*plan_date_preview_comments*`, `src/components/comments`)

- One `comments` table with `target_type` (`plan` | `event`) and `target_id` (the plan uuid, or the event id), threaded by `parent_id`.
- **Depth:** root (0), reply (1), reply to a reply (2). A reply to a level-2 comment becomes its **sibling** at level 2. Enforced in `add_comment`.
- **Who can read:** plan threads, only plan members; event threads, any signed-in user (guests included). Reading an event thread starts a guest session only when the visitor asks to see comments.
- **Who can write:** plan threads, any member (guests included); **event threads need a real account** (not an anonymous guest): they are public, so they need a lasting identity for moderation. `add_comment` raises `account_required`.
- Reactions: `like`, `love`, `laugh`, `fire`, `wow`; one per kind per user; shown as icons, not emoji.
- Delete: the author, or the plan organizer for plan threads. The row stays (`deleted_at`, empty body) so replies keep their place.
- Report: one per user per comment, written to `comment_reports`; nobody can read reports through the API (moderate in the dashboard).
- Rate limit: at most 8 comments per user per minute (`rate_limited`).
- All writes go through RPCs; the tables have no insert or update policies.

test: `supabase/tests/comments.test.sql`.

## 14. Accounts (`src/lib/supabase/auth.ts`, `/konto`)

- Plain **email + password** (min. 8 characters). No email is sent when *Confirm email* is switched off in the Supabase dashboard (Authentication → Sign In / Providers → Email); the code also handles the "needs confirmation" case if it is on.
- A **guest that signs up keeps its user id** (`updateUser({ email, password })` on the anonymous user), so its plans, memberships, votes and comments stay. Someone with no session gets a normal sign-up; signing in is `signInWithPassword`.
- If the email already belongs to an account, the guest is told so and may sign in there; the guest's own data stays with the guest on that device.
- No password reset yet: it needs custom SMTP (the built-in mailer only delivers to project team members). See `docs/BACKEND.md`.

## 15. Notifications, friends and invitations (`supabase/migrations/*notifications_friends*`, `src/lib/social`, `src/components/notifications`, `/vanner`)

- **Unread is computed, not stored per event.** `plan_members.last_seen_at` is set by `mark_plan_seen` when a member opens the plan room; `my_unread()` counts other people's votes, comments, options, joins and a decision after that time. Own activity never counts. The nav badge shows plans with news + open invitations + friend requests.
- **Friends and invitations need an account** (`private.require_account()` rejects anonymous users). A guest shares the plan link instead. Everything is written through RPCs (`add_friend`, `respond_friend`, `remove_friend`, `invite_friend`, `accept_invite`, `decline_invite`); the tables are read-only to clients and RLS limits reads to the two people involved.
- A friend is added by **code or link** (`/vanner?kod=…`); `friend_preview` shows only the display name. Adding someone who already asked you accepts the request. Only accepted friends can be invited; accepting an invitation joins the plan.
- Notifications are polled (on focus and every 60 s), not pushed, and they fail quietly. There is no email or push delivery yet.

## 16. Languages (`src/i18n`, `messages/`, `src/proxy.ts`, `src/lib/i18n`)

- **Locales:** `sv` (default, unprefixed URLs) and `en` (`/en/…`). Route slugs are **not** translated (`/en/vanner`, `/en/konto`, `/en/integritet`, `/en/plan/<code>`) so friend links, invite links and redirects stay one-to-one. `/sv/…` redirects to the unprefixed URL; the old `/monkey-match` and `/matches` redirects exist in both languages.
- **Which language you get:** the URL prefix wins; otherwise the `NEXT_LOCALE` cookie; otherwise Swedish. `Accept-Language` is never used (`src/proxy.ts` strips it before next-intl sees the request), so a shared link never redirects on the browser's language. The cookie is functional only (language), set by next-intl on the toggle or when a prefixed URL is opened, and is listed on `/integritet`.
- **Strings:** every user-facing string lives in `messages/sv.json` and `messages/en.json`, same keys, same placeholders (`src/i18n/messages.test.mjs`). Keys are typed from `sv.json` (`global.d.ts`), so a missing key fails `npm run typecheck`. `src/i18n/hardcoded.test.mjs` fails if Swedish copy is hard-coded in `src/components`, `src/app`, `src/lib` or `src/data` (the seed events are the one exception, see below). Plurals are ICU in the message, never `count === 1 ?` in code.
- **Data identifiers are not translated.** `EventCategory`, `Mood`, the `'Alla event'` filter value and `Preferences.location` stay Swedish in code, filters, snapshots and the database; `categoryLabel`, `moodLabel`, `cityLabel` (`src/lib/i18n/labels.ts`) give them a display name (`categories.*`, `moods.*`, `cities.*`). New category or mood ⇒ add both labels.
- **Pure `src/lib` helpers take the language, they do not read it:** `formatPrice`, `formatWhen`, `formatDateSelection`, `formatPlanDate`, `describeNews`, `describeReason` receive a `locale` and/or the root translator (`useTranslations()` / `getTranslations()`); tests pass a translator over the real messages (`src/i18n/testing.mjs`).
- **Seller content is shown as written.** Ticketmaster titles, venues and descriptions are never translated. The fictional demo events keep Swedish source data and are shown through `demoEvents.*` messages (`localizeEvent`, applied in `useCatalog` and on the event page). A plan created from a demo event stores what its creator saw.
- **Dates and prices:** `intlLocale` maps `sv → sv-SE`, `en → en-GB` (24 h clock, day before month). Prices read `180 kr` / `180 SEK`. The time zone stays Europe/Stockholm (§4) in both languages; `todayInGothenburg` uses `sv-SE` only because it formats `YYYY-MM-DD`.
- **Shared links carry the language of the sender** (`getPathname` in `PlanRoom` invite box and `FriendsPanel` link); `parseFriendCode` accepts any URL shape.
- **Navigation:** import `Link`, `useRouter`, `usePathname`, `redirect` from `@/i18n/navigation`, never from `next/link` / `next/navigation` (except `notFound`, `useSearchParams`).
- **Toggle:** `LanguageToggle` in the header (also on phones). Each option is a real link with `lang`/`hreflang`; the current one has `aria-current`. Switching keeps the page and the query string.

