# Issue 6: Create note + mobile top bar

## Parent PRD

PRD-notes-list.md

## What to build

Add the "+ New Note" button that creates a note via `POST /api/notes/` and navigates to `/notes/[id]`. When a category filter is active (URL search param), the new note is created with that category pre-assigned. When viewing "All Categories" (no filter), the note is created with `category: null`.

On successful creation, granularly invalidate TanStack Query caches: `["notes", ...]` (new note in list) and `["categories"]` (note_count changed).

Build the mobile top bar layout: on small screens, the sidebar is hidden and replaced by a horizontal bar at the top of the notes page with a category dropdown on the left and the "+ New Note" button on the right. On desktop, the "+ New Note" button is positioned at the top right of the main area and the sidebar is the normal vertical layout.

## Acceptance criteria

- [ ] "+ New Note" button visible on desktop (top right of main area)
- [ ] Clicking "+ New Note" sends `POST /api/notes/` with `{ category: <active_filter_id> | null }`
- [ ] On success, navigates to `/notes/<new_note_id>`
- [ ] Cache invalidation: `["notes", ...]` and `["categories"]` are invalidated on create
- [ ] Mobile: sidebar hidden, replaced by top bar with category dropdown (left) + "+ New Note" button (right)
- [ ] Mobile category dropdown filters notes identically to the desktop sidebar (sets URL search param)
- [ ] Responsive breakpoint: mobile bar shown on small screens, sidebar shown on desktop

## Blocked by

- Blocked by Issue 5 (notes grid — need the grid and cards in place to see the created note)

## User stories addressed

- User story 17 (click "+ New Note" to create and navigate)
- User story 18 (new note gets active filter's category)
- User story 19 (new note without category when on "All Categories")
- User story 27 (mobile top bar with dropdown + new note button)
