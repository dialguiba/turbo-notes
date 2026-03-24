# Issue 3: Category delete with confirmation

## Parent PRD

PRD-category-management.md

## What to build

Add the ability to delete any category with a confirmation step. "Delete" from the context menu (built in Issue 2) opens a shadcn `AlertDialog` with a contextual message: when the category has notes, warn that they will become uncategorized ("This category has X notes. They will become uncategorized."); when empty, show a simple confirmation ("Are you sure you want to delete this category?").

Wire `useDeleteCategory` hook with optimistic sidebar removal — the category disappears immediately, rolling back on error with a toast notification. On settle, invalidate both `["notes"]` and `["categories"]` queries. If the deleted category was the active URL filter, clear the search param (return to "All Categories").

On mobile, the delete flow works identically within the fullscreen management sheet.

## Acceptance criteria

- [x] "Delete" from the context menu opens an `AlertDialog`
- [x] AlertDialog shows contextual message based on `note_count` (has notes vs. empty)
- [x] Confirmation always required (even for empty categories)
- [x] On confirm: category removed from sidebar optimistically
- [x] On error: toast notification + silent UI rollback
- [x] On settle: `["notes"]` and `["categories"]` queries invalidated
- [x] If deleted category was active filter (`?category={id}`), filter is cleared
- [x] AlertDialog prevents dismissal by clicking outside (proper `role="alertdialog"` semantics)
- [x] Mobile: delete flow works within the fullscreen management sheet
- [x] `pnpm build` passes with no TypeScript errors
- [x] `pnpm lint` passes

## Blocked by

- Issue 2 (needs `CategoryContextMenu` with the "Delete" menu item)

## User stories addressed

- User story 4 (delete any category)
- User story 5 (warned before deleting a category with notes)
- User story 6 (always confirm before deleting)
