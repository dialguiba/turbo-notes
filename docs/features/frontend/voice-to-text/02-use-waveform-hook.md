# Issue 2: `useWaveform` hook + `<Waveform />` component

## Parent PRD

PRD-voice-to-text.md

## What to build

Build the waveform visualization system: a hook (`useWaveform`) that manages the Web Audio API pipeline, and a canvas component (`<Waveform />`) that renders real-time audio bars.

**`useWaveform` hook** manages: requesting microphone access via `navigator.mediaDevices.getUserMedia({ audio: true })`, creating an `AudioContext` with `createAnalyser()` and `createMediaStreamSource(stream).connect(analyser)`, exposing the `analyserNode` for the canvas to read frequency data, and full cleanup on stop (`AudioContext.close()`, `MediaStream.getTracks().forEach(t => t.stop())`). Returns `{ analyserNode, isActive, start, stop }`.

**`<Waveform />` component** receives an `AnalyserNode` as prop. Uses `requestAnimationFrame` to continuously read `analyser.getByteFrequencyData()` and render ~5 vertical bars on a small `<canvas>` element. Bar heights are proportional to frequency magnitudes. The canvas fits within the pill bar dimensions (~60×24px). The animation loop stops when the component unmounts or the analyser prop becomes null.

No speech recognition in this issue — audio visualization only.

## Acceptance criteria

- [x] `useWaveform` hook requests microphone access via `getUserMedia`
- [x] Hook creates `AudioContext` → `AnalyserNode` → `MediaStreamSource` pipeline on `start()`
- [x] Hook exposes `analyserNode` for the `<Waveform />` component to consume
- [x] `stop()` closes `AudioContext` and stops all `MediaStream` tracks
- [x] Hook cleans up all resources on unmount (no audio leaks)
- [x] `<Waveform />` renders a small canvas (~5 bars) that animates based on `getByteFrequencyData()`
- [x] Bars reflect actual microphone input levels (not a CSS animation)
- [x] Animation loop starts when `analyserNode` prop is provided and stops on unmount or null prop
- [x] Component handles missing `analyserNode` gracefully (renders empty/static bars)
- [x] `pnpm build` passes with no TypeScript errors
- [x] `pnpm lint` passes

## Blocked by

None — can start immediately (parallelizable with Issue 1).

## User stories addressed

- User story 3 (real-time waveform visualization confirming microphone is picking up voice)
