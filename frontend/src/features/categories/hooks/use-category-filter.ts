"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

export function useCategoryFilter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeCategoryId = searchParams.get("category");

  function setCategory(id: number | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (id === null) {
      params.delete("category");
    } else {
      params.set("category", String(id));
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return { activeCategoryId, setCategory };
}
