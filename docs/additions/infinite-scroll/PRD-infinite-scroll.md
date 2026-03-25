# PRD: Infinite Scroll for Notes Grid

## Problem Statement

The notes list currently fetches all of a user's notes in a single API request and renders them at once. As the number of notes grows, this causes slower load times, higher memory usage, and unnecessary data transfer — the user may have hundreds of notes but only sees ~20 at a time on screen.

## Solution

Add cursor-based pagination to the notes API and infinite scroll to the notes grid. The backend returns notes in pages of 20, and the frontend automatically loads the next page when the user scrolls near the bottom of the grid. The experience is seamless — there are no "Load More" buttons or page numbers.

## User Stories

1. As a user with many notes, I want only the first batch of notes loaded initially, so that the page loads quickly.
2. As a user scrolling through my notes, I want more notes to load automatically as I approach the bottom, so that browsing feels continuous.
3. As a user waiting for more notes to load, I want to see skeleton placeholder cards at the bottom of the grid, so that I know more content is on its way.
4. As a user who has scrolled through all their notes, I want scrolling to stop loading, so that I know I've seen everything.
5. As a user filtering by category, I want infinite scroll to work within the filtered set, so that pagination respects my current filter.
6. As a user who just created a note, I want the list to refresh from the top with my new note visible first, so that I can confirm it was created.
7. As a user who just edited a note, I want the list to refresh from the top with my updated note visible first, so that I see the latest state.
8. As a user on a slow connection, I want the initial page to load with 20 notes instead of all notes, so that I get a usable screen faster.
9. As a user switching between categories, I want each category's scroll position to start fresh from the top, so that the experience is clean per filter.
10. As a user with fewer than 20 notes, I want the grid to behave exactly as before (no scroll indicators, no "end of list"), so that the feature is invisible when unnecessary.

## Implementation Decisions

### Backend — Cursor Pagination

- **Pagination class**: A custom `CursorPagination` subclass scoped to `NoteViewSet` only (not global). Page size of 20, ordering by `-updated_at`.
- **Why cursor over offset**: The notes feed is ordered by `updated_at`, which shifts whenever a note is edited. Cursor pagination is stable against these mutations — no duplicated or skipped items between pages. The trade-off (no random page access) is irrelevant for infinite scroll.
- **Scope**: Only `NoteViewSet` gets pagination. `CategoryViewSet` returns all categories unpaginated — users have few categories, and the sidebar needs the full list.
- **Response shape change**: The notes list endpoint changes from returning a flat `Note[]` to returning `{ next: string | null, previous: string | null, results: Note[] }`. This is a breaking change to the API contract that the frontend must handle simultaneously.
- **Category filtering**: The existing `?category=<id>` query parameter continues to work. DRF applies cursor pagination on top of the already-filtered queryset — no changes needed to the filtering logic.

### Frontend — useInfiniteQuery

- **Hook migration**: `useNotes` switches from TanStack Query's `useQuery` to `useInfiniteQuery`. The query key stays `["notes", { category }]` so per-category caching still works automatically.
- **Paginated response type**: Add a generic `PaginatedResponse<T>` type with `next`, `previous`, and `results` fields. The `useNotes` hook returns pages of notes; consumers flatten them via `data.pages.flatMap(p => p.results)`.
- **`getNextPageParam`**: Extracts the `next` URL from the response. When `next` is `null`, TanStack Query sets `hasNextPage = false` and stops fetching.

### Frontend — Intersection Observer (Native)

- **Sentinel element**: A small invisible `<div>` rendered after the last note card in the grid. When it enters the viewport, the observer triggers `fetchNextPage()`.
- **Implementation**: Native `IntersectionObserver` API in a `useEffect` — no external library. The observer watches the sentinel, calls `fetchNextPage` when `isIntersecting` is true, and is guarded by `hasNextPage && !isFetchingNextPage` to prevent redundant fetches.
- **Cleanup**: The observer disconnects on unmount via the `useEffect` cleanup function.

### Frontend — Loading UX

- **Initial load**: The existing `NotesGridSkeleton` (6 skeleton cards) continues to show while the first page loads — no change.
- **Subsequent pages**: A smaller skeleton row (2-3 cards) appears at the bottom of the grid while the next page is being fetched. Reuses the same skeleton card styling for visual consistency.
- **End of list**: When `hasNextPage` is false, the sentinel and skeleton are not rendered. The grid simply ends.

### Frontend — Mutation Behavior

- **Create/edit a note**: Invalidate the `["notes"]` query (all category variants) and scroll the grid container to the top. The edited/created note will appear first due to `-updated_at` ordering.
- **Delete a note**: Same invalidation pattern. No scroll-to-top needed since the deleted note simply disappears.
- **Category invalidation**: Unchanged — creating, deleting, or reassigning notes still invalidates `["categories"]` to update note counts.

### API Client

- No changes needed to `api-client.ts`. The cursor pagination URLs returned by DRF are full absolute URLs, but `useInfiniteQuery`'s `queryFn` receives the `pageParam` (the `next` URL). The hook will need to call the full URL for subsequent pages rather than constructing a path.

## Testing Decisions

### Philosophy

Test the backend pagination contract thoroughly via TDD (the project's backend workflow). Frontend testing is deferred — the infinite scroll behavior is wiring (intersection observer + TanStack Query), not pure logic, and is better validated through manual testing or future E2E tests.

### Backend Tests (pytest + Django Test Client)

Three new tests following TDD red-green-refactor:

1. **Response shape**: Verify that `GET /api/notes/` returns `{ next, previous, results }` instead of a flat array.
2. **Page size**: Create 25 notes, verify the first page returns 20 results and `next` is not null.
3. **Cursor navigation**: Follow the `next` URL from the first page, verify it returns the remaining 5 results and `next` is null.

Additionally, update any existing tests that assert on the response being a flat `Note[]` — they now need to read from `.results`.

### What NOT to Test

- Intersection observer behavior — browser API, not business logic
- `useInfiniteQuery` page merging — trust TanStack Query
- Skeleton rendering — visual, no logic

## Out of Scope

- "Load More" button as an alternative to automatic infinite scroll
- Virtual scrolling / windowing (react-window, react-virtuoso) — premature for the current dataset size
- Server-side rendering of the first page — notes are behind auth, always client-rendered
- Pagination for categories — unnecessary given the small dataset
- Search or text-based filtering — separate feature
- Configurable page size (user preference) — over-engineering for now
- Pull-to-refresh on mobile — separate UX consideration

## Further Notes

- The existing `PRD-notes-list.md` explicitly listed "Pagination or infinite scroll" as out of scope. This PRD promotes it to an in-scope feature now that the notes list is built and the need is clearer.
- `CursorPagination` encodes the cursor as a base64 string in the URL query param. The frontend should treat cursor values as opaque — never parse or construct them manually.
- If a user has exactly 20 notes, the first page will return all of them with `next: null`. The experience is identical to the current unpaginated behavior — infinite scroll is invisible.
- The `select_related("category")` optimization on the queryset is unaffected by pagination — DRF paginates after the queryset is evaluated, so the join still applies.
