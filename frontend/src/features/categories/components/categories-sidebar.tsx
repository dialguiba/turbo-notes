"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { useCategoryFilter } from "@/features/categories/hooks/use-category-filter";
import { CategoryDialog } from "@/features/categories/components/category-dialog";
import { CategoryContextMenu } from "@/features/categories/components/category-context-menu";
import type { Category } from "@/features/categories/types";

function CategoryItem({
  category,
  isActive,
  onClick,
  onEdit,
  onDelete,
}: {
  category: Category;
  isActive: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group flex items-center rounded-md hover:bg-accent">
      <button
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2 text-sm"
      >
        <span
          className="size-3 shrink-0 rounded-full"
          style={{ backgroundColor: category.color }}
        />
        <span className={`truncate ${isActive ? "font-bold" : ""}`}>
          {category.name}
        </span>
        {category.note_count > 0 && (
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">
            {category.note_count}
          </span>
        )}
      </button>
      <div className="pr-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
        <CategoryContextMenu onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
}

export function CategoriesSidebar() {
  const { data: categories, isLoading } = useCategories();
  const { activeCategoryId, setCategory } = useCategoryFilter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  if (isLoading) {
    return (
      <nav className="w-56 shrink-0 space-y-1 py-4 pr-4" aria-label="Categories">
        <div className="px-3 py-2 text-sm text-muted-foreground">Loading…</div>
      </nav>
    );
  }

  return (
    <nav
      className="flex w-56 shrink-0 flex-col py-4 pr-4"
      aria-label="Categories"
    >
      {/* All Categories — fixed at top */}
      <button
        onClick={() => setCategory(null)}
        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent"
      >
        <span className={activeCategoryId === null ? "font-bold" : ""}>
          All Categories
        </span>
      </button>

      {/* Scrollable category list */}
      <ScrollArea className="flex-1">
        <div className="space-y-1">
          {categories?.map((cat) => (
            <CategoryItem
              key={cat.id}
              category={cat}
              isActive={activeCategoryId === String(cat.id)}
              onClick={() => setCategory(cat.id)}
              onEdit={() => setEditingCategory(cat)}
              onDelete={() => {/* wired in next commit */}}
            />
          ))}
        </div>
      </ScrollArea>

      {/* "+" button pinned at bottom */}
      <div className="pt-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="size-4" />
          New Category
        </Button>
      </div>

      <CategoryDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={(cat) => setCategory(cat.id)}
      />

      <CategoryDialog
        open={!!editingCategory}
        onOpenChange={(open) => {
          if (!open) setEditingCategory(null);
        }}
        category={editingCategory ?? undefined}
      />

    </nav>
  );
}
