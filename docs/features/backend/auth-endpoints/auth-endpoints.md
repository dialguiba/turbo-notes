# PRD: Auth Endpoints (Signup, Login, Refresh)

## Problem Statement

The custom User model exists with email-based authentication, but there are no API endpoints for users to register, log in, or refresh their JWT tokens. Without these endpoints, the frontend cannot authenticate users or maintain sessions.

## Solution

Create three auth endpoints using Django REST Framework and `djangorestframework-simplejwt`:

1. **POST \****`/api/auth/signup/`** — Register a new user and return JWT tokens immediately (auto-login).
2. **POST \****`/api/auth/login/`** — Authenticate with email + password, return JWT tokens.
3. **POST \****`/api/auth/refresh/`** — Exchange a refresh token for a new access token.

Login and refresh use simplejwt's built-in views directly — no subclassing needed. Only signup requires custom code (serializer + view).

## User Stories

1. As a new user, I want to sign up with email and password and be logged in immediately, so I don't have to go through a separate login step after registration.
2. As a returning user, I want to log in with my email and password, so I can access my notes.
3. As a logged-in user, I want my session to persist without frequent re-authentication, so I can focus on writing notes.
4. As a frontend developer, I want clear error responses with field-level validation messages, so I can map errors to specific form fields.

## Implementation Decisions

- **Signup response**: Returns `{ access, refresh }` immediately (auto-login). The product spec says "On success: redirect to the main notes screen" — this requires the user to be authenticated right after signup.
- **Serializer type**: Plain `Serializer` (not `ModelSerializer`) — we only need `email` and `password` as input, and the output is tokens, not user fields. A `ModelSerializer` would auto-generate fields we don't want to expose.
- **Password validation**: `min_length=8` on the serializer field. No Django `AUTH_PASSWORD_VALIDATORS` — keep it simple for a note-taking app.
- **Duplicate email handling**: DRF's built-in `UniqueValidator` via the email field's uniqueness constraint. Returns `{"email": ["user with this email already exists."]}`.
- **Login/Refresh views**: simplejwt's `TokenObtainPairView` and `TokenRefreshView` used directly. `TokenObtainPairView` reads `USERNAME_FIELD` from the user model, so it automatically expects `email` instead of `username`.
- **Token expiry**: Access token — 30 minutes. Refresh token — 7 days. A note-taking app needs longer sessions since users leave notes open while thinking. Configured via `SIMPLE_JWT` dict in settings.
- **URL structure**: `config/urls.py` delegates to `apps.users.urls` via `include()`. Keeps the root URLconf clean as more apps are added.
- **Error format**: DRF defaults (field-level errors). No custom error formatting.
- **HTTP status codes**: 201 (signup success), 200 (login/refresh success), 400 (validation errors), 401 (invalid credentials).
- **Default categories**: Not created during signup — this is PRD 3's responsibility via a `post_save` signal on User.

## Testing Decisions

- **TDD required** — write tests before implementation.
- **8 test cases** covering signup, login, and refresh:
  1. Successful signup → 201, response has `access` and `refresh`
  2. Signup with duplicate email → 400, field-level error on `email`
  3. Signup with missing email → 400
  4. Signup with missing password → 400
  5. Successful login → 200, has `access` and `refresh`
  6. Login with wrong password → 401
  7. Login with non-existent email → 401
  8. Refresh token → 200, returns new `access`
- **Protected endpoint test**: Deferred to PRD 4. No protected endpoints exist yet, and testing against a real endpoint is more valuable than creating throwaway test infrastructure.
- **Test framework**: `pytest` + DRF's `APIClient`.

## Out of Scope

- Default category creation (PRD 3)
- Category and Note models (PRD 3, 5)
- Category and Note endpoints (PRD 4, 6)
- Frontend auth screens
- Password reset flow
- Email verification
- Rate limiting on auth endpoints
