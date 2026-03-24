# Issue 3: Delete note with confirmation dialog

## Parent PRD

PRD-note-editor.md

## What to build

Add a delete action to the note editor. A trash icon in the top bar (next to the X button) opens a confirmation AlertDialog. On confirm, flush any pending auto-save, delete the note via `DELETE /api/notes/{id}/`, invalidate query caches, and close the modal.

## Acceptance criteria

- [x] A trash icon button is visible in the editor top bar, next to the X close button
- [x] Clicking the trash icon opens a confirmation AlertDialog ("Delete this note?" / "This can't be undone.")
- [x] Clicking "Cancel" closes the dialog without deleting
- [x] Clicking "Delete" flushes any pending auto-save, then deletes the note via the API
- [x] On successful deletion, `["notes"]` and `["categories"]` caches are invalidated and the modal closes
- [x] The deleted note no longer appears in the notes list
- [x] On deletion failure, a toast ("Failed to delete note") is shown
- [x] `pnpm build` passes with no TypeScript errors
- [x] `pnpm lint` passes

## Blocked by

- Issue 1 (editor modal + layout must exist first)

## User stories addressed

- User story 8 (delete a note with confirmation step)
