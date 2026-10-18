---
name: matching-engine
description: Rules and workflow for changing the Gänget ranking/filtering logic (src/lib/matching.ts, src/lib/discovery.ts, src/lib/dates.ts, src/data/events.ts recurrence). Use whenever a task changes which events are shown, how they are ranked, the reasons text, weights, or time/date handling.
---

# Matching engine changes

Read `docs/CONTRACTS.md` §1–§5 first. The engine is a product promise ("transparent, no sponsored placement"), not just code.

## Non-negotiables
- Stays **pure**: no `Date.now()`, `new Date()` without an argument, `Math.random()`, I/O, or mutation of inputs. Time comes in as `options.now` (ISO with `Z`/offset).
- **Hard filters before ranking.** A filtered-out event can never come back via a high score.
- **No scores leave the engine.** Output is `{ event, reasons }` only.
- **Reasons must be true** and Swedish. Don't emit "Inom din budget" if no budget was set, don't invent urgency.
- **Deterministic**: same inputs in any order ⇒ same output. Keep the tie-break chain (start → distance → price → id).
- Time zone is Europe/Stockholm (use `dates.ts` helpers / existing `Intl.DateTimeFormat` pattern).

## Workflow
1. Write or extend a failing test in `src/lib/matching.test.mjs` (or `dates` / `discovery` / `recurrence`) that states the new behaviour. Use the `fixture(...)` helper pattern already there.
2. Implement in `src/lib/*.ts` with the smallest change. Keep the explanatory doc-comment above `matchEvents` accurate.
3. Run `npm test`; then the `verify` skill.
4. If weights, a factor, a hard filter, a reason string or the date model changed: update `docs/CONTRACTS.md` §3/§4 **and** add a `docs/DECISIONS.md` entry. Weight changes are product decisions — flag them in the PR description for the other maintainer.
5. Check the UI copy that makes promises about ranking (`MatchResults` footnote) still holds.

## Edge cases to consider every time
Overnight events (dated by start), DST weeks (late March / late October), midnight in Stockholm vs UTC, inclusive limits, `budget: null` vs `0`, `distance: 0`, empty moods, duplicate moods, reversed/incomplete ranges, past events when `now` is given, events with bad `time`/`date`/`price`.
