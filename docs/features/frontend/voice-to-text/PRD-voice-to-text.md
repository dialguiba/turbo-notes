# PRD 6 — Voice-to-Text

## Problem Statement

Users can type notes but have no way to dictate them. In situations where typing is inconvenient — hands busy, on the go, or for accessibility — the only option is to type manually. The product spec (§5.4) calls for a voice-to-text feature integrated into the note editor.

## Solution

Add a floating button (headphones icon) at the bottom-right corner of the note editor. On press, the button expands into a pill bar with recording controls: a microphone indicator, a stop button, a real-time waveform visualization, a language badge, and a cursor-position indicator. Dictated speech is transcribed using the browser's native Web Speech API and inserted at the cursor position in the textarea. When the browser does not support the Web Speech API, clicking the button shows an informational message directing the user to Chrome.

## User Stories

1. As a user, I want to see a floating headphones button at the bottom-right of the note editor, so that I can initiate voice dictation.
2. As a user, I want to press the floating button and see it expand into a pill bar with recording controls, so that I know recording has started and I can control it.
3. As a user, I want to see a real-time waveform visualization in the pill bar while recording, so that I can confirm the microphone is picking up my voice.
4. As a user, I want to see a language badge (e.g., "EN", "ES") in the pill bar, so that I know which language the transcription is using.
5. As a user, I want to see an indicator showing that text will be inserted at the cursor position, so that I know where my dictated text will appear.
6. As a user, I want dictated speech to be transcribed and inserted at the cursor position in the note, so that I can dictate into a specific part of my note.
7. As a user, I want to press the red stop button to end recording, so that I can stop dictation when I'm done.
8. As a user, I want the pill bar to collapse back to the floating headphones button after I stop recording, so that the editor returns to its normal state.
9. As a user, I want the transcription to automatically restart after silence pauses, so that I don't have to press the button again after a brief pause in speech.
10. As a user, I want to see a toast notification if I deny microphone permissions, so that I know how to enable them in my browser settings.
11. As a user, I want to see an informational message when my browser doesn't support voice-to-text, so that I know to use Chrome for this feature.
12. As a user, I want the auto-save to continue working normally while I dictate, so that my dictated text is saved without any extra steps.
13. As a user, I want a final save (flush) when I stop recording, so that all dictated text is persisted even if auto-save hasn't triggered yet.
14. As a user, I want specific error messages for different failure types (permissions denied, network error), so that I can troubleshoot issues.

## Implementation Decisions

### Transcription Engine

- **Web Speech API** (`SpeechRecognition` / `webkitSpeechRecognition`) — browser-native, no backend required, no cost.
- **Browser support:** Chromium-based browsers only (Chrome, Edge, Arc). When `window.SpeechRecognition` and `window.webkitSpeechRecognition` are both undefined, clicking the floating button shows a toast/message: _"Voice-to-text is only available in Chrome for now."_
- **No backend transcription endpoint.** All processing is client-side.

### Transcription Mode

- `interimResults: false` — only final results are used.
- `continuous: true` — the recognition session stays open until the user presses Stop.
- Results are inserted into the textarea at the stored cursor position as they arrive (phrase by phrase).
- The `lang` property is NOT set explicitly — the browser uses its default locale (auto-detect). The detected language code is displayed as a badge in the pill bar (e.g., "EN", "ES") read from `navigator.language`.

### Cursor Position & Insertion

- When the user clicks the floating button to start recording, the current `selectionStart` of the textarea is captured and stored.
- Each final transcript result is inserted at the stored cursor position, and the cursor position is advanced by the length of the inserted text.
- An external indicator (small label/badge near the pill bar) shows that text is being inserted at the cursor position (e.g., a cursor icon ▎ or "At cursor").
- If the textarea has no focus or the cursor is at the end, text is appended to the end (same as cursor-at-end behavior).

### Waveform Visualization

- **Real waveform** using Web Audio API — not a CSS animation.
- `navigator.mediaDevices.getUserMedia({ audio: true })` provides the `MediaStream`.
- `AudioContext` → `createAnalyser()` → `createMediaStreamSource(stream).connect(analyser)`.
- `requestAnimationFrame` loop reads `analyser.getByteFrequencyData()` and renders ~5 bars in a small `<canvas>` element inside the pill.
- Cleanup: `AudioContext.close()`, `MediaStream.getTracks().forEach(t => t.stop())` when recording stops.

### Auto-Save Behavior

- No changes to the existing auto-save mechanism. The 1s debounce continues normally.
- Each inserted transcript phrase triggers `handleContentChange` → `autoSave.schedule()`.
- When the user presses Stop, `autoSave.flush()` is called to persist immediately.

### Floating Button & Pill Bar Layout

- The floating button is positioned `absolute` within the note editor dialog, at `bottom-4 right-4`.
- The button always remains visible (the textarea scrolls internally, so content never pushes the button off-screen). This deviates from the product spec's mention of "hidden when content is extensive" — since the editor uses internal scroll, the button is never occluded.
- On press, the button expands into a pill bar (animates toward the left) containing:
  - Microphone icon (indicates recording is active)
  - Waveform canvas (~5 animated bars)
  - Language badge (2-letter code from `navigator.language`)
  - Cursor position indicator (▎ icon or "At cursor" label)
  - Red stop button (circle with stop icon)

### Error Handling

- **Microphone permission denied:** Toast — _"Microphone access is required for voice-to-text. Please enable it in your browser settings."_
- **Network error:** Toast — _"Voice-to-text requires an internet connection. Please check your network."_
- **Silence timeout / `onend` event:** Automatic restart via `recognition.start()` while the pill is active. The user only stops recording by pressing the Stop button.
- **Other `onerror` types:** Generic toast — _"Something went wrong with voice-to-text. Please try again."_

### Component Architecture

- **`VoiceButton`** — The floating button + expanded pill bar. Manages the recording state machine (idle → recording → idle). Lives in `features/notes/components/`.
- **`Waveform`** — Small canvas component that renders real-time audio bars. Receives `analyserNode` as prop. Lives in `features/notes/components/`.

### Hooks

- **`useSpeechRecognition`** — Core hook. Manages `SpeechRecognition` lifecycle: start, stop, restart on silence, `onresult` handler, `onerror` handler, browser support detection. Returns `{ isListening, isSupported, transcript, start, stop, error }`.
- **`useWaveform`** — Manages `getUserMedia`, `AudioContext`, `AnalyserNode` lifecycle. Returns `{ analyserNode, start, stop }`. Handles cleanup on unmount.

## Testing Decisions

### What to test

- **`useSpeechRecognition` hook** — Unit test with a mock `SpeechRecognition` class. Test: start/stop lifecycle, transcript accumulation from `onresult` events, auto-restart on `onend`, error handling per error type, `isSupported` detection when API is undefined.
- **`useWaveform` hook** — Difficult to unit test meaningfully (depends on `AudioContext` and `getUserMedia`). Skip unit tests; covered by E2E.
- **Cursor insertion logic** — If extracted as a pure utility function (`insertAtCursor(content, cursorPos, transcript) → { newContent, newCursorPos }`), unit test the insertion and cursor advancement logic.

### What NOT to test

- Visual appearance of the waveform canvas
- Pill bar expand/collapse animation
- Actual speech recognition accuracy (browser responsibility)

### Prior art

- `format-note-date.test.ts` and `format-editor-date.test.ts` — examples of pure utility function tests in this codebase.

## Out of Scope

- Backend transcription endpoint (Whisper, Google Speech-to-Text, etc.)
- Language selector UI (user picks transcription language)
- Rich text / contentEditable migration for inline cursor markers
- Audio file storage or playback
- Transcription history or undo dictation
- Mobile-specific UI adaptations (pill bar is the same on all screen sizes)

## Further Notes

- The Web Speech API in Chrome requires an internet connection (audio is processed by Google's servers). This is a known limitation — the network error toast covers this case.
- Future enhancement: if browser support becomes a pain point, a backend transcription endpoint (Issue 2 of a future PRD) could serve as a fallback, using the same hook interface with a different implementation.
- The `SpeechRecognition` API may behave differently across Chrome versions. Testing should be done on latest stable Chrome.
