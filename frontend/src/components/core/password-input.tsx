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
  // The eyelid is roughly an ellipse centered at (12,12), rx≈10, ry≈4.
  // Upper arc point at x: y_top = 12 - 4*sqrt(1 - ((x-12)/10)^2)
  // Lower arc point at x: y_bot = 12 + 4*sqrt(1 - ((x-12)/10)^2)
  // Lash origins sit ON the arc; tips extend outward.
  const upperLashes = [
    { x1: 6, y1: 8.6, x2: 3.5, y2: 3.5 },
    { x1: 9, y1: 8.1, x2: 7.5, y2: 2.5 },
    { x1: 12, y1: 8, x2: 12, y2: 2 },
    { x1: 15, y1: 8.1, x2: 16.5, y2: 2.5 },
    { x1: 18, y1: 8.6, x2: 20.5, y2: 3.5 },
  ];
  const lowerLashes = [
    { x1: 6, y1: 15.4, x2: 4, y2: 19 },
    { x1: 9, y1: 15.9, x2: 8, y2: 20 },
    { x1: 12, y1: 16, x2: 12, y2: 20.5 },
    { x1: 15, y1: 15.9, x2: 16, y2: 20 },
    { x1: 18, y1: 15.4, x2: 20, y2: 19 },
  ];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Upper eyelid arc — always visible */}
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />

      {/* Pupil — visible when open */}
      <circle
        cx="12"
        cy="12"
        r="3"
        style={{
          opacity: open ? 1 : 0,
          transform: `scale(${open ? 1 : 0})`,
          transformOrigin: "12px 12px",
          transition: "opacity 0.25s ease-in-out, transform 0.25s ease-in-out",
        }}
      />

      {/* Upper lashes — visible when open */}
      {upperLashes.map(({ x1, y1, x2, y2 }, i) => (
        <line
          key={`u${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          style={{
            opacity: open ? 1 : 0,
            transform: `scaleY(${open ? 1 : 0})`,
            transformOrigin: `${x1}px ${y1}px`,
            transition: `opacity 0.25s ease-in-out, transform 0.25s ease-in-out`,
          }}
        />
      ))}

      {/* Lower lashes — visible when closed */}
      {lowerLashes.map(({ x1, y1, x2, y2 }, i) => (
        <line
          key={`l${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          style={{
            opacity: open ? 0 : 1,
            transform: `scaleY(${open ? 0 : 1})`,
            transformOrigin: `${x1}px ${y1}px`,
            transition: `opacity 0.25s ease-in-out, transform 0.25s ease-in-out`,
          }}
        />
      ))}
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
        className="text-primary absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
      >
        <AnimatedEye open={showPassword} />
      </button>
    </div>
  );
}

export { PasswordInput };
