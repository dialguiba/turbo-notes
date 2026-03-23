# Slice 1: Cleanup — Remove is_system, signal, and Unassigned

## Parent PRD

[PRD-note-endpoints.md](PRD-note-endpoints.md)

## What to build

Remove the `is_system` field from Category, delete the `pre_delete` signal that reassigned notes to "Unassigned", and remove all related protection logic from the CategoryViewSet. Category deletion now relies solely on `SET_NULL` on the Note→Category FK — notes whose category is deleted become uncategorized (`category=NULL`). Update product-specs section 2.6 and existing tests accordingly.

See PRD "Implementation Decisions → Cleanup" and "Part A" of the Solution.

## Acceptance criteria

- [x] `is_system` BooleanField removed from Category model
- [x] Migration generated and applied to remove `is_system` column
- [x] `pre_delete` signal (`reassign_notes_on_category_delete`) removed from `signals.py`
- [x] `post_save` signal for default categories retained in `signals.py` (still needed)
- [x] `perform_update` in CategoryViewSet no longer checks `is_system` — all categories are editable
- [x] `perform_destroy` in CategoryViewSet no longer checks `is_system` — all categories are deletable
- [x] `is_system` removed from CategorySerializer fields and read_only_fields
- [x] `is_system` removed from Category admin list_display/list_filter
- [x] Tests updated: `is_system` and signal tests removed from `tests.py`
- [x] Tests updated: system category protection tests removed from `test_category_endpoints.py` (update 403, delete 403, create ignores is_system)
- [x] Product-specs section 2.6 updated: "notes become uncategorized" instead of "reassigned to Unassigned"
- [x] All remaining tests pass (`python manage.py test`)
- [x] `ruff check .` passes clean

## Blocked by

None — can start immediately.

## User stories addressed

- User story 17: notes become uncategorized on category deletion
- User story 18: all categories fully editable and deletable
