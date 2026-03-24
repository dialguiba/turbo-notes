# PRD: Note Editor

## Problem Statement

Users can view and create notes from the notes list (PRD 3), but clicking a note or creating a new one navigates to a stub page with no editing capability. There is no way to edit a note's title, content, or category — the core functionality of a note-taking app.

This PRD builds the Note Editor as a fullscreen modal dialog that opens on top of the notes list, with auto-save, category switching, and note deletion.

## Solution

Build the Note Editor as a fullscreen Dialog (shadcn) that opens when the user clicks a note card or creates a new note:

- The modal covers 100% of the viewport with the note's category color as background
- A category dropdown (top left) lets users change the note's category — background color updates immediately
- Title and content are plain text fields that auto-save with a 1-second debounce
- A "Last Edited" timestamp updates in real-time as the user types
- A delete button with confirmation dialog removes the note
- Closing the modal (X button) flushes any pending save and returns to the notes list

## User Stories

1. As a user, I want to click a note card to open it in a fullscreen editor, so that I can read and edit it.
2. As a user, I want my edits to auto-save as I type, so that I never lose work.
3. As a user, I want the "Last Edited" timestamp to update in real-time as I type, so that I know when the note was last modified.
4. As a user, I want to change a note's category via a dropdown, so that I can reorganize my notes.
5. As a user, I want the editor background color to match the note's category color, so that the note feels visually connected to its category.
6. As a user, I want to remove a note's category by selecting "No Category", so that I can leave notes uncategorized.
7. As a user, I want to close the editor with the X button and return to the notes list, so that I can browse my notes again.
8. As a user, I want to delete a note with a confirmation step, so that I don't accidentally lose important notes.
9. As a user, I want to see a loading state while the note loads, so that I know the editor is working.
10. As a user, I want to be notified if auto-save fails, so that I can take action before losing my work.

## Implementation Decisions

### Editor as Modal (not a separate page)

The editor is a fullscreen Dialog (shadcn) that opens on top of the notes list — not a separate route. The X button in the spec indicates a modal pattern. This means:

- **No URL change**: The URL stays at `/notes` (or `/notes?category=X`). The modal state lives in `useState<number | null>` in the notes page.
- **Delete the stub**: `app/(dashboard)/notes/[id]/page.tsx` is removed since the editor is no longer a page.
- **Adapt NoteCard**: Change from `<Link>` to `onClick` callback that sets the selected note ID.
- **Adapt use-create-note**: Remove `router.push`, return the created note so page.tsx can set the selected ID.

### Dialog Sizing

100% viewport (`w-screen h-screen`), no visible overlay, no border radius. The dialog background IS the category color. Visually replaces the notes list but technically the list stays mounted behind.

### Auto-Save

- **Debounce 1s**: After the user stops typing for 1 second, a `PATCH /api/notes/{id}/` fires with changed fields (title, content).
- **Optimistic timestamp**: The "Last Edited" display updates to `new Date()` on every keystroke in the UI — the server confirms a similar time when the PATCH response returns.
- **Flush on close**: When the user clicks X, cancel the debounce timer and immediately fire the pending PATCH. The modal closes without waiting for the response (TanStack Query keeps the mutation alive).
- **Error handling**: On PATCH failure, show a toast via sonner ("Failed to save — retrying..."), retry after 2s, max 3 retries.

### Category Dropdown

- Built with shadcn **Popover + Command** for full control over rendering color indicators.
- Trigger shows current category color dot + name (or "No Category" with gray dot).
- List excludes the currently selected category, includes "No Category" at top.
- On select: `PATCH /api/notes/{id}/ { category: id | null }` fires **immediately** (no debounce — discrete user action).
- Invalidates `["notes"]` and `["categories"]` caches on success (note counts shift).
- UI updates optimistically: category and background color change before the PATCH confirms.

### Inputs

- **Title**: `<input>` with large font, transparent background, placeholder "Note Title".
- **Content**: `<textarea>` that fills remaining viewport height (`flex-1`), scrolls internally on overflow, transparent background, placeholder "Pour your heart out...".

### Timestamp Format

Full date-time in the editor: `"Last Edited: July 21, 2024 at 8:39pm"` — uses date-fns `format(date, "MMMM d, yyyy 'at' h:mmaaa")`. This is a different format from the card date (which uses "Today" / "Yesterday" / "Mar 19").

### Delete

- Trash icon in the top bar next to the X button.
- Opens an AlertDialog: "Delete this note?" / "This can't be undone." / [Cancel] [Delete].
- On confirm: flush pending auto-save, `DELETE /api/notes/{id}/`, invalidate caches, close modal.

### Cache Invalidation on Close

Invalidate `["notes"]` and `["categories"]` query keys when the modal closes. This ensures the list reflects any title, content, or category changes made in the editor.

### Component Architecture

- **NoteEditor** (`features/notes/components/note-editor.tsx`): Client component. Receives `noteId` and `onClose` props. Renders the fullscreen Dialog with all editor content inside.
- **CategoryDropdown** (`features/notes/components/category-dropdown.tsx`): Popover + Command. Receives current category and onChange callback.
- **DeleteNoteDialog** (`features/notes/components/delete-note-dialog.tsx`): AlertDialog. Receives noteId and onDeleted callback.

### Hooks

- `features/notes/hooks/use-note.ts` — TanStack Query hook for fetching a single note (`GET /api/notes/{id}/`)
- `features/notes/hooks/use-auto-save.ts` — Custom hook encapsulating debounce timer + PATCH mutation + flush + retry
- `features/notes/hooks/use-delete-note.ts` — TanStack Query mutation for `DELETE /api/notes/{id}/`

## Testing Decisions

### What to test

- **Editor timestamp formatter** (`format-editor-date.ts`): Pure function, test various dates including today, different times (am/pm), midnight edge cases.

### What NOT to test

- Editor UI rendering, Dialog open/close — visual components, tested via E2E in PRD 8
- Auto-save debounce timing — implementation detail, trust the timer + test via E2E
- Category dropdown interaction — shadcn component behavior, tested via E2E

## Out of Scope

- Voice-to-text floating button — PRD 6
- Category CRUD (create, edit, delete categories) — PRD 5
- Rich text formatting (bold, italic, etc.) — not in product specs
- Note sharing or collaboration — not in product specs
- Pagination or lazy loading of note content — not needed for current scale
