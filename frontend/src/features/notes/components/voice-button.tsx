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
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
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
  textareaRef,
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

      // Keep the textarea cursor in sync so the user sees the insertion point
      const ta = textareaRef.current;
      if (ta) {
        requestAnimationFrame(() => {
          ta.focus();
          ta.setSelectionRange(newCursorPos, newCursorPos);
        });
      }
    },
    [onContentChange, textareaRef],
  );

  const { isListening, isSupported, error, start, stop } =
    useSpeechRecognition({ onTranscript: handleTranscript });

  const waveform = useWaveform();
  const stopWaveform = waveform.stop;

  // On speech recognition error: show toast and release the microphone
  useEffect(() => {
    if (error) {
      toast.error(error);
      stopWaveform();
    }
  }, [error, stopWaveform]);

  async function handleStart() {
    if (!isSupported) {
      toast.error("Voice-to-text is only available in Chrome for now.");
      return;
    }
    await waveform.start();
    start();

    // Restore focus + cursor so the user sees where dictated text will land
    const ta = textareaRef.current;
    if (ta) {
      ta.focus();
      ta.setSelectionRange(cursorRef.current, cursorRef.current);
    }
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
        <span className="rounded bg-background/20 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide">
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
      variant={null}
      size="icon"
      className="absolute right-4 bottom-4 size-10 rounded-full bg-foreground text-background shadow-lg hover:bg-foreground/80"
      onClick={handleStart}
      aria-label="Voice to text"
    >
      <Headphones className="size-5" />
    </Button>
  );
}
