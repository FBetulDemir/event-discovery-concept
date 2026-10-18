# Gänget

**Vad gör vi ikväll?** Gänget helps a group of friends in Göteborg decide what to do tonight: find a real event, send a link, everyone votes, then buy the ticket at the seller.

Discover → Match → Decide together → Get tickets.

## What it does

- **Utforska:** real events from ticket sellers (Ticketmaster today), with search, day and category filters, and a mood picker on the front door.
- **Match:** a short guided flow (when, mood, budget) that returns up to three events, each with the reasons it matched. No scores, no sponsored placement.
- **Planer:** make a plan from an event, share the link, friends vote as guests (no sign-up), the organizer closes the vote and the winner becomes a ticket with a link to the seller.

Swedish first; English and a language toggle are planned.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 with a token-driven design system, Supabase (Postgres, Auth, Realtime), lucide-react. Fonts: Anton and Work Sans.

## Development

Requires Node ≥ 22.18 (`nvm use` reads `.nvmrc`).

```bash
npm ci
cp .env.example .env.local   # fill it in, see docs/BACKEND.md
npm run dev                  # http://localhost:3000
npm run check                # typecheck + tests + build
```

The component and token reference is the running app at `/design`.

## Project docs

Contributor and AI-agent documentation lives in the repo:

- [`AGENTS.md`](AGENTS.md): how to work here (commands, rules, workflow); `CLAUDE.md` imports it
- [`CONTRIBUTING.md`](CONTRIBUTING.md): branches, PRs, review
- [`docs/`](docs/README.md): product, architecture, contracts, backend, brand and design, roadmap, decisions, status

## Credits

Events come from the sellers' public listings. City photographs: Matthew Skinner, Robin Röcker, Israel Sundseth and Riley Briggs via Unsplash. Gänget is an independent product and is not affiliated with any ticket seller.
