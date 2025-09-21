"use client";

import React, { useState } from "react";
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
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
import { Trash2 } from "lucide-react";
import { ObjectStorageObject } from "@/lib/sealos/resources/objectstorage/objectstorage-schemas/objectstorage-object-schema";
import { useObjectStorageLifecycle } from "@/hooks/sealos/objectstorage/use-objectstorage-lifecycle";

interface ObjectStorageDropdownMenuProps {
  object: ObjectStorageObject;
  onDelete?: (bucketName: string) => void;
}

export default function ObjectStorageDropdownMenu({
  object,
  onDelete,
}: ObjectStorageDropdownMenuProps) {
  const { name: bucketName, displayName } = object;
  const { executeAction, isPending } = useObjectStorageLifecycle();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    executeAction("delete", displayName);
    onDelete?.(bucketName);
    setShowDeleteDialog(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  return (
    <>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          onClick={handleDeleteClick}
          className="text-destructive"
          disabled={isPending("delete")}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Object Storage Bucket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{bucketName}"? This action cannot
              be undone and will permanently remove the bucket and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending("delete")}
            >
              {isPending("delete") ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
