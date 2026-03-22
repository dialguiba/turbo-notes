# Issue: Implement Custom User Model

## Parent PRD

[user-model.md](./user-model.md)

## What to build

Implement a custom Django User model with email-based authentication from scratch. This is a single end-to-end slice that delivers:

1. **Settings**: Set `AUTH_USER_MODEL = "users.CustomUser"` before any migration runs.
2. **Manager**: `CustomUserManager` with `create_user(email, password)` and `create_superuser(email, password)` — both fields required, full email normalization (lowercase + strip), `ValueError` on missing args.
3. **Model**: `CustomUser(AbstractBaseUser, PermissionsMixin)` with fields: email (unique, `USERNAME_FIELD`), is_active, is_staff, date_joined. No username, first_name, or last_name.
4. **Tests (TDD — written first)**: Manager validation, email normalization, superuser flag enforcement, model `__str__`.
5. **Admin**: Custom `UserAdmin` with creation/change forms adapted for email-only auth.
6. **Migration**: Generate and apply the initial users migration.

This must be the **first migration** in the project — see PRD "Further Notes" for details.

## Acceptance criteria

- [x] `AUTH_USER_MODEL = "users.CustomUser"` is set in `config/settings.py`
- [x] `CustomUserManager.create_user(email, password)` creates a user with normalized email
- [x] `CustomUserManager.create_user()` raises `ValueError` when email is missing
- [x] `CustomUserManager.create_user()` raises `ValueError` when password is missing
- [x] `CustomUserManager.create_superuser()` sets `is_staff=True` and `is_superuser=True`
- [x] Email normalization lowercases the entire email and strips whitespace
- [x] `CustomUser.USERNAME_FIELD` is `"email"`
- [x] `CustomUser.REQUIRED_FIELDS` is `[]`
- [x] `CustomUser.__str__()` returns the email
- [x] Model has only: email, password, is_active, is_staff, is_superuser, date_joined (no username/first_name/last_name)
- [x] Django admin shows Users section with custom create/change forms
- [x] `python manage.py makemigrations users` succeeds
- [x] `python manage.py migrate` succeeds
- [x] `python manage.py createsuperuser` works with email + password prompt
- [x] All tests pass (`pytest`)
- [x] `ruff check backend/` passes clean

## Blocked by

None — can start immediately. This is the foundational task.

## User stories addressed

- User story 1: Custom User model with email as primary identifier
- User story 2: `create_user()` requires both email and password
- User story 3: `create_superuser()` enforces staff and superuser flags
- User story 4: Full email normalization prevents duplicate accounts
- User story 5: User model registered in Django admin with custom forms
- User story 6: `AUTH_USER_MODEL` set before first migration
- User story 7: Clean model with no unused fields
