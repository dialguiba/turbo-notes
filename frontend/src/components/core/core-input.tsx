"use client";

import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ComponentProps, useState } from "react";

type CoreInputProps = ComponentProps<"input"> & {
  variant?: "default" | "password";
};

function CoreInput({
  variant = "default",
  type,
  className,
  ...props
}: CoreInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    variant === "password"
      ? showPassword
        ? "text"
        : "password"
      : (type ?? "text");

  return (
    <div className="relative">
      <Input
        type={inputType}
        className={cn(
          "border-warm-brown rounded-[6px] placeholder:text-black",
          variant === "password" && "pr-10",
          className,
        )}
        {...props}
      />
      {variant === "password" && (
        <button
          type="button"
          aria-label="Toggle password visibility"
          onClick={() => setShowPassword((prev) => !prev)}
          className="text-warm-brown absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
        >
          {showPassword ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </button>
      )}
    </div>
  );
}

export { CoreInput };
export type { CoreInputProps };
