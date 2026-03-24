# PRD: Note Endpoints (CRUD) + Cleanup is_system/signal

## Problem Statement

The Note model exists (PRD 5) and Category CRUD endpoints are live (PRD 4), but there are no API endpoints for the frontend to create, list, edit, or delete notes. Without these endpoints, the main notes screen cannot display the 3-column grid of note cards, the editor cannot save changes, and auto-save has no backend to call. Additionally, the current `is_system` field and `pre_delete` signal (which reassign notes to an "Unassigned" category on deletion) add unnecessary complexity — the existing `SET_NULL` on the Note→Category FK already handles category deletion cleanly by setting `category=NULL`.

## Solution

**Part A — Cleanup:** Remove `is_system`, the `pre_delete` signal, and all "Unassigned" category logic. Category deletion now relies on `SET_NULL` (notes become uncategorized). Update product-specs section 2.6 to reflect this change.

**Part B — Note CRUD:** Create a full CRUD API for notes using a DRF `ModelViewSet` + `DefaultRouter`:

1. **GET** `/api/notes/` — List the authenticated user's notes (ordered by `-updated_at`), with optional category filter.
2. **POST** `/api/notes/` — Create a note (all fields optional for auto-save support).
3. **GET** `/api/notes/{id}/` — Retrieve a single note with nested category.
4. **PUT** `/api/notes/{id}/` — Full update of a note.
5. **PATCH** `/api/notes/{id}/` — Partial update (e.g., auto-save sends only `content`).
6. **DELETE** `/api/notes/{id}/` — Delete a note.

Category filtering: `?category=<id>` returns notes in that category; `?category=none` returns uncategorized notes.

## User Stories

1. As a user, I want to see all my notes as preview cards sorted by last edited, so I can find my most recent work quickly.
2. As a user, I want to create a new note by clicking "+ New Note", so I can start writing immediately.
3. As a user, I want new notes to be created with empty title and content, so the auto-save flow works (create first, type later).
4. As a user, I want to assign a category when creating a note, so it appears under the right category in the sidebar.
5. As a user, I want to create a note without a category, so I can categorize it later.
6. As a user, I want to open a note and see its full title, content, and category, so I can read and edit it.
7. As a user, I want to edit a note's title and content with changes auto-saved, so I never lose my work.
8. As a user, I want to change a note's category via the editor dropdown, so I can reorganize my notes.
9. As a user, I want to remove a note's category (set to null), so I can uncategorize it.
10. As a user, I want to delete a note I no longer need, so my notes list stays clean.
11. As a user, I want to filter notes by clicking a category in the sidebar, so I see only relevant notes.
12. As a user, I want to see uncategorized notes when filtering by "no category", so I can find notes that lost their category after deletion.
13. As a user, I want clear validation errors when I submit invalid data (e.g., a category that doesn't exist or belongs to another user), so I know what to fix.
14. As a user, I want each note's response to include the category name and color (not just an ID), so the frontend can render colored chips without extra API calls.
15. As a user, I should never see or access another user's notes, so my data stays private.
16. As an unauthenticated visitor, I should be rejected from all note endpoints, so the API is secure.
17. As a user, when I delete a category, I want my notes to become uncategorized (not deleted), so I never lose content.
18. As a user, I want all categories (including the 3 defaults) to be fully editable and deletable, so I have full control.

## Implementation Decisions

- **Cleanup — Remove `is_system` and signal**: The `is_system` BooleanField on Category, the `pre_delete` signal in `signals.py`, the signal wiring in `apps.py`, and all `is_system` protection logic in the CategoryViewSet are removed. Category deletion relies on the existing `SET_NULL` on `Note.category`. Notes whose category is deleted become uncategorized (`category=NULL`). A migration is generated to remove the `is_system` column. The product-specs section 2.6 is updated to reflect this simpler behavior.
- **ViewSet pattern**: `ModelViewSet` + `DefaultRouter`, matching the Category endpoints pattern. Notes are registered as `"notes"` on the same router in `apps/notes/urls.py`, giving us `/api/notes/` and `/api/notes/{id}/`.
- **Serializer — nested category in reads**: Responses include `category` as a nested object `{id, name, color}` using a `CategoryMinimalSerializer`. Writes accept a plain integer ID via `PrimaryKeyRelatedField`. The serializer uses `to_representation()` to swap the PK for the nested object in responses.
- **Serializer fields**: Read: `id`, `title`, `content`, `category` (nested), `created_at`, `updated_at`. Write: `title`, `content`, `category` (PK, optional, nullable). The `user` field is excluded — set via `perform_create`.
- **Validation — category ownership**: `validate_category()` ensures the category belongs to `request.user`. Returns 400 if the category is owned by another user.
- **Validation — content length**: `validate_content()` enforces a maximum of 300,000 characters. Returns 400 if exceeded.
- **Empty note creation**: All fields are optional with model defaults (`title=""`, `content=""`, `category=NULL`). `POST /api/notes/ {}` creates a valid empty note — this supports the auto-save UX where the note is created on click and fields are filled in via PATCH.
- **Category filter**: `get_queryset()` checks `request.query_params["category"]`. If `"none"`, filters for `category__isnull=True`. If an integer, validates it exists and belongs to the user (400 if invalid). If not present, returns all notes.
- **Ordering**: Fixed `-updated_at` from the model's `Meta.ordering`. No configurable ordering via query params.
- **No pagination**: Consistent with Category endpoints. Volume doesn't justify it yet.
- **Content in list**: Full content returned in list endpoint (not truncated). Note content is plain text and typically not large enough to warrant server-side truncation.
- **`select_related("category")`**: On the queryset to avoid N+1 when serializing nested category objects.
- **HTTP status codes**: 200 (list, retrieve, update), 201 (create), 204 (delete), 400 (validation/filter errors), 401 (unauthenticated), 404 (not found / not owned).
- **Ownership scoping**: `get_queryset()` filters by `request.user`. Another user's note ID returns 404 (not 403).
- **Auto-save from frontend**: Uses the standard PATCH endpoint with partial fields (e.g., `{"content": "..."}` or `{"title": "..."}`). No special auto-save endpoint needed.

## Testing Decisions

- **TDD required** — Write all tests before implementation, following the red-green-refactor pattern.
- **Test external behavior only** — Tests verify HTTP status codes, response shapes, and side effects. No testing of internal serializer/view logic.
- **Separate test file**: `test_note_endpoints.py` in `apps/notes/`, following the pattern of `test_category_endpoints.py`.
- **Prior art**: `apps/notes/test_category_endpoints.py` — same fixtures (`api_client`, `user`, `other_user`, `auth_client`), same `@pytest.mark.django_db` class pattern, same assertion style.
- **Cleanup tests**: Update `test_category_endpoints.py` to remove `is_system` tests (system category protection for update/delete). Update `tests.py` to remove signal and `is_system` model tests.
- **~20 test cases across 6 groups**:

  **List (6 tests):**
  1. List returns user's notes with nested category — 200
  2. List ordered by `-updated_at` descending
  3. List excludes other user's notes
  4. Filter by `?category=<id>` returns matching notes
  5. Filter by `?category=none` returns uncategorized notes
  6. Filter by invalid/other user's category — 400

  **Auth (1 test):**
  7. Unauthenticated request — 401

  **Create (5 tests):**
  8. Create note with category — 201, response includes nested category
  9. Create note without category — 201, `category=null`
  10. Create empty note (empty body `{}`) — 201 (auto-save support)
  11. Create with other user's category — 400
  12. Create with content exceeding 300,000 chars — 400

  **Retrieve (2 tests):**
  13. Retrieve own note — 200, full content + nested category
  14. Retrieve other user's note — 404

  **Update (4 tests):**
  15. PUT full update — 200
  16. PATCH partial update (content only) — 200
  17. PATCH change category — 200, new category in response
  18. Update with other user's category — 400

  **Delete (2 tests):**
  19. Delete own note — 204
  20. Delete other user's note — 404

## Out of Scope

- Search/full-text search on notes (`?search=<term>`)
- Pagination (will add when volume justifies it)
- Bulk operations (delete multiple, move multiple)
- Note sharing between users
- Rich text / markdown content
- Voice-to-text transcription endpoint
- Frontend integration (FE PRDs 3-5)
- Configurable ordering via query params

## Further Notes

- **Breaking change to Category API**: Removing `is_system` means the `is_system` field disappears from Category responses and the 403 protection on system categories is removed. Since the frontend isn't built yet, this has no impact.
- **Product-specs update**: Section 2.6 will be updated to say "notes become uncategorized" instead of "reassigned to Unassigned".
- The `note_count` annotation on CategoryViewSet already works correctly — it counts notes via `related_name="notes"` on the FK. Deleting a category and having notes go to `NULL` means those notes simply don't count toward any category.
- The filter `?category=none` uses `category__isnull=True`, which is a standard Django ORM lookup.
