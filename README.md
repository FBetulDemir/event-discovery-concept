# VIP Monkey discovery prototype

Next.js App Router, React, TypeScript, Tailwind CSS v4, and Lucide React.
Requires Node.js 20.9 or newer.

## Development

```sh
npm ci
npm run dev
```

Open http://localhost:3000.

## Validation

```sh
npm run build
npm run typecheck
```

## Foundation

- `src/app/globals.css`: brand colors, typography, spacing, responsive container, control states, and accessibility styles. Brand tokens are also available as Tailwind utilities such as `bg-primary` and `text-muted`.
- `Button`: native button with primary/secondary variants, defaults to `type="button"`, supports disabled state and native props.
- `Chip`: controlled selection button with `selected` and `aria-pressed`. Manage its state in a consuming client component.
- `PageContainer`: render once per route; provides the main landmark, responsive gutters, maximum width, and the skip-link target.
- `SectionHeading`: title, optional eyebrow and trailing content; defaults to `h2`, with `h1` and `h3` supported for semantic heading order.

Use Lucide icons as named imports. Decorative icons should have `aria-hidden="true"`; icon-only controls need an accessible name.

The app uses a local system font stack with no font downloads. Controls have a minimum 44px height, visible keyboard focus, disabled states, and reduced-motion support.

The discovery page includes local event imagery, six fictional listings, live search, category/date/free-entry filters, expandable event descriptions, and a Monkey Match promotion. `/monkey-match` provides a three-step preference flow. `/matches` currently shows a selection summary; ranked results and planning are not implemented. No backend, authentication, or database.

## Discovery checks

Run the filter behavior tests with Node.js 22.6 or newer:

```sh
node --experimental-strip-types --test src/lib/discovery.test.mjs
```

Images are downloaded illustrative Unsplash photos. Source URLs are listed in public/images/SOURCES.md. Listings are fictional, distances are from central Göteborg, and imagery does not depict the named venues.

## Monkey Match preferences

- Three steps: date/location/distance, moods, and ticket budget per person.
- Reusable native radio and checkbox selection cards support keyboard navigation and visible selected/focus states.
- Progress, back/continue, optional skips, and a final review are included.
- React context preserves selections between steps and client-side routes, including returning from /matches to edit. A full page reload resets this in-memory prototype session.
- Skipping mood clears mood preferences; skipping budget selects no price limit. Zero means free entry and is distinct from no limit.
- The calendar supports any future date, date ranges, and flexible dates, using today in the Europe/Stockholm timezone. The event catalogue remains fictional and currently covers 25–26 September 2026. Göteborg is fixed; no geolocation is requested.

## Flexible calendar

- Single day, inclusive date range, or any date; shortcuts for today, tomorrow, and the remaining Friday–Sunday weekend.
- Month arrows, past-day prevention, today outline, mint selected days, and a live selection summary.
- Keyboard: arrow keys move by day/week; Home/End move within the week; Page Up/Down change month; Shift + Page Up/Down change year; Enter/Space select.
- Unfinished ranges disable Continue until an end date is selected. Reversed endpoints are sorted. Selections remain in the shared React draft.
- Calendar tests: node --experimental-strip-types --test src/lib/dates.test.mjs

## Transparent event matching

`src/lib/matching.ts` exports `filterCompatibleEvents(events, preferences, options?)` and `matchEvents(events, preferences, options?)`. Both are pure and independent of React. No inputs are mutated and no system clock is read.

```ts
const recommendations = matchEvents(events, preferences, {
  now: '2026-09-25T15:00:00Z',
});
// [{ event, reasons: ['Matchar Dansa', 'Inom din budget', '1,8 km bort', 'Ikväll'] }]
const topThree = recommendations.slice(0, 3);
```

Compatibility requires availability, matching city, valid date/time/price/distance, an inclusive selected date or date range, and prices/distances within the user's limits. Incomplete ranges return no results. A null budget is unlimited; zero means free entry only. With an explicit `now`, already-started events are excluded, including overnight events whose start has passed. Relative labels use Europe/Stockholm. Without `now`, no past-event filtering or today/tonight claims are made. Invalid reference timestamps throw a RangeError.

Ranking uses documented internal weights: mood/category relevance 60, earlier start time 20, budget headroom 10, proximity 10. Category-inferred and explicit mood matches are deduplicated. Skipped mood/budget preferences are neutral. Earlier starts are a discovery default, not an inferred preference for a particular hour. Ties resolve by date/time, distance, price, then event ID. Scores are not returned and are not confidence percentages. Every compatible result is returned so the caller can choose how many to show.

```sh
node --experimental-strip-types --test src/lib/matching.test.mjs
```

This step adds the matching engine only. The `/matches` route remains a selection summary until the results UI step.