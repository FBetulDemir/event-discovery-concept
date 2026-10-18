---
name: verify
description: Run the full pre-commit check for Monkey Match (typecheck, unit tests, production build) and report precisely what passed or failed. Use before committing, before opening a PR, or when asked "does it work / is it green".
---

# Verify

1. Make sure the Node version is right: `node --version` must be ≥ 22.18 (`nvm use` reads `.nvmrc`). If it is older, stop and say so — `npm test` fails on old Node with `ERR_UNKNOWN_FILE_EXTENSION ".ts"`, which is an environment issue, not a regression.
2. If `node_modules` is missing: `npm ci`.
3. Run, in order, and capture only the tail of the output:
   - `npm run typecheck`
   - `npm test` (expect all tests passing; report the count — pure logic only; database rules are `supabase/tests/plans_rls.test.sql`)
   - `npm run build` (expect the route table: `/`, `/matches`, `/monkey-match`, `/plan`, `/plan/new` static; `/events/[id]`, `/plan/[code]`, `/api/events` dynamic)
4. Report each step as pass/fail with the evidence (test count, build route list). Do not summarise a failure as "some tests failed" — name the test and the assertion.
5. If the change touched UI, say plainly whether you ran the app and at what viewport; "typecheck and build pass" is not UI verification. For UI changes also run `npm run dev` and check 390px + desktop, keyboard operation, and that `aria-live` counts still update.
6. Never "fix" a failure by weakening a test or an assertion. If a test is wrong, say why and propose the change separately.
