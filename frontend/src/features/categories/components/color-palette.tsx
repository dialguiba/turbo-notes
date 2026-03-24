"use client";

import { Check } from "lucide-react";
import { CATEGORY_COLORS } from "@/features/categories/constants";
import { cn } from "@/lib/utils";

interface ColorPaletteProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPalette({ value, onChange }: ColorPaletteProps) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {CATEGORY_COLORS.map(({ name, hex }) => (
        <button
          key={hex}
          type="button"
          onClick={() => onChange(hex)}
          className={cn(
            "flex size-8 items-center justify-center rounded-full transition-transform hover:scale-110",
            value === hex && "ring-foreground/30 ring-2 ring-offset-2",
          )}
          style={{ backgroundColor: hex }}
          title={name}
          aria-label={name}
          aria-pressed={value === hex}
        >
          {value === hex && <Check className="size-3.5 opacity-60" />}
        </button>
      ))}
    </div>
  );
}
