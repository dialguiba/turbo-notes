# Backend Roadmap

## PRDs

| # | PRD | Status | Blocked by | Docs |
| --- | --- | --- | --- | --- |
| 1 | Custom User Model | ✅ Complete | — | [`user-model/`](user-model/) |
| 2 | Auth Endpoints (signup, login, refresh) | Not started | PRD 1 ✅ | [`auth-endpoints/`](auth-endpoints/) |
| 3 | Category Model + Default Categories | Not started | PRD 1 ✅ | TBD |
| 4 | Category Endpoints (CRUD) | Not started | PRD 3 | TBD |
| 5 | Note Model | Not started | PRD 3 | TBD |
| 6 | Note Endpoints (CRUD) | Not started | PRD 5 | TBD |

## Implementation Order

```
PRD 1 (complete) → PRD 2 → PRD 3 → PRD 5 → PRD 4 → PRD 6
     User Model     Auth    Categories  Notes    Cat API   Notes API
                            + Signal    Model
```

> PRD 3 y 5 (modelos) van antes de PRD 4 y 6 (endpoints) porque los serializers/views dependen de los modelos.

## Verification (after each PRD)

1. `pytest` — all tests pass
2. `ruff check backend/` — no linting errors
3. Verify in Django admin that data looks correct
