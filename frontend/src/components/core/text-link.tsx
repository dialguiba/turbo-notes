import Link from "next/link";
import { cn } from "@/lib/utils";

type TextLinkProps = React.ComponentProps<typeof Link>;

function TextLink({ className, ...props }: TextLinkProps) {
  return (
    <Link
      className={cn("text-xs underline", className)}
      {...props}
    />
  );
}

export { TextLink };
export type { TextLinkProps };
