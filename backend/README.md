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
├── config/              # Django project settings, urls, wsgi
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── users/           # Custom user model (email-based auth) + auth endpoints
│   └── notes/           # Notes and categories (in progress)
├── pyproject.toml       # Dependencies, ruff config, pytest config
└── db.sqlite3           # SQLite database (git-ignored)
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
- **Thin views** — business logic goes in models or services, not views
