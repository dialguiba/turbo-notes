# PRD: Note Model + Category Deletion Safety

## Problem Statement

The Category model and auth endpoints exist, but there is no Note model — the core entity of the application. Users cannot create, store, or organize notes. Additionally, there is no protection for notes when a category is deleted — without safeguards, deleting a category could orphan or destroy a user's notes.

## Solution

Create the Note model in `apps.notes` with fields for title, content, category, and timestamps. Add a `pre_delete` signal on Category that automatically reassigns orphaned notes to a protected "Unassigned" category. Extend the Category model with an `is_system` flag to mark "Unassigned" as non-editable and non-deletable.

## User Stories

1. As a user, I want to create a note so that I can capture my thoughts.
2. As a user, I want each note to have a title and content body so that I can structure my writing.
3. As a user, I want notes to be created empty (blank title and content) so that I can start typing immediately after clicking "+ New Note" without any save friction.
4. As a user, I want each note to belong to a category so that my notes are color-coded and organized.
5. As a user, I want notes sorted by last-edited date (most recent first) so that I can quickly find what I was working on.
6. As a user, I want a "Last Edited" timestamp that auto-updates on every edit so that I know when I last touched a note.
7. As a user, I want my notes to be deleted when I delete my account so that my data doesn't persist after I leave.
8. As a user, I want my notes to survive if I delete a category — they should be reassigned to an "Unassigned" category rather than lost.
9. As a user, I want the "Unassigned" category to be created automatically only when needed (not cluttering my sidebar by default).
10. As a user, I want the "Unassigned" category to be protected (not editable or deletable) so that it always serves as a safety net for orphaned notes.
11. As a user, I want to delete an empty category without any side effects — no phantom "Unassigned" category should appear.

## Implementation Decisions

- **Note model fields**: `user` (FK to User, CASCADE), `title` (CharField max 255, blank, default ""), `content` (TextField, blank, default ""), `category` (FK to Category, SET_NULL, null, blank), `created_at` (auto_now_add), `updated_at` (auto_now).
- **Blank defaults for title/content**: Notes are auto-created on "+ New Note" click — they start empty and the user fills them in. No explicit save action.
- **category FK with SET_NULL**: Safety net. If the `pre_delete` signal fails for any reason, the note survives with `category=None` instead of being deleted. In normal operation, the signal reassigns before deletion so SET_NULL never fires.
- **`__str__` returns `self.title or "Untitled"`**: Since notes can be blank, this provides a readable representation in Django admin.
- **`Meta.ordering = ["-updated_at"]`**: Matches product spec requirement ("sorted by last edited descending"). Applied at model level since this is the canonical sort order for notes everywhere.
- **`related_name="notes"`**: On both the user FK and category FK, allowing `user.notes.all()` and `category.notes.all()`.
- **`is_system` field on Category**: New `BooleanField(default=False)`. Only "Unassigned" gets `is_system=True`. The 3 default categories (Random Thoughts, School, Personal) remain `is_system=False` — they are editable and deletable. Endpoint-level validation (PRD 4) will use this flag to reject DELETE/PATCH on system categories.
- **`pre_delete` signal on Category**: When a category is about to be deleted, the signal checks if it has notes. If yes, it creates or retrieves an "Unassigned" category (`get_or_create` with `is_system=True`, color `#D1D5DB`) for that user and reassigns the notes. If the category has no notes, nothing happens. If the category itself is a system category, the signal returns early (defense-in-depth).
- **Signal location**: In `apps/notes/signals.py` alongside the existing `post_save` signal for default categories. Wired via `NotesConfig.ready()`.
- **Django admin**: Register `Note` with `list_display`, `list_filter`, `search_fields` for development debugging. Update existing `CategoryAdmin` to show `is_system`.
- **Product specs update**: Add section 2.6 documenting category deletion behavior and the "Unassigned" category.

## Testing Decisions

- **TDD required** — write all tests before implementation, following the red-green-refactor pattern established in PRDs 2-3.
- **Test external behavior only** — tests verify model fields, queryset ordering, FK cascade/set_null behavior, and signal side effects. No testing of internal implementation details.
- **Prior art**: `TestCategoryModel` in `apps/notes/tests.py` — same pytest + `@pytest.mark.django_db` pattern, same `_create_user` helper.
- **9 test cases across 3 groups**:

  **Note model (5 tests):**
  1. Create note with all fields + verify `__str__` returns title or "Untitled"
  2. Title and content default to blank — create note with only user+category
  3. Deleting user cascades to delete notes
  4. Ordering: `-updated_at` — two notes, most recent comes first
  5. Category SET_NULL safety net — disconnect signal, delete category, verify note.category is None

  **pre_delete signal + Unassigned (3 tests):**
  6. Deleting a category with notes reassigns them to "Unassigned" (#D1D5DB)
  7. The "Unassigned" category is created with `is_system=True`
  8. Deleting a category without notes does NOT create "Unassigned"

  **is_system field (1 test):**
  9. `is_system` defaults to False on regular categories

## Out of Scope

- Note CRUD endpoints (PRD 6)
- Category CRUD endpoints (PRD 4) — `is_system` validation at API level belongs there
- Auto-save behavior (frontend concern)
- Default category assignment on note creation (API-level logic, PRD 6)
- Color validation for categories (PRD 4, serializer level)
- Frontend display of "Unassigned" category
- Voice-to-text functionality

## Further Notes

- The `is_system` field is a forward-looking addition. It has no behavioral impact until PRD 4 implements endpoint-level validation (`if category.is_system: return 403`).
- If a user manually creates a category named "Unassigned" before deleting any category, `get_or_create` will reuse it rather than creating a duplicate. This is acceptable behavior.
- The existing `test_default_categories_created_on_signup` test (PRD 3) is NOT affected — it checks `len(DEFAULT_CATEGORIES) == 3`, and "Unassigned" is not a default category.
