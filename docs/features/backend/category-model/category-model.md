# PRD: Category Model + Default Categories

## Problem Statement

The custom User model and auth endpoints exist, but there's no way to organize notes by category. The product spec requires 3 default categories created automatically for every new user, and the Note model (PRD 5) depends on Category as a foreign key. Without the Category model, neither notes nor category endpoints can be built.

## Solution

Create the Category model in `apps.notes` and a `post_save` signal on User that automatically creates 3 default categories (Random Thoughts, School, Personal) whenever a new user is created.

## User Stories

1. As a new user, I want to have 3 default categories ready when I sign up, so I can start organizing notes immediately.
2. As a user, I want each category to have a name and color, so I can visually distinguish between them.
3. As a user, I shouldn't be able to have two categories with the same name, so I don't get confused.

## Implementation Decisions

- **Model location**: `apps/notes/models.py` — categories are part of the notes domain, not the users domain.
- **Fields**: `user` (FK to User), `name` (CharField, max 100), `color` (CharField, max 7 for `#RRGGBB`), `created_at`, `updated_at`. Primary key is `BigAutoField` (Django default), matching the `id: number` type on the frontend.
- **Unique constraint**: `UniqueConstraint(fields=["user", "name"])` — prevents duplicate category names per user while allowing different users to have identically named categories.
- **No `is_default` flag**: The product spec doesn't require distinguishing default from custom categories. Users can edit name and color of any category equally. If needed later, a migration can add it.
- **No color validation**: PRD 3 only creates categories via our own hardcoded constant. Validation of user-supplied colors belongs in the serializer (PRD 4) at the API boundary.
- **No `Meta.ordering`**: The model shouldn't dictate presentation order. The API view (PRD 4) decides ordering.
- **Default categories constant**: `DEFAULT_CATEGORIES` list of `(name, color)` tuples defined in `models.py`, close to the model it relates to.
- **Signal approach**: `post_save` on User with `if created` guard. This ensures defaults are created regardless of how the user is created (signup, `createsuperuser`, admin, tests). Signal lives in `apps/notes/signals.py`, wired via `NotesConfig.ready()`.
- **Cascade delete**: `on_delete=CASCADE` — deleting a user deletes their categories. This is the only sensible behavior for per-user data.

## Testing Decisions

- **TDD required** — write tests before implementation.
- **5 test cases**:
  1. Category creation + `__str__` returns name
  2. User creation triggers 3 default categories with exact names and colors matching `DEFAULT_CATEGORIES`
  3. Signal doesn't create additional categories on user update (guards `if created`)
  4. Unique constraint: two categories with same name + same user → `IntegrityError`
  5. Same category name allowed for different users
- **Test framework**: `pytest` + Django test client.

## Out of Scope

- Category CRUD endpoints (PRD 4)
- Color validation (PRD 4, at serializer level)
- Note model (PRD 5)
- Frontend category UI
