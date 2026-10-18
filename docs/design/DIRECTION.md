# Design direction (proposal)

Status: **decided and built (front door, Match, event page, join/plan screens, design system)**; decisions below are recorded in `docs/DECISIONS.md` D-013 to D-015. Produced with `design-taste-frontend` (`draw.mjs --sector event --have product-ui --options 3`), after `UX-IA.md` and `AUDIT.md`.

## Scope of the skill

`design-taste-frontend` is made for public-facing pages, not app screens. Monkey Match is both, so:
- **Public surfaces** (home/Utforska, Match entry, event page, join screen, footer): composed with the dealt direction.
- **App surfaces** (plan room, forms, date picker, lists, comments): governed by the **design system** (tokens + components), which bakes in the same rules (readable type, tone-step surfaces, no hairlines/shadows at rest, real states).

## What the inventory gave us

Things that belong to this product and to no competitor: the question **"Vad gör vi ikväll?"**; the four moods (Dansa, Livemusik, Skratta, Hänga); the **shared plan** that fills with friends' votes; the **invite link** dropped into a group chat; the transparent **reasons** ("Matchar Dansa", "Ikväll"); real Göteborg venues (Scandinavium, Filmstudion, Park Lane, Pustervik, Trädgår'n); the ticket handed over to the seller; Göteborg itself (trams, the river, the harbour light).

## The three dealt directions

| Id | Idea | Fits? |
|---|---|---|
| `sentence-as-layout` | One short sentence at poster scale is the composition; something from the subject sits inside it where a word would be. | **Best fit.** The sentence is already the product: "Vad gör vi ikväll?". The inline slot can hold a real event. |
| `page-is-the-object` | Build the page as the printed object that exists in the subject's world. | **Right for the plan room**, not the front page: the shared plan *is* a ticket that fills with names and turns into the winner. |
| `place-carries-it` | One full-bleed photograph of where you would stand is the argument. | Weak: we have no photographs of our own, and event images from sources are artist or poster art, not places. Would need found/archival Göteborg pictures. |

## Recommendation

1. **Front door: `sentence-as-layout`.**
   - Idea: *On this page, the question every friend group asks ("Vad gör vi ikväll?") becomes the poster-scale sentence, with tonight's real events playing inside it.*
   - Competitor test: Ticketmaster, Eventbrite, Songkick and VIP Monkey itself lead with a search bar or a hero carousel; none leads with the group's question. It stays true if you swap in another ticket seller.
   - **The one live thing:** the inline picture slot cycles through *tonight's real events* from `/api/events`; picking a mood word (Dansa / Skratta / Livemusik / Hänga) changes the answer; tapping the slot opens that event. Plain fallback without script: the first event of tonight as a static picture and a normal link list.
2. **Plan room: `page-is-the-object`.** The plan is a ticket stub: plan name, the date, members as perforated "seats" that fill as friends join, votes as marks, and on closing the winner prints as the ticket with the seller link. Idea: *the shared plan becomes the ticket.*
3. **App surfaces:** design system, below.

## Design-system direction

- **Tokens, three layers.** Primitive (raw hues, sizes) → semantic (`ground`, `surface-1..3`, `ink`, `ink-muted`, `accent`, `accent-ink`, `danger`, `focus`) → component only when needed. Delete screen-named tokens.
- **Type.** One display step at 8–12 vw for the sentence, a statement step, **16–18 px body**, nothing under 13 px, five sizes at most. One family unless the brand decision says otherwise.
- **Surfaces.** Separate by one tone step; no hairlines, no outlined boxes, no shadows at rest (only on sheets, menus, dialogs), no gradients except a neutral scrim over photos.
- **Shape.** Decide once: square corners or fully round controls (top studied sites: 52% square, 23% pill); the current 12 px "soft" radius is the weak-site default.
- **Motion.** Entrance per part of each section, press/hover feedback on every control, one moving picture, `prefers-reduced-motion` honoured; transform and opacity only.
- **Imagery.** Event images come from sources and are arbitrary: one fixed ratio with a safe crop; our own pictures are limited to found, credited archival/real Göteborg images and drawn graphics, never presented as an event.
- **Components to add** (full list in `AUDIT.md`): Card, Field/Input, Tag, Avatar, IconButton, Sheet/Dialog, Toast, Tabs, Skeleton/Empty/Error, language toggle, comment thread.
- **Documentation.** One page per component in `docs/design/components/` and a living gallery route `/design`.

## Decisions needed (from Eralp, with Betül)

1. **Brand.** Keep the VIP Monkey look (logo, mint `#00EBB0`, Arial) or give Monkey Match its own identity? Drives palette, type and the header. (Roadmap open question 1.)
2. **Direction.** Approve `sentence-as-layout` for the front door and the ticket object for the plan room, or pick another.
3. **IA.** Mood-first home with Match as the guided version (proposal), or keep today's separate Match mode.
4. **Scope of the redesign PR.** Design system + front door + Match + event first (proposal); plan room and comments next.
5. **Audience** assumption: Swedish-speaking friend groups, with English-speaking visitors as a real second audience (drives how early the English version ships).

## Next steps after the decisions

1. Deal the full direction sheet, find real pictures of Göteborg (`assets.mjs`) and write the copy deck.
2. Build tokens + primitives + `/design` gallery.
3. Rebuild the front door, Match, event page, join screen; then the plan room.
4. Run `lint.mjs` and `inspect.mjs` to zero `FAIL`, look at the screenshots, three critique rounds.
5. i18n (next-intl) lands on top of the new components so strings are extracted once.
