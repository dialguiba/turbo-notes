# Issue 1: Foundations — Fonts, color tokens, and Vitest setup

## Parent PRD

PRD-auth-screens.md

## What to build

Configure the project's typography and color foundations, plus the unit testing infrastructure. Replace the default Geist fonts with Inter (body) and Inria Serif (headings) using `next/font/google`, add warm-brown color tokens to the Tailwind `@theme` block, and set up Vitest with `@testing-library/react` for frontend unit tests.

This slice touches only global configuration — no visible UI beyond font changes on existing stub pages.

See PRD sections: **Typography**, **Color tokens**, **Test framework**.

## Acceptance criteria

- [x] Inter (weights 400, 700) configured via `next/font/google` with CSS variable `--font-inter`
- [x] Inria Serif (weight 700) configured via `next/font/google` with CSS variable `--font-serif`
- [x] `--font-sans` token in `@theme` points to `var(--font-inter)`, `--font-heading` points to `var(--font-serif)`
- [x] Geist and Geist_Mono font imports removed from root layout
- [x] `--color-warm-brown: #957139` and `--color-title-brown: #88642A` added to `@theme inline` block
- [x] Vitest, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, and `jsdom` installed as dev dependencies
- [x] `vitest.config.ts` created with jsdom environment and `@/*` path alias
- [x] `pnpm test` and `pnpm test:watch` scripts added to package.json
- [x] `pnpm build` passes (no TypeScript errors)
- [x] `pnpm lint` passes
- [x] Existing stub pages render with Inter font

## Blocked by

None — can start immediately.

## User stories addressed

- User story 14: Reusable core components reflecting the app's visual identity (prerequisite: tokens)
- User story 15: Inter and Inria Serif fonts configured globally
