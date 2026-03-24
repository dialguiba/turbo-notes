# Issue 2: Real auth (login, signup, logout) + server errors

## Parent PRD

PRD-notes-list.md

## What to build

Replace the mock `AuthProvider` with real JWT authentication. Login calls `POST /api/auth/login/`, signup calls `POST /api/auth/signup/` — both store the returned access + refresh tokens in localStorage via the helpers from issue 1. Logout clears tokens and redirects to `/login`. On mount, the provider checks for an existing token to restore the session across browser refreshes.

Update the login and signup form components to catch and display server-side validation errors inline (e.g., "No active account found with the given credentials", "A user with this email already exists"). Client-side validation (email required, password min 8 chars) remains as-is.

Remove mock auth code from `AuthProvider` and delete `lib/mock-data.ts`.

## Acceptance criteria

- [x] Signup form calls `POST /api/auth/signup/` and stores tokens on success
- [x] Login form calls `POST /api/auth/login/` and stores tokens on success
- [x] Logout clears tokens from localStorage and redirects to `/login`
- [x] Session persists across browser refresh (tokens read from localStorage on mount)
- [x] Server-side errors display inline on login form (e.g., invalid credentials)
- [x] Server-side errors display inline on signup form (e.g., email already exists)
- [x] Mock auth functions removed from `AuthProvider`
- [x] `lib/mock-data.ts` deleted
- [x] Existing login/signup form tests updated to cover server error display

## Blocked by

- Blocked by Issue 1 (API client + token storage)

## User stories addressed

- User story 1 (signup creates real account)
- User story 2 (login authenticates against backend)
- User story 5 (logout clears tokens)
- User story 9 (server validation errors on signup)
- User story 10 (error message on failed login)
