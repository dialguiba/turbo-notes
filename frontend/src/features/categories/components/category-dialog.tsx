"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColorPalette } from "@/features/categories/components/color-palette";
import { DEFAULT_COLOR } from "@/features/categories/constants";
import { useCreateCategory } from "@/features/categories/hooks/use-create-category";
import { ApiError } from "@/lib/api-client";
import type { Category } from "@/features/categories/types";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (category: Category) => void;
}

export function CategoryDialog({
  open,
  onOpenChange,
  onSuccess,
}: CategoryDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(DEFAULT_COLOR);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const createCategory = useCreateCategory();

  const trimmedName = name.trim();
  const canSave = trimmedName.length > 0 && !createCategory.isPending;

  function reset() {
    setName("");
    setColor(DEFAULT_COLOR);
    setFieldError(null);
    createCategory.reset();
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  }

  async function handleSave() {
    setFieldError(null);
    try {
      const created = await createCategory.mutateAsync({
        name: trimmedName,
        color,
      });
      reset();
      onOpenChange(false);
      onSuccess?.(created);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        const data = err.data as Record<string, string[]>;
        if (data.name?.[0]) {
          setFieldError(data.name[0]);
          return;
        }
      }
      setFieldError("Something went wrong. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>New Category</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldError) setFieldError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSave) handleSave();
              }}
              placeholder="Category name"
              maxLength={100}
              autoFocus
            />
            {fieldError && (
              <p className="text-destructive text-xs">{fieldError}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Color</Label>
            <ColorPalette value={color} onChange={setColor} />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            size="sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!canSave}
            size="sm"
          >
            {createCategory.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
