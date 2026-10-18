# Architecture

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 + token-driven hand-written CSS · lucide-react icons. Deployed on Vercel. No backend.

## Routes

| Route | File | Rendering | Purpose |
|---|---|---|---|
| `/` | `src/app/page.tsx` | static shell, client `EventDiscovery` | Hero, filters, event grid, `MatchPromo` |
| `/monkey-match` | `src/app/monkey-match/page.tsx` | static shell, client `PreferenceFlow` | 3-step preference flow |
| `/matches` | `src/app/matches/page.tsx` | static shell, client `MatchResults` | Top-3 ranked matches + reasons |
| `/events/[id]` | `src/app/events/[id]/page.tsx` | `force-dynamic` (server) | Event detail; computes next occurrence at request time |
| `/plan` | `src/app/plan/page.tsx` | static shell, client `PlanExperience` | Shared shortlist + voting (`?event=<id>` adds to shortlist) |
| `/plan/result` | `src/app/plan/result/page.tsx` | static shell, client `ResultExperience` | Winner + ticket CTA |

Pages are thin; behaviour lives in components and `src/lib`.

## Layers

```
types/        Event, Preferences, DateSelection, Mood, EventCategory
data/         events.ts (templates + getEvents(now)), match-options.ts (defaults)
lib/          matching.ts · dates.ts · discovery.ts   (pure, tested)
              useEvents.ts                             (client hook around getEvents)
components/   feature folders; ui/ = primitives (Button, Chip, DatePicker, …)
app/          routes, layout (providers + header/nav), globals.css
```

Dependency direction: `app → components → lib/data → types`. `lib` must not import from `components` or `app`. `lib` is framework-free so it can move to a server/edge function later.

## Data flow

```
data/events.ts  eventTemplates (fixed weekday-anchored dates)
      │  getEvents(now)  → next occurrence in Europe/Stockholm; ID stable
      ▼
useEvents()     [] on server/first render → fills after mount; refreshes every 30 s and on window focus
      │
      ├─► lib/discovery.filterEvents  → EventDiscovery (home)
      └─► lib/matching.matchEvents(events, preferences, { now }) → MatchResults (/matches, first 3)
```

`/events/[id]` calls `getEvents()` on the server per request (`force-dynamic`) so the displayed date is always the next occurrence.

## State

All client state is in-memory React context, mounted in `src/app/layout.tsx`:

| Provider | Holds | Persistence |
|---|---|---|
| `PreferencesProvider` | `preferences`, `completed`, `resetPreferences()` | none — reload resets (intentional for now) |
| `ShortlistProvider` | `shortlist` (event IDs), `votes` (id → count), `myVote` | none — seeded with 3 events and fixed votes for the demo |

There is no server state, no cookies, no storage, no network calls. Anything "shared with friends" is simulated.

## Matching engine (`src/lib/matching.ts`)

`matchEvents(events, preferences, { now })` → `Recommendation[]` (`{ event, reasons }`), sorted. Steps: validate preferences → hard filters (available, city, budget, distance, valid date/time, not started, date mode) → score (mood 60, time 20, budget 10, distance 10) → deterministic tie-break → strip scores. Full rules in `docs/CONTRACTS.md` §3.

## Styling

- `src/app/globals.css` (~700 lines): CSS custom properties for colour/space/type/radius/motion, a Tailwind `@theme static` block for brand colours, then `@layer components` with hand-written BEM-ish classes.
- Components use those class names; very little inline Tailwind. Keep it that way for consistency.
- Brand: dark UI, primary mint `#00EBB0`, secondary orange `#FFA65E`, pink accent `#E86987`, Arial/Helvetica.

## Testing

`node:test` against pure logic only (`src/lib/*.test.mjs`, 31 tests). They import `.ts` directly (Node ≥ 22.18). There are no component, e2e or visual tests yet.

## CI / deploy

GitHub Actions (`.github/workflows/ci.yml`): typecheck, test, build on PRs and `main`. The live prototype (see README) is hosted on Vercel; confirm the Vercel project settings with the repo owner.

## Where to put new things

| Adding… | Put it in… |
|---|---|
| A new rule that decides/ranks/filters | `src/lib/<name>.ts` + `<name>.test.mjs` |
| A new domain type | `src/types/` |
| A new screen | `src/app/<route>/page.tsx` + `src/components/<feature>/` (see `new-screen` skill) |
| A reusable primitive | `src/components/ui/` |
| New seed events | `src/data/events.ts` (fictional only) |
| A cross-cutting client state | a provider in `src/components/<feature>/`, mounted in `layout.tsx` |
| Server logic / API (future) | `src/app/api/…` route handlers calling `src/lib` — needs a `docs/DECISIONS.md` entry first |
