# Issue 1: `useSpeechRecognition` hook + `insertAtCursor` utility

## Parent PRD

PRD-voice-to-text.md

## What to build

Build the core speech recognition hook (`useSpeechRecognition`) that encapsulates the entire Web Speech API lifecycle, and a pure utility function (`insertAtCursor`) for inserting transcribed text at a specific cursor position.

**`useSpeechRecognition` hook** manages: creating and configuring the `SpeechRecognition` instance (`continuous: true`, `interimResults: false`, no explicit `lang`), starting and stopping recognition, handling `onresult` events to accumulate final transcript phrases, auto-restarting on `onend` (silence timeout) while the session is active, detecting browser support (`window.SpeechRecognition` / `window.webkitSpeechRecognition`), and handling `onerror` with specific messages per error type (`not-allowed` → permissions toast, `network` → network toast, others → generic toast). Returns `{ isListening, isSupported, start, stop, error }` and accepts an `onTranscript` callback invoked with each final phrase.

**`insertAtCursor` utility** is a pure function: `insertAtCursor(content, cursorPos, transcript)` → `{ newContent, newCursorPos }`. It inserts the transcript string (prepended with a space separator if not at position 0) at `cursorPos` within `content`, and returns the new content plus the updated cursor position advanced by the inserted length.

No UI components in this issue — hooks and utilities only.

## Acceptance criteria

- [x] `useSpeechRecognition` hook detects browser support and exposes `isSupported` boolean
- [x] `start()` creates a `SpeechRecognition` instance with `continuous: true` and `interimResults: false`
- [x] `onresult` handler extracts final transcript and calls the `onTranscript` callback
- [x] On `onend` event, recognition auto-restarts if the session is still active (user hasn't pressed stop)
- [x] `stop()` ends recognition and sets `isListening` to false (no auto-restart after explicit stop)
- [x] `onerror` handler sets specific error messages: `not-allowed` (permissions), `network` (connection), generic for others
- [x] Hook cleans up recognition instance on unmount
- [x] `insertAtCursor` inserts text at the given cursor position and returns updated content + new cursor position
- [x] `insertAtCursor` prepends a space separator when inserting at a non-zero position with no preceding space
- [x] `insertAtCursor` appends to end when cursor position equals content length
- [x] Vitest tests cover `useSpeechRecognition`: start/stop lifecycle, transcript accumulation, auto-restart on `onend`, error handling per type, `isSupported` detection
- [x] Vitest tests cover `insertAtCursor`: insertion at start, middle, end, with and without existing spaces
- [x] `pnpm build` passes with no TypeScript errors
- [x] `pnpm lint` passes

## Blocked by

None — can start immediately.

## User stories addressed

- User story 6 (dictated speech transcribed and inserted at cursor position)
- User story 9 (transcription auto-restarts after silence)
- User story 10 (toast notification if microphone permissions denied)
- User story 11 (informational message when browser doesn't support voice-to-text)
- User story 14 (specific error messages for different failure types)
