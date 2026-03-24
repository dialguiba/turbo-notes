import { renderHook, act } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { useSpeechRecognition } from "../use-speech-recognition";

// --- Mock SpeechRecognition -------------------------------------------------

let mockInstance: MockSpeechRecognition;
let constructorCallCount = 0;

class MockSpeechRecognition {
  continuous = false;
  interimResults = true;
  onresult: ((event: unknown) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  onend: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn();
  abort = vi.fn();

  constructor() {
    constructorCallCount++;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    mockInstance = this;
  }
}

// --- Helpers ----------------------------------------------------------------

function simulateResult(transcript: string) {
  mockInstance.onresult?.({
    results: [[{ transcript }]],
    resultIndex: 0,
  });
}

function simulateError(error: string) {
  mockInstance.onerror?.({ error });
}

function simulateEnd() {
  mockInstance.onend?.();
}

// --- Tests ------------------------------------------------------------------

describe("useSpeechRecognition", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    constructorCallCount = 0;
    // Install global SpeechRecognition
    Object.defineProperty(window, "SpeechRecognition", {
      value: MockSpeechRecognition,
      writable: true,
      configurable: true,
    });
    // Remove webkit prefix if set
    Object.defineProperty(window, "webkitSpeechRecognition", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "SpeechRecognition", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, "webkitSpeechRecognition", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  // --- isSupported ---

  describe("isSupported", () => {
    it("returns true when SpeechRecognition is available", () => {
      const { result } = renderHook(() =>
        useSpeechRecognition({ onTranscript: vi.fn() })
      );

      expect(result.current.isSupported).toBe(true);
    });

    it("returns true when only webkitSpeechRecognition is available", () => {
      Object.defineProperty(window, "SpeechRecognition", {
        value: undefined,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, "webkitSpeechRecognition", {
        value: MockSpeechRecognition,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() =>
        useSpeechRecognition({ onTranscript: vi.fn() })
      );

      expect(result.current.isSupported).toBe(true);
    });

    it("returns false when neither SpeechRecognition nor webkitSpeechRecognition exist", () => {
      Object.defineProperty(window, "SpeechRecognition", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() =>
        useSpeechRecognition({ onTranscript: vi.fn() })
      );

      expect(result.current.isSupported).toBe(false);
    });
  });

  // --- start / stop lifecycle ---

  describe("start/stop lifecycle", () => {
    it("is not listening initially", () => {
      const { result } = renderHook(() =>
        useSpeechRecognition({ onTranscript: vi.fn() })
      );

      expect(result.current.isListening).toBe(false);
    });

    it("creates instance with continuous: true and interimResults: false on start", () => {
      const { result } = renderHook(() =>
        useSpeechRecognition({ onTranscript: vi.fn() })
      );

      act(() => result.current.start());

      expect(constructorCallCount).toBe(1);
      expect(mockInstance.continuous).toBe(true);
      expect(mockInstance.interimResults).toBe(false);
    });

    it("sets isListening to true after start()", () => {
      const { result } = renderHook(() =>
        useSpeechRecognition({ onTranscript: vi.fn() })
      );

      act(() => result.current.start());

      expect(result.current.isListening).toBe(true);
    });

    it("calls recognition.start() on start()", () => {
      const { result } = renderHook(() =>
        useSpeechRecognition({ onTranscript: vi.fn() })
      );

      act(() => result.current.start());

      expect(mockInstance.start).toHaveBeenCalled();
    });

    it("sets isListening to false after stop()", () => {
      const { result } = renderHook(() =>
        useSpeechRecognition({ onTranscript: vi.fn() })
      );

      act(() => result.current.start());
      act(() => result.current.stop());

      expect(result.current.isListening).toBe(false);
    });

    it("calls recognition.stop() on stop()", () => {
      const { result } = renderHook(() =>
        useSpeechRecognition({ onTranscript: vi.fn() })
      );

      act(() => result.current.start());
      act(() => result.current.stop());

      expect(mockInstance.stop).toHaveBeenCalled();
    });
  });

  // --- transcript ---

  describe("transcript handling", () => {
    it("calls onTranscript with the final transcript from onresult", () => {
      const onTranscript = vi.fn();
      const { result } = renderHook(() =>
        useSpeechRecognition({ onTranscript })
      );

      act(() => result.current.start());
      act(() => simulateResult("hello world"));

      expect(onTranscript).toHaveBeenCalledWith("hello world");
    });

    it("accumulates multiple transcript phrases via separate onTranscript calls", () => {
      const onTranscript = vi.fn();
      const { result } = renderHook(() =>
        useSpeechRecognition({ onTranscript })
      );

      act(() => result.current.start());
      act(() => simulateResult("first phrase"));
      act(() => simulateResult("second phrase"));

      expect(onTranscript).toHaveBeenCalledTimes(2);
      expect(onTranscript).toHaveBeenNthCalledWith(1, "first phrase");
      expect(onTranscript).toHaveBeenNthCalledWith(2, "second phrase");
    });
  });

  // --- auto-restart on onend ---

  describe("auto-restart on silence (onend)", () => {
    it("auto-restarts recognition when onend fires and session is still active", () => {
      const { result } = renderHook(() =>
        useSpeechRecognition({ onTranscript: vi.fn() })
      );

      act(() => result.current.start());
      const firstInstance = mockInstance;

      act(() => simulateEnd());

      // A new instance should be created and started
      expect(constructorCallCount).toBe(2);
      expect(mockInstance.start).toHaveBeenCalled();
      expect(mockInstance).not.toBe(firstInstance);
      expect(result.current.isListening).toBe(true);
    });

    it("does NOT auto-restart after explicit stop()", () => {
      const { result } = renderHook(() =>
        useSpeechRecognition({ onTranscript: vi.fn() })
      );

      act(() => result.current.start());
      act(() => result.current.stop());

      const countAfterStop = constructorCallCount;

      act(() => simulateEnd());

      expect(constructorCallCount).toBe(countAfterStop);
      expect(result.current.isListening).toBe(false);
    });
  });

  // --- error handling ---

  describe("error handling", () => {
    it("sets permissions error message for 'not-allowed' error", () => {
      const { result } = renderHook(() =>
        useSpeechRecognition({ onTranscript: vi.fn() })
      );

      act(() => result.current.start());
      act(() => simulateError("not-allowed"));

      expect(result.current.error).toBe(
        "Microphone access is required for voice-to-text. Please enable it in your browser settings."
      );
      expect(result.current.isListening).toBe(false);
    });

    it("sets network error message for 'network' error", () => {
      const { result } = renderHook(() =>
        useSpeechRecognition({ onTranscript: vi.fn() })
      );

      act(() => result.current.start());
      act(() => simulateError("network"));

      expect(result.current.error).toBe(
        "Voice-to-text requires an internet connection. Please check your network."
      );
      expect(result.current.isListening).toBe(false);
    });

    it("sets generic error message for other errors", () => {
      const { result } = renderHook(() =>
        useSpeechRecognition({ onTranscript: vi.fn() })
      );

      act(() => result.current.start());
      act(() => simulateError("audio-capture"));

      expect(result.current.error).toBe(
        "Something went wrong with voice-to-text. Please try again."
      );
      expect(result.current.isListening).toBe(false);
    });

    it("clears error on next start()", () => {
      const { result } = renderHook(() =>
        useSpeechRecognition({ onTranscript: vi.fn() })
      );

      act(() => result.current.start());
      act(() => simulateError("network"));
      expect(result.current.error).not.toBeNull();

      act(() => result.current.start());
      expect(result.current.error).toBeNull();
    });
  });

  // --- cleanup on unmount ---

  describe("cleanup", () => {
    it("stops recognition on unmount", () => {
      const { result, unmount } = renderHook(() =>
        useSpeechRecognition({ onTranscript: vi.fn() })
      );

      act(() => result.current.start());
      const instance = mockInstance;

      unmount();

      expect(instance.abort).toHaveBeenCalled();
    });
  });
});
