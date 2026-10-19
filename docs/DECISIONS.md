# Decisions

Append-only log. Newest at the bottom. One entry per decision that someone would otherwise have to rediscover. Status: `accepted` · `superseded by D-nnn` · `proposed`.

Template:

```
## D-nnn — Title
- Date: YYYY-MM-DD · Status: accepted · Deciders: names
- Context: what forced the choice
- Decision: what we do
- Consequences: what gets easier/harder; what to revisit and when
```

---

## D-001 — Matching is a pure, explainable function
- Date: 2026-09 (recorded 2026-10-17) · Status: accepted · Deciders: original author
- Context: The pitch of Monkey Match is trust — "why am I seeing this?"
- Decision: `matchEvents` is pure (clock injected), filters hard constraints before ranking, uses fixed documented weights, exposes reasons not scores, breaks ties deterministically.
- Consequences: Easy to test and to move server-side. Any personalisation or paid placement must be an explicit new decision, because it breaks the "no sponsored placements" promise shown in the UI.

## D-002 — Europe/Stockholm is the only time zone
- Date: 2026-09 (recorded 2026-10-17) · Status: accepted · Deciders: original author
- Context: One city (Göteborg); events are local-time; users may travel or have wrong device zones.
- Decision: All "today/now/start" logic is computed in Europe/Stockholm. Dates and times are plain strings.
- Consequences: Simple and DST-correct for Sweden. Multi-country support (Phase 2) requires a per-event/per-city zone.

## D-003 — Prototype state is in-memory and simulated
- Date: 2026-09 (recorded 2026-10-17) · Status: superseded by D-006 for plans/votes (preferences are still in-memory) · Deciders: original author
- Context: The concept needed to demonstrate the group-vote flow without infrastructure.
- Decision: Preferences, shortlist and votes live in React context; friends and seed votes are fabricated.
- Consequences: Great demo, not a product. Replaced when the backend decision is made.

## D-004 — Swedish UI, English code and docs
- Date: 2026-10-17 · Status: accepted · Deciders: maintainers (proposed in handoff PR)
- Context: Swedish audience; two maintainers and several AI agents collaborating.
- Decision: User-facing strings in Swedish; everything else in English.
- Consequences: i18n (sv/en) is deferred to Phase 4; strings are currently inline in components.

## D-005 — Two-maintainer workflow: branches + PRs, CI gate, agent docs as source of truth
- Date: 2026-10-17 · Status: proposed (merged with the handoff PR) · Deciders: maintainers
- Context: The project is public and will be developed in parallel by two people using AI agents.
- Decision: No direct pushes to `main`; PR per change; the other maintainer reviews; CI (`typecheck`, `test`, `build`) must pass; `AGENTS.md` + `docs/` are kept current as part of each PR; `docs/STATUS.md` carries session-to-session handoff.
- Consequences: Slightly slower than pushing to `main`, much less merge confusion. Branch protection settings on GitHub should mirror this (owner action).

## D-006 — Supabase is the backend
- Date: 2026-10-18 · Status: accepted · Deciders: Eralp
- Context: Plans, votes, invite links and (next) comments and friends need shared, live, access-controlled state.
- Decision: Supabase (Postgres + Auth + Realtime + RLS). Project `monkey-match`, `eu-north-1`, in the owner's org (~10 USD/month). Authorization is RLS plus `SECURITY DEFINER` RPCs; the browser holds only the publishable key. Schema = SQL migrations in `supabase/`.
- Consequences: Realtime and anonymous auth come for free; we depend on Supabase and need its dashboard once (enable anonymous sign-ins). Neon + own API and Firebase were considered and rejected (more work / poor fit for relational voting data).

## D-007 — Events come from external sources, not from our database
- Date: 2026-10-18 · Status: accepted · Deciders: Eralp
- Context: We should not be the system of record for events; listings change at the source.
- Decision: Server-side adapters normalize each source into one `Event` shape (`src/lib/events`), reused for 10 minutes, served by `/api/events`. Two sources on purpose (Ticketmaster Discovery API first, Göteborg & Co GraphQL next) to prove the UI/matching handle heterogeneous data. Plans reference events by `(source, external_id)` and keep a small snapshot. Fictional demo events are only a labelled fallback.
- Consequences: Data quality varies by source (missing prices, end times, descriptions): the model allows unknowns (D-009). Provider terms on caching/storage must be checked per source. Göteborg & Co is blocked on a subscription key and schema.

## D-008 — Hybrid identity: guests vote, accounts do social
- Date: 2026-10-18 · Status: accepted (guests implemented; accounts with comments/friends) · Deciders: Eralp
- Context: The promise is "send a link, friends vote in two taps". Friends and comments need a lasting identity.
- Decision: Everyone is an authenticated Supabase user. Invitees join as anonymous guests with just a name; accounts (email magic link + Google) are needed for friends and comments, and a guest can upgrade without losing votes. A guest session is created only when someone acts.
- Consequences: Anonymous sign-in must be enabled and should be protected by CAPTCHA before launch. Abuse controls and moderation are required for public comments.

## D-009 — Unknown price is "unknown", not "fits" or "free"
- Date: 2026-10-18 · Status: accepted (provisional, flip if product disagrees) · Deciders: proposed by Claude, to confirm
- Context: Sources often omit prices; the old model required a number.
- Decision: `price: number | null`. With a capped budget an unknown-price event stays eligible, earns no budget points and is labelled "Pris ej angivet" (never "Inom din budget"); it never passes free-only. Likewise `time` may be start-only and `ageRestriction` may be null.
- Consequences: Keeps the transparency promise. **In practice every Ticketmaster event is unknown-price** (verified live: it publishes none for Sweden), so budget filtering effectively does not apply to real events until a source supplies prices; see roadmap issue 13. Risk: a user with a low budget may see events that turn out pricier; if that proves annoying, switch to excluding unknown prices when a budget is set.

## D-010 — Plans keep an event snapshot
- Date: 2026-10-18 · Status: accepted · Deciders: Claude (to confirm against provider terms)
- Decision: `plan_events.snapshot` stores title, venue, date/time, image URL, price, ticket link and a ≤280-char description, so a shortlist survives the source changing or dropping a listing. Shown as of when it was added.
- Consequences: A small copy of public listing metadata is stored; verify each provider's terms allow it.

## D-011 — i18n with next-intl, `/sv` and `/en` prefixes, Swedish default
- Date: 2026-10-18 · Status: **built** (branch `feat/i18n`, `docs/CONTRACTS.md` §16) · Deciders: Eralp
- Decision: URL-prefixed locales via `next-intl` so shared links carry the language; Swedish is the default and unprefixed (`as-needed`); English lives under `/en`; a visible language toggle switches the prefix and keeps the page.
- Consequences: Routes moved under `app/[locale]/`; UI strings left the components for `messages/*.json`; invite and friend links are locale-aware; `next-intl@4.14.9` is a dependency; Next 16 needs `src/proxy.ts` (not `middleware.ts`). See D-021 and D-022 for the two choices made while building it.

## D-012 — Comments are threaded posts with reactions, not chat
- Date: 2026-10-18 · Status: accepted, not implemented yet (PR3) · Deciders: Eralp
- Decision: Each plan has a Facebook-style comment thread (plus public comments on events). Replies nest two levels below the root (deeper replies attach to level two). Likes and emoji reactions on comments. No direct messages in this version.
- Consequences: One polymorphic `comments` table (`target_type`: plan | event) with `parent_id`/depth; moderation basics (report, delete own, rate limit, admin delete) are required because event comments are public.

## D-013 — Independent product: Gänget, with its own identity
- Date: 2026-10-18 · Status: accepted · Deciders: Eralp
- Context: The concept was built around VIP Monkey (name, logo, mascot, mint-on-black look) as a job-application demo. The product is now ours.
- Decision: Name **Gänget**; mark = wordmark with a ticket notch, no mascot; palette A (paper and signal, one vermilion accent) with **dark as the default theme** and a light theme; Anton and Work Sans; Swedish informal voice. Everything of VIP Monkey is removed from the product. Source of truth: `docs/brand/GUIDELINES.md`; reasoning in `docs/brand/STRATEGY.md`.
- Consequences: Trademark (PRV/EUIPO) and domain checks are still open; `gänget.se` appeared held by someone else. The README no longer carries the job-application disclaimer.

## D-014 — Front door is the sentence; the plan is a ticket; mood first
- Date: 2026-10-18 · Status: accepted (front door and winner ticket built; the full plan-room ticket comes next) · Deciders: Eralp
- Decision: Direction `sentence-as-layout` ("Vad gör vi ikväll?" at poster scale, tonight's real events playing inside it, mood chips change the answer); the plan winner is a paper ticket; Match stays as the guided version using the same card; bottom nav Utforska · Match · Planer. Routes renamed `/monkey-match` → `/match`, `/matches` → `/match/results` with permanent redirects.
- Consequences: The home page is rendered per request with the real catalogue (no hydration flash). The sections dealt by the design skill that do not serve the product (pinned showcase) were dropped.

## D-015 — Styling approach: token CSS, not utility classes
- Date: 2026-10-18 · Status: accepted · Deciders: Claude (to confirm)
- Decision: Tokens in `src/styles/tokens.css` (primitive → semantic → scales), hand-written BEM-ish CSS split into base/components/screens, Tailwind v4 only as the base layer and token bridge. A theme is a `data-theme` on `<html>`.
- Consequences: One palette, two themes, no raw values in components; a new look is a token change. Utility classes are not used, so the CSS files grow with the app (split per feature when they pass ~1,000 lines).

## D-016 — Comments: members (guests included) in plan threads, accounts only on event threads
- Date: 2026-10-18 · Status: accepted (deviates from D-008 for plan threads; confirm) · Deciders: Claude, to confirm with Eralp
- Context: D-008 said friends and comments need an account. In practice a friend who joined as a guest and cannot say a word in the plan thread is a worse product, and plan threads are private to members.
- Decision: any plan member may comment in the plan thread; **public event threads require a real account**. Reactions are icons from the system, not emoji. Depth, delete, report and rate limit as in `docs/CONTRACTS.md` §13.
- Consequences: a guest's comments live with the guest identity until they add an email (same user id, nothing lost). If guests in plan threads turn out to be an abuse vector, require accounts there too.

## D-017 — Catalogue quality gates
- Date: 2026-10-18 · Status: accepted · Deciders: Claude, to confirm
- Decision: events further than 20 km from the centre are left out; a repeating show is one card with `+N datum` and the other dates on its event page (`groupSeries`); raw URLs are stripped from seller descriptions. Dates further than a week away are labelled with the date, not a weekday.
- Consequences: the catalogue is smaller but each card is a real choice. Revisit the 20 km limit when other cities are added.

## D-018 — Accounts are email + password
- Date: 2026-10-18 · Status: accepted · Deciders: Eralp
- Context: The first build used an emailed magic link. Supabase's built-in mailer only reaches project team members, so every outsider would be stuck until custom SMTP exists.
- Decision: plain email + password. A guest that signs up keeps its user id. With *Confirm email* off in the dashboard no email is sent at all.
- Consequences: no password reset until SMTP is set up (a lost password means a new account). Sign-ups need CAPTCHA before launch. The password sign-up path was not run against a real inbox-less address in tests (the auth server rejects fake domains); it was exercised through sign-in with SQL-created users.

## D-019 — Friends, invitations and notifications
- Date: 2026-10-18 · Status: accepted · Deciders: Claude, to confirm with Eralp
- Decision: friends and plan invitations need an account (a friend list needs a lasting identity); guests share the plan link. Friends are added by code/link and are mutual once accepted. Notifications are *computed* from `last_seen_at` per plan plus open invitations and friend requests, polled every 60 s and on focus; no push or email yet. All writes go through RPCs (`docs/CONTRACTS.md` §15).
- Consequences: the nav badge can lag up to a minute outside the plan room. Email/push notifications are a later step and need SMTP or a push provider and a consent decision.

## D-020 — Ticketmaster terms: what we store and show
- Date: 2026-10-18 · Status: proposed (needs a decision) · Deciders: Eralp
- Context: Ticketmaster's API terms limit how long event data may be kept, forbid earning revenue from the API data itself, and require removing content on request within about 24 hours. Plan rows keep an event snapshot so a plan survives the event leaving the feed.
- Decision (proposed): keep snapshots only while the plan is open and shortly after the event date, purge them afterwards; no ads or paid placement next to API data (already a product promise); one named contact for takedowns (placeholder on `/integritet`); the privacy page states what is stored.
- Consequences: a purge job is not built yet. Until then snapshots stay. Re-read the current terms before launch; this is a reading of them, not legal advice.

## D-021 — Matching reasons are structured data, rendered per language
- Date: 2026-10-18 · Status: accepted · Deciders: Eralp (approved in plan), Claude
- Context: `matchEvents` returned Swedish sentences (`Matchar Dansa`). A second language would have meant either translating inside a pure function or parsing sentences back.
- Decision: `Recommendation.reasons` is `Reason[]` (`kind` + the facts: mood, km, when/date/time). Ranking, filters and the honesty rule (a reason states a real constraint) are unchanged. `describeReason(reason, t, locale)` produces the sentence; the engine stays pure and clock-free.
- Consequences: CONTRACTS §3.5–3.7 and `matching.test.mjs` changed in the same PR; any new reason must be added in the type, the renderer, both message files and the tests. Nothing else in the engine moved.

## D-022 — Language memory: URL, then cookie; no Accept-Language; Swedish slugs
- Date: 2026-10-18 · Status: accepted · Deciders: Eralp
- Decision: the URL prefix decides; an unprefixed URL falls back to the `NEXT_LOCALE` cookie (set by the toggle) and then to Swedish. The browser's `Accept-Language` is deliberately ignored (stripped in `src/proxy.ts`; next-intl cannot read the cookie without also reading that header, hence `localeDetection: true` plus the strip). Route slugs stay Swedish under `/en`.
- Consequences: a shared Swedish link never redirects by itself; someone who chose English and opens an unprefixed link is sent to the `/en` version of it. One functional cookie, disclosed on `/integritet`. Translating slugs later (`pathnames`) means touching every internal link, friend link and redirect.

