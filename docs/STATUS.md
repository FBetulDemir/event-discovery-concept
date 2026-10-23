# Status

_Last updated: 2026-10-23 by Codex._

## Current work

- PRs #4 and #5 are merged: Ticketmaster runs through Supabase and comment/login feedback is deployed.
- [PR #6](https://github.com/FBetulDemir/event-discovery-concept/pull/6) records live guest verification. Two isolated guests created/joined a temporary plan, voted, commented/replied, reacted, removed comments as organizer, and received the winner live. Test plans were removed. The shared user plan was not changed. Live account sign-in, registration/upgrade and friends remain unverified: no test account session became available.
- `feat/password-recovery`: localized email reset requests and verified recovery on the existing account page; reload persistence, invalid-link handling, confirmation and provider-error feedback. Component examples are in `/design`. No schema, RLS, dependency, route or auth-model change. D-024 updates the account contract.

## Verification and deployment

- `npm run check` passes: 93 tests, typecheck and production build. English reset UI inspected at 390px and desktop; Swedish at 390px. Keyboard Tab order, heading focus, input labels and alert/status roles checked.

- Password recovery: pure/state tests and local browser checks with mocked Supabase cover requests, localized redirects, neutral confirmation, callback/reload, mismatch/short passwords, provider errors, completion, and expired/forged/rejected-token links. These checks do not send real email or change a live password.
- Configure custom SMTP and both localized account redirect URLs in Supabase (`BACKEND.md`), then test delivered links and sign-in with the new password after deployment.
- No screen-reader session was available; labels, status/alert roles and focus are checked through browser automation. The design skill's documented `lint.mjs` and `inspect.mjs` are absent from this machine.

## Next

1. Review/merge the verification and password-recovery PRs; finish the hosted account/email checks above.
2. Anonymous sign-in CAPTCHA needs provider keys and Supabase configuration before launch.
3. Decide snapshot retention/purge (D-020), add a privacy contact, and obtain a Göteborg & Co key.
4. Trademark/domain checks and human review of English/privacy copy remain open.
