# Issue 4: Login screen — Form with mock auth

## Parent PRD

PRD-auth-screens.md

## What to build

Build the complete Login screen. A `LoginForm` Client Component in `features/auth/components/` renders the full login UI: cactus mascot (relative sizing ~7.4vw), "Yay, You're Back!" heading in Inria Serif, email input, password input with eye toggle, outlined submit button, and a TextLink to `/signup` ("Oops! I've never been here before").

On submit, calls mock `login()` from `useAuth()` and redirects to `/notes`. No password length validation on login (user already has an account).

The login page is a thin Server Component wrapper. Reuses the same auth layout refined in Issue 3.

See PRD sections: **Auth screen layout**, **Form handling**, **Component architecture**.

## Acceptance criteria

- [x] Login page renders at `/login` with beige background
- [x] Cactus mascot displayed, sized relatively (~7.4vw width, min 60px, height auto)
- [x] "Yay, You're Back!" heading in Inria Serif, bold, color `#88642A`, responsive size via `clamp()`
- [x] Email input with "Email address" placeholder
- [x] Password input with eye toggle (no constraint hint — this is login, not signup)
- [x] Submit with valid data calls mock `login()` and redirects to `/notes`
- [x] Button shows "Logging in..." and is disabled while submitting
- [x] "Oops! I've never been here before" link navigates to `/signup`
- [x] Responsive: usable at 375px width
- [x] Unit test: valid submission calls login and triggers navigation
- [x] `pnpm build` passes
- [x] `pnpm lint` passes

## Blocked by

- Issue 2 (Core Components) — needs CoreButton, CoreInput, TextLink

Note: Can be implemented in parallel with Issue 3 (Signup screen).

## User stories addressed

- User story 8: See login screen with mascot and "Yay, You're Back!"
- User story 9: Enter email and password to access account
- User story 10: Toggle password visibility on login
- User story 11: Redirected to notes screen after login
- User story 12: Navigate to signup via "Oops! I've never been here before"
- User story 13: Responsive on any device
