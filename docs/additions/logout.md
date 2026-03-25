# Logout

Quick iteration — adds sign-out capability to the existing auth flow.

## Context

The `useAuth().logout()` function already exists (clears tokens, resets state, redirects to `/login`). What's missing is the UI to trigger it.

## Design Decisions

| Decision         | Resolution                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------- |
| **Where**        | Sidebar footer (desktop) + top bar icon (mobile)                                          |
| **User info**    | Avatar with initials + email                                                              |
| **Interaction**  | Direct button — no dropdown menu (YAGNI, single action)                                   |
| **Confirmation** | None — logout is not destructive (notes are auto-saved)                                   |
| **Backend**      | `POST /api/auth/logout/` blacklists the refresh token (simplejwt `TokenBlacklistView`)    |
| **Mobile**       | LogOut icon in the right side of `mobile-top-bar`                                         |

## Scope

### Files to modify

1. **`features/categories/components/categories-sidebar.tsx`** — add footer with avatar (initials) + email + logout button
2. **`features/notes/components/mobile-top-bar.tsx`** — add LogOut icon to the right
3. **`app/providers.tsx`** — call `POST /api/auth/logout/` (fire-and-forget) before clearing tokens

### Out of scope

- Dropdown menu / user settings menu
- Confirmation dialog

## Acceptance Criteria

- [x] Desktop: sidebar shows user avatar (initials) + email + logout button at the bottom
- [x] Mobile: top bar shows a LogOut icon
- [x] Clicking logout clears tokens, resets auth state, and redirects to `/login`
- [x] Backend: `POST /api/auth/logout/` blacklists the refresh token server-side
- [x] Frontend: logout calls backend endpoint (fire-and-forget) before clearing local state
