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
- The prototype uses fixed sample dates and Göteborg as its location; no geolocation is requested.
