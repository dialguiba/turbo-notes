"use client";

import { usePathname } from "next/navigation";

export function AuthPageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className="flex w-full justify-center animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      {children}
    </div>
  );
}
