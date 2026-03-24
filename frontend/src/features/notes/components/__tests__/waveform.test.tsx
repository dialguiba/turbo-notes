import { render, cleanup } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { Waveform } from "../waveform";

// --- Mock AnalyserNode -------------------------------------------------------

function createMockAnalyser(): AnalyserNode {
  return {
    frequencyBinCount: 32,
    getByteFrequencyData: vi.fn((array: Uint8Array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = 128;
      }
    }),
  } as unknown as AnalyserNode;
}

// --- Tests -------------------------------------------------------------------

describe("Waveform", () => {
  let rafCallbacks: FrameRequestCallback[];
  let rafIdCounter: number;
  let mockFillRect: ReturnType<typeof vi.fn>;
  let mockClearRect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    rafCallbacks = [];
    rafIdCounter = 0;
    mockFillRect = vi.fn();
    mockClearRect = vi.fn();

    const mockContext = {
      fillRect: mockFillRect,
      clearRect: mockClearRect,
      fillStyle: "",
    };

    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      mockContext as unknown as CanvasRenderingContext2D
    );

    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return ++rafIdCounter;
    });

    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  function flushRaf() {
    const cbs = [...rafCallbacks];
    rafCallbacks = [];
    cbs.forEach((cb) => cb(performance.now()));
  }

  it("renders a canvas element", () => {
    const { container } = render(<Waveform analyserNode={null} />);

    expect(container.querySelector("canvas")).not.toBeNull();
  });

  it("does not start animation loop when analyserNode is null", () => {
    render(<Waveform analyserNode={null} />);

    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("starts animation loop when analyserNode is provided", () => {
    const analyser = createMockAnalyser();
    render(<Waveform analyserNode={analyser} />);

    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });

  it("reads frequency data from analyserNode during animation", () => {
    const analyser = createMockAnalyser();
    render(<Waveform analyserNode={analyser} />);

    flushRaf();

    expect(analyser.getByteFrequencyData).toHaveBeenCalled();
  });

  it("draws exactly 5 bars per frame", () => {
    const analyser = createMockAnalyser();
    render(<Waveform analyserNode={analyser} />);

    flushRaf();

    expect(mockFillRect).toHaveBeenCalledTimes(5);
  });

  it("cancels animation on unmount", () => {
    const analyser = createMockAnalyser();
    const { unmount } = render(<Waveform analyserNode={analyser} />);

    unmount();

    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it("cancels animation when analyserNode becomes null", () => {
    const analyser = createMockAnalyser();
    const { rerender } = render(<Waveform analyserNode={analyser} />);

    rerender(<Waveform analyserNode={null} />);

    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it("continues animation loop by requesting next frame", () => {
    const analyser = createMockAnalyser();
    render(<Waveform analyserNode={analyser} />);

    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);

    flushRaf();

    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);
  });
});
