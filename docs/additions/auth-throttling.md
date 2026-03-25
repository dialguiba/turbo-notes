# Auth Throttling

Security improvement — rate-limits login and signup to prevent brute-force attacks.

## Context

Without throttling, an attacker could make unlimited login attempts per second to guess passwords or create thousands of accounts via signup.

## Changes

### Backend

**`config/settings.py`** — added `auth` throttle rate:

```python
"DEFAULT_THROTTLE_RATES": {
    "auth": "5/minute",
}
```

**`apps/users/views.py`** — created `AuthAnonThrottle` (scoped to `auth` rate) and applied it to `SignUpView`.

**`apps/users/urls.py`** — applied `AuthAnonThrottle` to the login view via `as_view(throttle_classes=...)`.

**`apps/users/conftest.py`** — clears DRF throttle cache between tests to prevent cross-test 429s.

### Scope

| Endpoint | Throttled | Why |
| --- | --- | --- |
| `POST /api/auth/login/` | Yes | Brute-force password guessing |
| `POST /api/auth/signup/` | Yes | Mass account creation |
| `POST /api/auth/refresh/` | No | Requires valid refresh token |
| `POST /api/auth/logout/` | No | Only blacklists an existing token |

### Frontend impact

When a user gets throttled (429), the existing `ApiError` handling in `api-client.ts` will surface it. No frontend changes needed — the error message from DRF ("Request was throttled. Expected available in X seconds.") is descriptive enough.
