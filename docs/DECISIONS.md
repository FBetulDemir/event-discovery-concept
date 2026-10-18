# Decisions

Append-only log. Newest at the bottom. One entry per decision that someone would otherwise have to rediscover. Status: `accepted` · `superseded by D-nnn` · `proposed`.

Template:

```
## D-nnn — Title
- Date: YYYY-MM-DD · Status: accepted · Deciders: names
- Context: what forced the choice
- Decision: what we do
- Consequences: what gets easier/harder; what to revisit and when
```

---

## D-001 — Matching is a pure, explainable function
- Date: 2026-09 (recorded 2026-10-17) · Status: accepted · Deciders: original author
- Context: The pitch of Monkey Match is trust — "why am I seeing this?"
- Decision: `matchEvents` is pure (clock injected), filters hard constraints before ranking, uses fixed documented weights, exposes reasons not scores, breaks ties deterministically.
- Consequences: Easy to test and to move server-side. Any personalisation or paid placement must be an explicit new decision, because it breaks the "no sponsored placements" promise shown in the UI.

## D-002 — Europe/Stockholm is the only time zone
- Date: 2026-09 (recorded 2026-10-17) · Status: accepted · Deciders: original author
- Context: One city (Göteborg); events are local-time; users may travel or have wrong device zones.
- Decision: All "today/now/start" logic is computed in Europe/Stockholm. Dates and times are plain strings.
- Consequences: Simple and DST-correct for Sweden. Multi-country support (Phase 2) requires a per-event/per-city zone.

## D-003 — Prototype state is in-memory and simulated
- Date: 2026-09 (recorded 2026-10-17) · Status: accepted for the prototype; **to be superseded in Phase 1** · Deciders: original author
- Context: The concept needed to demonstrate the group-vote flow without infrastructure.
- Decision: Preferences, shortlist and votes live in React context; friends and seed votes are fabricated.
- Consequences: Great demo, not a product. Replaced when the backend decision is made.

## D-004 — Swedish UI, English code and docs
- Date: 2026-10-17 · Status: accepted · Deciders: maintainers (proposed in handoff PR)
- Context: Swedish audience; two maintainers and several AI agents collaborating.
- Decision: User-facing strings in Swedish; everything else in English.
- Consequences: i18n (sv/en) is deferred to Phase 4; strings are currently inline in components.

## D-005 — Two-maintainer workflow: branches + PRs, CI gate, agent docs as source of truth
- Date: 2026-10-17 · Status: proposed (merged with the handoff PR) · Deciders: maintainers
- Context: The project is public and will be developed in parallel by two people using AI agents.
- Decision: No direct pushes to `main`; PR per change; the other maintainer reviews; CI (`typecheck`, `test`, `build`) must pass; `AGENTS.md` + `docs/` are kept current as part of each PR; `docs/STATUS.md` carries session-to-session handoff.
- Consequences: Slightly slower than pushing to `main`, much less merge confusion. Branch protection settings on GitHub should mirror this (owner action).
