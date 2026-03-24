# Issue 1: Category create dialog + sidebar "+" button

## Parent PRD

PRD-category-management.md

## What to build

Add the ability to create custom categories from the sidebar. Build the shared `CategoryDialog` component with a name input (`maxLength={100}`, trim on submit, Save disabled when empty/whitespace) and a `ColorPalette` grid of 12 curated pastels (first swatch pre-selected). Add a "+" button pinned at the bottom of the sidebar, wrap the category list in `ScrollArea` for overflow. Wire `useCreateCategory` hook (server-first, invalidate `["categories"]`, auto-select new category as active filter). Display inline field errors for duplicate names from the server response.

On mobile, add a "Manage Categories" entry (with divider) at the bottom of the `MobileTopBar` category dropdown. Tapping it opens a fullscreen `Dialog` listing all categories with color dots, names, note counts, and a "+" button at the bottom. X to close.

Install shadcn `AlertDialog` as setup for Issue 3.

## Acceptance criteria

- [x] "+" button visible at the bottom of the sidebar, below the scrollable category list
- [x] Category list wraps in `ScrollArea` — scrolls independently when list exceeds available height
- [x] "All Categories" remains at the top, outside the scroll area
- [x] Clicking "+" opens a `Dialog` with name input and 12-color pastel palette
- [x] First palette color (Peach `#FFD4B2`) is pre-selected by default
- [x] Save button is disabled when name is empty or whitespace-only
- [x] Name input has `maxLength={100}`
- [x] Name is trimmed before submission
- [x] On success: new category appears in sidebar, URL filter switches to `?category={newId}`
- [x] On duplicate name (400): inline error under the name field shows server message
- [x] Mobile: "Manage Categories" entry appears in `MobileTopBar` dropdown (separated by divider)
- [x] Mobile: tapping "Manage Categories" opens a fullscreen `Dialog` with category list + "+" button
- [x] Mobile: X button closes the management sheet
- [x] `useCreateCategory` hook invalidates `["categories"]` query on success
- [x] shadcn `AlertDialog` component is installed
- [x] `pnpm build` passes with no TypeScript errors
- [x] `pnpm lint` passes

## Blocked by

None — can start immediately.

## User stories addressed

- User story 1 (create custom category with name and color)
- User story 2 (pick color from curated palette)
- User story 7 (sidebar scrolls, "+" always accessible)
- User story 8 (inline errors for duplicate names)
- User story 9 (mobile category management)
- User story 10 (new category becomes active filter)
