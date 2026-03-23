# PRD: Category Endpoints (CRUD)

## Problem Statement

The Category model exists with default categories, the Note model has a FK to Category, and a `pre_delete` signal handles note reassignment on category deletion. But there are no API endpoints for the frontend to list, create, update, or delete categories. Without these endpoints, the sidebar cannot display categories with note counts, and users cannot create or manage custom categories.

## Solution

Create a full CRUD API for categories using a DRF `ModelViewSet` + `DefaultRouter`:

1. **GET** `/api/categories/` — List the authenticated user's categories with note counts, ordered by creation date.
2. **POST** `/api/categories/` — Create a custom category (name + color required).
3. **GET** `/api/categories/{id}/` — Retrieve a single category.
4. **PUT** `/api/categories/{id}/` — Full update of a category's name and color.
5. **PATCH** `/api/categories/{id}/` — Partial update (change only name or only color).
6. **DELETE** `/api/categories/{id}/` — Delete a category (the existing `pre_delete` signal reassigns its notes to "Unassigned").

System categories (`is_system=True`, e.g. "Unassigned") are protected: update and delete return 403.

## User Stories

1. As a user, I want to see all my categories in the sidebar with note counts, so I know how many notes are in each category.
2. As a user, I want note counts to be accurate and reflect the real number of notes in each category, so I can trust the sidebar numbers.
3. As a user, I want my default categories (Random Thoughts, School, Personal) to appear first in the list, so I have a consistent starting point.
4. As a user, I want to create a custom category with a name and color, so I can organize notes beyond the 3 defaults.
5. As a user, I want to be prevented from creating a category with a duplicate name, so I don't get confused by identically named categories.
6. As a user, I want clear validation errors when I submit invalid data (missing name, bad color format), so I know what to fix.
7. As a user, I want to rename a category, so I can adapt my organization scheme over time.
8. As a user, I want to change a category's color, so I can customize the visual coding of my notes.
9. As a user, I want to update only one field at a time (just the name or just the color) without resending the other, so edits feel lightweight.
10. As a user, I want to delete a category I no longer need, so my sidebar stays clean.
11. As a user, I want my notes to survive category deletion (reassigned to "Unassigned"), so I never accidentally lose content.
12. As a user, I want the "Unassigned" system category to be protected from editing and deletion, so it always serves as a safety net for orphaned notes.
13. As a user, I should never see or access another user's categories, so my data stays private.
14. As an unauthenticated visitor, I should be rejected from all category endpoints, so the API is secure.
15. As a frontend developer, I want the `is_system` flag in the response, so I can conditionally hide edit/delete UI for system categories.
16. As a frontend developer, I want `note_count` computed server-side, so I don't need all notes loaded just to render the sidebar.

## Implementation Decisions

- **ViewSet pattern**: `ModelViewSet` + `DefaultRouter`. Categories are a textbook CRUD resource — a ViewSet eliminates boilerplate and provides standard RESTful URL routing. The auth endpoints used plain `APIView` because signup is a one-off action, not a CRUD resource.
- **Serializer type**: `ModelSerializer` — unlike the auth serializer (plain `Serializer`), categories map 1:1 to a model. Fields: `id`, `name`, `color`, `is_system`, `note_count`, `created_at`, `updated_at`. The `user` field is excluded from input — it's set via `perform_create` from `request.user`.
- **`note_count` field**: `IntegerField(read_only=True, default=0)` on the serializer, fed by a `Count("notes")` annotation on the queryset. Uses the `related_name="notes"` from the Note model's FK to Category.
- **`is_system` field**: Read-only in the serializer. The frontend uses it to decide whether to show edit/delete controls. Users cannot set this via the API.
- **Color validation**: Regex validator `^#[0-9A-Fa-f]{6}$` on the `color` serializer field. The model only enforces `max_length=7`, so the API boundary is where we validate format. This follows the project convention of validating at system boundaries.
- **Duplicate name validation**: Custom `validate_name` method that checks for existing categories with the same name for the current user. On update, it excludes the current instance to allow saving without changing the name. Returns a field-level error, consistent with DRF conventions.
- **Ownership scoping**: `get_queryset()` filters by `request.user`. A user literally cannot see or interact with another user's categories — accessing someone else's category ID returns 404 (not 403), preventing information leakage about resource existence.
- **System category protection**: `perform_update` and `perform_destroy` check `is_system` and raise `PermissionDenied` (403) if true. This is the endpoint-level validation that PRD 5 (Note Model) deferred to this PRD.
- **Delete behavior**: Calls `instance.delete()` and lets the existing `pre_delete` signal handle note reassignment to "Unassigned". No additional delete logic needed in the view.
- **Ordering**: `created_at` ascending on the queryset. Default categories (created on signup) appear first, custom categories appear after in creation order.
- **PATCH support**: Enabled by default via `ModelViewSet`. Allows partial updates (e.g., change only color). No extra configuration needed.
- **URL structure**: `apps/notes/urls.py` defines a `DefaultRouter` with the `CategoryViewSet` registered as `categories`. The root URLconf includes this at `api/` via `include("apps.notes.urls")`, giving us `/api/categories/`.
- **Permission class**: `IsAuthenticated` — rejects unauthenticated requests with 401.
- **HTTP status codes**: 200 (list, retrieve, update), 201 (create), 204 (delete), 400 (validation errors), 401 (unauthenticated), 403 (system category protection), 404 (not found / not owned).
- **Error format**: DRF defaults (field-level errors), consistent with auth endpoints.

## Testing Decisions

- **TDD required** — write all tests before implementation, following the red-green-refactor pattern established in PRDs 2-3.
- **Test external behavior only** — tests verify HTTP status codes, response payloads, and side effects (ownership, counts, system protection). No testing of internal view/serializer implementation details.
- **Separate test file**: `test_categories.py` in `apps/notes/`, following the auth pattern (`test_auth.py` in `apps/users/`). Model tests remain in `tests.py`.
- **Prior art**: `apps/users/test_auth.py` — same `pytest` + `@pytest.mark.django_db` pattern, `APIClient`, fixture-based setup, organized by endpoint.
- **19 test cases across 5 groups**:

  **List (5 tests):**
  1. Authenticated user gets their 3 default categories with `note_count=0` → 200
  2. `note_count` reflects actual notes (create a note, verify count=1)
  3. Does not include another user's categories
  4. Ordered by `created_at` ascending
  5. Unauthenticated request → 401

  **Create (6 tests):**
  6. Create with valid name + color → 201, correct user, `is_system=False`
  7. Duplicate name for same user → 400
  8. Missing name → 400
  9. Missing color → 400
  10. Invalid hex color (`#ZZZZZZ`) → 400
  11. Name exceeding 100 chars → 400

  **Retrieve (2 tests):**
  12. Retrieve own category → 200
  13. Retrieve another user's category → 404

  **Update (4 tests):**
  14. PUT update name + color → 200
  15. PATCH update only color → 200
  16. Update to duplicate name → 400
  17. Update system category → 403

  **Delete (2 tests):**
  18. Delete non-system category → 204
  19. Delete system category → 403

## Out of Scope

- Note CRUD endpoints (PRD 6)
- Category filtering of notes (PRD 6, query parameter on notes endpoint)
- Frontend category sidebar UI
- Drag-and-drop category reordering
- Category icons or emoji support
- Pagination on categories (unlikely to have enough categories to need it)
- Bulk category operations (delete multiple, update multiple)

## Further Notes

- The `is_system` flag was introduced in PRD 5 (Note Model) specifically for this PRD to use. The only system category is "Unassigned", which is created on-demand by the `pre_delete` signal when a category with notes is deleted.
- The 3 default categories (Random Thoughts, School, Personal) are NOT system categories — they have `is_system=False` and are fully editable and deletable.
- The `note_count` annotation uses `Count("notes")` which relies on the `related_name="notes"` defined on `Note.category` FK. If a category has no notes, the annotation returns 0.
- When the Note endpoints (PRD 6) are built, they will also be wired through `apps/notes/urls.py` using the same router.
