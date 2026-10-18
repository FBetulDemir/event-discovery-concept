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
- Date: 2026-10-18 · Status: accepted, not implemented yet (PR2) · Deciders: Eralp
- Decision: URL-prefixed locales via `next-intl` so shared links carry the language; Swedish is the default; a visible language toggle switches the prefix.
- Consequences: Routes move under `app/[locale]/`; UI strings leave the components; invite links must be locale-aware.

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

