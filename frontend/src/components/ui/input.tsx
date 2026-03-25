import { type ComponentProps } from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        // Layout
        "h-12 w-full min-w-0 rounded-xl px-4 py-2",
        // Appearance
        "border-warm-brown border bg-transparent text-base transition-colors outline-none md:text-sm",
        // Autofill reset — delay browser's forced background so it never visually appears. Trick to be consistent with the background color since browsers often ignore custom styles for autofill.
        "autofill:[-webkit-text-fill-color:inherit] autofill:[transition:background-color_9999s_ease-in-out_0s] autofill:[-webkit-background-clip:text] autofill:[box-shadow:none]",
        // Placeholder
        "placeholder:text-muted-foreground",
        // Focus
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3",
        // Disabled
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // Validation error
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:ring-3",
        "dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        // File input
        "file:text-foreground file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
