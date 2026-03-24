"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

const variantMap = {
  primary: "default",
  secondary: "secondary",
  outlined: undefined, // custom styling, no shadcn variant
} as const;

type CoreButtonProps = Omit<ComponentProps<typeof Button>, "variant"> & {
  variant?: "primary" | "secondary" | "outlined";
};

function CoreButton({
  variant = "primary",
  className,
  ...props
}: CoreButtonProps) {
  if (variant === "outlined") {
    return (
      <Button
        variant="outline"
        className={cn(
          "border-warm-brown text-warm-brown rounded-full font-bold",
          className,
        )}
        {...props}
      />
    );
  }

  return (
    <Button
      variant={variantMap[variant]}
      className={cn(className)}
      {...props}
    />
  );
}

export { CoreButton };
export type { CoreButtonProps };
