# Frontend Roadmap

## Stack

See `claude.md` § Stack › Frontend for the full technology list and versions.

## PRDs — UI + Integration (build screens with real API)

Auth screens were built with mock data first (PRD 2) since auth integration requires JWT + protected routes + middleware — topics that add complexity unrelated to building UI. The remaining feature PRDs build UI and integrate with the real backend API in a single pass, avoiding throwaway mock code.

| # | PRD | Status | Blocked by | Docs |
| --- | --- | --- | --- | --- |
| 1 | Project Initialization | Done | — | [`project-init/`](project-init/) |
| 2 | Auth Screens (mock) | Done | PRD 1 | [`auth-screens/`](auth-screens/) |
| 3 | Notes List + Sidebar | Not started | PRD 2 + BE notes API | [`notes-list/`](notes-list/) |
| 4 | Note Editor | Not started | PRD 3 + BE notes API | [`note-editor/`](note-editor/) |
| 5 | Category Management | Not started | PRD 3 + BE categories API | [`category-management/`](category-management/) |
| 6 | Voice-to-Text | Not started | PRD 4 | [`voice-to-text/`](voice-to-text/) |
| 7 | Auth Integration | Not started | PRD 2 + BE auth API + httpOnly cookie migration | [`auth-integration/`](auth-integration/) |
| 8 | E2E Tests (Playwright) | Not started | PRDs 3-7 | [`e2e-tests/`](e2e-tests/) |

## Implementation Order

```
Phase 1 — Auth UI (mock):
PRD 1 → PRD 2
  Init    Auth Screens (mock)

Phase 2 — Feature UI + Integration (real API):
PRD 3 → PRD 4 → PRD 6
 Notes    Editor   Voice-to-Text
 List
PRD 3 → PRD 5
         Category Mgmt

Phase 3 — Auth Integration:
PRD 7
 Auth (swap mock → real JWT, protected routes, middleware)

Phase 4 — E2E:
PRD 8
 Playwright tests
```

> PRDs 3-5 require the backend running on `:8000` with the corresponding API endpoints ready.
> PRD 7 (Auth Integration) is intentionally last — mock auth lets feature PRDs run without login friction during development.
> PRD 8 (E2E tests) requires the full stack working end-to-end.

## Verification (after each PRD)

### PRD 2 (Auth Screens — mock)
1. `pnpm dev` — starts on `:3000` with no errors
2. `pnpm build` — no TypeScript errors
3. `pnpm lint` — passes
4. Visual design matches product specs

### PRDs 3-6 (UI + Integration)
1. Backend running on `:8000`, frontend on `:3000`
2. `pnpm build` — no TypeScript errors
3. `pnpm lint` — passes
4. Feature works end-to-end with real API
5. Visual design matches product specs

### PRD 7 (Auth Integration)
1. Login/signup flow works with real backend
2. Protected routes redirect unauthenticated users to `/login`
3. Token refresh works transparently

### PRD 8 (E2E)
1. `pnpm test:e2e` — all tests pass
