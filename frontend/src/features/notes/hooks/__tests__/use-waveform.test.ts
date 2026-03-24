import { renderHook, act } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { useWaveform } from "../use-waveform";

// --- Mock Web Audio API objects -----------------------------------------------

let mockAnalyserNode: MockAnalyserNode;
let mockAudioContext: MockAudioContext;
let mockMediaStream: MockMediaStream;

class MockAnalyserNode {
  fftSize = 0;
  frequencyBinCount = 32;
  getByteFrequencyData = vi.fn();
}

class MockMediaStreamSource {
  connect = vi.fn();
}

class MockAudioContext {
  state = "running";
  createAnalyser = vi.fn(() => {
    mockAnalyserNode = new MockAnalyserNode();
    return mockAnalyserNode;
  });
  createMediaStreamSource = vi.fn(() => {
    const source = new MockMediaStreamSource();
    return source;
  });
  close = vi.fn(() => Promise.resolve());

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    mockAudioContext = this;
  }
}

class MockMediaStreamTrack {
  stop = vi.fn();
}

class MockMediaStream {
  private tracks: MockMediaStreamTrack[];

  constructor() {
    this.tracks = [new MockMediaStreamTrack(), new MockMediaStreamTrack()];
  }

  getTracks() {
    return this.tracks;
  }
}

// --- Setup / teardown --------------------------------------------------------

function installMocks() {
  mockMediaStream = new MockMediaStream();

  Object.defineProperty(window, "AudioContext", {
    value: MockAudioContext,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(navigator, "mediaDevices", {
    value: {
      getUserMedia: vi.fn(() => Promise.resolve(mockMediaStream)),
    },
    writable: true,
    configurable: true,
  });
}

function removeMocks() {
  Object.defineProperty(window, "AudioContext", {
    value: undefined,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(navigator, "mediaDevices", {
    value: undefined,
    writable: true,
    configurable: true,
  });
}

// --- Tests -------------------------------------------------------------------

describe("useWaveform", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    installMocks();
  });

  afterEach(() => {
    removeMocks();
  });

  // --- initial state ---

  describe("initial state", () => {
    it("is not active initially", () => {
      const { result } = renderHook(() => useWaveform());

      expect(result.current.isActive).toBe(false);
    });

    it("has null analyserNode initially", () => {
      const { result } = renderHook(() => useWaveform());

      expect(result.current.analyserNode).toBeNull();
    });
  });

  // --- start ---

  describe("start()", () => {
    it("requests microphone access via getUserMedia", async () => {
      const { result } = renderHook(() => useWaveform());

      await act(() => result.current.start());

      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        audio: true,
      });
    });

    it("creates AudioContext and AnalyserNode pipeline", async () => {
      const { result } = renderHook(() => useWaveform());

      await act(() => result.current.start());

      expect(mockAudioContext.createAnalyser).toHaveBeenCalled();
      expect(mockAudioContext.createMediaStreamSource).toHaveBeenCalledWith(
        mockMediaStream
      );
    });

    it("connects MediaStreamSource to AnalyserNode", async () => {
      const { result } = renderHook(() => useWaveform());

      await act(() => result.current.start());

      const source = mockAudioContext.createMediaStreamSource.mock.results[0].value;
      expect(source.connect).toHaveBeenCalledWith(mockAnalyserNode);
    });

    it("exposes analyserNode after start", async () => {
      const { result } = renderHook(() => useWaveform());

      await act(() => result.current.start());

      expect(result.current.analyserNode).toBe(mockAnalyserNode);
    });

    it("sets isActive to true after start", async () => {
      const { result } = renderHook(() => useWaveform());

      await act(() => result.current.start());

      expect(result.current.isActive).toBe(true);
    });

    it("cleans up previous resources when start is called twice", async () => {
      const { result } = renderHook(() => useWaveform());

      await act(() => result.current.start());
      const firstContext = mockAudioContext;
      const firstStream = mockMediaStream;

      // Re-install a fresh MediaStream for the second start
      mockMediaStream = new MockMediaStream();
      vi.mocked(navigator.mediaDevices.getUserMedia).mockResolvedValueOnce(
        mockMediaStream as unknown as MediaStream
      );

      await act(() => result.current.start());

      expect(firstContext.close).toHaveBeenCalled();
      for (const track of firstStream.getTracks()) {
        expect(track.stop).toHaveBeenCalled();
      }
      expect(result.current.isActive).toBe(true);
    });
  });

  // --- stop ---

  describe("stop()", () => {
    it("closes AudioContext on stop", async () => {
      const { result } = renderHook(() => useWaveform());

      await act(() => result.current.start());
      act(() => result.current.stop());

      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    it("stops all MediaStream tracks on stop", async () => {
      const { result } = renderHook(() => useWaveform());

      await act(() => result.current.start());
      act(() => result.current.stop());

      for (const track of mockMediaStream.getTracks()) {
        expect(track.stop).toHaveBeenCalled();
      }
    });

    it("sets isActive to false after stop", async () => {
      const { result } = renderHook(() => useWaveform());

      await act(() => result.current.start());
      act(() => result.current.stop());

      expect(result.current.isActive).toBe(false);
    });

    it("sets analyserNode to null after stop", async () => {
      const { result } = renderHook(() => useWaveform());

      await act(() => result.current.start());
      act(() => result.current.stop());

      expect(result.current.analyserNode).toBeNull();
    });

    it("is safe to call stop before start", () => {
      const { result } = renderHook(() => useWaveform());

      expect(() => {
        act(() => result.current.stop());
      }).not.toThrow();
    });
  });

  // --- cleanup on unmount ---

  describe("cleanup on unmount", () => {
    it("closes AudioContext on unmount while active", async () => {
      const { result, unmount } = renderHook(() => useWaveform());

      await act(() => result.current.start());
      unmount();

      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    it("stops all MediaStream tracks on unmount while active", async () => {
      const { result, unmount } = renderHook(() => useWaveform());

      await act(() => result.current.start());
      unmount();

      for (const track of mockMediaStream.getTracks()) {
        expect(track.stop).toHaveBeenCalled();
      }
    });
  });

  // --- error handling ---

  describe("error handling", () => {
    it("does not throw when getUserMedia is rejected", async () => {
      vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValueOnce(
        new DOMException("Not allowed", "NotAllowedError")
      );

      const { result } = renderHook(() => useWaveform());

      await act(() => result.current.start());

      expect(result.current.isActive).toBe(false);
      expect(result.current.analyserNode).toBeNull();
    });
  });
});
