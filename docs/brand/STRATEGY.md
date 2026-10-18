# Brand strategy (proposal)

Status: **proposal, awaiting decisions** (name, palette, mark; see the end). Method: `brand-strategist` (positioning, identity, messaging, governance) and `brand` (voice, visual identity, guidelines). Written 2026-10-18.

The product is **independent of VIP Monkey**. Everything that identifies VIP Monkey (name, logo, wordmark, mint `#00EBB0`-on-black look, monkey mascot) leaves the product.

## Assumptions (to validate; not research)

- **Audience:** friend groups in Göteborg, roughly 20 to 35, who go out together and decide in a group chat; English-speaking residents and visitors are a real second audience.
- **Category frame:** a *decision* tool for going out, sitting between a ticket seller and a group chat. Not a ticket seller, not a social network.
- **Business objective:** launch a new independent brand.
- **Competitive set** (from general knowledge, partly from sources; verify): ticket sellers (Ticketmaster, Eventbrite, Fever), gig and club guides (Songkick, Resident Advisor, goteborg.com), where friends coordinate today (Facebook/Instagram events, WhatsApp/iMessage group chats and polls), and the closest in spirit, Partiful (casual, personality-led planning with friends; [CNBC via NBC](https://www.nbcnewyork.com/news/business/money-report/meet-partiful-the-gen-z-party-planning-staple-thats-taking-on-apple/6231135/)). Eventbrite sells admission to public events ([overview](https://kristenberman.substack.com/p/3-ways-partiful-is-beating-eventbrite)).

## Positioning

```
For friend groups in Göteborg
Who can never decide what to do tonight
[Name] is the plan-together app for going out
That turns real events into one decision, with everyone's vote, in minutes
Unlike ticket sites (built to sell) and group chats (built to talk)
We are built to decide, and we send you to the seller for tickets
```

**Only-we test.** A ticket seller cannot say "we are built to decide" without a conflict of interest (they want a sale of *their* event). A group chat cannot say "real events, ranked with reasons". Partiful plans parties you host, not nights out chosen among public events. The claim holds.

**Proof points:** matches show their reasons ("Matchar Dansa", "Ikväll") with no scores and no sponsored placement; invitees vote as guests with no sign-up; every plan ends in a seller link, not a checkout we own; events are the real ones from the sources (Ticketmaster today).

## Brand values (and what they forbid)

| Value | Means | Forbids |
|---|---|---|
| **Decide** | One answer, fast. | Endless feeds, "explore more" loops. |
| **Honest** | Show why; show what we don't know ("Pris ej angivet"). | Hidden ranking, fake urgency, invented prices. |
| **Together** | The group is the user; the invitee is a first-class user. | Sign-up walls, features that only the organizer sees. |
| **Local** | Göteborg, in Swedish first. | Generic "cities worldwide" language. |

## Name

Open decision. "Monkey Match" borrows VIP Monkey's mascot word and should go with the rest of their identity. Candidates (the domain check is only a rough signal: a registered `.se` or `.com` means someone holds it; "no site found" does not mean free; **a trademark search at PRV/EUIPO is required before committing**):

| Name | Meaning | For | Against | Domains seen |
|---|---|---|---|---|
| **Gänget** | "the gang / the crew" | Warm, one word, names the *user* (the group). Fits "Vad gör gänget ikväll?" and the ticket-seats idea. | `ä` is hard for non-Swedes. | `.se` held, `.com`/`.app` no site found |
| **Kvällsplan** | "evening plan" | Says what it is; easy to say. | Descriptive, weaker to own. | none found |
| **Ikväll** | "tonight" | The product's exact moment and the front-door sentence. | Generic; hard to protect; fits any listings site. | `.se`, `.com` held |
| **Keep "Monkey Match"** | | Zero rename cost. | Ties the product to VIP Monkey's mascot. | n/a |

Recommendation: **Gänget**, pending trademark and domain checks; fallback Kvällsplan.

## Identity direction

### Visual

Principle: it should feel like a **paper ticket handed over at the door**, not a nightclub. That gives the plan-room idea (the plan is a ticket) a home and separates us from the dark-and-neon look of nightlife listings (and from VIP Monkey's own).

- **Palette, one ground, one ink, one accent** (final values come from the dealt direction sheet; proposal):
  - **A. Paper & signal (recommended):** cool off-white ground, near-black ink, one signal vermilion accent; a full ink-black field for night sections. Readable in daylight on a phone, which is where plans are made.
  - **B. Tram blue:** saturated blue ground with white ink and one warm accent; ties to Göteborg's trams. Strong, but blue fields tire quickly at length.
  - **C. Night:** dark ground with one acid accent. Closest to what exists in the category (and to the old look).
- **Type:** a Swedish-designed grotesque (candidates on Google Fonts: Familjen Grotesk, Schibsted Grotesk) used large and tight for the poster sentence; one family, two weights. Body 16 to 18 px.
- **Mark:** a wordmark with a **ticket notch**: a semicircle cut into the edge, reused as the favicon, the plan "seat" and the avatar shape. No mascot, no monkey.
- **Shape:** one decision, square corners (ticket stock) or fully round controls; not soft 12 px.
- **Imagery:** real event images from sources as-is; our own graphics are drawn from the ticket motif; found, credited archival images of Göteborg where a place picture is needed. Never a stock nightclub crowd.

### Verbal

- **Voice:** informal Swedish (du), short, warm, a little dry. Direct questions. Never hype ("Epic!"), never nanny.
- **Tone by context:** discovery playful and brief; plan room calm and clear; errors plain and kind; legal formal.
- **Examples:** "Vad gör vi ikväll?" · "Skicka länken. Alla röstar. Vi hittar svaret." · "Lika många röster. Du bestämmer." · "Pris ej angivet" (never "Gratis?!").
- **English** is a full voice, not a translation: same dryness, same brevity (written in PR2).

### Messaging

- **Master line:** the sentence itself, "Vad gör vi ikväll?" / "What are we doing tonight?"
- **Pillars (two proofs each):**
  1. *Real nights, not ads.* Real listings from the sellers; matches explain themselves; no sponsored placement.
  2. *Decide together.* One link, guests vote with no sign-up; the organizer closes; ties are broken by a person.
  3. *Then go.* We hand you to the seller for the ticket; nothing hidden between decision and door.

## Architecture

Single product brand (Branded House). If more cities or products come, endorse them from the master brand.

## Governance

- `docs/brand/GUIDELINES.md` (after decisions) is the source of truth; tokens are generated from it into the design system.
- Brand changes go through `docs/DECISIONS.md`.
- Measurement later (needs data): unaided recall among Göteborg 20 to 35s, plan completion rate, invitee conversion, share of plans that end in a ticket click.

## Decisions needed

1. **Name:** Gänget (recommended), Kvällsplan, Ikväll, or keep Monkey Match.
2. **Palette:** A paper & signal (recommended), B tram blue, C night.
3. **Mark:** ticket-notch wordmark (recommended), wordmark only, or a new character.

Then: write `docs/brand/GUIDELINES.md`, deal the full direction sheet with the new palette and type, generate tokens, and start the design-system build.
