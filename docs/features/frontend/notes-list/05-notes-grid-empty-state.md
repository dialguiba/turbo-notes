# Issue 5: Notes grid + empty state + date formatting

## Parent PRD

PRD-notes-list.md

## What to build

Fetch notes via TanStack Query (`GET /api/notes/` with optional `?category=<id>` from URL search params) and render them as preview cards in a responsive grid (1 col → 2 col → 3 col). Each card shows the formatted date, category name, title, and truncated content preview. Card background color is applied via inline style using the category's hex color from the backend. Notes are sorted by last edited (most recent first — the backend default). Clicking a card navigates to `/notes/[id]`.

Build the date formatting utility in `features/notes/` using `date-fns`: "Today", "Yesterday", or "Mar 19" (no year). Include Vitest tests for the formatter.

When the notes list is empty, display the boba tea image (`public/images/coffee.png`) centered with the text "I'm just here waiting for your charming notes...". The sidebar and page header remain visible.

Create a stub page at `/notes/[id]` that shows the note ID and a back link to `/notes` (the full editor is PRD 4).

Establish the `useNotes` hook in `features/notes/hooks/`, `Note` and `NotePayload` types in `features/notes/types.ts`.

## Acceptance criteria

- [x] Notes fetched from `GET /api/notes/` via TanStack Query with key `["notes", { category }]`
- [x] Category filter from URL search params is passed as `?category=<id>` query param to the API
- [x] Cards display date, category name, title, and truncated content
- [x] Card background color matches category color via inline style
- [x] Grid is responsive: 1 column on mobile, 2 on tablet, 3 on desktop
- [x] Date formatting: "Today" / "Yesterday" / "Mar 19" — no year shown
- [x] Vitest tests for the date formatting utility (today, yesterday, older, midnight edge cases)
- [x] Clicking a card navigates to `/notes/[id]`
- [x] Empty state shows boba tea image + "I'm just here waiting for your charming notes..."
- [x] Stub editor page at `/notes/[id]` with note ID and back link

## Blocked by

- Blocked by Issue 4 (categories sidebar — filter must be in place for notes to consume it)

## User stories addressed

- User story 11 (responsive grid of preview cards)
- User story 12 (sorted by last edited)
- User story 13 (card shows date, category, title, truncated content)
- User story 14 (card background matches category color)
- User story 15 (date formatting rules)
- User story 16 (click card to open note)
- User story 20 (empty state with boba tea)
