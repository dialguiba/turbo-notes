"use client";

import { useState } from "react";
import { ChevronDown, Settings } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { CreateNoteButton } from "@/features/notes/components/create-note-button";
import { MobileCategoryManager } from "@/features/categories/components/mobile-category-manager";
import type { Note } from "@/features/notes/types";

interface MobileTopBarProps {
  onNoteCreated?: (note: Note) => void;
}

export function MobileTopBar({ onNoteCreated }: MobileTopBarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: categories } = useCategories();
  const [managerOpen, setManagerOpen] = useState(false);

  const activeCategoryId = searchParams.get("category");

  const activeCategory = categories?.find(
    (c) => String(c.id) === activeCategoryId,
  );
  const label = activeCategory ? activeCategory.name : "All Categories";

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
