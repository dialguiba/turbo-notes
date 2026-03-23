# Slice 2: Note CRUD — Create, Retrieve, Update, Delete

## Parent PRD

[PRD-note-endpoints.md](PRD-note-endpoints.md)

## What to build

Implement the core Note CRUD endpoints: create, retrieve, full update (PUT), partial update (PATCH), delete, and basic list (without category filter). The serializer returns a nested category object `{id, name, color}` in responses but accepts a plain ID for writes. All fields are optional on create to support the auto-save flow. Category ownership validation and content length validation (300K chars) are enforced.

See PRD "Implementation Decisions" for serializer, viewset, and validation details.

## Acceptance criteria

- [x] `NoteSerializer` created with nested `CategoryMinimalSerializer` for read, `PrimaryKeyRelatedField` for write
- [x] `to_representation()` swaps category PK for nested object in responses
- [x] `validate_category()` ensures category belongs to `request.user` (400 if not)
- [x] `validate_content()` enforces max 300,000 characters (400 if exceeded)
- [x] `NoteViewSet` created with `ModelViewSet`, `IsAuthenticated`, `get_queryset` filtered by user
- [x] `select_related("category")` on queryset to avoid N+1
- [x] `perform_create` sets `user=request.user`
- [x] Notes registered as `"notes"` on the existing router in `urls.py`
- [x] `POST /api/notes/` with empty body `{}` creates valid note (title="", content="", category=null) — 201
- [x] `POST /api/notes/` with category returns nested category in response — 201
- [x] `POST /api/notes/` without category returns `category: null` — 201
- [x] `POST /api/notes/` with other user's category — 400
- [x] `POST /api/notes/` with content > 300K chars — 400
- [x] `GET /api/notes/{id}/` returns own note with nested category — 200
- [x] `GET /api/notes/{id}/` for other user's note — 404
- [x] `PUT /api/notes/{id}/` full update — 200
- [x] `PATCH /api/notes/{id}/` partial update (content only) — 200
- [x] `PATCH /api/notes/{id}/` change category — 200, new nested category in response
- [x] `PATCH /api/notes/{id}/` with other user's category — 400
- [x] `DELETE /api/notes/{id}/` own note — 204
- [x] `DELETE /api/notes/{id}/` other user's note — 404
- [x] Unauthenticated request to any endpoint — 401
- [x] `GET /api/notes/` returns user's notes ordered by `-updated_at` — 200
- [x] `GET /api/notes/` excludes other user's notes
- [x] All tests pass (`python manage.py test`)
- [x] `ruff check .` passes clean

## Blocked by

- Blocked by Slice 1 (Cleanup is_system/signal) — CategorySerializer no longer has `is_system`, and serializer imports may shift.

## User stories addressed

- User story 1: see all notes sorted by last edited
- User story 2: create a new note
- User story 3: empty note creation for auto-save
- User story 4: assign category when creating
- User story 5: create without category
- User story 6: open and see full note
- User story 7: edit with auto-save (PATCH)
- User story 8: change category
- User story 9: remove category (set null)
- User story 10: delete a note
- User story 13: validation errors
- User story 14: nested category in response
- User story 15: data privacy (other user's notes)
- User story 16: authentication required
