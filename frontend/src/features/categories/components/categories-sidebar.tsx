"use client";

import { useState } from "react";
import { LogOut, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { useCategoryFilter } from "@/features/categories/hooks/use-category-filter";
import { CategoryDialog } from "@/features/categories/components/category-dialog";
import { CategoryContextMenu } from "@/features/categories/components/category-context-menu";
import { DeleteCategoryDialog } from "@/features/categories/components/delete-category-dialog";
import type { Category } from "@/features/categories/types";
import { useAuth } from "@/app/providers";

function getInitials(email: string): string {
  const [local = "", domain = ""] = email.split("@");
  return `${local[0] ?? ""}${domain[0] ?? ""}`.toUpperCase() || "?";
}

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
    <div className="group hover:bg-accent relative flex items-center rounded-md">
      <button
        onClick={onClick}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-3 py-2 text-sm"
      >
        <span
          className="size-3 shrink-0 rounded-full"
          style={{ backgroundColor: category.color }}
        />
        <span className={`truncate ${isActive ? "font-bold" : ""}`}>
          {category.name}
        </span>
      </button>
      {/* Count — visible at rest, hidden on hover */}
      <span className="text-muted-foreground mr-3 shrink-0 text-xs group-hover:hidden">
        {category.note_count}
      </span>
      {/* Context menu — overlaps count slot on hover */}
      <div className="absolute right-1 opacity-0 transition-opacity group-hover:opacity-100">
        <CategoryContextMenu onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
}

export function CategoriesSidebar() {
  const { data: categories, isLoading } = useCategories();
  const { activeCategoryId, setCategory } = useCategoryFilter();
  const { user, logout } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );

  if (isLoading) {
    return (
      <nav
        className="w-56 shrink-0 space-y-1 py-4 pr-4"
        aria-label="Categories"
      >
        <div className="text-muted-foreground px-3 py-2 text-sm">Loading…</div>
      </nav>
    );
  }

  return (
    <nav
      className="flex h-full w-56 shrink-0 flex-col px-4 py-4"
      aria-label="Categories"
    >
      {/* Scrollable category list + New Category button */}
      <ScrollArea className="flex-1">
        <div className="space-y-1">
          {/* All Categories item */}
          <button
            onClick={() => setCategory(null)}
            className="hover:bg-accent flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm"
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
              onEdit={() => setEditingCategory(cat)}
              onDelete={() => setDeletingCategory(cat)}
            />
          ))}
          <Button
            variant="ghost"
            size="lg"
            className="w-full justify-start gap-2"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-4" />
            New Category
          </Button>
        </div>
      </ScrollArea>

      {/* User footer — always visible at the bottom */}
      {user && (
        <div className="mt-auto flex items-center gap-2 border-t pt-3">
          <Avatar size="sm">
            <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
          </Avatar>
          <span className="text-muted-foreground min-w-0 flex-1 truncate text-xs">
            {user.email}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            onClick={logout}
            aria-label="Log out"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      )}

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

      <DeleteCategoryDialog
        category={deletingCategory}
        onOpenChange={(open) => {
          if (!open) setDeletingCategory(null);
        }}
      />
    </nav>
  );
}
