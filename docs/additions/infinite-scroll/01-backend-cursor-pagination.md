# Backend cursor pagination for notes

## Parent PRD

[PRD-infinite-scroll.md](PRD-infinite-scroll.md)

## What to build

Add cursor-based pagination to the notes list endpoint so it returns notes in pages of 20 instead of all at once. The response shape changes from a flat `Note[]` to `{ next, previous, results }` using DRF's `CursorPagination` with `-updated_at` ordering. Only `NoteViewSet` is paginated — `CategoryViewSet` remains unpaginated. Category filtering (`?category=<id>`) continues to work on top of the paginated queryset with no changes to filtering logic.

Follow TDD: write the tests first, then implement, then fix any existing tests that break due to the response shape change.

## Acceptance criteria

- [x] `NoteViewSet` uses a custom `CursorPagination` subclass with `page_size = 20` and `ordering = "-updated_at"`
- [x] `GET /api/notes/` returns `{ next, previous, results }` instead of a flat array
- [x] First page returns at most 20 notes; `next` is a valid cursor URL when more exist
- [x] Following the `next` URL returns the next page of results
- [x] `next` is `null` on the last page
- [x] `CategoryViewSet` remains unpaginated (no `pagination_class`)
- [x] Category filtering (`?category=<id>`, `?category=none`) works correctly with pagination
- [x] Test: response shape validates `next`, `previous`, `results` keys
- [x] Test: creating 25 notes yields 20 in first page with non-null `next`
- [x] Test: following `next` cursor returns remaining 5 notes with `next` as null
- [x] All existing notes endpoint tests updated to account for the new response shape

## Blocked by

None — can start immediately.

## User stories addressed

- User story 1: first batch loads quickly
- User story 5: pagination respects category filter
- User story 8: smaller payload on slow connections
- User story 10: fewer than 20 notes behaves identically to before
