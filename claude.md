# Project Overview

Note-taking app with categories, auto-save, and voice-to-text.
Backend: Django + DRF (scaffolded). Frontend: Next.js 16 + shadcn/ui (to be built).

## Before any task

1. Read `docs/product-specs.md` — product specs and business logic
2. Read `docs/ubiquitous-language.md` — domain terminology (if it exists)
3. Read the relevant tasks file in `docs/features/` for the current feature

# Tech Stack

## Backend (already scaffolded)

- Framework: Django 6.0 + Django REST Framework
- Auth: JWT via djangorestframework-simplejwt
- Database: SQLite (dev)
- CORS: Configured for localhost:3000
- Apps: apps.users, apps.notes
- Linting: ruff
- Testing: pytest + Django Test Client

## Frontend (to be built)

- Runtime: Node.js 24 LTS (see `frontend/.nvmrc`) · pnpm · localhost:3000
- Framework: Next.js 16.x (App Router) + React + TypeScript strict
- UI Library: shadcn/ui (New York style)
- Styling: Tailwind CSS v4 (CSS-based config in `globals.css`)
- Server state: TanStack Query
- Icons: lucide-react
- Dates: date-fns
- Linting: ESLint + Prettier (with prettier-plugin-tailwindcss)
- Testing: Playwright (E2E) · Vitest (optional unit)

# Commands

## Backend

```bash
cd backend
python manage.py runserver          # localhost:8000
python manage.py test               # run tests
python manage.py showmigrations     # verify migration status
python manage.py makemigrations     # generate new migrations
python manage.py migrate            # apply pending migrations
python manage.py createsuperuser    # create admin user (first time setup)
ruff check .                        # lint
ruff check . --fix                  # lint + autofix
```

> **First time setup:** run `python manage.py migrate` then `python manage.py createsuperuser` to access the Django admin at `localhost:8000/admin/`.

## Frontend

```
cd frontend
nvm use                             # switch to Node 24 LTS (from .nvmrc)
pnpm dev                            # localhost:3000
pnpm build                          # production build (catches TS errors)
pnpm lint                           # ESLint
pnpm format                         # Prettier write
pnpm format:check                   # Prettier check (CI)
pnpm test                           # Vitest (uses --no-webstorage for Node 25+ compat)
pnpm test:watch                     # Vitest watch mode
```

# Architecture Decisions

- Monolito modular con Django REST Framework, organizado por apps de dominio (`notes`, `users`) con API REST stateless y autenticación JWT
- API calls go through `frontend/src/lib/api-client.ts` — never `fetch()` directly in components
- Custom colors (categories, auth bg) defined via `@theme` in `globals.css`
- Use shadcn tokens for UI chrome, custom tokens for business colors
- Route params and searchParams are async in Next.js 16 (must be awaited)
- Route groups: `(auth)` for login/signup, `(dashboard)` for main app — separate layouts, no URL impact
- Turbopack is the default bundler in Next.js 16
- React Compiler is enabled (`reactCompiler: true` in next.config.ts) — manual `useMemo`/`useCallback` is usually unnecessary

# Project Structure

- `backend/apps/users/` — user model and auth
- `backend/apps/notes/` — notes and categories
- `frontend/src/features/{auth,notes,categories}/` — feature modules with `components/`, `hooks/`, `types.ts`
- `frontend/src/components/ui/` — shadcn components
- `frontend/src/lib/` — api-client, utils, mock-data
- `docs/product-specs.md` — source of truth for requirements
- `docs/ubiquitous-language.md` — domain glossary
- `docs/features/` — PRDs and tasks per feature

# Data Model

See source of truth: `backend/apps/users/models.py`, `backend/apps/notes/models.py`

# API Endpoints

See source of truth: `backend/config/urls.py`, `backend/apps/users/views.py`, `backend/apps/notes/views.py`

# Workflow

- Backend: follow TDD — write the test first, then the implementation
- Frontend: auth screens were built with mock data (PRD 2); PRD 3 replaces mock auth with real JWT integration before building notes UI; feature PRDs (3-6) build UI with real API and real auth
- Run linter after every change (`ruff` for backend, `pnpm lint` for frontend)
- Mark tasks as complete in the tasks.md file after each implementation
- Never skip a failing test — fix it before moving on

# Testing Rules

## Backend (pytest + Django Test Client) — TDD

- Every endpoint needs at least one test
- Test ownership: a user should never access another user's data
- Test the unhappy path: wrong credentials, missing fields, invalid data

## Frontend (Playwright) — E2E

- End-to-end tests that validate full user flows against acceptance criteria

## Frontend (Vitest) — Selective Unit Tests (Optional)

- Test pure logic only: date formatting, auto-save debounce, category filtering
- No visual/snapshot tests

# Conventions

- Use email-based authentication (not username)
- All API responses in JSON
- Keep views thin — business logic goes in models or services
- Follow existing PK style in the codebase (don't mix UUID and Int)
- Components in `features/*/components/`, colocated with their types
- Hooks in `features/*/hooks/`, one file per domain (useNotes, useCategories)
- Never use `bg-white` or `text-black` directly — use shadcn tokens
- Import with `@/*` alias (resolves to `src/*`)
