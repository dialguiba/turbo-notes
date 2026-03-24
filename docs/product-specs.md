# Note-Taking App — Product Specifications

## Overview

A note-taking application that allows users to create, organize, and edit notes by category. The app provides a clean, aesthetic interface with automatic saving, color-coded categories, and smart date formatting.

---

## 1. Authentication

### 1.1 Sign Up

- **Heading**: "Yay, New Friend!"
- **Illustration**: Sleeping dog/cow mascot
- **Fields**: Email address, Password
- **Password visibility toggle**: Users can show/hide the password they are typing
- **Button**: "Sign Up" (primary button)
- **Navigation link**: "We're already friends!" — navigates to Login screen
- **Background**: Warm beige/cream
- **On success**: Create account and redirect to the main notes screen (empty state)

### 1.2 Login

- **Heading**: "Yay, You're Back!"
- **Illustration**: Cactus mascot
- **Fields**: Email address, Password
- **Password visibility toggle**: Users can show/hide the password they are typing
- **Button**: "Login" (primary button)
- **Navigation link**: "Oops! I've never been here before" — navigates to Sign Up screen
- **Background**: Warm beige/cream
- **On success**: Redirect to the main notes screen

### 1.3 Technical Details

- JWT-based authentication (already configured via `djangorestframework-simplejwt`)
- Backend: `apps/users`

---

## 2. Categories

### 2.1 Default Categories

Three categories are **automatically created** for every new user:

| Category | Associated Color |
| --- | --- |
| Random Thoughts | Orange/Peach |
| School | Golden Yellow |
| Personal | Teal/Aqua Blue |

### 2.2 Category Display (Sidebar)

- Each category shows:
  - **Color indicator** (circle or swatch matching the category color)
  - **Category name**
  - **Note count** (number of notes in that category) — **hidden when count is 0**
- An **"All Categories"** option shows all notes (no filter)

### 2.3 Category Filtering

- Clicking a category filters the notes list to show only notes belonging to that category
- The **selected category name is displayed in bold** as a visual indicator
- Note counts for all categories remain visible (global counts, not filtered counts)
- Clicking "All Categories" removes the filter and shows all notes

### 2.4 Custom Categories

- Users can create custom categories beyond the 3 defaults
- Each custom category requires a **name** and a **color**

### 2.5 Editing Categories

- Users can edit the **name** and **color** of any category (including the 3 defaults)
- Editing is accessible via the category dropdown in the note editor
- Changes apply immediately to all notes assigned to that category

### 2.6 Deleting Categories

- When a category is deleted, all its notes become **uncategorized** (`category = null`) — the notes are preserved, only the category link is removed
- All categories (including the 3 defaults) are fully editable and deletable

---

## 3. Notes

### 3.1 Creating a Note

- Users create a note by clicking the **"New Note"** button/icon
- The note is **automatically created** on click — no explicit save action required
- New notes open immediately in the editor view

### 3.2 Note Structure

Each note has the following fields:

| Field | Description |
| --- | --- |
| **Title** | Editable text field |
| **Content** | Editable text body |
| **Category** | Selectable from a dropdown of existing categories |
| **Last Edited** | Timestamp, auto-updated on any edit |

### 3.3 Auto-Save Behavior

- Notes are **automatically saved** as the user types
- The **"Last Edited" timestamp** updates in real-time as edits are made
- No manual save button exists

### 3.4 Category & Color

- Each note is assigned a category
- The **background color** of the note (in both editor and preview) reflects the color of its assigned category
- Changing the category via dropdown immediately changes the background color

---

## 4. Notes List Screen (Main Screen)

### 4.1 Layout

- **Left sidebar**: Category list with filters
- **Main area**: Grid of note preview cards in **3 columns**
- **Sort order**: Cards are ordered by **last edited date, descending** (most recent first)
- **"+ New Note" button**: Positioned at the top right of the main area

### 4.2 Empty State

- When a new user has no notes, display an empty state with:
  - The category sidebar (with default categories, note counts hidden when 0)
  - **Illustration**: Boba tea/bubble tea mascot (centered in main area)
  - **Text**: "I'm just here waiting for your charming notes..."
  - The **"+ New Note" button** remains visible at the top right

### 4.3 Preview Cards

Each note is displayed as a preview card containing:

| Element | Details |
| --- | --- |
| **Date** | Last edited date (see date formatting rules below) |
| **Category** | Category name |
| **Title** | Note title |
| **Content** | Note content preview — **truncated** if it exceeds the card space |

### 4.4 Date Formatting Rules

| Condition | Display Format | Example |
| --- | --- | --- |
| Edited **today** | `Today` | Today |
| Edited **yesterday** | `Yesterday` | Yesterday |
| Edited **before yesterday** | `Month Day` | Mar 19 |

- **No year** should ever be displayed
- Relative dates (`Today`, `Yesterday`) take priority over absolute dates

> **Note**: These rules apply to **preview cards only**. Inside the note editor, the full timestamp is shown — see section 5.2.

---

## 5. Note Editor Screen

### 5.1 Opening a Note

- Clicking on a preview card opens the note in a **fullscreen/modal editor view** (replaces the notes list)

### 5.2 Editor Layout

- **Category Dropdown**: Positioned at the **top left**, outside the note content area
  - Shows the current category with its **color indicator** (circle)
  - On open, lists all other categories (excludes the currently selected one)
  - Each option displays its color indicator
  - Changing the category immediately updates the note's category and background color
- **Close button (X icon)**: Positioned at the **top right**
- **Note content area**: Background color matches the assigned category color
  - **"Last Edited" timestamp**: Displayed at the top right of the content area, format: `Last Edited: Month Day, Year at H:MMpm` (e.g., "Last Edited: July 21, 2024 at 8:39pm")
  - **Title**: Click to edit (placeholder: "Note Title")
  - **Content**: Click to edit (placeholder: "Pour your heart out...")

### 5.3 Behavior

- All changes auto-save
- Last edited timestamp updates on every edit
- Background color updates when category changes
- Clicking the **X icon** returns to the notes list

### 5.4 Voice-to-Text

- A **floating button** (headphones icon) is displayed at the **bottom right** of the editor
- The floating button is **always visible** — the editor uses internal scroll so the button is never occluded by content
- On press, the button **expands into a pill/bar** (animates toward the left) with the following controls:
  - **Microphone icon** — indicates recording is active
  - **Stop/hang-up button** (red) — stops the recording
  - **Equalizer/waveform visualization** — real-time audio bars reflecting actual microphone input
  - **Language badge** — 2-letter code (e.g., "EN", "ES") showing the auto-detected transcription language
  - **Cursor position indicator** — shows that text is being inserted at the cursor position
  - **Headphones icon**
- Dictated speech is **transcribed to text** and **inserted at the cursor position** in the note content
- If the cursor is at the end or the textarea has no focus, text is appended to the end
- Uses the **browser's native Web Speech API** (Chromium only). Unsupported browsers see an informational message when clicking the button
- Transcription auto-restarts after silence pauses; the user must press Stop to end recording

---

## 6. UI Components

The following reusable components are used across the application:

| Component | Description |
| --- | --- |
| **Note Card** | Preview card displaying date, category, title, and truncated content. Background color matches category. |
| **Category Dropdown** | Dropdown selector with color indicator per option. Used in the note editor to change a note's category. |
| **Item Category** | Sidebar element displaying a color dot, category name, and note count. |
| **Button Primary** | Main action button (e.g., "Sign Up", "Login") |
| **Button Secondary** | Secondary action button |
| **X Icon** | Close/dismiss icon button (e.g., close the note editor) |

---

## 7. Acceptance Criteria Summary

- [ ] User can sign up with email and password
- [ ] User can toggle password visibility on sign up/login
- [ ] User can log in with existing credentials
- [ ] New users see 3 default categories: Random Thoughts, School, Personal
- [ ] New users see an empty state with boba tea illustration and "I'm just here waiting for your charming notes..."
- [ ] User can create a new note by clicking "+ New Note"
- [ ] Notes are auto-created (no manual save)
- [ ] Notes have title, content, category, and last-edited timestamp
- [ ] Last-edited timestamp updates in real-time as user types
- [ ] Editor shows "Last Edited" with full date and time (e.g., "July 21, 2024 at 8:39pm")
- [ ] Changing a note's category changes its background color
- [ ] Notes list shows preview cards in a 3-column grid, sorted by last edited descending
- [ ] Dates on cards display as "Today", "Yesterday", or "Mon Day" (no year)
- [ ] Clicking a category filters notes to that category only
- [ ] Selected category is visually indicated with bold text
- [ ] "All Categories" shows all notes
- [ ] Each category shows its color, name, and note count (count hidden when 0)
- [ ] User can edit existing notes (title, content, category)
- [ ] User can create custom categories
- [ ] User can edit the name and color of any category
- [ ] User can dictate notes using voice-to-text (Chrome only; other browsers show informational message)
- [ ] Voice-to-text inserts dictated text at the cursor position
- [ ] Pill bar shows real-time waveform, language badge, and cursor position indicator
- [ ] Recording auto-restarts after silence; user presses Stop to end
- [ ] Note editor opens as a fullscreen/modal view with X button to close
