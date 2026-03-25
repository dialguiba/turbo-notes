# JWT Hardening

Security improvement — enables refresh token rotation and blacklisting.

## Context

The original JWT config had a 30-minute access token lifetime, no refresh rotation, and no token blacklisting. A stolen refresh token could be reused for the full 7-day lifetime without detection.

## Changes

### Backend (`config/settings.py`)

| Setting | Before | After |
| --- | --- | --- |
| `ACCESS_TOKEN_LIFETIME` | 30 minutes | 15 minutes |
| `ROTATE_REFRESH_TOKENS` | `False` (default) | `True` |
| `BLACKLIST_AFTER_ROTATION` | `False` (default) | `True` |
| `token_blacklist` app | not installed | installed + migrated |

**How it works**: Every time the frontend calls `/api/auth/refresh/`, the backend now returns a new access token AND a new refresh token. The old refresh token is added to a blacklist table and can no longer be used.

### Frontend (`lib/api-client.ts`)

Updated `refreshAccessToken()` to store the new refresh token returned by the rotation flow. Previously it only stored the new access token.

## Frontend impact

- The `refreshAccessToken` function now expects `{ access: string; refresh?: string }` from the refresh endpoint
- The `refresh` field is optional (`refresh?`) for backwards safety, but will always be present with the current backend config
- No changes needed in components — the api-client handles this transparently
