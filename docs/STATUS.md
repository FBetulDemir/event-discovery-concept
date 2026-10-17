# Status

Living handoff note. **Update it at the end of any session that leaves work open** (the `handoff` skill does this). Keep it short; history lives in git.

_Last updated: 2026-10-17 by Eralp (with Claude) — handoff setup PR._

## Now

- Repo prepared for two-person, agent-assisted development: `AGENTS.md`, `CLAUDE.md`, `docs/*`, CI, PR template, project skills.
- App behaviour is **unchanged** from the prototype (verified: `typecheck` clean, 31/31 tests, `next build` OK on Node 24).

## In flight

| Branch / PR | Owner | What | State |
|---|---|---|---|
| `chore/agent-handoff-foundation` | Eralp | This setup PR | Awaiting review |

## Next up (proposed — agree in the PR)

1. Review/merge this PR; turn on branch protection for `main` (require PR + green CI).
2. Resolve the open questions in `docs/ROADMAP.md` (brand/permission, customer, backend).
3. Split Phase 1: one person on the plan data model + backend, the other on real-event data / geography or on test+lint tooling.

## Blocked / waiting on a human

- Brand permission & naming (VIP Monkey logo/name are in the repo).
- Backend choice and who owns the account/costs.
- Licence for the public repo.

## Verification notes

- Last full `npm run check` on `main` baseline: green on Node 24.19. `npm test` fails on Node 20 (type stripping unsupported) — use `nvm use`.
- No UI was changed in the setup PR; no browser verification was needed.
