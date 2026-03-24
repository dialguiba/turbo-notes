"use client";

import { useState } from "react";
import { toast } from "sonner";
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
import { useUpdateCategory } from "@/features/categories/hooks/use-update-category";
import { ApiError } from "@/lib/api-client";
import type { Category } from "@/features/categories/types";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
  onSuccess?: (category: Category) => void;
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        {open && (
          <CategoryForm
            category={category}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CategoryForm({
  category,
  onClose,
  onSuccess,
}: {
  category?: Category;
  onClose: () => void;
  onSuccess?: (category: Category) => void;
}) {
  const isEdit = !!category;
  const [name, setName] = useState(category?.name ?? "");
  const [color, setColor] = useState(category?.color ?? DEFAULT_COLOR);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const isPending = createCategory.isPending || updateCategory.isPending;
  const trimmedName = name.trim();
  const canSave = trimmedName.length > 0 && !isPending;

  async function handleSave() {
    setFieldError(null);

    if (isEdit) {
      const payload: { id: number; name?: string; color?: string } = {
        id: category.id,
      };
      if (trimmedName !== category.name) payload.name = trimmedName;
      if (color !== category.color) payload.color = color;

      if (!payload.name && !payload.color) {
        onClose();
        return;
      }

      // Optimistic — close immediately, toast on error
      onClose();
      try {
        const updated = await updateCategory.mutateAsync(payload);
        onSuccess?.(updated);
      } catch (err) {
        if (err instanceof ApiError && err.status === 400) {
          const data = err.data as Record<string, string[]>;
          if (data.name?.[0]) {
            toast.error(data.name[0]);
            return;
          }
        }
      }
    } else {
      try {
        const created = await createCategory.mutateAsync({
          name: trimmedName,
          color,
        });
        onClose();
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
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit Category" : "New Category"}</DialogTitle>
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
        <Button variant="outline" onClick={onClose} size="sm">
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!canSave} size="sm">
          {isPending ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </>
  );
}
