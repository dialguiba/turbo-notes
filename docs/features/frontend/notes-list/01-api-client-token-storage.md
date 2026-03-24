# Issue 1: API client + token storage

## Parent PRD

PRD-notes-list.md

## What to build

Build the typed fetch wrapper in `lib/api-client.ts` that all feature code will use to communicate with the backend. The client prefixes `API_URL` to all paths, attaches `Authorization: Bearer <token>` from localStorage, parses JSON responses, and handles auth errors. On a 401 response, it attempts a token refresh via `POST /api/auth/refresh/` using the stored refresh token and retries the original request. If the refresh fails, it clears both tokens from localStorage and redirects to `/login`.

This slice also establishes the localStorage token storage contract (key names, read/write helpers) that slices 2 and 3 depend on.

No UI changes — this is a pure infrastructure slice.

## Acceptance criteria

- [x] `api-client.ts` exports typed `get`, `post`, `patch`, `delete` (or equivalent) functions
- [x] Every request includes `Authorization: Bearer <access_token>` when a token exists in localStorage
- [x] On 401 response, the client calls `POST /api/auth/refresh/` with the refresh token
- [x] On successful refresh, the new access token is stored and the original request is retried
- [x] On failed refresh (e.g., refresh token expired), both tokens are cleared and the user is redirected to `/login`
- [x] Token storage helpers (get/set/clear) are exported for use by AuthProvider and middleware
- [x] Vitest tests cover: auth header attachment, 401 refresh + retry flow, refresh failure → clear + redirect

## Blocked by

None — can start immediately.

## User stories addressed

- User story 3 (API requests include auth token automatically)
- User story 4 (expired tokens refreshed transparently)
- User story 8 (stale sessions redirect to login)
