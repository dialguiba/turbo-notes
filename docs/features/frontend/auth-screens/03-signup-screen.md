# Issue 3: Signup screen — Form with validation and mock auth

## Parent PRD

PRD-auth-screens.md

## What to build

Build the complete Sign Up screen. A `SignupForm` Client Component in `features/auth/components/` renders the full signup UI: sleeping cat mascot (relative sizing ~14.7vw), "Yay, New Friend!" heading in Inria Serif, email input, password input with eye toggle and constraint hint ("Minimum 8 characters"), outlined submit button, and a TextLink to `/login` ("We're already friends!").

Form validates on submit (password >= 8 chars) with inline error messages. On success, calls mock `signup()` from `useAuth()` and redirects to `/notes` via `router.push()`.

The signup page is a thin Server Component wrapper. The auth layout is refined with `flex-1` and mobile padding.

See PRD sections: **Auth screen layout**, **Form handling**, **Component architecture**, **Responsive approach**.

## Acceptance criteria

- [x] Signup page renders at `/signup` with beige background
- [x] Sleeping cat mascot displayed, sized relatively (~14.7vw width, min 120px, height auto)
- [x] "Yay, New Friend!" heading in Inria Serif, bold, color `#88642A`, responsive size via `clamp()`
- [x] Email input with "Email address" placeholder
- [x] Password input with eye toggle and "Minimum 8 characters" hint below
- [x] Submit with password < 8 chars shows inline error, does NOT call signup
- [x] Submit with valid data calls mock `signup()` and redirects to `/notes`
- [x] Button shows "Signing up..." and is disabled while submitting
- [x] "We're already friends!" link navigates to `/login`
- [x] Responsive: usable at 375px width
- [x] Unit test: validation rejects short passwords, valid submission calls signup
- [x] `pnpm build` passes
- [x] `pnpm lint` passes

## Blocked by

- Issue 2 (Core Components) — needs CoreButton, CoreInput, TextLink

## User stories addressed

- User story 1: See signup screen with mascot and "Yay, New Friend!"
- User story 2: Enter email and password to create account
- User story 3: See password constraints before submitting
- User story 4: Toggle password visibility
- User story 5: See inline error messages on validation failure
- User story 6: Redirected to notes screen after signup
- User story 7: Navigate to login via "We're already friends!"
- User story 13: Responsive on any device
