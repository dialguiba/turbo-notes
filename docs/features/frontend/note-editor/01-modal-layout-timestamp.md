# Issue 1: Editor modal + note detail + layout + timestamp

## Parent PRD

PRD-note-editor.md

## What to build

Refactor the notes list so that clicking a note card or creating a new note opens a fullscreen Dialog (modal) instead of navigating to a separate page. Build the single-note data fetching hook, the editor layout (category color background, title input, content textarea, close button, "Last Edited" timestamp), loading/404 states, and the timestamp formatter with Vitest tests. Remove the stub page at `/notes/[id]`.

Title and content are editable locally (controlled inputs) but do not persist yet — auto-save is wired in Issue 2.

## Acceptance criteria

- [x] Clicking a note card opens the editor in a fullscreen Dialog (100% viewport, category color background)
- [x] Creating a new note (via "+ New Note") opens the editor modal with the newly created note
- [x] The editor displays the note title in an editable `<input>` with placeholder "Note Title"
- [x] The editor displays the note content in an editable `<textarea>` with placeholder "Pour your heart out..."
- [x] The textarea fills remaining viewport height and scrolls internally on overflow
- [x] "Last Edited: July 21, 2024 at 8:39pm" timestamp displays at the top right of the content area
- [x] The X button closes the modal and returns to the notes list
- [x] Loading skeleton shows while the note is being fetched
- [x] If the note doesn't exist (404), "Note not found" is shown with a close button
- [x] The stub page at `app/(dashboard)/notes/[id]/page.tsx` is deleted
- [x] Vitest tests cover the editor timestamp formatter (various dates, am/pm, midnight edge cases)
- [x] `pnpm build` passes with no TypeScript errors
- [x] `pnpm lint` passes

## Blocked by

None — can start immediately.

## User stories addressed

- User story 1 (click note card to open editor)
- User story 3 (timestamp updates in real-time — display only in this issue)
- User story 7 (close editor with X button)
- User story 9 (loading state while note loads)
