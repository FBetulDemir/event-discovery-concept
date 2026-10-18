# Design QA

How the UI is checked, and what is deliberately not met.

## Tools

`design-taste-frontend` ships a linter and a browser inspector (needs Node 22+ and Chrome). Run them from the repo root against a production build:

```bash
npm run build && npx next start -p 3100 &
S=~/.claude/skills/design-taste-frontend/scripts
node $S/lint.mjs src
node $S/inspect.mjs http://localhost:3100/                       # front door: must reach 0 FAIL
node $S/inspect.mjs http://localhost:3100/match --allow few-pictures,covered-text   # app screens
```

Run the screens in **both languages** (`/` and `/en`, `/en/match`, …): English strings are longer, so look at 390px for wrapping. Screenshots land in `.taste-skill/inspect/` (git-ignored); look at them, the numbers are not the design.

## Result on 2026-10-18

| Surface | Before the redesign | Now |
|---|---|---|
| Lint (`src`) | 27 FAIL | **0 FAIL** |
| Front door `/` | 9 FAIL | **0 FAIL** (1 warning: no looping clip yet) |
| `/match`, `/match/results`, event page | 7 to 10 FAIL each | **0 FAIL** with the exceptions below |
| `/plan`, `/plan/new` | 5 to 7 FAIL | 1 FAIL each: `still-page`. These are near-empty screens (an empty list, one form), so there are few elements to animate; accepted. |
| `/design` (internal) | n/a | not graded: a reference page with specimens |

## Allowed exceptions, with reasons

| Rule | Where | Why |
|---|---|---|
| `few-pictures` | App screens (flow, results, plans, event, forms) | The rule is written for public pages. A form or a vote list does not get four photographs. Real event images already appear wherever events appear. |
| `covered-text` | Mobile, any page | The bottom navigation is fixed by design, so any large text passes under it while scrolling. Nothing is hidden at rest; the page reserves space at the end (`body` padding). |

## Still to do

- `no-footage` warning: one honest looping clip for the front door (`assets.mjs --video`).
- Real Göteborg pictures from open collections instead of the generic night scenes.
- Contrast and keyboard pass on the date picker in the new theme, and a light-theme pass (`data-theme="light"`).
