# Turbo Notes — Frontend

Next.js 16 application for a note-taking app with categories, auto-save, and voice-to-text.

## Tech Stack

- **Runtime:** Node.js 24 LTS (see `.nvmrc`)
- **Package manager:** pnpm
- **Framework:** Next.js 16.x (App Router) + React 19 + TypeScript (strict)
- **Bundler:** Turbopack (Next.js 16 default)
- **UI Library:** shadcn/ui (New York style)
- **Styling:** Tailwind CSS v4 (CSS-based config in `globals.css`)
- **Server state:** TanStack Query
- **Icons:** lucide-react
- **Dates:** date-fns
- **Linting:** ESLint + Prettier (with `prettier-plugin-tailwindcss`)

## Project Structure

```text
frontend/src/
├── app/
│   ├── (auth)/              # Login/signup routes (separate layout)
│   ├── (dashboard)/         # Main app routes (separate layout)
│   ├── globals.css          # Tailwind v4 config + custom theme tokens
│   ├── layout.tsx           # Root layout
│   ├── providers.tsx        # Client providers (TanStack Query, etc.)
│   └── page.tsx             # Landing page
├── components/
│   ├── ui/                  # shadcn components
│   └── illustrations/       # SVG illustrations
├── features/
│   ├── auth/                # Auth feature module
│   ├── notes/               # Notes feature module
│   └── categories/          # Categories feature module
├── lib/
│   ├── api-client.ts        # Centralized API client (all fetch calls go here)
│   ├── mock-data.ts         # Mock data (auth screens only)
│   └── utils.ts             # Shared utilities (cn, etc.)
```

Each feature module follows this structure:

```text
features/<feature>/
├── components/              # Feature-specific components
├── hooks/                   # Feature-specific hooks (useNotes, useCategories)
└── types.ts                 # Feature-specific types
```

## Getting Started

### Prerequisites

- **Node.js 24 LTS** (see `.nvmrc`) — run `nvm use` in the `frontend/` directory to switch
- pnpm

> **Node 25+ note:** Node 25 enables the Web Storage API natively, which conflicts with jsdom's `localStorage` in tests. The test scripts include `--no-webstorage` to work around this. If you're on Node 24 LTS this flag is harmless.

### Installation

```bash
cd frontend
nvm use                          # switch to Node 24 (from .nvmrc)
pnpm install
```

### Run the Dev Server

```bash
pnpm dev                     # http://localhost:3000
```

## Available Commands

| Command              | Description                        |
| -------------------- | ---------------------------------- |
| `pnpm dev`           | Start dev server on port 3000      |
| `pnpm build`         | Production build (catches TS errors) |
| `pnpm start`         | Serve production build             |
| `pnpm lint`          | Run ESLint                         |
| `pnpm format`        | Format with Prettier               |
| `pnpm format:check`  | Check formatting (CI)              |
| `pnpm test`          | Run Vitest (unit tests)            |
| `pnpm test:watch`    | Run Vitest in watch mode           |

## Key Design Decisions

- **Route groups** — `(auth)` and `(dashboard)` provide separate layouts without affecting URLs
- **Feature modules** — components, hooks, and types colocated per domain (`auth`, `notes`, `categories`)
- **Centralized API client** — all API calls go through `lib/api-client.ts`, never raw `fetch()` in components
- **Auth strategy** — Auth screens (PRD 2) were built with mock auth; PRD 3 replaces mock with real JWT integration before building notes UI; all feature PRDs (3-6) run with real auth
- **shadcn tokens for UI** — never use `bg-white` or `text-black` directly; use design tokens for theme support
- **Custom theme tokens** — category colors and auth background defined via `@theme` in `globals.css`
- **Import alias** — `@/*` resolves to `src/*`
