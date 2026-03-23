# Issue: Implement Category Model + Default Categories

## Parent PRD

[category-model.md](./category-model.md)

## What to build

Implement the Category model and a `post_save` signal that creates 3 default categories for every new user. This is a single end-to-end slice that delivers:

1. **Constant**: `DEFAULT_CATEGORIES` with 3 tuples — `("Random Thoughts", "#FFD4B2")`, `("School", "#FFF3BF")`, `("Personal", "#B2F2E5")`.
2. **Model**: `Category` with fields `user` (FK), `name` (max 100), `color` (max 7), `created_at`, `updated_at`, and a `UniqueConstraint` on `(user, name)`.
3. **Signal**: `post_save` on User in `signals.py` — creates defaults only when `created=True`.
4. **App wiring**: `NotesConfig.ready()` imports `signals.py`.
5. **Admin**: Register `Category` in Django admin.
6. **Tests (TDD — written first)**: 5 test cases covering model, signal, and constraint.

## Acceptance criteria

- [x] `DEFAULT_CATEGORIES` constant defined in `apps/notes/models.py` with 3 tuples
- [x] `Category` model with fields: `user` (FK, CASCADE), `name` (max 100), `color` (max 7), `created_at`, `updated_at`
- [x] `UniqueConstraint` on `(user, name)` named `unique_category_per_user`
- [x] `__str__` returns category name
- [x] `post_save` signal in `apps/notes/signals.py` creates 3 default categories on user creation
- [x] Signal does NOT create categories on user update
- [x] Signal wired via `NotesConfig.ready()` in `apps.py`
- [x] `Category` registered in Django admin
- [x] Migration generated and applied
- [x] All 5 tests pass (`pytest`)
- [x] `ruff check backend/` passes clean

## Blocked by

PRD 2 (Auth Endpoints) — **already complete**.

## User stories addressed

- User story 1: Default categories ready on signup
- User story 2: Categories have name and color
- User story 3: No duplicate category names per user
