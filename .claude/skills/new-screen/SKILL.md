---
name: new-screen
description: Add a new route/screen or feature component to Monkey Match following the house structure, design tokens and accessibility baseline. Use when asked to add a page, flow step, or sizeable UI component.
---

# New screen / component

Read `docs/ARCHITECTURE.md` ("Where to put new things") and `docs/CONTRACTS.md` §7–§9.

## Steps
1. **Route** (`src/app/<route>/page.tsx`): thin server component. Wrap content in `PageContainer` exactly once (it renders `<main id="main-content">`, the skip-link target). Export no logic here.
2. **Feature components** in `src/components/<feature>/`, one per file, PascalCase. Add `'use client'` only if the component needs state, effects or browser APIs.
3. **Logic** goes to `src/lib/<name>.ts` as pure functions with a sibling `<name>.test.mjs`. Components call it; they don't contain rules.
4. **Primitives**: reuse `Button`, `Chip`, `SelectionCard`, `ProgressBar`, `SectionHeading`, `DatePicker`. Add a new primitive to `src/components/ui/` only if two features need it.
5. **Styling**: add classes in `src/app/globals.css` inside `@layer components`, in a clearly commented block for the feature, BEM-ish names (`.feature__part--modifier`). Use existing tokens (`--space-*`, `--color-*`, `--radius-*`, `--control-height`, `--motion-*`). No raw hex/px values. Mobile-first at 390px, then widen.
6. **Navigation**: if it is a top-level destination, update `Header` and `BottomNav` and their `aria-current` logic.
7. **State that crosses routes** → a provider mounted in `src/app/layout.tsx`, following `PreferencesProvider` (throw if used outside the provider). Anything that needs persistence or sharing between people is a backend topic: stop and check `docs/ROADMAP.md` / `docs/DECISIONS.md` first.
8. **Time-dependent rendering**: never read the clock during render. Follow `useEvents` / `MatchResults` (neutral on server, fill after mount).

## Accessibility checklist (must pass)
- One `h1`; headings in order; labelled regions.
- Every input labelled (visible or `sr-only`); errors announced.
- Dynamic counts/results: `role="status" aria-live="polite" aria-atomic="true"`.
- Multi-step UI: move focus to the new step's heading (`tabIndex={-1}`).
- Keyboard-only operable; visible focus; toggles use `aria-pressed`.
- Decorative icons `aria-hidden="true"`; meaningful images get Swedish `alt`.
- Respect `prefers-reduced-motion`.

## Copy
Swedish, informal, short. Don't promise anything the engine doesn't do.

## Finish
Run the `verify` skill, then run the app (`npm run dev`) and look at the screen at 390px and desktop. State in the PR what you checked.
