"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ComponentProps, useState } from "react";

/**
 * Inline SVG eye icon with a clip-path "eyelid" animation.
 * When closed, the clip ellipse collapses to a horizontal line.
 * When open, it expands to reveal the full eye.
 */
function AnimatedEye({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
    >
      {/* Eyelid outline — always visible */}
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />

      {/* Pupil + slash line, clipped by an animated ellipse "eyelid" */}
      <g
        style={{
          clipPath: open
            ? "ellipse(50% 50% at 50% 50%)"
            : "ellipse(50% 0% at 50% 50%)",
          transition: "clip-path 0.3s ease-in-out",
        }}
      >
        <circle cx="12" cy="12" r="3" />
      </g>

      {/* Diagonal slash — fades out when eye opens */}
      <line
        x1="2"
        y1="2"
        x2="22"
        y2="22"
        style={{
          opacity: open ? 0 : 1,
          transition: "opacity 0.2s ease-in-out",
        }}
      />
    </svg>
  );
}

function PasswordInput({ className, ...props }: ComponentProps<"input">) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn("pr-10", className)}
        {...props}
      />
      <button
        type="button"
        aria-label="Toggle password visibility"
        onClick={() => setShowPassword((prev) => !prev)}
        className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
      >
        <AnimatedEye open={showPassword} />
      </button>
    </div>
  );
}

export { PasswordInput };
