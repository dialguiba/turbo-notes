import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        // Layout
        "h-12 w-full min-w-0 rounded-xl px-4 py-2",
        // Appearance
        "border border-warm-brown bg-transparent text-base outline-none transition-colors md:text-sm",
        // Autofill reset
        "autofill:shadow-[inset_0_0_0px_1000px_transparent] autofill:[-webkit-text-fill-color:inherit]",
        // Placeholder
        "placeholder:text-black",
        // Focus
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        // Disabled
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // Validation error
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        "dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        // File input
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
