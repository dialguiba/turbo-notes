"use client";

import { useState } from "react";
import { ChevronDown, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { useCategoryFilter } from "@/features/categories/hooks/use-category-filter";
import { CreateNoteButton } from "@/features/notes/components/create-note-button";
import { MobileCategoryManager } from "@/features/categories/components/mobile-category-manager";
import type { Note } from "@/features/notes/types";

interface MobileTopBarProps {
  onNoteCreated?: (note: Note) => void;
}

export function MobileTopBar({ onNoteCreated }: MobileTopBarProps) {
  const { data: categories } = useCategories();
  const { activeCategoryId, setCategory } = useCategoryFilter();
  const [managerOpen, setManagerOpen] = useState(false);

  const activeCategory = categories?.find(
    (c) => String(c.id) === activeCategoryId,
  );
  const label = activeCategory ? activeCategory.name : "All Categories";

  return (
    <div className="flex items-center justify-between gap-2 md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="sm">
              {activeCategory && (
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: activeCategory.color }}
                />
              )}
              {label}
              <ChevronDown className="ml-1 size-3.5" />
            </Button>
          }
        />
        <DropdownMenuContent>
          <DropdownMenuItem
            className={activeCategoryId === null ? "font-bold" : ""}
            onClick={() => setCategory(null)}
          >
            All Categories
          </DropdownMenuItem>
          {categories?.map((cat) => (
            <DropdownMenuItem
              key={cat.id}
              className={activeCategoryId === String(cat.id) ? "font-bold" : ""}
              onClick={() => setCategory(cat.id)}
            >
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              {cat.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setManagerOpen(true)}>
            <Settings className="size-3.5" />
            Manage Categories
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateNoteButton onNoteCreated={onNoteCreated} />

      <MobileCategoryManager
        open={managerOpen}
        onOpenChange={setManagerOpen}
        onCategoryCreated={(cat) => setCategory(cat.id)}
      />
    </div>
  );
}
