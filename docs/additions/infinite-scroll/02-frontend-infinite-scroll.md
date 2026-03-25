# Frontend infinite scroll with skeleton loading

## Parent PRD

[PRD-infinite-scroll.md](PRD-infinite-scroll.md)

## What to build

Migrate the notes grid from loading all notes at once to infinite scroll. The `useNotes` hook switches from `useQuery` to `useInfiniteQuery`, consuming the new paginated API response. A sentinel element at the bottom of the grid uses the native `IntersectionObserver` API to trigger `fetchNextPage()` automatically. A partial skeleton (2-3 cards) shows while the next page loads. When a note is created or edited, the query is invalidated and the grid scrolls to the top.

## Acceptance criteria

- [x] Add a generic `PaginatedResponse<T>` type with `next`, `previous`, and `results` fields
- [x] `useNotes` hook uses `useInfiniteQuery` with `getNextPageParam` extracting the `next` URL
- [x] Notes grid renders `data.pages.flatMap(p => p.results)` instead of a flat array
- [x] An invisible sentinel `<div>` after the last card triggers `fetchNextPage()` via native `IntersectionObserver`
- [x] Fetching is guarded by `hasNextPage && !isFetchingNextPage`
- [x] A partial skeleton row (2-3 cards) appears at the bottom while loading the next page
- [x] No sentinel or skeleton renders when `hasNextPage` is false
- [x] Initial load still shows the existing full `NotesGridSkeleton` (6 cards)
- [x] Creating a note invalidates the notes query and scrolls the grid to the top
- [x] Editing a note invalidates the notes query and scrolls the grid to the top
- [x] Switching categories starts fresh from page 1 (existing query key behavior)
- [x] Users with fewer than 20 notes see no change in behavior
- [x] Observer disconnects on component unmount (no memory leaks)

## Blocked by

- Blocked by [01-backend-cursor-pagination.md](01-backend-cursor-pagination.md)

## User stories addressed

- User story 2: automatic loading on scroll
- User story 3: skeleton feedback while loading
- User story 4: scrolling stops when all notes are loaded
- User story 5: infinite scroll works within filtered category
- User story 6: list refreshes from top after creating a note
- User story 7: list refreshes from top after editing a note
- User story 9: category switch starts fresh from top
- User story 10: invisible when fewer than 20 notes
