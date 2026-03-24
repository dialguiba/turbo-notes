"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCategories } from "@/features/categories/hooks/use-categories";
import type { Category } from "@/features/categories/types";

function CategoryItem({
  category,
  isActive,
  onClick,
}: {
  category: Category;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent"
    >
      <span
        className="size-3 shrink-0 rounded-full"
        style={{ backgroundColor: category.color }}
      />
      <span className={isActive ? "font-bold" : ""}>{category.name}</span>
      {category.note_count > 0 && (
        <span className="ml-auto text-xs text-muted-foreground">
          {category.note_count}
        </span>
      )}
    </button>
  );
}

export function CategoriesSidebar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: categories, isLoading } = useCategories();

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

  if (isLoading) {
    return (
      <nav className="w-56 shrink-0 space-y-1 py-4 pr-4" aria-label="Categories">
        <div className="px-3 py-2 text-sm text-muted-foreground">Loading…</div>
      </nav>
    );
  }

  return (
    <nav className="w-56 shrink-0 space-y-1 py-4 pr-4" aria-label="Categories">
      <button
        onClick={() => setCategory(null)}
        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent"
      >
        <span className={activeCategoryId === null ? "font-bold" : ""}>
          All Categories
        </span>
      </button>

      {categories?.map((cat) => (
        <CategoryItem
          key={cat.id}
          category={cat}
          isActive={activeCategoryId === String(cat.id)}
          onClick={() => setCategory(cat.id)}
        />
      ))}
    </nav>
  );
}
