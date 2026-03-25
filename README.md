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
│   │   ├── users/          # Custom user model, JWT auth, services
│   │   └── notes/          # Notes and categories CRUD, signals
│   └── config/
│       └── settings/       # Split settings: base, local, production
├── frontend/
│   └── src/
│       ├── app/            # Next.js routes — (auth) and (dashboard) groups
│       ├── components/
│       │   ├── ui/         # shadcn primitives
│       │   └── core/       # Shared composed components (password-input)
│       ├── features/       # auth, notes, categories — colocated components/hooks/types
│       └── lib/            # API client, auth constants, utilities
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

I used AI throughout this project to move faster, but I made all the design and architecture calls myself. Here's how the workflow looked:

### 1. Requirements Gathering

I took the Figma designs, walkthrough video, and brief from Turbo AI and turned them into a product spec (`docs/product-specs.md`) that I used as the source of truth for everything else.

### 2. Roadmap Planning

I wrote roadmaps for backend (`docs/features/backend/roadmap.md`) and frontend (`docs/features/frontend/roadmap.md`) to define the build order and figure out which tasks could run in parallel.

### 3. PRD Generation (per feature)

For each feature I followed three steps:

1. **Interview skill** — I answered targeted questions to think through edge cases before writing any code
2. **PRD skill** — generated a PRD from that context, then I reviewed and adjusted it
3. **Issue breakdown skill** — split each PRD into vertical slices with acceptance criteria so I could implement them one by one

### 4. Implementation

- **Backend:** strict TDD — tests first, then the code to make them pass
- **Frontend:** built features end-to-end, then checked them against the acceptance criteria

I also used a **TDD skill** that enforced a red-green-refactor loop: write one failing test, write just enough code to pass it, refactor, repeat. This gave me a clear implementation order and helped catch bugs early instead of after the fact.

### 5. Review & Commits

After each piece of work:

- I reviewed all the code changes myself
- Used a **commit planning skill** to split changes into small, well-described commits
- Ran automated code reviews (including a Next.js best practices check) to catch things I might have missed

## Future Improvements

- Migrate JWT storage from localStorage to HTTP-only cookies with CSRF protection to reduce XSS attack surface
- Add PostgreSQL support for production deployment
- Add real-time collaborative editing
