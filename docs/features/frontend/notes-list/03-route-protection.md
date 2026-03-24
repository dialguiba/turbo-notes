# Issue 3: Route protection middleware

## Parent PRD

PRD-notes-list.md

## What to build

Add Next.js middleware that protects routes based on authentication state. The middleware checks for the presence of an access token (via a cookie mirror or a convention readable from middleware context). Unauthenticated users visiting dashboard routes (`/notes`, `/notes/[id]`) are redirected to `/login`. Authenticated users visiting auth routes (`/login`, `/signup`) are redirected to `/notes`.

This slice can be built in parallel with issue 2 — both depend only on the token storage keys established in issue 1.

## Acceptance criteria

- [x] Visiting `/notes` without a token redirects to `/login`
- [x] Visiting `/notes/[id]` without a token redirects to `/login`
- [x] Visiting `/login` with a valid token redirects to `/notes`
- [x] Visiting `/signup` with a valid token redirects to `/notes`
- [x] Middleware only runs on relevant routes (not on static assets, API routes, etc.)

## Blocked by

- Blocked by Issue 1 (API client + token storage)

## User stories addressed

- User story 6 (unauthenticated → redirect to /login)
- User story 7 (authenticated → redirect away from auth pages)
