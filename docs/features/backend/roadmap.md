# Backend Roadmap

## PRDs

| # | PRD | Status | Blocked by | Docs |
| --- | --- | --- | --- | --- |
| 1 | Custom User Model | ✅ Complete | — | [`user-model/`](user-model/) |
| 2 | Auth Endpoints (signup, login, refresh) | ✅ Complete | PRD 1 ✅ | [`auth-endpoints/`](auth-endpoints/) |
| 3 | Category Model + Default Categories | ✅ Complete | PRD 2 ✅ | [`category-model/`](category-model/) |
| 4 | Category Endpoints (CRUD) | ✅ Complete | PRD 3 ✅ | [`category-endpoints/`](category-endpoints/) |
| 5 | Note Model + Category Deletion Safety | ✅ Complete | PRD 3 ✅ | [`note-model/`](note-model/) |
| 6 | Note Endpoints (CRUD) | ✅ Complete | PRD 5 ✅ | [`note-endpoints/`](note-endpoints/) |

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
