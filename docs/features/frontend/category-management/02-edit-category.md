# Issue 2: Category edit via context menu

## Parent PRD

PRD-category-management.md

## What to build

Add the ability to edit any category's name and color from the sidebar. Build the `CategoryContextMenu` component: an ellipsis ("...") button on each sidebar category item that opens a shadcn `DropdownMenu` with "Edit" and "Delete" options. The ellipsis is visible on hover/keyboard focus on desktop, always visible on the mobile management sheet.

"Edit" opens the `CategoryDialog` (built in Issue 1) in edit mode, pre-filled with the category's current name and color. Wire `useUpdateCategory` hook with optimistic sidebar update — the sidebar reflects changes immediately, rolling back on error with a toast notification. On settle, invalidate `["notes"]` query so note cards reflect the updated category name/color.

On mobile, the ellipsis and edit flow work identically within the fullscreen management sheet built in Issue 1.

## Acceptance criteria

- [ ] Each sidebar category shows an ellipsis ("...") button on hover/keyboard focus (desktop)
- [ ] Ellipsis is always visible on the mobile management sheet
- [ ] Clicking ellipsis opens a `DropdownMenu` with "Edit" and "Delete" items
- [ ] "Edit" opens `CategoryDialog` pre-filled with current name and color
- [ ] User can change name, color, or both and save
- [ ] Save is disabled if name is empty or whitespace-only
- [ ] On submit: sidebar updates optimistically (instant visual feedback)
- [ ] On error: toast notification + silent UI rollback
- [ ] On settle: `["notes"]` query is invalidated (note cards update)
- [ ] Duplicate name error surfaces via toast (dialog is already closed)
- [ ] Standard keyboard navigation: Tab to ellipsis, Enter/Space to open menu, arrow keys, Escape to close
- [ ] Mobile: edit flow works within the fullscreen management sheet
- [ ] `pnpm build` passes with no TypeScript errors
- [ ] `pnpm lint` passes

## Blocked by

- Issue 1 (needs `CategoryDialog`, `ColorPalette`, and mobile management sheet)

## User stories addressed

- User story 3 (edit any category's name and color)
- User story 8 (inline errors for duplicate names)
