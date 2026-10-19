# Design critique and design-system audit

Date: 2026-10-18. Evidence: `inspect.mjs` (real browser, 1440 / 768 / 390 px) on `/`, `/monkey-match`, `/matches`; `lint.mjs` on `src/`; screenshots of the same pages; a measurement of `src/app/globals.css`. The inspector's house rules are strict on purpose; where a finding is a rule rather than a defect I say so.

## Part 1 — Design critique

### Overall impression
A competent dark prototype with a clear mint accent and good bones (skip link, labels, live regions, focus handling), but it reads as a template: two headlines fight on the first screen, every section is a grid of identical outlined cards, small grey uppercase labels are everywhere, and the three main screens use different card styles. It does not look like a place you would want to go out with friends.

### Usability

| Finding | Severity | Recommendation |
|---|---|---|
| Two discovery systems (home filters, Match flow) with different cards and vocabulary. | 🔴 | One card, one vocabulary; mood is the first control on home (`UX-IA.md` §8). |
| Planning, the core promise, has no labelled entry; reached only from an event or an unlabelled icon. | 🔴 | "Planer" as a labelled primary destination. |
| Home cards had no link to the event (fixed in this branch). | 🔴 (fixed) | Keep the whole card and its title as one link target. |
| Every real event says "Pris ej angivet" (the source publishes no price), so the budget step cannot filter real events and "Fri entré" returns nothing. | 🟡 | Do not promise a price filter on real data; decide per roadmap issue 13. |
| Match results are three cards after a three-step form with a calendar; the last step is a budget that may do nothing. | 🟡 | Shorten to mood + when; budget only when a source supplies prices. |
| The invitee's first screen is a bare form. | 🟡 | A designed join screen: who invited, what, who is in, one field. |
| Event images from the source are arbitrary (portraits, posters, text); fixed crops cut titles ("SER JAG TJOCK UT"). | 🟡 | Design for any image: fixed ratio with a safe crop, or poster-friendly fit. |
| No loading or skeleton state on home (list is empty until the fetch returns). | 🟢 | Skeleton/blank-safe layout. |

### Visual hierarchy
- **What draws the eye first:** the stacked headline pair "Bra kvällar. Ännu bättre minnen." then the hero image with "Staden är vaken. Är du?". Two statements compete; neither is the product.
- **Reading flow:** headline, hero, filters, cards. The hero crowd photo is generic and dark; the first screen is 37% image, the filter bar sits below the fold on laptops.
- **Emphasis:** the mint button is the only strong accent, good. But 74 tiny uppercase tracked labels (inspector) dilute it: they are everywhere and identical in weight.
- **Scale:** the Match page's best moment is the giant "03"; elsewhere type is timid (largest type 4.4–5 vw; strong sites run 8 vw+). Body text is 14 px and 176 blocks are under 13 px (inspector `FAIL`).

### Consistency

| Element | Issue | Recommendation |
|---|---|---|
| Cards | Home cards are dark outlined; Match cards are white inside a dark page; plan cards a third variant; I added a fourth (`plan-list__item`). | One `Card`, one image treatment, variants for context. |
| Surfaces | 70 hairline rules and 69 1-px outlined boxes define everything; the date picker is a white island. | Define surfaces by tone steps; theme the date picker. |
| Labels | 23 eyebrow labels above headings (`FAIL`). | Fold the information into the heading or drop it. |
| Brand | VIP Monkey logo and name in the header of a product called Monkey Match. | Decide the brand (roadmap question 1). |
| Forms | New plan/join forms use raw inputs I wrote; Match uses `SelectionCard`/`Chip`. | An `Input` primitive and form pattern. |

### Accessibility
- **Colour contrast:** brand pairs pass; one real failure, my "Visa event" link was dark on dark (1:1), fixed in this branch. Muted grey on dark (`#B8B8B2` on `#121212`) is fine; small sizes make it hard to read.
- **Touch targets:** controls are 44 px (`--control-height`), good.
- **Text readability:** 14 px body is below the house floor (16 px).
- **Structure:** skip link, one `h1`, labelled regions, `aria-live` counts, focus moved on step change are all present and must survive the redesign.
- **Motion:** only one element moves on load (`still-page`); `prefers-reduced-motion` is honoured.

### What works well
- The mint-on-near-black palette is distinctive and legible.
- Transparent match reasons ("Matchar Dansa", "Inom din budget") are a real product asset.
- The mood vocabulary (Dansa, Livemusik, Skratta, Hänga) is human; keep it.
- Accessibility groundwork is genuinely good; most prototypes have none.
- The vote screen is simple.

### Priority recommendations
1. **Rebuild the first screen around one idea** ("Vad gör vi ikväll?" with real events inside it) and make mood the first control. Removes the double headline and the filter-bar-below-the-fold problem.
2. **One card, one surface language** (tone steps instead of lines, no white islands) across Utforska, Match, Planer and the event page.
3. **Scale up type and fix readability** (16 px body, nothing under 13 px, a display size at 8 vw+) and give the invitee a designed join screen.

## Part 2 — Design-system audit

### Summary
**Tokens:** 81 defined, 0 hard-coded hex outside them, all 98 `font-size` declarations use tokens. **Components:** 6 primitives. **Score: 58 / 100.** The foundation is better than most prototypes; the gaps are semantic naming, missing primitives and a type scale that fails readability.

### Naming consistency

| Issue | Where | Recommendation |
|---|---|---|
| Tokens named after screens, not meaning: `--flow-*` (5), `--results-*` (4), `--hero-*` (2), `--calendar-*`, `--header-height`. | `globals.css` `:root` | Semantic layers: **primitive** (raw), **semantic** (`--surface-1`, `--text-muted`, `--accent`), **component** only when needed. |
| 24 `--color-*` tokens mix brand names and roles (`--color-primary`, `--color-promo`, `--color-selected-surface`, `--color-image-label`). | `:root`, `@theme` | Roles only: ground, surface 1–3, ink, ink-muted, accent, accent-ink, danger, focus. Brand hues stay primitives. |
| Two declaration places for the same palette (`:root` custom properties and Tailwind `@theme static`). | `globals.css` | One source; generate the other. |
| BEM-ish classes (`.voting-card__footer`) plus Tailwind plus one 737-line file with 160 classes. | whole file | Split per component; keep one styling system (decision needed). |

### Token coverage

| Category | Defined | Gaps |
|---|---|---|
| Colour | 24 | No elevation/surface steps, no danger/success/warning, `rgb()` literal in one overlay. |
| Spacing | 9 (`--space-1..16`) | OK; 28 `rem` and 4 `px` literals remain. |
| Typography | 12 sizes, 2 leading, 2 tracking, 4 weights | Body step is 14 px; no display step above 5 vw; one family (Arial). |
| Radius / border / focus | 2 / 1 / 2 | Fine. |
| Shadow / elevation | 0 | Three `box-shadow` uses are hard-coded (inspector `FAIL`); either tokenise as overlay-only or remove. |
| Motion | 2 (`--motion-duration`, `--motion-easing`) | No durations scale, no stagger, no entrance tokens; only one element animates. |
| Breakpoints | 0 tokens, 17 media queries | Define named breakpoints. |

### Component completeness

| Component | States | Variants | Docs | Score |
|---|---|---|---|---|
| Button | ✅ hover, active, disabled, focus | ✅ primary, secondary | ❌ | 7/10 |
| Chip (toggle) | ✅ pressed, disabled | ⚠️ one | ❌ | 6/10 |
| SelectionCard | ✅ checked | ⚠️ checkbox/radio | ❌ | 6/10 |
| ProgressBar | ⚠️ | ❌ | ❌ | 4/10 |
| SectionHeading | n/a | ❌ | ❌ | 4/10 |
| DatePicker | ✅ | ⚠️ range/single | ❌ | 6/10 (white island, bespoke) |
| **Missing primitives** | | | | |
| Card (event / plan / match) | | | | duplicated four times |
| Input, field, form pattern | | | | raw CSS in plan forms |
| Avatar / member list | | | | needed for plans, comments |
| Tag / badge (category, price, source) | | | | ad-hoc spans |
| Icon button | | | | `.icon-button` one-off |
| Sheet / dialog / toast | | | | none; needed for share, errors, reactions |
| Tabs / segmented control | | | | date mode picker is bespoke |
| Skeleton, empty state, error state | | | | partly bespoke |
| Comment thread (2 levels, reactions) | | | | PR3 |
| Language toggle | | | | PR2 |

### Priority actions
1. **Re-layer the tokens** (primitive → semantic) and add the missing scales: surface steps, display type, state colours, motion durations, breakpoints. Delete screen-named tokens.
2. **Build the missing primitives** (Card, Input/Field, Tag, Avatar, IconButton, Sheet/Dialog, Toast, Tabs, Skeleton/Empty/Error) and migrate every screen to them; remove the one-off classes I added for plans.
3. **Document each component** (variants, states, a11y) in the repo and add a component gallery route (`/design`) so both maintainers and agents can see the system.
4. **Decide the styling approach** (Tailwind-first with tokens, or CSS modules per component) and stop growing the single global file.
