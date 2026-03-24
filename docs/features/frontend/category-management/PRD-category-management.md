# PRD: Category Management

## Problem Statement

Users can view and filter by categories in the sidebar (PRD 3), but they cannot create, edit, or delete categories. The 3 default categories are fixed — there is no way to customize them or add new ones. This limits users to a predefined organizational structure that may not match their needs.

This PRD adds full category CRUD to the sidebar, allowing users to create custom categories, edit any category's name and color, and delete categories they no longer need.

## Solution

Add category management directly to the existing sidebar:

- A "+" button pinned at the bottom of the sidebar opens a dialog to create a new category with a name and color from a curated pastel palette
- An ellipsis ("...") button on each category item reveals a context menu with Edit and Delete options
- Edit opens the same dialog pre-filled with the category's current values
- Delete shows a confirmation dialog (with a contextual message when the category has notes)
- On mobile, a "Manage Categories" entry in the existing category dropdown opens a fullscreen sheet with the same management capabilities

## User Stories

1. As a user, I want to create a custom category with a name and color, so that I can organize notes in a way that makes sense to me.
2. As a user, I want to pick a color from a curated palette, so that my categories look visually consistent.
3. As a user, I want to edit any category's name and color (including the 3 defaults), so that I can customize my workspace.
4. As a user, I want to delete any category, so that I can remove categories I no longer need.
5. As a user, I want to be warned before deleting a category that has notes, so that I understand the impact (notes become uncategorized).
6. As a user, I want to always confirm before deleting a category, so that I don't accidentally remove one.
7. As a user, I want the sidebar to scroll when I have many categories, with the "+" button always accessible at the bottom.
8. As a user, I want to see inline errors when creating or renaming a category to a name that already exists.
9. As a user on mobile, I want to access category management from the existing category dropdown, so that I can manage categories on small screens.
10. As a user, I want newly created categories to become the active filter, so that I can immediately start adding notes to them.

## Implementation Decisions

### Create Flow

- A "+" button is pinned at the bottom of the category sidebar (below the scrollable list).
- Clicking it opens a `Dialog` (shadcn) with a name input and a color palette.
- The name input has `maxLength={100}`. Save is disabled when the name is empty or whitespace-only. Name is trimmed on submit.
- The color palette is a grid of 12 curated pastel swatches. The first swatch (Peach `#FFD4B2`) is pre-selected.
- On submit: `POST /api/categories/` with `{ name, color }`. Server-first — wait for the response, then update the cache.
- On success: invalidate `["categories"]` query, set the new category as the active URL filter (`?category={newId}`).
- On duplicate name error (400): display the server's error message ("You already have a category with this name.") inline under the name field.

### Color Palette

12 curated pastels in the same lightness range as the default categories:

| Swatch | Hex |
|---|---|
| Peach | `#FFD4B2` |
| Golden | `#FFF3BF` |
| Teal | `#B2F2E5` |
| Lavender | `#D4B2FF` |
| Rose | `#FFB2C8` |
| Sky Blue | `#B2D4FF` |
| Mint | `#B2FFD4` |
| Coral | `#FFB2B2` |
| Lemon | `#F0FFB2` |
| Periwinkle | `#B2B2FF` |
| Blush | `#FFD4D4` |
| Sage | `#D4E8C2` |

This palette is a constant array — no color picker library needed. The palette includes the 3 default category colors for consistency when editing.

### Edit Flow

- Each category in the sidebar shows an ellipsis ("...") button: visible on hover/keyboard focus (desktop), always visible (mobile management sheet).
- The ellipsis opens a shadcn `DropdownMenu` with "Edit" and "Delete" items.
- "Edit" opens the same `Dialog` used for create, pre-filled with the category's current name and color.
- On submit: `PATCH /api/categories/{id}/` with changed fields. **Optimistic update** — the sidebar updates immediately, rolls back on error.
- On error: toast notification (e.g., "Failed to update category") + silent UI rollback. Duplicate name errors also show via toast since the dialog is already closed.
- On success: invalidate `["notes"]` query so note cards reflect the updated category name/color.

### Delete Flow

- "Delete" from the ellipsis menu opens a shadcn `AlertDialog` (to be installed) with proper `role="alertdialog"` semantics.
- **Always confirms**, regardless of note count. The message varies:
  - Has notes: "This category has X notes. They will become uncategorized. Delete?"
  - No notes: "Are you sure you want to delete this category?"
- On confirm: `DELETE /api/categories/{id}/`. **Optimistic update** — the category is removed from the sidebar immediately.
- On error: toast notification + silent UI rollback.
- On success: invalidate both `["notes"]` and `["categories"]` queries (notes lose their category, counts change).
- If the deleted category was the active filter (`?category={id}`), clear the filter (remove the search param, return to "All Categories").

### Sidebar Layout Changes

- The category list is wrapped in shadcn `ScrollArea` for independent scrolling when the list exceeds available height.
- The "+" button is pinned below the scroll area (not inside it), always accessible.
- "All Categories" remains at the top, outside the scroll area.

### Mobile Management

- The existing `MobileTopBar` category dropdown gets a new "Manage Categories" entry at the bottom (separated by a divider).
- Tapping it opens a fullscreen `Dialog` (consistent with the note editor modal pattern):
  - Lists all categories with color dots, names, note counts, and always-visible ellipsis buttons.
  - "+" button at the bottom to create.
  - X button to close and return to the notes list.
- The same hooks, dialog components, and context menus are reused — only the container differs (fullscreen sheet vs. sidebar).

### Mutation Strategy Summary

| Operation | Strategy | Cache Behavior |
|---|---|---|
| Create | Server-first | Invalidate `["categories"]`, set new category as active filter |
| Edit | Optimistic | Optimistic sidebar update, invalidate `["notes"]` on settle |
| Delete | Optimistic | Optimistic sidebar removal, invalidate `["notes"]` + `["categories"]` on settle, clear filter if active |

### Client-Side Validation

- Name: required, trimmed, `maxLength={100}`, whitespace-only treated as empty (Save disabled)
- Color: must be one of the 12 palette values (enforced by UI — no free-form input)
- Duplicate name: server-side only (inline error from 400 response)

### Component Architecture

- **CategoryDialog** (`features/categories/components/category-dialog.tsx`): Shared dialog for create and edit. Props: `mode: "create" | "edit"`, optional `category` for edit mode, `onSuccess` callback. Contains the name input, color palette grid, and Save/Cancel buttons.
- **CategoryContextMenu** (`features/categories/components/category-context-menu.tsx`): Ellipsis button + DropdownMenu with Edit and Delete items. Props: `category`, callbacks for edit/delete.
- **DeleteCategoryDialog** (`features/categories/components/delete-category-dialog.tsx`): AlertDialog with contextual message based on `note_count`. Props: `category`, `onConfirm`, `onCancel`.
- **ColorPalette** (`features/categories/components/color-palette.tsx`): Grid of color swatches with selection state. Props: `value`, `onChange`.
- **MobileCategoryManager** (`features/categories/components/mobile-category-manager.tsx`): Fullscreen Dialog listing categories with management controls.

### Hooks

- `features/categories/hooks/use-create-category.ts` — TanStack Query mutation for `POST /api/categories/`
- `features/categories/hooks/use-update-category.ts` — TanStack Query mutation for `PATCH /api/categories/{id}/` with optimistic update
- `features/categories/hooks/use-delete-category.ts` — TanStack Query mutation for `DELETE /api/categories/{id}/` with optimistic update

### New Dependencies

- shadcn `AlertDialog` — install via `pnpm dlx shadcn@latest add alert-dialog`
- No third-party color picker library needed

### Keyboard Accessibility

- Standard shadcn `DropdownMenu` keyboard navigation: Tab to ellipsis, Enter/Space to open, arrow keys to navigate, Escape to close.
- Dialog traps focus. AlertDialog prevents outside click dismissal.

## Testing Decisions

### What to test

Nothing. There are no pure functions worth unit testing in this PRD — the logic is in mutations, UI interactions, and cache management, all of which are better covered by E2E tests in PRD 8.

### What NOT to test

- Dialog rendering, open/close behavior — visual, tested via E2E
- Optimistic update/rollback — TanStack Query behavior, tested via E2E
- DropdownMenu interaction — shadcn component, tested via E2E

## Out of Scope

- Category CRUD from the note editor dropdown — PRD 4 builds the dropdown as a selector only; it can be enhanced later to include "Add category" if needed
- Category reordering / drag-and-drop — not in product specs
- Category icons or emoji — not in product specs
- Category archiving — not in product specs
- Bulk category operations — not in product specs
