# PRD: Notes List + Sidebar (with Auth Integration)

## Problem Statement

Auth screens exist but use mock authentication — the app cannot actually log in users or protect routes. Without real auth, the next feature PRD (Notes List) cannot fetch user-specific data from the backend. Additionally, users have no way to view, create, or filter their notes once authenticated.

This PRD solves both problems in sequence: first replace mock auth with real JWT integration, then build the Notes List screen with a category sidebar — the main screen users land on after login.

## Solution

### Part 1 — Auth Integration

Replace the mock `AuthProvider` with real JWT authentication:
- Login and signup forms call the backend auth endpoints and store JWT tokens in localStorage
- The API client attaches the access token to every request
- A 401 response triggers a token refresh attempt; if refresh fails, redirect to login
- Route protection via Next.js middleware redirects unauthenticated users to `/login` and authenticated users away from auth pages
- Logout clears tokens and redirects to `/login`

### Part 2 — Notes List + Sidebar

Build the main app screen at `/notes`:
- A left sidebar displays the user's categories (with color indicators and note counts), plus an "All Categories" option
- The main area shows a responsive grid of note preview cards (1→2→3 columns), sorted by last edited descending
- Clicking a category filters notes via URL search params (`?category=<id>`)
- A "+ New Note" button creates a note via the API and navigates to `/notes/[id]` (editor is a stub until PRD 4)
- An empty state with a boba tea illustration is shown when the user has no notes

## User Stories

### Auth Integration

1. As a new user, I want my signup form to create a real account on the backend, so that my data persists across sessions.
2. As a returning user, I want my login form to authenticate against the backend, so that I can access my notes.
3. As an authenticated user, I want my API requests to automatically include my auth token, so that the backend recognizes me.
4. As an authenticated user, I want expired tokens to be refreshed transparently, so that I don't get logged out unexpectedly.
5. As an authenticated user, I want to log out and have my tokens cleared, so that my session ends securely.
6. As an unauthenticated user, I want to be redirected to `/login` when I try to access `/notes`, so that I'm prompted to authenticate.
7. As an authenticated user, I want to be redirected to `/notes` when I visit `/login` or `/signup`, so that I don't see unnecessary screens.
8. As a user whose refresh token has expired, I want to be redirected to `/login`, so that I can re-authenticate.
9. As a new user, I want to see server-side validation errors (e.g., "email already exists") displayed inline on the signup form, so that I know what went wrong.
10. As a returning user, I want to see an error message when login fails (wrong credentials), so that I can correct my input.

### Notes List

11. As a user with notes, I want to see my notes displayed as preview cards in a responsive grid (1 col mobile → 2 col tablet → 3 col desktop), so that I can browse them at any screen size.
12. As a user, I want my notes sorted by last edited date (most recent first), so that I can quickly find what I was working on.
13. As a user, I want each preview card to show the date, category name, title, and a truncated content preview, so that I can identify notes at a glance.
14. As a user, I want the card background color to match the note's category color, so that I can visually distinguish categories.
15. As a user, I want dates on cards to display as "Today", "Yesterday", or "Mar 19" (no year), so that dates are easy to read.
16. As a user, I want to click on a preview card to navigate to `/notes/[id]`, so that I can view or edit the note (editor built in PRD 4).
17. As a user, I want to click a "+ New Note" button to instantly create a note and navigate to its editor, so that I can start writing immediately.
18. As a user filtering by a category, I want a new note to be created with that category pre-assigned, so that it matches my current context.
19. As a user viewing "All Categories", I want a new note to be created without a category, so that I can assign one later.
20. As a new user with no notes, I want to see a boba tea illustration with the text "I'm just here waiting for your charming notes...", so that the empty screen feels friendly.

### Category Sidebar

21. As a user, I want to see a sidebar listing all my categories with color indicators, names, and note counts, so that I can browse by category.
22. As a user, I want note counts hidden when a category has 0 notes, so that the sidebar stays clean.
23. As a user, I want to click a category to filter notes to only that category, so that I can focus on a specific topic.
24. As a user, I want the selected category name displayed in bold, so that I know which filter is active.
25. As a user, I want to click "All Categories" to remove the filter and see all notes, so that I can return to the full list.
26. As a user, I want the category filter to persist in the URL (`?category=<id>`), so that I can refresh the page without losing my filter.
27. As a user on mobile, I want the sidebar to collapse into a top bar with a category dropdown and "+ New Note" button, so that I can filter and create notes on small screens.

## Implementation Decisions

### Auth Integration

- **API client**: Build `lib/api-client.ts` as a typed fetch wrapper that prefixes `API_URL`, attaches `Authorization: Bearer <token>` from localStorage, parses JSON responses, and handles errors. On 401, attempt token refresh via `POST /api/auth/refresh/`; if refresh fails, clear tokens and redirect to `/login`.
- **Token storage**: Access and refresh tokens stored in localStorage under known keys. The `AuthProvider` reads tokens on mount to restore sessions.
- **AuthProvider rewrite**: Replace mock `login`/`signup`/`logout` with real implementations:
  - `login(email, password)` → `POST /api/auth/login/` → store tokens, set user state
  - `signup(email, password)` → `POST /api/auth/signup/` → store tokens, set user state
  - `logout()` → clear tokens from localStorage, reset user state, redirect to `/login`
- **User state**: Decode the JWT access token to extract user info (email), or store email alongside the token. No separate `/me` endpoint needed.
- **Route protection**: Next.js middleware checks for the presence of an access token. If absent on dashboard routes → redirect to `/login`. If present on auth routes → redirect to `/notes`.
- **Error handling on forms**: Login and signup forms catch API errors and display them inline (e.g., "No active account found with the given credentials", "A user with this email already exists").

### Notes List

- **Types**: Split into response and request shapes:
  - `Note` (response): `category` is `{ id, name, color } | null` — matches what `GET /api/notes/` returns
  - `NoteCreatePayload` / `NoteUpdatePayload` (request): `category` is `number | null` — what `POST/PATCH` expects
  - `Category` (response): Add `note_count`, `created_at`, `updated_at` to match the full serializer
- **Data fetching**: TanStack Query with these query keys:
  - `["categories"]` — fetches `GET /api/categories/` (includes `note_count`)
  - `["notes", { category }]` — fetches `GET /api/notes/` or `GET /api/notes/?category=<id>`. The category search param is embedded in the query key so TanStack Query caches per filter automatically.
- **Cache invalidation (granular)**:
  - Creating a note → invalidate `["notes", ...]` and `["categories"]` (note_count changed)
  - Deleting a note → invalidate `["notes", ...]` and `["categories"]` (note_count changed)
  - Updating a note's category → invalidate `["notes", ...]` and `["categories"]` (note_counts shifted)
  - Updating a note's title/content only → invalidate `["notes", ...]` only (note_count unchanged)
- **Category filter state**: URL search params (`/notes?category=3`) via `useSearchParams`. This is idiomatic in Next.js App Router, survives page refresh, and maps 1:1 to the backend's `?category=<id>` query param.
- **Card background color**: Applied via inline `style={{ backgroundColor }}` since category colors are dynamic hex values from the backend (including user-created custom colors). Tailwind cannot generate classes for arbitrary runtime values.
- **Date formatting**: A utility function in the notes feature module using `date-fns`. Logic: `isToday()` → "Today", `isYesterday()` → "Yesterday", else `format(date, "MMM d")`.
- **Create note flow**: `POST /api/notes/` with `category` set to the currently filtered category ID (from URL search params), or `null` if viewing "All Categories". On success, navigate to `/notes/<new-id>`.
- **Navigation to editor**: `router.push("/notes/[id]")`. The editor page is a stub in this PRD — it just shows the note ID and a back button. Full editor is PRD 4.
- **Grid responsive**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
- **Sidebar placement**: Lives inside `/notes/page.tsx` only, not in the dashboard layout. The editor page (`/notes/[id]`) renders fullscreen without a sidebar.
- **Sidebar responsive**: On desktop, renders as a fixed-width left sidebar. On mobile, collapses into a top bar with a category dropdown selector on the left and the "+ New Note" button on the right.
- **Card click target**: The entire card is clickable (wraps in a Link or has an onClick on the card container).
- **Empty state**: Uses the existing boba tea image at `public/images/coffee.png` with the spec text centered in the main area. The sidebar and "+ New Note" button remain visible.

### Component Architecture

- **Page**: `app/(dashboard)/notes/page.tsx` — Server Component shell, renders the client component
- **NotesListView**: Client Component — orchestrates sidebar, grid, empty state, and "+ New Note" button. Reads `searchParams` for the active category filter.
- **CategorySidebar**: Displays category list with color dots, names, counts. Highlights the active filter. Desktop variant.
- **CategoryMobileBar**: Mobile top bar with a dropdown for category selection and the "+ New Note" button. Shown via responsive classes (hidden on desktop, visible on mobile).
- **NoteCard**: Preview card with date, category, title, truncated content, and dynamic background color.
- **EmptyState**: Boba tea illustration + message. Shown when the notes list is empty.

### Hooks

- `features/notes/hooks/useNotes.ts` — TanStack Query hook for fetching notes (with optional category filter) and creating notes
- `features/categories/hooks/useCategories.ts` — TanStack Query hook for fetching categories
- `features/auth/hooks/useAuth.ts` — if the AuthProvider is refactored to use a hook-based pattern (or remains as context)

## Testing Decisions

### Philosophy

Test external behavior that could break and would affect users. Don't test implementation details (state shape, internal method calls). Prior art: `features/auth/components/__tests__/login-form.test.tsx` and `signup-form.test.tsx` — both use Vitest + Testing Library, mock `useAuth` and `useRouter`.

### What to test

- **Date formatting utility** (`features/notes/utils.ts`): Pure function, easy to test exhaustively — today, yesterday, older dates, edge cases around midnight. This is explicitly called out in the project's testing rules as a candidate for Vitest unit tests.
- **Auth integration on forms**: Update existing login/signup form tests to verify that real API errors are displayed inline (e.g., mock the API client to return a 401, assert the error message renders). The existing tests mock `useAuth` — they should continue to do so, since auth integration is tested through the provider, not the form.
- **API client token refresh**: Test that on 401, the client attempts a refresh and retries the original request; on refresh failure, it clears tokens.

### What NOT to test

- NoteCard rendering, CategorySidebar rendering — visual components with no complex logic
- TanStack Query cache invalidation — trust the library, test through E2E in PRD 8
- Route protection middleware — tested manually and via E2E in PRD 8

## Out of Scope

- Note editor UI (title, content editing, auto-save) — PRD 4
- Category CRUD (create, edit, delete categories) — PRD 5
- Voice-to-text — PRD 6
- "Forgot password" flow — not in current product specs
- Dark mode — separate initiative
- Pagination or infinite scroll — dataset size doesn't warrant it
- Search/filter by text — not in current product specs
- Note deletion — handled in the editor (PRD 4)
- Drag-and-drop reordering — not in product specs

## Further Notes

- The backend auto-creates 3 default categories (Random Thoughts, School, Personal) on user signup via a `post_save` signal. No frontend logic needed for this — the categories will appear immediately when fetching `GET /api/categories/` after signup.
- The `NoteSerializer.to_representation` method returns the full category object (`{ id, name, color }`) on reads but expects just the category ID on writes. This is why the frontend types are split into response and request shapes.
- The auth forms already handle client-side validation (email required, password min 8 chars on signup). This PRD adds server-side error display on top of that — both layers coexist.
- The `mock-data.ts` file and mock `AuthProvider` can be cleaned up after auth integration is complete. The mock data file may still be useful for Vitest tests that need fixtures.
