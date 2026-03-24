"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// --- Web Speech API types (not in lib.dom by default) -----------------------

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionEvent {
  results: { [index: number]: SpeechRecognitionResultItem[] };
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

// --- Types ------------------------------------------------------------------

interface UseSpeechRecognitionOptions {
  onTranscript: (transcript: string) => void;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  start: () => void;
  stop: () => void;
}

// --- Constants --------------------------------------------------------------

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (
    (w.SpeechRecognition as SpeechRecognitionConstructor) ??
    (w.webkitSpeechRecognition as SpeechRecognitionConstructor) ??
    null
  );
}

const ERROR_MESSAGES: Record<string, string> = {
  "not-allowed":
    "Microphone access is required for voice-to-text. Please enable it in your browser settings.",
  network:
    "Voice-to-text requires an internet connection. Please check your network.",
};

const GENERIC_ERROR =
  "Something went wrong with voice-to-text. Please try again.";

// --- Hook -------------------------------------------------------------------

export function useSpeechRecognition({
  onTranscript,
}: UseSpeechRecognitionOptions): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported] = useState(() => getSpeechRecognitionConstructor() !== null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const isActiveRef = useRef(false);
  const onTranscriptRef = useRef(onTranscript);
  const bootstrapRef = useRef<() => SpeechRecognitionLike | null>(() => null);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    bootstrapRef.current = () => {
      const Ctor = getSpeechRecognitionConstructor();
      if (!Ctor) return null;

      const recognition = new Ctor();
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const phrase = event.results[event.resultIndex][0];
        onTranscriptRef.current(phrase.transcript);
      };

      recognition.onerror = (event) => {
        const message = ERROR_MESSAGES[event.error] ?? GENERIC_ERROR;
        setError(message);
        setIsListening(false);
        isActiveRef.current = false;
      };

      recognition.onend = () => {
        if (!isActiveRef.current) return;
        const restarted = bootstrapRef.current();
        if (restarted) {
          recognitionRef.current = restarted;
          restarted.start();
        }
      };

      return recognition;
    };
  }, []);

  const start = useCallback(() => {
    setError(null);
    isActiveRef.current = true;

    const recognition = bootstrapRef.current();
    if (recognition) {
      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    }
  }, []);

  const stop = useCallback(() => {
    isActiveRef.current = false;
    setIsListening(false);
    recognitionRef.current?.stop();
  }, []);

  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      recognitionRef.current?.abort();
    };
  }, []);

  return { isListening, isSupported, error, start, stop };
}
