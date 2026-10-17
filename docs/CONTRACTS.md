# Contracts

Rules the codebase relies on. Each is enforced by a test where one exists (`test:` lines) — otherwise by review. If you need to change one, change this file, the tests and `docs/DECISIONS.md` in the same PR.

## 1. Event (`src/types/event.ts`)

| Field | Contract |
|---|---|
| `id` | Unique, URL-safe, **stable forever** (shortlist, votes and `/events/[id]` use it). Weekly rollover must not change it. |
| `slug` | URL-friendly name; currently unused for routing. |
| `date` | `YYYY-MM-DD`, a real calendar date, interpreted in **Europe/Stockholm**. For overnight events this is the **start** date. |
| `time` | `HH:MM–HH:MM` (en dash or hyphen), 24 h, local. Start = first half. Anything else makes the event ineligible for matching. |
| `city` | Compared case-, whitespace- and Unicode-normalised (`NFC`, `sv-SE`) against `Preferences.location`. |
| `price` | SEK per person, finite, `≥ 0`. `0` = free entry. |
| `distanceKm` | Finite, `≥ 0`, from city centre (placeholder until real geo exists). |
| `category` | One of `Klubb · Livemusik · Stand-up · Bar & häng`. Implies a mood (§3). |
| `moods` | Free-form mood tags; matched against `Mood`. |
| `available` | `false` ⇒ never shown anywhere (discovery or matching). |

Invalid events are **silently excluded** from matching (never thrown). Seed data is fictional.

test: `matching.test.mjs` "invalid event dates, times, prices and distances cannot enter ranking".

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
2. **Hard filters first, then rank.** An event failing any of these is never returned, whatever its score: `available`, same city, `price ≤ budget`, `distanceKm ≤ distance`, valid date/time, date within selection, **not already started** (only when `now` given).
3. **Score** (relative ranking points, *not* percentages or confidence): mood **60** · soonness **20** · budget headroom **10** · proximity **10**. Mood = fraction of chosen moods the event satisfies; the category's implied mood counts once alongside tags (`Klubb→Dansa`, `Livemusik→Livemusik`, `Stand-up→Skratta`, `Bar & häng→Hänga`). No moods or no budget ⇒ that factor is neutral. Soonness is measured from `now`, else the selected start date, else the earliest eligible event.
4. **Deterministic order.** Ties break by start date/time → distance → price → `id`, independent of input order.
5. **Return everything eligible**; the UI slices the top 3. **No score leaves the engine** — only `reasons: string[]`.
6. **Reasons are honest and Swedish** (`Matchar Dansa`, `Inom din budget`, `Fri entré`, `1,8 km bort`, `Ikväll`/`Idag`/`Imorgon`/date, `Inom din valda period`). A reason must reflect an actual constraint the user set. "Inom din budget" only when a budget was set.
7. Without `now`, past-event filtering and relative labels (`Idag`, `Imorgon`) are unavailable by design.
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

## 6. Plan & voting (`src/components/plan/ShortlistProvider.tsx`)

Current (prototype) behaviour — **will change when a backend exists**:

- A shortlist is an ordered list of unique event IDs; adding an existing ID is a no-op.
- Each person has **at most one vote**. Voting for the same event again withdraws it; voting for another moves it. Counts never go below 0.
- Winner = highest count; **ties currently go to the earliest shortlisted event** (known gap — see roadmap).
- Seed votes `{yaki-da:1, standup:0, tradgarn:3}` sum to 4, matching the "4 vänner har gått med" banner; the user's vote is the 5th. If you change one, change both.
- State is in-memory only.

Target contract (when real): a Plan has an ID, an organiser, members (anonymous allowed), a shortlist, one vote per member, a lifecycle (`open → decided`), a deterministic tie rule, and a shareable URL.

## 7. Design system (`src/app/globals.css`, `src/components/ui`)

- Colours, spacing, type, radii, control height and motion come from CSS variables / `@theme` tokens. No raw hex or px in components.
- Primitives (`Button`, `Chip`, `SelectionCard`, `ProgressBar`, `SectionHeading`, `DatePicker`) are reused, not re-implemented.
- Mobile-first at **390px**; content max-width `--container-width`.
- `Chip` is a controlled toggle and exposes `aria-pressed`; keep that when changing it. Each route renders `PageContainer` exactly once (the `<main id="main-content">` landmark and skip-link target).

## 8. Accessibility baseline

Must hold on every page:
- Skip link → `#main-content`; one `h1` per page; landmarks labelled.
- Every input has a visible or `sr-only` label.
- Dynamic result counts use `role="status" aria-live="polite" aria-atomic="true"`.
- Multi-step flows move focus to the step heading on change.
- Visible focus ring (`--focus-width`, `--focus-offset`); all actions reachable and operable by keyboard.
- Decorative icons `aria-hidden`; meaningful images have Swedish `alt`.
- Motion respects `prefers-reduced-motion`.
- Colour is never the only signal (selected chips also show a check).

## 9. Content & language

- UI strings: Swedish, informal, short. `<html lang="sv">`.
- Code, comments, docs, commits, PRs: English.
- Product promises in copy ("Inga sponsrade placeringar", "Sorterat efter känsla, tid, budget och avstånd") must remain true of the implementation (§3).

## 10. Repo & delivery

- Public repo: no secrets, no `.env`, no private data in fixtures.
- `main` is changed only through reviewed PRs; CI (`typecheck`, `test`, `build`) must be green.
- Third-party assets: record provenance (`public/images/SOURCES.md`). VIP Monkey name/logo are not ours — see `docs/ROADMAP.md` open questions.
