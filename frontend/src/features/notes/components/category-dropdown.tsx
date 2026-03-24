"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useCategories } from "@/features/categories/hooks/use-categories";
import type { NoteCategory } from "@/features/notes/types";

interface CategoryDropdownProps {
  current: NoteCategory | null;
  onSelect: (categoryId: number | null) => void;
}

export function CategoryDropdown({ current, onSelect }: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);
  const { data: categories } = useCategories();

  const otherCategories = categories?.filter((c) => c.id !== current?.id) ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="sm" className="gap-2">
            <span
              aria-hidden="true"
              className="size-3 shrink-0 rounded-full"
              style={{
                backgroundColor: current?.color ?? "#D1D5DB",
              }}
            />
            {current?.name ?? "No Category"}
            <ChevronDown className="size-3.5 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-48 p-0" align="start">
        <Command>
          <CommandList>
            <CommandGroup>
              {/* "No Category" option at top */}
              {current !== null && (
                <CommandItem
                  onSelect={() => {
                    onSelect(null);
                    setOpen(false);
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: "#D1D5DB" }}
                  />
                  No Category
                </CommandItem>
              )}

              {otherCategories.map((cat) => (
                <CommandItem
                  key={cat.id}
                  onSelect={() => {
                    onSelect(cat.id);
                    setOpen(false);
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
