# Issue 2: Auto-save with debounce + category dropdown + error handling

## Parent PRD

PRD-note-editor.md

## What to build

Wire the editor inputs to actually persist changes. Build a custom `useAutoSave` hook that debounces title/content changes (1s) and sends `PATCH /api/notes/{id}/` with only the changed fields. Build the CategoryDropdown component (Popover + Command) that lets users switch categories or remove them ("No Category"), with an immediate PATCH on selection. Add toast notifications (sonner) for save failures with retry logic. Flush pending saves on modal close and invalidate query caches.

## Acceptance criteria

- [x] Typing in title or content triggers a `PATCH` after 1 second of inactivity (debounce)
- [x] The "Last Edited" timestamp updates optimistically on every keystroke
- [x] Closing the modal (X button) flushes any pending debounced save before closing
- [x] The category dropdown (top left) shows current category with color dot and name
- [x] The dropdown lists all categories except the current one, plus "No Category" at top
- [x] Each dropdown item shows its color indicator
- [x] Selecting a category immediately PATCHes the note and updates the background color
- [x] Selecting "No Category" sets category to null and removes the colored background
- [x] On save failure, a toast ("Failed to save — retrying...") appears and retries after 2s (max 3 retries)
- [x] On modal close, `["notes"]` and `["categories"]` query caches are invalidated
- [x] `pnpm build` passes with no TypeScript errors
- [x] `pnpm lint` passes

## Blocked by

- Issue 1 (editor modal + layout must exist first)

## User stories addressed

- User story 2 (edits auto-save as I type)
- User story 3 (timestamp updates in real-time)
- User story 4 (change category via dropdown)
- User story 5 (background color matches category)
- User story 6 (remove category with "No Category")
- User story 10 (notified if auto-save fails)
