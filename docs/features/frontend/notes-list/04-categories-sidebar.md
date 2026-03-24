# Issue 4: Categories sidebar + filter

## Parent PRD

PRD-notes-list.md

## What to build

Build the category sidebar on the `/notes` page. Fetch categories via TanStack Query (`GET /api/categories/`) and display them in a vertical sidebar (desktop) with color dot, name, and note count for each category. Note counts are hidden when 0. An "All Categories" option at the top removes any filter. Clicking a category sets a URL search param (`?category=<id>`) that will be consumed by the notes grid in issue 5. The active category is displayed in bold.

The sidebar lives inside `/notes/page.tsx`, not in the dashboard layout (the editor page in PRD 4 is fullscreen without a sidebar).

Establish the `useCategories` hook in `features/categories/hooks/` and the `Category` type in `features/categories/types.ts`.

## Acceptance criteria

- [ ] Categories fetched from `GET /api/categories/` via TanStack Query with key `["categories"]`
- [ ] Sidebar displays each category with color dot, name, and note count
- [ ] Note count hidden when category has 0 notes
- [ ] "All Categories" option at the top of the list
- [ ] Clicking a category sets `?category=<id>` in the URL
- [ ] Clicking "All Categories" removes the `category` search param
- [ ] Active category name is bold
- [ ] Sidebar renders inside `/notes/page.tsx`, not in the layout

## Blocked by

- Blocked by Issue 2 (real auth — need to be logged in to fetch categories)
- Blocked by Issue 3 (route protection — need redirects working)

## User stories addressed

- User story 21 (sidebar with color, name, count)
- User story 22 (count hidden when 0)
- User story 23 ("All Categories" option)
- User story 24 (bold active category)
- User story 25 (click "All Categories" to remove filter)
- User story 26 (filter persists in URL)
