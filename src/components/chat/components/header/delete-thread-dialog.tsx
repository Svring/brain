"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteThreadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threadToDelete: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteThreadDialog({
  open,
  onOpenChange,
  threadToDelete,
  onConfirm,
  onCancel,
}: DeleteThreadDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Chat Thread</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this chat thread? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
