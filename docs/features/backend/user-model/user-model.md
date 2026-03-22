# PRD: Custom User Model

## Problem Statement

The app needs email-based authentication but Django's default User model authenticates via username. No custom user model exists yet, and all model files are empty stubs. This must be implemented first — before migrations are run — because Django makes it extremely difficult to swap the user model after the initial migration.

## Solution

Create a custom User model using `AbstractBaseUser` + `PermissionsMixin` with email as the sole identifier. Include a custom manager for user creation with full email normalization, and register the model in Django admin with proper forms.

## User Stories

1. As a developer, I want a custom User model with email as the primary identifier, so that the app uses email-based auth as required by the product specs.
2. As a developer, I want `create_user()` to require both email and password, so that passwordless accounts can't be created accidentally.
3. As a developer, I want `create_superuser()` to enforce `is_staff=True` and `is_superuser=True`, so that admin access is always properly configured.
4. As a developer, I want full email normalization (lowercase + strip), so that `Diego@Gmail.com` and `diego@gmail.com` can't create duplicate accounts.
5. As a developer, I want the User model registered in Django admin with custom forms, so that I can manage users during development.
6. As a developer, I want `AUTH_USER_MODEL` set before any migrations run, so that Django's auth system points to our custom model from the start.
7. As a developer, I want a clean model with no unused fields (no username, first_name, last_name), so that the data layer matches the product requirements exactly.

## Implementation Decisions

- **Base class**: `AbstractBaseUser` + `PermissionsMixin` (not `AbstractUser`) — full control over fields, no dead weight from unused username/first_name/last_name.
- **Fields**: email (unique, `USERNAME_FIELD`), password (inherited from `AbstractBaseUser`), is_active, is_staff, is_superuser (via `PermissionsMixin`), date_joined.
- **Primary key**: BigAutoField (Django default via `DEFAULT_AUTO_FIELD`) — simple sequential IDs, appropriate for SQLite dev setup.
- **Email normalization**: Full lowercase (`email.strip().lower()`) in `create_user()` — prevents case-variant duplicate accounts.
- **Manager**: `CustomUserManager` extending `BaseUserManager`. Both `create_user(email, password)` and `create_superuser(email, password)` require both arguments. `ValueError` raised if either is missing.
- **Admin**: Custom `UserAdmin` with `CustomUserCreationForm` (email, password1, password2) and `CustomUserChangeForm` (email, is_active, is_staff, is_superuser). Fieldsets adapted for email-only model.
- **Default categories**: Will be created via `post_save` signal on User in the notes app — **out of scope** for this PRD.
- **Settings**: `AUTH_USER_MODEL = "users.CustomUser"` must be added before the first migration.

## Testing Decisions

- **TDD required** per project workflow rules — write tests first, then implementation.
- **What makes a good test**: Test external behavior (can I create a user? does normalization work?), not implementation details (internal method calls, field ordering).
- **CustomUserManager tests**:
  - Creation with valid email + password succeeds
  - Missing email raises `ValueError`
  - Missing password raises `ValueError`
  - Email is normalized to lowercase
  - `create_superuser` sets `is_staff=True` and `is_superuser=True`
- **CustomUser model tests**:
  - `__str__` returns email
  - `USERNAME_FIELD` is `"email"`
- **Test framework**: `pytest` + Django test client (per `pyproject.toml` config)

## Out of Scope

- Auth views (signup, login, refresh endpoints)
- Serializers and URL routing
- Default category creation signal (belongs to the notes app PRD)
- Frontend auth screens
- Password reset flow

## Further Notes

- This must be the **first migration** in the project. Running any other migration before setting `AUTH_USER_MODEL` will cause Django to create the default User table, making it very difficult to switch later.
- The `REQUIRED_FIELDS` list should be empty — `email` is already implicitly required as `USERNAME_FIELD`.
- `PermissionsMixin` is included for Django admin compatibility. It adds `is_superuser`, `groups`, and `user_permissions` fields.
