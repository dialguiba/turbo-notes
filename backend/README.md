# Turbo Notes — Backend

Django REST Framework API for a note-taking app with categories, auto-save, and voice-to-text.

## Tech Stack

- **Python** 3.13+
- **Django** 6.0 + Django REST Framework
- **Auth:** JWT via `djangorestframework-simplejwt`
- **Database:** SQLite (development)
- **API Docs:** drf-spectacular (OpenAPI 3 + Swagger UI)
- **CORS:** `django-cors-headers` (configured for `localhost:3000`)
- **Linting:** Ruff
- **Testing:** pytest + pytest-django

## Project Structure

```text
backend/
├── config/
│   ├── settings/
│   │   ├── __init__.py      # Imports local.py by default
│   │   ├── base.py          # Shared settings (all environments)
│   │   ├── local.py         # Development overrides (DEBUG=True)
│   │   └── production.py    # Hardened settings (SSL, HSTS, secure cookies)
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── users/               # Custom user model, auth endpoints, services
│   └── notes/               # Notes, categories, signals
├── pyproject.toml           # Dependencies, ruff config, pytest config
└── db.sqlite3               # SQLite database (git-ignored)
```

## Getting Started

### Prerequisites

- Python 3.13+
- [uv](https://docs.astral.sh/uv/) (package manager)

### Installation

```bash
cd backend
uv sync                            # install dependencies
```

### First-Time Setup

```bash
python manage.py migrate           # apply all migrations
python manage.py createsuperuser   # create admin account (use your email)
```

After this you can access the Django admin panel at `http://localhost:8000/admin/`.

### Run the Server

```bash
python manage.py runserver         # http://localhost:8000
```

## Available Commands

| Command                            | Description                            |
| ---------------------------------- | -------------------------------------- |
| `python manage.py runserver`       | Start dev server on port 8000          |
| `python manage.py test`            | Run test suite                         |
| `python manage.py showmigrations`  | Check migration status                 |
| `python manage.py makemigrations`  | Generate migrations from model changes |
| `python manage.py migrate`         | Apply pending migrations               |
| `python manage.py createsuperuser` | Create an admin user                   |
| `ruff check .`                     | Lint                                   |
| `ruff check . --fix`               | Lint + auto-fix                        |

## API Endpoints

Full API documentation is available at [`/api/docs/`](http://localhost:8000/api/docs/) (Swagger UI) once the server is running.

| URL              | Description             |
| ---------------- | ----------------------- |
| `/api/docs/`     | Swagger UI              |
| `/api/schema/`   | OpenAPI 3 schema (JSON) |
| `/admin/`        | Django admin panel      |

## Key Design Decisions

- **Email-based auth** — no username field; email is the login identifier
- **Custom user model** (`apps.users.CustomUser`) — set up from day one to avoid migration headaches
- **JWT tokens** — access token: 15 min, refresh token: 7 days (rotated + blacklisted on each refresh)
- **All API responses in JSON** — standard DRF serialization
- **Thin views** — business logic goes in `services.py`, not views or serializers
- **Settings split** — `base.py` / `local.py` / `production.py`; production hardens SSL, HSTS, secure cookies, and requires `SECRET_KEY` from env

## Future Considerations

Items that are fine for the current scope but worth revisiting as the project grows:

- **UUID primary keys** — Models use sequential `BigAutoField` IDs. Sequential IDs allow enumeration (`/api/notes/1/`, `/api/notes/2/`, ...). The `get_queryset()` filter by `request.user` prevents unauthorized access, but UUIDs would eliminate guessability entirely. Switching later requires a data migration on every table + FK.
- **`factory_boy` for test data** — Tests create users and objects inline with `create_user()` / `Model.objects.create()`. At ~77 tests this is manageable, but if test count grows significantly, factories reduce duplication and make test setup more declarative.
- **`selectors.py` layer** — Complex read queries (like the category filter in `NoteViewSet.get_queryset`) live in the ViewSet. Extracting them into selectors would make them reusable and independently testable. Good candidates: note list with category filter, category list with `note_count` annotation.
- **`bulk_create` in signals** — Default categories are created via `bulk_create()` on user signup. This bypasses `full_clean()` and model-level signals. Safe today because the data is hardcoded constants, but if category validation grows, switch to individual `save()` calls.
- **Test file organization** — Tests are flat files (`test_auth.py`, `test_note_endpoints.py`) rather than a `tests/` directory with per-layer separation. Both work with pytest; the directory approach scales better if you add service/selector tests later.
