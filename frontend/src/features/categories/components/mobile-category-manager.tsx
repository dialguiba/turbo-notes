"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { CategoryDialog } from "@/features/categories/components/category-dialog";
import type { Category } from "@/features/categories/types";

interface MobileCategoryManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryCreated?: (category: Category) => void;
}

export function MobileCategoryManager({
  open,
  onOpenChange,
  onCategoryCreated,
}: MobileCategoryManagerProps) {
  const { data: categories } = useCategories();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="fixed! inset-0! top-0! left-0! w-screen! h-screen! max-w-none! translate-x-0! translate-y-0! rounded-none! p-0! ring-0! flex flex-col"
      >
        <DialogTitle className="sr-only">Manage Categories</DialogTitle>

        {/* Top bar */}
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold">Categories</h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {/* Category list */}
        <div className="flex-1 overflow-y-auto px-4">
          <div className="space-y-1">
            {categories?.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-3 rounded-md px-3 py-2.5"
              >
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-sm">{cat.name}</span>
                {cat.note_count > 0 && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {cat.note_count}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* "+" button at bottom */}
        <div className="border-t p-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-4" />
            New Category
          </Button>
        </div>

        <CategoryDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSuccess={(cat) => {
            setCreateOpen(false);
            onOpenChange(false);
            onCategoryCreated?.(cat);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
