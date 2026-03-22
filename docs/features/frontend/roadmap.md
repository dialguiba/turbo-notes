# Frontend Roadmap

## Stack

See `claude.md` § Stack › Frontend for the full technology list and versions.

## PRDs — Scaffold (mock data, no backend needed)

| # | PRD | Status | Blocked by | Docs |
| --- | --- | --- | --- | --- |
| 1 | Project Initialization | Not started | — | [`project-init/`](project-init/) |
| 2 | Auth Screens | Not started | PRD 1 | [`auth-screens/`](auth-screens/) |
| 3 | Notes List + Sidebar | Not started | PRD 1 | [`notes-list/`](notes-list/) |
| 4 | Note Editor | Not started | PRD 3 | [`note-editor/`](note-editor/) |
| 5 | Voice-to-Text | Not started | PRD 4 | [`voice-to-text/`](voice-to-text/) |
| 6 | Category Management | Not started | PRD 3 | [`category-management/`](category-management/) |

## PRDs — Integration (swap mocks → real API)

| # | PRD | Status | Blocked by | Docs |
| --- | --- | --- | --- | --- |
| 7 | Auth Integration | Not started | FE PRD 2 + BE PRD 2 | [`auth-integration/`](auth-integration/) |
| 8 | Categories Integration | Not started | FE PRD 6 + BE PRD 4 | [`categories-integration/`](categories-integration/) |
| 9 | Notes Integration | Not started | FE PRD 4 + BE PRD 6 | [`notes-integration/`](notes-integration/) |
| 10 | E2E Tests (Playwright) | Not started | PRDs 7-9 | [`e2e-tests/`](e2e-tests/) |

## Implementation Order

```
Scaffold (parallel to backend):
PRD 1 → PRD 2 → PRD 3 → PRD 4 → PRD 5
  Init    Auth    Notes    Editor   Voice
          UI      List              to-Text
            PRD 3 → PRD 6
                    Category Mgmt

Integration (after backend is ready):
PRD 7 → PRD 8 → PRD 9 → PRD 10
 Auth    Categories  Notes    E2E Tests
```

> PRD 1 (scaffold) can proceed independently of the backend.
> PRDs 2-4 depend on the corresponding backend PRDs being complete.
> PRD 5 (E2E tests) requires the full stack working end-to-end.

## Verification (after each PRD)

### Scaffold PRDs (1-6)
1. `pnpm dev` — starts on `:3000` with no errors
2. `pnpm build` — no TypeScript errors
3. `pnpm lint` — passes
4. Visual design matches product specs

### Integration PRDs (7-9)
1. Backend running on `:8000`, frontend on `:3000`
2. Feature works end-to-end with real API

### E2E PRD (10)
1. `pnpm test:e2e` — all tests pass
