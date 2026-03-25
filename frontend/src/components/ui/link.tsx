import NextLink from "next/link";
import { type ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Link({ className, ...props }: ComponentProps<typeof NextLink>) {
  return (
    <NextLink
      className={cn(
        "text-warm-brown underline underline-offset-4 transition-colors hover:text-warm-brown/70",
        className,
      )}
      {...props}
    />
  );
}

export { Link };
