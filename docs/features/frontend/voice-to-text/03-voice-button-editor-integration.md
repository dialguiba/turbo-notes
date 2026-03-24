# Issue 3: `<VoiceButton />` pill bar UI + editor integration

## Parent PRD

PRD-voice-to-text.md

## What to build

Build the `<VoiceButton />` component (floating button + pill bar) and integrate it into the existing note editor. This is the integration slice that connects the `useSpeechRecognition` hook (Issue 1) and `useWaveform` hook + `<Waveform />` component (Issue 2) into a cohesive UI within the note editor.

**`<VoiceButton />` component** renders as a floating headphones icon button positioned `absolute` at `bottom-4 right-4` within the note editor dialog. On click:
- If browser doesn't support Web Speech API → show toast: "Voice-to-text is only available in Chrome for now."
- If supported → capture textarea's `selectionStart`, expand button into a pill bar (animate toward the left), start both speech recognition and waveform hooks.

The **pill bar** contains: microphone icon (recording indicator), `<Waveform />` canvas, language badge (2-letter code from `navigator.language`, e.g., "EN", "ES"), cursor position indicator (▎ icon or "At cursor" label), and a red circular stop button.

**Editor integration**: each `onTranscript` callback from `useSpeechRecognition` calls `insertAtCursor` with the current content and stored cursor position, updates the textarea content via `handleContentChange` (triggering auto-save debounce), and advances the stored cursor position. When the user presses Stop, `autoSave.flush()` is called to persist immediately. The pill bar collapses back to the floating button.

**Error toasts**: microphone permission denied, network error, and generic error messages are shown via Sonner toast (already installed in the project).

## Acceptance criteria

- [x] Floating headphones button appears at bottom-right of the note editor dialog
- [x] Button is always visible regardless of textarea scroll position
- [x] Clicking the button on an unsupported browser shows a toast: "Voice-to-text is only available in Chrome for now."
- [x] Clicking the button on a supported browser expands into a pill bar with animation
- [x] Pill bar displays: microphone icon, waveform canvas, language badge, cursor position indicator, red stop button
- [x] Language badge shows the 2-letter code from `navigator.language` (e.g., "EN", "ES")
- [x] Cursor position indicator shows ▎ or "At cursor" label
- [x] Textarea's `selectionStart` is captured when recording starts
- [x] Dictated text is inserted at the captured cursor position and cursor position advances
- [x] Each insertion triggers `handleContentChange` → auto-save debounce
- [x] Pressing Stop: stops recognition + waveform, calls `autoSave.flush()`, collapses pill to button
- [x] Microphone permission denied shows specific toast message
- [x] Network error shows specific toast message
- [x] Other errors show generic toast message
- [x] `pnpm build` passes with no TypeScript errors
- [x] `pnpm lint` passes

## Blocked by

- Blocked by Issue 1 (`useSpeechRecognition` hook + `insertAtCursor` utility)
- Blocked by Issue 2 (`useWaveform` hook + `<Waveform />` component)

## User stories addressed

- User story 1 (floating headphones button at bottom-right)
- User story 2 (button expands into pill bar with controls)
- User story 4 (language badge in pill bar)
- User story 5 (cursor position indicator)
- User story 7 (red stop button ends recording)
- User story 8 (pill collapses back to button after stop)
- User story 12 (auto-save continues normally during dictation)
- User story 13 (flush on stop persists all dictated text)
