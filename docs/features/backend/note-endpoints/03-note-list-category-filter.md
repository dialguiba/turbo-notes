# Slice 3: Note List — Category Filter

## Parent PRD

[PRD-note-endpoints.md](PRD-note-endpoints.md)

## What to build

Add category filtering to the existing `GET /api/notes/` list endpoint. Support `?category=<id>` to filter by a specific category and `?category=none` to filter uncategorized notes. Invalid or other user's category IDs return 400 with a descriptive error.

See PRD "Implementation Decisions → Category filter" for query param handling details.

## Acceptance criteria

- [x] `GET /api/notes/?category=<id>` returns only notes in that category — 200
- [x] `GET /api/notes/?category=none` returns only notes with `category=NULL` — 200
- [x] `GET /api/notes/?category=999` (non-existent) returns 400 with error message
- [x] `GET /api/notes/?category=<other_user_cat_id>` returns 400 (not 404, to avoid leaking info about valid param format)
- [x] `GET /api/notes/?category=abc` (non-integer, non-"none") returns 400
- [x] `GET /api/notes/` without category param still returns all notes (no regression)
- [x] All tests pass (`python manage.py test`)
- [x] `ruff check .` passes clean

## Blocked by

- Blocked by Slice 2 (Note CRUD) — the list endpoint and NoteViewSet must exist first.

## User stories addressed

- User story 11: filter notes by category
- User story 12: see uncategorized notes
