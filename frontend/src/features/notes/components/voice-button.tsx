"use client";

import { useCallback, useEffect, useRef } from "react";
import { Headphones, Mic, Square } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSpeechRecognition } from "@/features/notes/hooks/use-speech-recognition";
import { useWaveform } from "@/features/notes/hooks/use-waveform";
import { Waveform } from "@/features/notes/components/waveform";
import { insertAtCursor } from "@/features/notes/insert-at-cursor";

// --- Types -------------------------------------------------------------------

interface VoiceButtonProps {
  content: string;
  cursorPosition: number;
  onContentChange: (newContent: string) => void;
  onFlush: () => void;
}

// --- Helpers -----------------------------------------------------------------

function getLanguageBadge(): string {
  if (typeof navigator === "undefined") return "EN";
  return navigator.language.slice(0, 2).toUpperCase();
}

// --- Component ---------------------------------------------------------------

export function VoiceButton({
  content,
  cursorPosition,
  onContentChange,
  onFlush,
}: VoiceButtonProps) {
  const contentRef = useRef(content);
  const cursorRef = useRef(cursorPosition);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    cursorRef.current = cursorPosition;
  }, [cursorPosition]);

  const handleTranscript = useCallback(
    (transcript: string) => {
      const { newContent, newCursorPos } = insertAtCursor(
        contentRef.current,
        cursorRef.current,
        transcript,
      );
      cursorRef.current = newCursorPos;
      contentRef.current = newContent;
      onContentChange(newContent);
    },
    [onContentChange],
  );

  const { isListening, isSupported, error, start, stop } =
    useSpeechRecognition({ onTranscript: handleTranscript });

  const waveform = useWaveform();

  // Show toast on error from speech recognition
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  async function handleStart() {
    if (!isSupported) {
      toast.error("Voice-to-text is only available in Chrome for now.");
      return;
    }
    await waveform.start();
    start();
  }

  function handleStop() {
    stop();
    waveform.stop();
    onFlush();
  }

  // --- Pill bar (recording active) ---
  if (isListening) {
    return (
      <div className="absolute right-4 bottom-4 flex animate-in fade-in slide-in-from-right-4 items-center gap-2 rounded-full bg-foreground/80 py-1.5 pr-1.5 pl-3 text-background shadow-lg duration-200">
        {/* Recording indicator */}
        <Mic className="size-4 animate-pulse text-red-400" />

        {/* Waveform */}
        <Waveform analyserNode={waveform.analyserNode} />

        {/* Language badge */}
        <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide">
          {getLanguageBadge()}
        </span>

        {/* Cursor position indicator */}
        <span className="text-xs opacity-60">At cursor</span>

        {/* Stop button */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-7 rounded-full bg-red-500 text-background hover:bg-red-600"
          onClick={handleStop}
          aria-label="Stop recording"
        >
          <Square className="size-3 fill-current" />
        </Button>
      </div>
    );
  }

  // --- Floating button (idle) ---
  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute right-4 bottom-4 size-10 rounded-full bg-foreground/60 text-background shadow-lg hover:bg-foreground/80"
      onClick={handleStart}
      aria-label="Voice to text"
    >
      <Headphones className="size-5" />
    </Button>
  );
}
