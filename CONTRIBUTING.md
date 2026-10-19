# Contributing

Two maintainers (and their agents) work here in parallel. The repo is **public** — never commit secrets or private data.

## Setup

```bash
nvm use          # Node 24 from .nvmrc (≥ 22.18 required)
npm ci
cp .env.example .env.local   # then fill it in; see docs/BACKEND.md
npm run dev
```

## Flow

1. Sync: `git switch main && git pull`.
2. Branch: `git switch -c <type>/<short-name>` — types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`.
3. Work in small commits (Conventional Commits: `feat: add plan invite link`).
4. Before pushing: `npm run check` (typecheck + tests + build).
5. Open a PR into `main` using the template. Describe *what* and *why*, list what you verified (and what you didn't), link the roadmap item.
6. **The other maintainer reviews and merges.** Don't merge your own PR unless the other person agreed or is unavailable and it's docs-only.
7. Delete the branch after merge.

Contributors without write access: fork, push the branch to your fork, open the PR against this repo.

## Keeping out of each other's way

- Say in `docs/STATUS.md` ("In flight") what you're working on before you start something big.
- Prefer vertical, small PRs over long-lived branches. Rebase on `main` often.
- Hot files that cause conflicts: `src/app/globals.css` (add new CSS in a clearly separated block per feature), `src/data/events.ts`, `docs/STATUS.md`. Touch them in small, quick PRs.

## Review checklist

- [ ] `npm run check` green (CI also runs it)
- [ ] Contracts in `docs/CONTRACTS.md` respected or updated (+ `docs/DECISIONS.md`)
- [ ] Logic in `src/lib` has tests; no weakened assertions
- [ ] UI: keyboard works, labels/`aria-live` in place, checked at 390px and desktop
- [ ] Swedish UI copy, English code/docs
- [ ] No secrets, no new dependency without discussion
- [ ] Docs/`STATUS.md` updated

## Working with AI agents

- Agents follow `AGENTS.md`. If an agent keeps making the same mistake, fix the instruction in `AGENTS.md` (or a skill), not just the code.
- Treat agent output as a draft: read the diff, run the app for UI changes.
- Claude Code users: project skills are in `.claude/skills/` (`verify`, `matching-engine`, `new-screen`, `handoff`).
