"use client";

import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function DeleteNoteDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: DeleteNoteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        size="sm"
        className="bg-beige ring-warm-brown/15 gap-3"
      >
        <AlertDialogHeader className="gap-1">
          <AlertDialogMedia className="bg-transparent">
            <Trash2 className="text-title-brown size-5" />
          </AlertDialogMedia>
          <AlertDialogTitle className="font-heading text-title-brown">
            Delete this note?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="border-warm-brown/10 bg-transparent">
          <AlertDialogCancel variant="ghost">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isPending}>
            {isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
