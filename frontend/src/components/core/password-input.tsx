"use client";

import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ComponentProps, useState } from "react";

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
        {showPassword ? (
          <EyeOff className="size-4" />
        ) : (
          <Eye className="size-4" />
        )}
      </button>
    </div>
  );
}

export { PasswordInput };
