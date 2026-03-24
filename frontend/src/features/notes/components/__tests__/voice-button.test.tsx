import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";

// --- Mocks ------------------------------------------------------------------

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

// Mock useSpeechRecognition
const mockSpeechStart = vi.fn();
const mockSpeechStop = vi.fn();
let speechOnTranscript: (transcript: string) => void;
let mockSpeechState = {
  isListening: false,
  isSupported: true,
  error: null as string | null,
  start: mockSpeechStart,
  stop: mockSpeechStop,
};

vi.mock("@/features/notes/hooks/use-speech-recognition", () => ({
  useSpeechRecognition: (opts: { onTranscript: (t: string) => void }) => {
    speechOnTranscript = opts.onTranscript;
    return mockSpeechState;
  },
}));

// Mock useWaveform
const mockWaveformStart = vi.fn().mockResolvedValue(undefined);
const mockWaveformStop = vi.fn();
let mockWaveformState = {
  analyserNode: null as AnalyserNode | null,
  isActive: false,
  start: mockWaveformStart,
  stop: mockWaveformStop,
};

vi.mock("@/features/notes/hooks/use-waveform", () => ({
  useWaveform: () => mockWaveformState,
}));

// Mock Waveform component
vi.mock("@/features/notes/components/waveform", () => ({
  Waveform: () => <div data-testid="waveform" />,
}));

// Mock insertAtCursor
vi.mock("@/features/notes/insert-at-cursor", () => ({
  insertAtCursor: (content: string, cursor: number, transcript: string) => ({
    newContent: content.slice(0, cursor) + transcript + content.slice(cursor),
    newCursorPos: cursor + transcript.length,
  }),
}));

import { VoiceButton } from "../voice-button";

// --- Helpers ----------------------------------------------------------------

const defaultProps = {
  content: "existing text",
  cursorPosition: 13,
  onContentChange: vi.fn(),
  onFlush: vi.fn(),
};

function renderButton(overrides: Partial<typeof defaultProps> = {}) {
  return render(<VoiceButton {...defaultProps} {...overrides} />);
}

// --- Tests ------------------------------------------------------------------

describe("VoiceButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSpeechState = {
      isListening: false,
      isSupported: true,
      error: null,
      start: mockSpeechStart,
      stop: mockSpeechStop,
    };
    mockWaveformState = {
      analyserNode: null,
      isActive: false,
      start: mockWaveformStart,
      stop: mockWaveformStop,
    };
    // Set navigator.language
    vi.spyOn(navigator, "language", "get").mockReturnValue("en-US");
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  // --- Floating button ---

  describe("floating button", () => {
    it("renders a headphones button", () => {
      renderButton();

      expect(
        screen.getByRole("button", { name: /voice to text/i })
      ).toBeInTheDocument();
    });

    it("shows unsupported toast when browser lacks Web Speech API", async () => {
      mockSpeechState.isSupported = false;
      renderButton();
      const user = userEvent.setup();

      await user.click(
        screen.getByRole("button", { name: /voice to text/i })
      );

      expect(toast.error).toHaveBeenCalledWith(
        "Voice-to-text is only available in Chrome for now."
      );
    });

    it("does not start recording when unsupported", async () => {
      mockSpeechState.isSupported = false;
      renderButton();
      const user = userEvent.setup();

      await user.click(
        screen.getByRole("button", { name: /voice to text/i })
      );

      expect(mockSpeechStart).not.toHaveBeenCalled();
      expect(mockWaveformStart).not.toHaveBeenCalled();
    });
  });

  // --- Starting recording ---

  describe("starting recording", () => {
    it("starts waveform first, then speech recognition", async () => {
      const callOrder: string[] = [];
      mockWaveformStart.mockImplementation(() => {
        callOrder.push("waveform");
        return Promise.resolve();
      });
      mockSpeechStart.mockImplementation(() => {
        callOrder.push("speech");
      });

      renderButton();
      const user = userEvent.setup();

      await user.click(
        screen.getByRole("button", { name: /voice to text/i })
      );

      expect(callOrder).toEqual(["waveform", "speech"]);
    });
  });

  // --- Pill bar UI ---

  describe("pill bar", () => {
    it("shows pill bar with all elements when listening", () => {
      mockSpeechState.isListening = true;
      mockWaveformState.isActive = true;
      renderButton();

      // Waveform canvas
      expect(screen.getByTestId("waveform")).toBeInTheDocument();
      // Language badge
      expect(screen.getByText("EN")).toBeInTheDocument();
      // Cursor indicator
      expect(screen.getByText(/at cursor/i)).toBeInTheDocument();
      // Stop button
      expect(
        screen.getByRole("button", { name: /stop recording/i })
      ).toBeInTheDocument();
    });

    it("shows 2-letter language code from navigator.language", () => {
      vi.spyOn(navigator, "language", "get").mockReturnValue("es-MX");
      mockSpeechState.isListening = true;
      renderButton();

      expect(screen.getByText("ES")).toBeInTheDocument();
    });
  });

  // --- Transcript insertion ---

  describe("transcript insertion", () => {
    it("calls onContentChange with inserted text when transcript arrives", () => {
      const onContentChange = vi.fn();
      mockSpeechState.isListening = true;
      renderButton({ onContentChange, content: "hello", cursorPosition: 5 });

      speechOnTranscript("world");

      expect(onContentChange).toHaveBeenCalledWith("helloworld");
    });

    it("advances cursor so consecutive transcripts accumulate correctly", () => {
      const onContentChange = vi.fn();
      mockSpeechState.isListening = true;
      renderButton({ onContentChange, content: "hello", cursorPosition: 5 });

      speechOnTranscript(" first");
      speechOnTranscript(" second");

      expect(onContentChange).toHaveBeenNthCalledWith(1, "hello first");
      expect(onContentChange).toHaveBeenNthCalledWith(2, "hello first second");
    });
  });

  // --- Stop recording ---

  describe("stopping recording", () => {
    it("stops speech and waveform, flushes auto-save on stop click", async () => {
      mockSpeechState.isListening = true;
      mockWaveformState.isActive = true;
      const onFlush = vi.fn();
      renderButton({ onFlush });
      const user = userEvent.setup();

      await user.click(
        screen.getByRole("button", { name: /stop recording/i })
      );

      expect(mockSpeechStop).toHaveBeenCalled();
      expect(mockWaveformStop).toHaveBeenCalled();
      expect(onFlush).toHaveBeenCalled();
    });

    it("collapses pill bar back to floating button after stop", () => {
      // Render in listening state → shows pill bar
      mockSpeechState.isListening = true;
      const { rerender } = render(<VoiceButton {...defaultProps} />);

      expect(screen.queryByRole("button", { name: /voice to text/i })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /stop recording/i })).toBeInTheDocument();

      // Simulate state returning to idle after stop
      mockSpeechState.isListening = false;
      rerender(<VoiceButton {...defaultProps} />);

      expect(screen.getByRole("button", { name: /voice to text/i })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /stop recording/i })).not.toBeInTheDocument();
    });
  });

  // --- Error toasts ---

  describe("error toasts", () => {
    it("shows toast when speech recognition returns an error", () => {
      mockSpeechState.error = "Microphone access is required for voice-to-text. Please enable it in your browser settings.";
      renderButton();

      expect(toast.error).toHaveBeenCalledWith(
        "Microphone access is required for voice-to-text. Please enable it in your browser settings."
      );
    });
  });
});
