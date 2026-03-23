# Issue: Implement Note Model + Category Deletion Safety

## Parent PRD

[note-model.md](./note-model.md)

## What to build

Implement the Note model and category deletion safety net. This is a single end-to-end slice that delivers:

1. **Category field**: Add `is_system = BooleanField(default=False)` to existing `Category` model — marks "Unassigned" as protected.
2. **Model**: `Note` with fields `user` (FK, CASCADE), `title` (max 255, blank), `content` (TextField, blank), `category` (FK, SET_NULL, nullable), `created_at`, `updated_at`. Ordering by `-updated_at`. `__str__` returns `self.title or "Untitled"`.
3. **Signal**: `pre_delete` on Category in `signals.py` — reassigns orphaned notes to an "Unassigned" category (`#D1D5DB`, `is_system=True`) created on-demand via `get_or_create`. Does nothing if category has no notes.
4. **Admin**: Register `Note` with `list_display`, `list_filter`, `search_fields`. Update `CategoryAdmin` to show `is_system`.
5. **Docs**: Add section 2.6 (Deleting Categories) to `product-specs.md`.
6. **Tests (TDD — written first)**: 9 test cases covering model, signal, and `is_system` field.

## Acceptance criteria

- [x] `is_system = BooleanField(default=False)` added to `Category` model
- [x] `Note` model with fields: `user` (FK, CASCADE), `title` (max 255, blank, default ""), `content` (TextField, blank, default ""), `category` (FK, SET_NULL, null, blank), `created_at`, `updated_at`
- [x] `related_name="notes"` on both `user` and `category` FKs
- [x] `Meta.ordering = ["-updated_at"]`
- [x] `__str__` returns `self.title or "Untitled"`
- [x] `pre_delete` signal reassigns notes to "Unassigned" (`#D1D5DB`, `is_system=True`) when deleting a category with notes
- [x] Signal does NOT create "Unassigned" when deleting a category without notes
- [x] Signal returns early if category `is_system=True` (defense-in-depth)
- [x] Signal skips reassignment during user CASCADE (uses Django `origin` kwarg)
- [x] `Note` registered in Django admin with `list_display = ["title", "user", "category", "updated_at"]`
- [x] `CategoryAdmin` updated to show `is_system`
- [x] Section 2.6 added to `product-specs.md` documenting category deletion behavior
- [x] Migration generated and applied
- [x] All 9 tests pass (`pytest`)
- [x] Existing 5 Category tests still pass (6 with new `is_system` test)
- [x] `ruff check backend/` passes clean

## Blocked by

PRD 3 (Category Model) — **already complete**.

## User stories addressed

- User story 1: Create a note
- User story 2: Note has title and content
- User story 3: Notes created empty (blank defaults)
- User story 4: Note belongs to a category
- User story 5: Notes sorted by last-edited descending
- User story 6: Last Edited timestamp auto-updates
- User story 7: Notes deleted when user is deleted (CASCADE)
- User story 8: Notes survive category deletion (reassigned to "Unassigned")
- User story 9: "Unassigned" created only when needed
- User story 10: "Unassigned" is protected (is_system=True)
- User story 11: Deleting empty category has no side effects
