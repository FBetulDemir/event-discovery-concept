---
name: handoff
description: End-of-session handoff for Monkey Match. Updates docs/STATUS.md (and DECISIONS/ROADMAP if needed) so the other maintainer or a fresh agent can continue from the repo alone. Use when finishing a work session, before opening a PR that leaves follow-ups, or when asked to "hand off" / "write up where we are".
---

# Handoff

Goal: a stranger with only the repo can continue without asking you anything.

1. Gather facts, don't recall: `git status`, `git log --oneline main..HEAD`, `git diff --stat main...HEAD`, open PRs (`gh pr list` if available), and the result of the last `npm run check`.
2. Update `docs/STATUS.md`:
   - **Last updated** line (date, who).
   - **Now**: what is true of the app today (one or two lines).
   - **In flight**: branch/PR, owner, what, state.
   - **Next up**: concrete next steps, ordered, each small enough for one PR.
   - **Blocked / waiting on a human**: decisions or access needed, and who.
   - **Verification notes**: what you actually ran and what you did *not* (e.g. "UI not checked in a browser").
3. If you made or discovered a decision (library, data model, rule change), add a `D-nnn` entry to `docs/DECISIONS.md`.
4. If you found a bug or gap you did not fix, add it to **Known issues** in `docs/ROADMAP.md` (file, symptom, suggested fix).
5. If a contract changed, confirm `docs/CONTRACTS.md` was updated in the same branch.
6. Keep `STATUS.md` short — remove finished items instead of accumulating history.
7. Commit the docs on your working branch (`docs: update status`). Do not push to `main`.
8. Tell the user in 3–5 lines: what is done, what is open, what you need from them.
