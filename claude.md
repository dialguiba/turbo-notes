# Claude

# Note-Taking App — Project Context
## What this project is
A note-taking app with categories, auto-save, and voice-to-text. Backend: Django + DRF. Frontend: Next.js 16 + TypeScript + shadcn/ui.
## Before any task
1. Read @docs/product-specs.md — product specs and business logic
2. Read @docs/ubiquitous-language.md — domain terminology (if it exists)
3. Read the relevant tasks file in @docs/features/ for the current feature
## Architecture
Monolito modular con Django REST Framework, organizado por apps de dominio (`notes`, `users`) con API REST stateless y autenticación JWT.

## Stack
### Backend (already scaffolded)
- Framework: Django 6.0 + Django REST Framework
- Auth: JWT via djangorestframework-simplejwt
- Database: SQLite (dev)
- CORS: Configured for localhost:3000
- Apps: apps.users, apps.notes
- Linting: ruff
- Testing: pytest + Django Test Client
### Frontend (to be built)
- Runs on localhost:3000
- Framework: Next.js 16.x + React + TypeScript
- UI Library: shadcn/ui
- Styling: Tailwind CSS
## Project structure
- backend/apps/users/ — user model and auth
- backend/apps/notes/ — notes and categories
- docs/specs.md — source of truth for requirements
- docs/ubiquitous-language.md — domain glossary
- docs/features/ — PRDs and tasks per feature
## Workflow
- Backend: follow TDD — write the test first, then the implementation
- Run ruff after every backend change
- Mark tasks as complete in the tasks.md file after each implementation
- Never skip a failing test — fix it before moving on
## Testing rules
### Backend (pytest + Django Test Client) — TDD
- Every endpoint needs at least one test
- Test ownership: a user should never access another user's data
- Test the unhappy path: wrong credentials, missing fields, invalid data
### Frontend (Playwright) — E2E
- End-to-end tests that validate full user flows against acceptance criteria
### Frontend (Vitest) — Selective Unit Tests (Optional)
- Test pure logic only: date formatting, auto-save debounce, category filtering
- No visual/snapshot tests
## Data Model
See source of truth: `backend/apps/users/models.py`, `backend/apps/notes/models.py`

## API Endpoints
See source of truth: `backend/config/urls.py`, `backend/apps/users/views.py`, `backend/apps/notes/views.py`

### Auth
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/signup/` | Register new user |
| POST | `/api/auth/login/` | Obtain JWT tokens |
| POST | `/api/auth/refresh/` | Refresh access token |

### Categories
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/categories/` | List user's categories |
| POST | `/api/categories/` | Create a new custom category |
| PATCH | `/api/categories/:id/` | Edit a category's name and color |

### Notes
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/notes/` | List all user's notes |
| POST | `/api/notes/` | Create a new note (triggered immediately on "New Note" click) |
| GET | `/api/notes/:id/` | Get a single note |
| PATCH | `/api/notes/:id/` | Update a note |
| DELETE | `/api/notes/:id/` | Delete a note |

> **Query Parameter**: `GET /api/notes/?category=:id` — filter notes by category

## Conventions
- Use email-based authentication (not username)
- All API responses in JSON
- Keep views thin — business logic goes in models or services
- UUID or Int PKs (follow what's already in the codebase)