# PRD: Project Initialization

## Problem Statement

The backend is scaffolded, but no frontend code exists yet. Before building any features, we need a solid project foundation: tooling, configuration, folder structure, and providers. Without this, every subsequent PRD would need to reinvent setup decisions.

## Solution

Create a `frontend/` directory at the repo root using the stack defined in `claude.md`:
- shadcn/ui with pre-installed components
- TanStack Query provider wired into the app
- Feature-based folder structure (`auth`, `notes`, `categories`)
- Custom Tailwind color tokens for categories and auth backgrounds
- ESLint + Prettier with Tailwind class sorting
- Stub pages confirming routing works

This is strictly infrastructure — no feature UI, no mock data logic, no real pages. Just a working, lint-clean, build-passing project skeleton that PRDs 2-6 build on top of.

## User Stories

1. As a developer, I want a Next.js project with App Router and TypeScript, so that I have a modern, type-safe frontend foundation.
2. As a developer, I want shadcn/ui components installed and configured, so that I can build UI quickly with accessible, customizable primitives.
3. As a developer, I want ESLint + Prettier configured with Tailwind class sorting, so that code quality and formatting are enforced from the start.
4. As a developer, I want custom Tailwind CSS variables for the app's color palette (beige, category colors), so that colors are consistent and easy to change.

## Implementation Decisions

> Stack and architecture decisions are defined in `claude.md`. This section covers only decisions specific to this PRD's execution.

### Project scaffolding

- **Command**: `pnpm create next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*"`
- **Source directory**: `--src-dir` — all code lives under `frontend/src/`. Keeps the project root clean for config files.

### Color tokens (`@theme`)

- **Naming convention**: Semantic names — `bg-category-random-thoughts`, `bg-beige`, etc.
- **Auth background**: `#F5F0E8` (warm beige) → `--color-beige`
- **Default categories**: Random Thoughts (`#FFD4B2`), School (`#FFF3BF`), Personal (`#B2F2E5`)
- **Additional palette**: `#FFB3B3` (coral), `#D4B2FF` (lavender), `#B2D4FF` (sky), `#E8B2FF` (orchid), `#B2FFD4` (mint)

### shadcn/ui components to install

`button`, `input`, `card`, `dropdown-menu`, `dialog`, `label`, `separator`, `scroll-area`, `tooltip`, `badge`

### Providers

- `src/app/providers.tsx` wraps children with `QueryClientProvider` (outer) and `AuthProvider` (inner, mock — provides `{ user, isAuthenticated, login, signup, logout }`)
- Wired into `src/app/layout.tsx`

### API client strategy

- **API client pattern**: `lib/api-client.ts` exports typed functions. TanStack Query hooks call these. Feature PRDs (3-6) integrate with the real backend API directly.
- Auth screens (PRD 2) use mock auth via the provider; real auth integration is PRD 7.

### Prettier config

- Semi, double quotes, tab width 2
- `prettier-plugin-tailwindcss` for class sorting
- `eslint-config-prettier` to disable conflicting ESLint rules
- Scripts: `"format"` and `"format:check"`

### Default page

- Replace the default page with a minimal placeholder showing "Turbo Notes" and links to `/login` and `/notes`. Confirms routing and Tailwind config work.

## Testing Decisions

- **No tests in this PRD**. This is pure infrastructure — nothing to test beyond the verification checklist.
- **Future**: Playwright (E2E) in PRD 8, Vitest (unit) set up in PRD 2.

## Out of Scope

- Feature UI (auth screens, notes list, editor) — PRDs 2-6
- Auth integration (JWT, protected routes) — PRD 7
- httpOnly cookie setup on backend — backend PRD
- Production assets/illustrations
- Responsive/mobile layout
- Dark mode
- React Compiler optimization
- Deployment configuration
