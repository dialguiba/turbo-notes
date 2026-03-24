"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// --- Types -------------------------------------------------------------------

interface UseWaveformReturn {
  analyserNode: AnalyserNode | null;
  isActive: boolean;
  start: () => Promise<void>;
  stop: () => void;
}

// --- Hook --------------------------------------------------------------------

export function useWaveform(): UseWaveformReturn {
  const [isActive, setIsActive] = useState(false);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const stop = useCallback(() => {
    audioContextRef.current?.close();
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    audioContextRef.current = null;
    mediaStreamRef.current = null;
    setAnalyserNode(null);
    setIsActive(false);
  }, []);

  const start = useCallback(async () => {
    stop();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      mediaStreamRef.current = stream;
      setAnalyserNode(analyser);
      setIsActive(true);
    } catch {
      // getUserMedia rejected (permission denied, no mic, etc.)
    }
  }, [stop]);

  useEffect(() => {
    return stop;
  }, [stop]);

  return { analyserNode, isActive, start, stop };
}
