@AGENTS.md

## Claude Code specifics

- Project skills live in `.claude/skills/`: `verify` (run the full check), `matching-engine` (rules for touching `src/lib/matching.ts`), `new-screen` (add a route/component the house way), `handoff` (end-of-session status update).
- Shared permissions are in `.claude/settings.json` (safe read/check commands only). Personal overrides go in `.claude/settings.local.json`, which is git-ignored.
- Use plan mode for anything that touches a contract in `docs/CONTRACTS.md` or adds a dependency.
- Use the repo's Node version before running tests: `nvm use` (reads `.nvmrc`). On Node 20 `npm test` fails with `ERR_UNKNOWN_FILE_EXTENSION ".ts"`; that is an environment problem, not a code bug.
