# Gänget brand guidelines

Source of truth for the look and voice of Gänget. Tokens in `src/styles/tokens.css` implement this file; if they disagree, fix them to match this file (or change this file with a `docs/DECISIONS.md` entry). Strategy and reasoning: `STRATEGY.md`.

Gänget is an independent product. It carries nothing that belongs to VIP Monkey.

## Name

**Gänget** (Swedish, "the gang / the crew"). Written with a capital G and the umlaut, in running text and in the wordmark. In the URL and where `ä` is unavailable: `ganget`. Never "Gänget App", never all caps in text (the display face sets caps by itself).

Open before launch: trademark search (PRV, EUIPO) and a domain.

## Mark

A **wordmark with a ticket notch**: GÄNGET set in the display face, with a half-circle cut into the left edge of a plain block behind or beside it, like the perforation on a ticket stub. The notch is the brand's one graphic idea and is reused:

| Use | How |
|---|---|
| Favicon / app icon | The notch block alone: a square with a semicircle bitten out of the left edge, in the accent. |
| Plan "seats" | Members are notches along the edge of the plan ticket. |
| Avatar shape | Square with one notched corner side. |
| Tag / ticket surfaces | `--notch` radius cut from the left and right edges of the paper. |

Rules: clear space equal to the cap height on all sides; minimum 20 px tall on screen; ink on ground, accent for the notch block only; never rotate, outline, shadow or add a gradient; never place it on a photograph without a neutral scrim.

## Colour

One ground, one ink, one accent. **Dark is the default theme**; a light theme exists and uses the same roles. The accent is used on the primary action and at most one other thing per screen. Surfaces are separated by a tone step, never by a line or a shadow.

### Roles

| Role | Dark (default) | Light | Notes |
|---|---|---|---|
| `bg` (ground) | `#0F1317` | `#F2F4F5` | Page. |
| `surface-1` | `#161B21` | `#E8EBED` | Cards, inputs. |
| `surface-2` | `#1E252C` | `#DDE1E4` | Raised, selected. |
| `surface-3` | `#28313A` | `#CFD5D9` | Hover, pressed. |
| `ink` | `#F2F4F5` | `#0F1317` | Running text. 16.9:1 on `bg` in both. |
| `ink-muted` | `#A3ADB6` | `#56606A` | Secondary text. 8.2:1 dark, 5.8:1 light. |
| `ink-subtle` | `#7B8590` | `#7A858F` | **Decorative or 18 px+ only.** Fails 4.5:1 on `surface-2` (dark) and on all light surfaces. |
| `accent` | `#FF4A1F` | `#FF4A1F` | Fills (buttons, notch). |
| `accent-ink` | `#0F1317` | `#0F1317` | Text on accent, 5.6:1. |
| `accent-text` | `#FF4A1F` | `#C2310A` | Accent as text: 5.6:1 on dark `bg`, 5.1:1 on light `bg`. |
| `paper` / `paper-ink` | `#F2F4F5` / `#0F1317` | `#FFFFFF` / `#0F1317` | The ticket: **stays light in both themes**. |
| `danger` | `#FF6B6B` | `#C62828` | Errors only; functional, not decorative. |
| `success` | `#4CC38A` | `#1B7F4B` | Confirmations only. |
| `warning` | `#F2C14E` | `#8A5A00` | Warnings only. |
| `focus` | `#FF4A1F` | `#C2310A` | 2 px ring, 3 px offset. |

Proportions on a typical screen: ground about 60%, ink text and tone-step surfaces about 30%, accent under 10%. A section may flip to a full `paper` field (the ticket moments) or to an accent field; nothing fades into anything.

## Typography

Dealt for this brand (see `docs/design/DIRECTION.md`): **Anton** for display, **Work Sans** for text. Both from Google Fonts via `next/font` (self-hosted at build).

| Step | Use | Size | Face |
|---|---|---|---|
| `display` | The hero sentence | `clamp(4rem, 2rem + 11vw, 11rem)`, leading 1.12 | Anton, uppercase, tracking -0.01em |
| `head` | Section headings | `clamp(2.5rem, 1.2rem + 5vw, 5.5rem)`, leading 1.12 | Anton, uppercase |
| `lead` | Statements, card titles | `clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem)` | Work Sans 600 or Anton |
| `body` | Running text | `clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem)`, leading 1.5 | Work Sans 400 |
| `small` | Meta, captions | `clamp(0.8125rem, 0.79rem + 0.1vw, 0.875rem)` | Work Sans 400/600 |

Rules: five sizes, nothing under 13 px, body 16 px or more, left-aligned, headings at most two lines at every width, no small uppercase letter-spaced labels, no monospace, no numbered labels. Diacritics (Å Ä Ö) collide with the line above below leading 1.0 on caps, so display and heading leading is 1.12.

## Shape and surface

Square corners everywhere (ticket stock). One button shape. No hairline rules, no 1 px outlined boxes, no shadows on things at rest (only on overlays), no gradients except a neutral scrim over a photograph. Separate with space, a tone step, or scale.

## Imagery

- **Event images** come from the sources as they are. One fixed ratio (4:5 on cards, 16:9 on detail) with `object-fit: cover`; a poster that loses its text in the crop is shown at its natural ratio on the detail page.
- **City atmosphere** (hero sections, how-it-works panels): real photographs of Göteborg-like night scenes, credited in `public/images/SOURCES.md` and on the page footer. They show the place, never a specific event or venue.
- **Never** a stock nightclub crowd, a mascot, or a picture presented as an event it is not.
- One treatment per set; photos are not tinted or filtered decoratively.

## Voice

Informal Swedish (du), short, warm, a little dry. Direct questions. English is a full voice with the same brevity and dryness (written in the i18n step), never a literal translation.

| Context | Tone |
|---|---|
| Discovery | Playful, brief: "Vad gör vi ikväll?" |
| Plan | Calm, clear: "Skicka länken. Alla röstar." |
| Errors | Plain and kind: "Det gick inte att spara. Försök igen." |
| Ties | Respectful of the organizer: "Lika många röster. Du bestämmer." |
| Legal | Formal, plain. |

Avoid: hype ("Epic!"), filler ("seamless", "unlock"), "snälla" in buttons, exclamation marks on system copy, claims we cannot prove ("bästa kvällen"). Always say when we don't know ("Pris ej angivet").

Buttons: verb first, one to three words, no terminal punctuation: "Hitta kvällen", "Skapa plan", "Rösta", "Köp biljetter".

## Motion

Moves are short and purposeful; only `transform` and `opacity`. Tokens in `tokens.css`: 120 ms feedback, 240 ms state, 600 ms entrance, 1.1 s for the one signature move (image shutter). Entrances: heading, then text, then picture, staggered 60 to 90 ms, once. `prefers-reduced-motion` keeps content and drops travel. Never hide content when JavaScript fails.

## Do and don't

| Do | Don't |
|---|---|
| Lead each screen with one big thing. | Fill space with another label, card or icon. |
| Show reasons and unknowns. | Hide missing data or invent it. |
| Let ink carry the emphasis. | Colour or italicise a word in a headline. |
| Hand tickets to the seller. | Imply we sell tickets. |
| Use the notch as the one motif. | Add decorative shapes, blobs or emoji. |

## Governance

- This file and `src/styles/tokens.css` change together, in one PR, with a `docs/DECISIONS.md` entry.
- New components follow `docs/design/components/` and appear in the `/design` gallery.
- Anything that looks like another company's brand is rejected in review.
