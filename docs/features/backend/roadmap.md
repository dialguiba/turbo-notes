# Backend Roadmap — All PRDs

## Current Status

| Component | Status |
| --- | --- |
| User Model + Manager | Implemented |
| User Tests | Implemented |
| User Admin | Implemented |
| User Migration | Created and applied |
| AUTH_USER_MODEL in settings | Configured |
| Everything else | Empty/Does not exist |

---

## Required PRDs

### PRD 1: Custom User Model (ALREADY EXISTS — `user-model.md`)
**Status**: 100% complete
- [x] `CustomUser` model with `AbstractBaseUser + PermissionsMixin`
- [x] `CustomUserManager` with `create_user` / `create_superuser`
- [x] Model and manager tests
- [x] `AUTH_USER_MODEL` in settings
- [x] Migration generated
- [x] Custom admin with forms (UserCreationForm, UserChangeForm)
- [x] Apply migration (`python manage.py migrate`)
- [x] Verify `createsuperuser`
- [x] Run ruff

---

### PRD 2: Auth Endpoints (signup, login, refresh)
**Files**: `apps/users/serializers.py` (new), `apps/users/views.py`, `apps/users/urls.py` (new), `config/urls.py`

**Tasks**:
- [ ] Create `SignUpSerializer` — validates unique email, required password, creates user
- [ ] Create `SignUpView` (POST `/api/auth/signup/`) — registers user, returns JWT tokens
- [ ] Configure `TokenObtainPairView` from simplejwt for login (POST `/api/auth/login/`)
- [ ] Configure `TokenRefreshView` from simplejwt for refresh (POST `/api/auth/refresh/`)
- [ ] Create `apps/users/urls.py` with all 3 routes
- [ ] Include URLs in `config/urls.py` under `api/auth/`
- [ ] TDD Tests:
  - Successful signup → returns tokens
  - Signup with duplicate email → 400
  - Signup with missing fields → 400
  - Successful login → returns access + refresh
  - Login with invalid credentials → 401
  - Refresh token works
  - Protected endpoint rejects requests without token

---

### PRD 3: Category Model + Default Categories
**Files**: `apps/notes/models.py`, `apps/notes/migrations/`, `apps/notes/admin.py`

**Tasks**:
- [ ] Create `Category` model — fields: name, color, user (FK), created_at
- [ ] Create `post_save` signal on User → creates 3 default categories:
  - Random Thoughts (Orange/Peach)
  - School (Golden Yellow)
  - Personal (Teal/Aqua Blue)
- [ ] Register in admin
- [ ] Generate and apply migration
- [ ] TDD Tests:
  - Create category with name + color
  - When a user is created, 3 default categories are created
  - Category belongs to a user (ownership)
  - Model `__str__`

---

### PRD 4: Category Endpoints (CRUD)
**Files**: `apps/notes/serializers.py` (new), `apps/notes/views.py`, `apps/notes/urls.py` (new)

**Tasks**:
- [ ] Create `CategorySerializer` — includes note_count (annotated)
- [ ] GET `/api/categories/` — list authenticated user's categories with note_count
- [ ] POST `/api/categories/` — create custom category (name + color)
- [ ] PATCH `/api/categories/:id/` — edit name and/or color
- [ ] Configure URLs and register in `config/urls.py`
- [ ] TDD Tests:
  - List only the authenticated user's categories
  - Create custom category
  - Edit category name and color
  - Cannot access another user's categories
  - Cannot edit another user's category
  - note_count is calculated correctly

---

### PRD 5: Note Model
**Files**: `apps/notes/models.py`, `apps/notes/migrations/`

**Tasks**:
- [ ] Create `Note` model — fields: title, content, category (FK), user (FK), created_at, updated_at
- [ ] `updated_at` auto-updates on every save
- [ ] Default ordering: `-updated_at` (most recent first)
- [ ] Register in admin
- [ ] Generate and apply migration
- [ ] TDD Tests:
  - Create note with title, content, category
  - `updated_at` changes on edit
  - Default ordering is `-updated_at`
  - Note belongs to a user

---

### PRD 6: Note Endpoints (CRUD)
**Files**: `apps/notes/views.py`, `apps/notes/serializers.py`, `apps/notes/urls.py`

**Tasks**:
- [ ] Create `NoteSerializer` — includes category name and color
- [ ] GET `/api/notes/` — list user's notes, ordered by updated_at desc
- [ ] GET `/api/notes/?category=:id` — filter by category
- [ ] POST `/api/notes/` — create note (auto-created, minimal fields)
- [ ] GET `/api/notes/:id/` — note detail
- [ ] PATCH `/api/notes/:id/` — update title, content, category
- [ ] DELETE `/api/notes/:id/` — delete note
- [ ] Configure URLs and register in `config/urls.py`
- [ ] TDD Tests:
  - List only the authenticated user's notes
  - Filter notes by category
  - Create minimal note (auto-create)
  - Get note detail
  - Update note fields
  - Delete note
  - Cannot access/edit/delete another user's notes
  - Notes are ordered by updated_at desc

---

## Recommended Implementation Order

```
PRD 1 (complete) → PRD 2 → PRD 3 → PRD 5 → PRD 4 → PRD 6
     User Admin     Auth    Categories  Notes    Cat API   Notes API
                            + Signal    Model
```

> PRD 3 y 5 (modelos) van antes de PRD 4 y 6 (endpoints) porque los serializers/views dependen de los modelos.

## Verification (after each PRD)

1. `pytest` — all tests pass
2. `ruff check backend/` — no linting errors
3. Verify in Django admin that data looks correct
