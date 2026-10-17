# Product

## One-liner

Help people who know *what kind of night they want* but not *which event to pick* — and help a group agree on it — before they buy tickets.

## The problem

1. **"What should we do?"** Event lists are organised by what exists, not by what you feel like. People who want "dancing, under 200 kr, close by" have to scan and filter manually.
2. **"Which one should we choose?"** The decision is made in a group chat, away from the ticket page. It stalls, and the sale is lost or delayed.

## The idea

| Step | User question | Surface |
|---|---|---|
| Discover | "What's on?" | Home: visible filters (search, category, date, free entry) |
| Match | "What fits me?" | Monkey Match: location, date, distance, mood, budget → 3 transparent matches |
| Decide together | "Which one?" | Plan with Friends: shared shortlist → invite → vote → winner |
| Get tickets | "Let's go." | Winner → ticket purchase (not built) |

## Principles

- **Transparent, not magical.** Show *why* something matched (`reasons`), never a hidden score. No sponsored placement. If we ever monetise ranking, it must be labelled and is a product decision (`docs/DECISIONS.md`).
- **Fewer, better.** Monkey Match returns a short list (3), not a feed.
- **Decision, then ticket.** The group-decision step exists to shorten the path to a purchase.
- **Mobile first.** Designed at 390px; scales up.
- **Accessible by default.** Keyboard, screen reader, reduced motion.
- **Swedish UI.** Göteborg first.

## Users (working assumption — validate)

- **The organiser:** the friend who always ends up picking the night out; wants an answer fast and a way to get the group to commit.
- **The follower:** wants to vote in two taps without creating an account.

## Non-goals (for now)

Event creation by organisers, social feed, chat, payments inside this app (hand off to the ticket provider), recommendations based on personal history.

## Success measures (proposed — not instrumented yet)

- Match flow completion rate (start → results).
- Match → shortlist add rate.
- Plans created that reach a winner; median time to winner.
- Winner → ticket click-through.

## Current state

Front-end prototype with fictional seed data. See `docs/STATUS.md` and `docs/ROADMAP.md`.
