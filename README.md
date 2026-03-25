# Turbo Notes

A note-taking application with categories, auto-save, color-coded organization, and smart date formatting. Built as a technical assessment for [Turbo AI](https://turbo.ai).

## Tech Stack

| Layer    | Technology                                                        |
| -------- | ----------------------------------------------------------------- |
| Backend  | Python 3.13, Django 6.0, DRF, SimpleJWT, SQLite, drf-spectacular |
| Frontend | Node.js 24, Next.js 16 (App Router), React 19, TypeScript        |
| UI       | shadcn/ui, Tailwind CSS v4, TanStack Query, lucide-react         |
| Tooling  | uv, pnpm, Ruff, ESLint, Prettier, Vitest, pytest                 |

## Getting Started

### Prerequisites

- Python 3.13+ and [uv](https://docs.astral.sh/uv/)
- Node.js 24 LTS (use `nvm use` in `frontend/`) and pnpm

### Backend

```bash
cd backend
uv sync                            # install dependencies
python manage.py migrate           # apply migrations
python manage.py createsuperuser   # create admin account
python manage.py runserver         # http://localhost:8000
```

API docs available at `http://localhost:8000/api/docs/` (Swagger UI).

### Frontend

```bash
cd frontend
nvm use                            # switch to Node 24 (from .nvmrc)
pnpm install                       # install dependencies
pnpm dev                           # http://localhost:3000
```

## Project Structure

```text
turbo-ai/
├── backend/
│   ├── apps/
│   │   ├── users/          # Custom user model, email-based JWT auth
│   │   └── notes/          # Notes and categories CRUD
│   └── config/             # Django settings, urls, wsgi
├── frontend/
│   └── src/
│       ├── app/            # Next.js routes — (auth) and (dashboard) groups
│       ├── components/ui/  # shadcn components
│       ├── features/       # auth, notes, categories — colocated components/hooks/types
│       └── lib/            # API client, utilities
└── docs/                   # Product specs, PRDs, feature tasks
```

## Architecture Decisions

### Backend Decisions

| Decision | Rationale |
| -------- | --------- |
| **Email-based auth** (custom `AbstractBaseUser`) | Email is the sole identifier — no unused `username` field |
| **JWT tokens** (15 min access / 7-day refresh, rotated + blacklisted) | Short access window limits exposure; refresh rotation invalidates old tokens on each use |
| **`SET_NULL` on category FK** | Deleting a category makes notes uncategorized instead of deleting them |
| **Blank defaults for title/content** | Auto-save UX creates a note on click, then fills fields via PATCH |
| **Nested category objects in responses** | Frontend avoids N+1 lookups; single serializer with `to_representation()` swap |
| **Fixed `-updated_at` ordering** | Canonical sort for notes everywhere — no need for configurable params |
| **TDD with pytest** | Every endpoint tested before implementation; ownership and unhappy paths covered |

### Frontend Decisions

| Decision | Rationale |
| -------- | --------- |
| **Route groups `(auth)` / `(dashboard)`** | Separate layouts (beige background vs. notes grid) without affecting URLs |
| **Feature modules** (`features/{auth,notes,categories}/`) | Colocated components, hooks, and types per domain |
| **Centralized API client** (`lib/api-client.ts`) | Single place for auth headers, 401 refresh+retry, token rotation, and session management |
| **localStorage for JWT** | Simple, survives refresh — acceptable tradeoff for a note-taking app (see Future Improvements) |
| **Note editor as modal, not page** | Opens over the notes list; simpler state management than URL-based routing |
| **Auto-save with 1s debounce** | Reduces API calls; flushes on dialog close; toast + retry on failure |
| **Optimistic updates for categories** | Immediate UI feedback; TanStack Query rolls back cache on error |
| **Web Speech API for voice-to-text** | No backend cost; client-side only; graceful fallback for unsupported browsers |

## AI-Assisted Development

This project was built using AI as a development accelerator, with every decision reviewed and directed by me. Here is the workflow:

### 1. Requirements Gathering

Started from the resources provided by Turbo AI (Figma designs, walkthrough video, and the brief) to build a structured product spec (`docs/product-specs.md`) as the single source of truth.

### 2. Roadmap Planning

Created sequential roadmaps for both backend (`docs/features/backend/roadmap.md`) and frontend (`docs/features/frontend/roadmap.md`). These define the order of implementation and identify which tasks can run in parallel — useful both for team workflows and for leveraging AI agents effectively.

### 3. PRD Generation (per feature)

For each feature, followed a three-step process:

1. **Interview skill** — answered a series of targeted questions to fill in gaps and think through edge cases before writing any code
2. **PRD skill** — generated a detailed PRD from the gathered context, then reviewed and refined it manually
3. **Issue breakdown skill** — split each PRD into vertical slices with acceptance criteria, enabling parallel and structured implementation

### 4. Implementation

- **Backend:** strict TDD — tests written first, then implementation to make them pass
- **Frontend:** functional approach — implemented features end-to-end, then validated against acceptance criteria

All implementation decisions (data model choices, UI patterns, tradeoffs) were made by me; AI handled the code generation under my direction.

### 5. Review & Commits

After each iteration:

- Manual code review of all changes
- Used a **commit planning skill** to group changes into granular, well-described commits
- Periodic automated code reviews via specialized skills (including an official Next.js best practices review) to catch issues I might have missed

## Future Improvements

- Migrate JWT storage from localStorage to HTTP-only cookies with CSRF protection to reduce XSS attack surface
- Add PostgreSQL support for production deployment
- Implement voice-to-text note input
- Add real-time collaborative editing
