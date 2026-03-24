# PRD: Auth Screens

## Problem Statement

The frontend scaffold is complete (PRD 1), but there are no functional screens yet. Users cannot see or interact with any UI. The Login and Signup screens are the entry point to the app — without them, no subsequent feature screen can be reached. Additionally, the project lacks reusable core components (Button, Input, TextLink) that match the app's visual identity, which every future PRD will need.

## Solution

Build the Login and Signup screens using mock authentication (no real API calls yet). As part of this work, establish the project's core component library (Button, Input, TextLink) and configure the app's typography (Inter + Inria Serif). These screens will use the existing mock `AuthProvider` and redirect to `/notes` on successful form submission.

## User Stories

1. As a new user, I want to see a Sign Up screen with a friendly mascot illustration and heading "Yay, New Friend!", so that I feel welcomed.
2. As a new user, I want to enter my email and password on the Sign Up screen, so that I can create an account.
3. As a new user, I want to see password constraints ("Minimum 8 characters") displayed on the Sign Up form before submitting, so that I know the requirements upfront.
4. As a new user, I want to toggle password visibility using an eye icon inside the password field, so that I can verify what I typed.
5. As a new user, I want to see inline error messages below the relevant field when validation fails on submit, so that I know exactly what to fix.
6. As a new user, I want to be redirected to the notes screen after signing up successfully, so that I can start using the app.
7. As a new user, I want to click "We're already friends!" below the Sign Up form to navigate to the Login screen, so that I can log in if I already have an account.
8. As a returning user, I want to see a Login screen with a cactus mascot illustration and heading "Yay, You're Back!", so that I feel recognized.
9. As a returning user, I want to enter my email and password on the Login screen, so that I can access my account.
10. As a returning user, I want to toggle password visibility on the Login screen, so that I can verify my credentials.
11. As a returning user, I want to be redirected to the notes screen after logging in successfully, so that I can access my notes.
12. As a returning user, I want to click "Oops! I've never been here before" below the Login form to navigate to the Sign Up screen, so that I can create an account.
13. As a user on any device, I want the auth screens to be responsive, so that I can sign up or log in on mobile, tablet, or desktop.
14. As a developer, I want reusable core components (Button, Input, TextLink) that reflect the app's visual identity, so that I can build future screens consistently.
15. As a developer, I want the project configured with Inter and Inria Serif fonts via `next/font/google`, so that typography matches the design system globally.

## Implementation Decisions

### Typography

- **Inter**: Body/UI font (weights 400, 700). Replaces Geist as the default sans-serif font. Configured via `next/font/google` with CSS variable `--font-inter`. Applied as `--font-sans` in the Tailwind `@theme` block.
- **Inria Serif**: Heading/display font (weight 700 only). Configured via `next/font/google` with CSS variable `--font-serif`. Applied as `--font-heading` in the Tailwind `@theme` block. Used via `font-serif` utility class.
- Both fonts configured globally in the root layout and available throughout the app.

### Color tokens

Two new tokens added to the `@theme inline` block in `globals.css`:
- `--color-warm-brown: #957139` — used for input borders, button borders, eye icon color, button text
- `--color-title-brown: #88642A` — used for auth screen headings

### Core components (`components/core/`)

A new layer of project-specific reusable components. These may use shadcn primitives (`components/ui/`) internally but expose a project-consistent API.

- **CoreButton**: Wraps shadcn Button. Variants: `primary`, `secondary`, `outlined`. Auth screens use `outlined` — pill-shaped (`rounded-full`), warm-brown border, bold Inter text. Full width on auth forms.
- **CoreInput**: Wraps shadcn Input. Default variant with warm-brown border, 6px border-radius, black placeholder text. Password variant adds an Eye/EyeOff toggle icon (lucide-react) positioned at the right edge of the input, icon color warm-brown. Internal state toggles between `type="password"` and `type="text"`.
- **TextLink**: Wraps Next.js `Link`. Small text (12px relative), Inter regular weight, underlined, navigates to provided href.
- **Barrel export** via `index.ts` for clean imports.

### Auth screen layout

Both Login and Signup follow the same vertical layout, centered on a beige (`#F5F0E8`) background:

1. **Mascot illustration** — `next/image` with relative sizing:
   - Signup: `sleeping_cat.png`, width ~14.7vw (min 120px), height auto
   - Login: `cactus_mascot.png`, width ~7.4vw (min 60px), height auto
2. **Heading** — Inria Serif, bold, responsive size via `clamp()`, color `#88642A`
3. **Form** — stacked vertically with gap:
   - Email input (CoreInput, type email)
   - Password input (CoreInput, password variant with eye toggle)
   - Signup only: constraint hint text below password field ("Minimum 8 characters")
   - Inline error text when validation fails
   - Submit button (CoreButton, outlined variant, full width)
4. **Navigation link** — TextLink centered below the button

### Form handling

- `useState` for each field (email, password) plus error and loading states. No form library — only 2 fields.
- Client-side validation on submit: required fields + password minimum 8 characters (signup only).
- Inline errors displayed below the relevant field.
- On success: calls mock `login()`/`signup()` from `useAuth()`, then `router.push("/notes")`.
- Submit button shows "Signing up..." / "Logging in..." text while processing and is disabled.

### Component architecture

- **Pages** (`app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx`): Server Components, thin wrappers that render the form component.
- **Form components** (`features/auth/components/login-form.tsx`, `features/auth/components/signup-form.tsx`): Client Components (`"use client"`) containing all form logic, state, and UI.
- **Auth layout** (`app/(auth)/layout.tsx`): Beige background, centered flex container with mobile padding.

### Responsive approach

- All measurements use relative units (vw, clamp, min-width).
- Form container uses `max-w-sm w-full` — constrains on large screens, full width on small.
- Images scale via vw with min-width floor to prevent them from becoming too small.
- Layout padding adapts for mobile breathing room.

### Assets

- `public/images/sleeping_cat.png` — signup mascot (already exists)
- `public/images/cactus_mascot.png` — login mascot (already exists)

## Testing Decisions

### Philosophy

- Test meaningful functionality — things that could break and would affect users. Not every component needs a test.
- Test external behavior (what the user sees/does), not implementation details (internal state shape).

### Test framework

- **Vitest** with `@testing-library/react` — less configuration than Jest with Next.js (no SWC transform or path alias config needed).
- Setup: install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`. Add `vitest.config.ts` with path aliases matching `tsconfig.json`.

### What to test

- **CoreInput password variant**: Toggle between password/text type when clicking the eye icon. This is the most interactive core component and the toggle behavior is non-trivial.
- **SignupForm validation**: Submit with password < 8 chars shows inline error. Submit with valid data calls signup and triggers navigation.
- **LoginForm submission**: Submit with valid data calls login and triggers navigation.

### What NOT to test

- CoreButton and TextLink — they are thin wrappers with no logic beyond styling.
- Visual/snapshot tests — not useful for this stage.

## Out of Scope

- ~~Real API integration (login/signup endpoints) — PRD 7 (Auth Integration)~~ → Moved to PRD 3
- ~~JWT token storage and refresh logic — PRD 7~~ → Moved to PRD 3
- ~~Protected route middleware (redirect unauthenticated users) — PRD 7~~ → Moved to PRD 3
- "Forgot password" flow — not in current product specs
- Dark mode styling for auth screens — separate initiative
- Category Badge, Category Dropdown, and other core components not needed by auth — future PRDs
- E2E tests (Playwright) — optional, to be determined later

## Further Notes

- The mock `AuthProvider` in `providers.tsx` exposes `login()`, `signup()`, and `logout()`. PRD 3 will replace these with real JWT calls before building the notes UI.
- The `lib/api-client.ts` shell exists but is not used in this PRD. PRD 3 will build the real api-client with JWT auth.
- Font swap from Geist to Inter/Inria Serif is a global change that affects the entire app. Since only stub pages exist currently, there's no regression risk.
- The core components establish a pattern: project components in `components/core/`, shadcn primitives in `components/ui/`. All feature code imports from `core/`, never directly from `ui/` for components that have a core equivalent.
