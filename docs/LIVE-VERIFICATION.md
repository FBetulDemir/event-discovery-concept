# Live journey verification

Date: 2026-10-23. Deployment: https://event-discovery-concept.vercel.app.
PR #5 (including the existing-account login fix) is merged. The deployed UI exhibits the fixes.

## Method

Real hosted Next.js and Supabase, without mocked responses. Two isolated browser sessions represented an anonymous organizer and a second anonymous member, at 1280px and 390px. A separate temporary private plan was used for mutations. The user-supplied plan was inspected but never joined or modified.

## Passed

- Shared-plan preview shows its organizer, options, name field, and join action.
- `/api/events` returned HTTP 200, Ticketmaster `ok` (66 mapped events; 47 catalogue events after filtering). Göteborg & Co remains unconfigured.
- Account page defaults to login; a guest can switch to account creation and back. Login password autocomplete is `current-password`.
- Empty login and short registration password show validation feedback without submitting an account registration.
- Guest Reply on an existing public event comment focuses explicit sign-in guidance; the guest has no public-comment composer.
- Fresh guest reaction on an existing public event comment reproduces HTTP 409 / PostgreSQL `23503` / `comment_reactions_user_id_fkey`. The name-setup prompt recovers and retries successfully; unlike removes the test reaction. This confirms the reported missing-profile failure against the live database.
- Guest creates a private plan with a live event.
- A second isolated browser joins and votes without an account.
- Organizer sees membership and votes update without reloading; both sessions see two votes.
- Guests post private-plan comments and replies; the other session sees them live.
- Like and unlike update across sessions.
- Organizer removes another member's comment; the removed state reaches the other session.
- Organizer closes voting; both sessions see the winner and closed state.
- Guest reload retains the session, plan access, and decided result.
- No JavaScript page errors were captured during these guest checks.

The temporary plans, including the first harness attempt, were deleted with their organizer sessions. Associated plan data cascaded away. Anonymous auth users/profiles were not administratively deleted. No public event comments/reports were posted, the one temporary public-event reaction was removed, and no tickets were purchased.

## Remaining

- A headed, isolated browser was opened for the user to sign into a dedicated account. No authenticated session was available during verification; these checks remain unverified. No password was requested or recorded.
- Real account login persistence, account plan/comment/reaction flow, and account event-comment permissions.
- New registration, email delivery/confirmation, and guest-to-account upgrade retaining the same identity and votes. Signing into an existing account is not an upgrade test.
- Public-event comment/reply submission with an account.
- Separate physical devices, screen-reader testing, and a complete accessibility audit. The two-session test verifies independent browser sessions, not two phones.

## Harness note

The first attempt tried clicking a visually hidden radio input and timed out because the card image intercepted the click. Clicking the visible event-selection label worked. This was a test-targeting issue, not a reproduced user-facing selection failure.
