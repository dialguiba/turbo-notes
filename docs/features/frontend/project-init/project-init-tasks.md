# Issue: Project Initialization

## Parent PRD

[project-init.md](./project-init.md)

## Type

AFK

## What to build

Set up the complete frontend scaffold (see `claude.md` for stack and versions) — tooling, theming, component library, folder structure, providers, and route stubs. This is pure infrastructure; no feature UI or business logic.

### 1. Set up Node.js version

- Create `frontend/.nvmrc` (see `claude.md` for the Node.js version)
- Run `nvm use` inside `frontend/` to activate

### 2. Scaffold Next.js project

- `pnpm create next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*"`

### 3. Install dependencies

- shadcn/ui, TanStack Query, date-fns, lucide-react
- Prettier + `prettier-plugin-tailwindcss` + `eslint-config-prettier`

### 4. Configure ESLint + Prettier

- Prettier: semi, double quotes, tab width 2, with `prettier-plugin-tailwindcss` for class sorting
- ESLint: extend `eslint-config-prettier` to disable conflicting rules
- Add scripts: `"format": "prettier --write src/"` and `"format:check": "prettier --check src/"`

### 5. Configure Tailwind theme

Add custom `@theme` CSS variables in `globals.css`:
- Auth background: `#F5F0E8` → `--color-beige`
- Category colors: `--color-category-random-thoughts` (`#FFD4B2`), `--color-category-school` (`#FFF3BF`), `--color-category-personal` (`#B2F2E5`)
- Additional palette: coral (`#FFB3B3`), lavender (`#D4B2FF`), sky (`#B2D4FF`), orchid (`#E8B2FF`), mint (`#B2FFD4`)

### 6. Initialize shadcn/ui + install components

- Init with New York style
- Install: `button`, `input`, `card`, `dropdown-menu`, `dialog`, `label`, `separator`, `scroll-area`, `tooltip`, `badge`

### 7. Create feature-based folder structure

- `src/features/auth/` with `components/`, `hooks/`, `types.ts`
- `src/features/notes/` with `components/`, `hooks/`, `types.ts`
- `src/features/categories/` with `components/`, `hooks/`, `types.ts`
- `src/components/illustrations/` (placeholder for SVGs)
- `src/lib/api-client.ts` (typed mock API — empty shell)
- `src/lib/mock-data.ts` (empty shell for constants)
- `src/lib/utils.ts` (shadcn cn helper — may already exist)

### 8. Set up providers

- `src/app/providers.tsx` with `QueryClientProvider` (outer) + `AuthProvider` (inner, mock — provides `{ user, isAuthenticated, login, signup, logout }`)
- Wire into `src/app/layout.tsx`

### 9. Create route stubs

- `src/app/page.tsx` — "Turbo Notes" placeholder + links to `/login` and `/notes`
- `src/app/(auth)/layout.tsx` — auth layout (beige background, centered)
- `src/app/(auth)/login/page.tsx` — stub
- `src/app/(auth)/signup/page.tsx` — stub
- `src/app/(dashboard)/layout.tsx` — dashboard layout
- `src/app/(dashboard)/notes/page.tsx` — stub
- `src/app/(dashboard)/notes/[id]/page.tsx` — stub (with async `params`)

### 10. Environment

- Create `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:8000`

## Acceptance criteria

- [x] `frontend/.nvmrc` exists and `nvm use` activates the correct Node.js version
- [x] `pnpm dev` starts on `:3000` with no errors
- [x] `pnpm build` passes with no TypeScript errors
- [x] `pnpm lint` passes
- [x] `pnpm format:check` passes
- [x] Import alias `@/*` resolves to `src/*`
- [x] shadcn/ui components are importable (e.g., `import { Button } from "@/components/ui/button"`)
- [x] Tailwind custom colors work in classes (e.g., `bg-beige`, `bg-category-random-thoughts`)
- [x] Feature folders exist: `src/features/{auth,notes,categories}/` each with `components/`, `hooks/`, `types.ts`
- [x] `QueryClientProvider` wraps the app via `providers.tsx`
- [x] Mock `AuthProvider` exports `{ user, isAuthenticated, login, signup, logout }`
- [x] Route stubs render at `/login`, `/signup`, `/notes`, `/notes/[id]`
- [x] Auth layout applies beige background
- [x] Home page shows "Turbo Notes" with navigation links
- [x] `.env.local` contains `NEXT_PUBLIC_API_URL=http://localhost:8000`

## Blocked by

None — can start immediately. This is the foundational frontend task.

## User stories addressed

- User story 1: Frontend project with App Router and TypeScript
- User story 2: shadcn/ui installed and configured
- User story 3: ESLint + Prettier with Tailwind class sorting
- User story 4: Custom Tailwind CSS variables for app color palette
