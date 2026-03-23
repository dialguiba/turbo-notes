# Issue: Implement Auth Endpoints

## Parent PRD

[auth-endpoints.md](./auth-endpoints.md)

## What to build

Implement three auth API endpoints: signup, login, and token refresh. This is a single end-to-end slice that delivers:

1. **Settings**: Add `SIMPLE_JWT` config with 30-min access / 7-day refresh token lifetimes.
2. **Serializer**: `SignUpSerializer` (plain `Serializer`) with email (unique) + password (min 8 chars), creates user and generates JWT tokens.
3. **View**: `SignUpView(APIView)` with `AllowAny` permission, returns `{ access, refresh }` with status 201.
4. **URLs**: `apps/users/urls.py` with 3 routes — signup, login (`TokenObtainPairView`), refresh (`TokenRefreshView`).
5. **Root URLs**: Include user URLs in `config/urls.py` under `api/auth/`.
6. **Tests (TDD — written first)**: 8 test cases covering signup, login, and refresh flows.

## Acceptance criteria

- [x] `SIMPLE_JWT` config added to settings: `ACCESS_TOKEN_LIFETIME = 30 min`, `REFRESH_TOKEN_LIFETIME = 7 days`
- [x] `SignUpSerializer` validates email (required, unique) and password (required, min 8 chars, write_only)
- [x] `SignUpSerializer.create()` creates user via `CustomUser.objects.create_user()` and generates JWT tokens
- [x] POST `/api/auth/signup/` with valid email + password → 201, returns `{ access, refresh }`
- [x] POST `/api/auth/signup/` with duplicate email → 400, field-level error on `email`
- [x] POST `/api/auth/signup/` with missing email → 400
- [x] POST `/api/auth/signup/` with missing password → 400
- [x] POST `/api/auth/login/` with valid credentials → 200, returns `{ access, refresh }`
- [x] POST `/api/auth/login/` with wrong password → 401
- [x] POST `/api/auth/login/` with non-existent email → 401
- [x] POST `/api/auth/refresh/` with valid refresh token → 200, returns new `access`
- [x] URLs delegate from `config/urls.py` to `apps.users.urls` via `include()`
- [x] All 8 tests pass (`pytest`)
- [x] `ruff check backend/` passes clean

## Blocked by

PRD 1 (Custom User Model) — **already complete**.

## User stories addressed

- User story 1: Sign up and be logged in immediately (auto-login via token response)
- User story 2: Log in with email and password
- User story 3: Persistent sessions via 30-min access + 7-day refresh tokens
- User story 4: Clear field-level error responses for frontend form mapping
