# Issue 2: Core components — Button, Input (password toggle), TextLink

## Parent PRD

PRD-auth-screens.md

## What to build

Create the project's core component library in `components/core/`. These are reusable, project-styled components that wrap shadcn primitives internally:

- **CoreButton**: Variants `primary`, `secondary`, `outlined`. Auth screens use `outlined` (pill-shaped, warm-brown border, bold text).
- **CoreInput**: Default variant with warm-brown border and 6px radius. Password variant adds an Eye/EyeOff toggle icon from lucide-react at the right edge, toggling between `type="password"` and `type="text"`.
- **TextLink**: Wraps Next.js `Link` with small, underlined text styling.
- **Barrel export** via `index.ts`.

Includes a unit test for the CoreInput password toggle behavior.

See PRD section: **Core components**.

## Acceptance criteria

- [x] `CoreButton` renders with `outlined` variant: `rounded-full`, `border-warm-brown`, bold text
- [x] `CoreButton` supports `primary` and `secondary` variants (mapped to shadcn equivalents)
- [x] `CoreInput` renders with warm-brown border and 6px border-radius
- [x] `CoreInput` with `variant="password"` shows Eye icon; clicking toggles to EyeOff and reveals text; clicking again toggles back
- [x] Eye/EyeOff icon color is warm-brown (`#957139`)
- [x] `TextLink` renders a Next.js Link with small underlined text
- [x] Barrel export from `components/core/index.ts` exports all three components
- [x] Unit test: CoreInput password toggle cycles through password → text → password
- [x] `pnpm build` passes
- [x] `pnpm test` passes

## Blocked by

- Issue 1 (Foundations) — needs color tokens and Vitest setup

## User stories addressed

- User story 4: Toggle password visibility using eye icon
- User story 10: Toggle password visibility on login screen
- User story 14: Reusable core components reflecting the app's visual identity
