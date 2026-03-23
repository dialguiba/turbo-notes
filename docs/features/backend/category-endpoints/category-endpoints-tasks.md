# Issue: Implement Category CRUD Endpoints

## Parent PRD

[category-endpoints.md](./category-endpoints.md)

## What to build

Implement a full CRUD API for categories using a DRF `ModelViewSet` + `DefaultRouter`. This is a single end-to-end slice that delivers:

1. **Serializer**: `CategorySerializer` (`ModelSerializer`) with `note_count` (annotated), `is_system` (read-only), hex color validation (`^#[0-9A-Fa-f]{6}$`), and duplicate name validation per user.
2. **ViewSet**: `CategoryViewSet` with `IsAuthenticated` permission, queryset scoped to `request.user`, `note_count` annotation via `Count("notes")`, `created_at` ascending ordering, and `is_system` protection on update/delete (403).
3. **URLs**: `apps/notes/urls.py` with `DefaultRouter` registering the ViewSet as `categories`.
4. **Root URLs**: Include notes URLs in `config/urls.py` under `api/`.
5. **Tests (TDD — written first)**: 19 test cases covering list, create, retrieve, update, delete, ownership, validation, and system category protection.

## Acceptance criteria

- [x] `CategorySerializer` with fields: `id`, `name`, `color`, `is_system`, `note_count`, `created_at`, `updated_at`
- [x] `is_system`, `id`, `created_at`, `updated_at` are read-only
- [x] `note_count` computed via `Count("notes")` annotation on queryset
- [x] `color` validated with regex `^#[0-9A-Fa-f]{6}$`
- [x] `name` validated for uniqueness per user (excludes self on update)
- [x] `CategoryViewSet` with `IsAuthenticated` permission
- [x] `get_queryset()` scopes to `request.user` (other users' categories return 404)
- [x] `perform_create()` sets `user=request.user`
- [x] `perform_update()` raises 403 if `is_system=True`
- [x] `perform_destroy()` raises 403 if `is_system=True`
- [x] Categories ordered by `created_at` ascending
- [x] GET `/api/categories/` → 200, returns user's categories with `note_count`
- [x] POST `/api/categories/` with valid name + color → 201, `is_system=False`
- [x] POST `/api/categories/` with duplicate name → 400
- [x] POST `/api/categories/` with invalid hex color → 400
- [x] POST `/api/categories/` with missing fields → 400
- [x] GET `/api/categories/{id}/` own category → 200
- [x] GET `/api/categories/{id}/` other user's category → 404
- [x] PUT `/api/categories/{id}/` → 200, updates name + color
- [x] PATCH `/api/categories/{id}/` → 200, partial update works
- [x] PUT/PATCH on system category → 403
- [x] DELETE `/api/categories/{id}/` non-system → 204
- [x] DELETE `/api/categories/{id}/` system → 403
- [x] Unauthenticated requests → 401
- [x] URLs wired: `config/urls.py` includes `apps.notes.urls` at `api/`
- [x] All 19 tests pass (`pytest`)
- [x] `ruff check backend/` passes clean

## Blocked by

PRDs 1-3 and 5 (User Model, Auth Endpoints, Category Model, Note Model) — **all complete**.

## User stories addressed

- User story 1: See all categories with note counts
- User story 2: Accurate note counts
- User story 3: Default categories appear first (ordered by `created_at`)
- User story 4: Create custom categories
- User story 5: Prevent duplicate names
- User story 6: Clear validation errors
- User story 7: Rename categories
- User story 8: Change category color
- User story 9: Partial updates (PATCH)
- User story 10: Delete categories
- User story 11: Notes survive deletion (signal handles reassignment)
- User story 12: System categories protected
- User story 13: Ownership isolation
- User story 14: Authentication required
- User story 15: `is_system` flag in response
- User story 16: Server-side `note_count`
