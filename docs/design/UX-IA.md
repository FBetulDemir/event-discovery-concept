# UX / IA reset

Output of the `ux-ia-reset` pass (2026-10-18). Written from the code, the live app and the decisions in `docs/DECISIONS.md`. **Audience and jobs are working assumptions, not research**; validate them (see "To validate").

## 1. The product in one sentence

Friends in Göteborg who want a night out but have not decided *what*: find a real event, agree on it together, buy the ticket at the seller.

## 2. Who, and what they are trying to do

| Role | Who | Moment | Job |
|---|---|---|---|
| **Organizer** | The friend who always ends up picking. | Thursday, nothing planned, the group chat is stalling. | "Get us a decision without a 40-message thread." |
| **Follower** | Friend who got a link. May never open the site again. | Taps a link in the chat. | "Say what I want in two taps, no sign-up." |
| **Spontaneous solo** | Alone or already out. | Tonight, 6 pm. | "What is on tonight near me, that fits my mood?" |
| **Visitor** *(hypothesis)* | International student, tourist. | Any time. | The same, in English. |

The one sentence they all share is **"Vad gör vi ikväll?"** (what are we doing tonight?). It is the product's idea and its first screen.

## 3. Mental model

People do not think "event catalogue". They think in three questions, in this order:

1. **What is on?** (tonight, this weekend, near me)
2. **What fits us?** (mood, budget, distance; "something with dancing")
3. **What did we decide?** (the plan, the votes, the ticket)

Today the app answers them with two competing discovery systems (home filters and the Match flow) and hides the third behind a small icon. The reset makes the three questions the structure.

## 4. Surfaces

### Primary (one tap, always reachable)

| Surface | Answers | Route |
|---|---|---|
| **Ikväll / Utforska** | What is on? Home: tonight first, then the next days; mood as the primary control, text/date/category filters as secondary. | `/` |
| **Match** | What fits us? Mood, when, budget → three explained picks. | `/match` (today `/monkey-match` + `/matches`) |
| **Planer** | What did we decide? Your plans, state, who has voted. | `/plan` |

Navigation: bottom bar on mobile (Utforska · Match · Planer), same three in the header on desktop. Plus language toggle (sv/en) and account/guest chip at the right.

### Secondary (one step deeper, in context)

- **Event** `/events/[id]`: facts, why it matched, **Planera med vänner**, **Biljetter hos säljaren**.
- **New plan** `/plan/new?event=`: name, your name, or add to an open plan.
- **Plan room** `/plan/[code]`: members, invite link, shortlist, live votes, organizer closes, winner + ticket link. *(PR3: the comment thread lives here.)*
- **Join preview** (invitee's first screen): who invited you, what it is, one name field, vote.

### Hidden / rare

- Language, account (sign in, upgrade a guest), sign out.
- Data sources and credits ("Evenemang från Ticketmaster"), the independent-concept notice, privacy.
- Friends list, notifications *(PR3, later)*.

## 5. First run

There is **no onboarding**. The first screen is "tonight" with real events. Accounts are never asked for up front: a guest session starts only when someone acts (create, join, vote). The first value moment must arrive in under 10 seconds: a real event for tonight on the first screen.

## 6. Core flows

**A. Organizer, browse-first:** Utforska → event → *Planera med vänner* → name the plan → invite link → copy/share → watch votes → close → tie? choose → *Biljetter*.

**B. Organizer, mood-first:** Match (3 steps, skippable) → three picks with reasons → *Planera* on one or add several → same as A from invite.

**C. Follower:** link → join preview (who, what) → name → shortlist with votes → vote → "Tack, du ser resultatet när arrangören stänger" → (later) result notification. Target: under 30 seconds, zero sign-up.

**D. Spontaneous solo:** Utforska → mood chip → event → *Biljetter*. No plan needed; plan is optional.

**E. Later (PR3):** account → friends → comment thread on a plan and public comments on an event, reactions.

## 7. Navigation hierarchy

```
Utforska (/)  ──► Event ──► Ny plan ──► Plan room ──► Winner + ticket link
   │                  ▲
Match (/match) ───────┘
Planer (/plan) ───────────────────────► Plan room
[sv | en]   [guest / account]   Footer: sources, concept notice, privacy
```

## 8. Findings that change the structure

1. **Two discovery systems.** Home has filters; Monkey Match has its own flow with its own results page. Same job, two vocabularies, two card designs. → Mood becomes the first control on home; Match remains for the guided, explained version, using the **same card**.
2. **Plans are buried.** Planning, the product's promise, is reached only from an event page or an unlabelled icon. → "Planer" is a labelled primary destination.
3. **The brand is another company's.** The header shows VIP Monkey while the product is Monkey Match. Open question 1 in `docs/ROADMAP.md`.
4. **Real data has no price**, so budget cannot filter real events (roadmap issue 13). The IA must not promise a price filter it cannot honour.
5. **The invitee is the weakest-designed user** and the most important: the join screen decides whether a group converts.

## 9. Anti-regression (keep these true after the redesign)

- Three questions, three primary destinations; no fourth top-level item without a decision entry.
- First screen shows real events; no sign-in wall; a guest can finish *join → vote* without an account.
- Matching stays transparent: every pick shows its reasons; no scores, no sponsored placement (`docs/CONTRACTS.md` §3).
- Plans and votes behave per `docs/CONTRACTS.md` §6 (organizer closes; ties are broken explicitly).
- Tickets are bought at the seller; we link out with the seller's URL and never claim to sell.
- Unknown price is shown as unknown (`Pris ej angivet`), never hidden or guessed.
- Accessibility baseline (`docs/CONTRACTS.md` §8) holds on every new screen.
- Mobile first at 390 px; every flow works one-handed.

## 10. To validate (before more building)

- Do friend groups really start from "what are we doing tonight" or from "which night"? Talk to five people.
- How many follower taps does it take today, and where do they drop?
- Is the international audience real (drives how early the English version matters)?
- Do people want a mood-first home, or do they just want a chronological list?
