"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { AlertCircleIcon } from "lucide-react";
import { useProjectLifecycle } from "@/hooks/brain/use-project-lifecycle";

interface UseDeleteProjectDialogProps {
  projectName: string;
  projectDisplayName: string;
  shouldRedirect?: boolean;
  onDelete?: (projectName: string) => void;
}

export function useDeleteProjectDialog({
  projectName,
  projectDisplayName,
  shouldRedirect = false,
  onDelete,
}: UseDeleteProjectDialogProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmationValue, setDeleteConfirmationValue] = useState("");

  const { deleteProject, isDeleting } = useProjectLifecycle({
    shouldRedirect,
  });

  const isDeleteConfirmationValid =
    deleteConfirmationValue.trim() === projectDisplayName;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirmationValue("");
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmationValue.trim() === projectDisplayName) {
      deleteProject(projectName);
      onDelete?.(projectName);
      setIsDeleteDialogOpen(false);
      setDeleteConfirmationValue("");
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setDeleteConfirmationValue("");
  };

  const DeleteProjectDialog = () => (
    <AlertDialog 
      open={isDeleteDialogOpen} 
      onOpenChange={(open) => {
        // Only allow closing the dialog, not opening it through onOpenChange
        if (!open) {
          setIsDeleteDialogOpen(false);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Project</AlertDialogTitle>
        </AlertDialogHeader>

        <Alert
          variant="destructive"
          className="bg-status-deleting text-red-700 border-none"
        >
          <AlertCircleIcon />
          <AlertDescription className="text-red-700!">
            This action cannot be undone and will permanently remove the project
            and all its resources.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Type the project name{" "}
            <span className="font-semibold text-foreground">
              "{projectDisplayName}"
            </span>{" "}
            to confirm:
          </p>
          <Input
            value={deleteConfirmationValue}
            onChange={(e) => setDeleteConfirmationValue(e.target.value)}
            placeholder={projectDisplayName}
            className="w-full"
            autoFocus
          />
          {deleteConfirmationValue && !isDeleteConfirmationValid && (
            <p className="text-sm text-destructive">
              Project name does not match. Please type "{projectDisplayName}" to
              confirm.
            </p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteConfirm}
            disabled={isDeleting || !isDeleteConfirmationValid}
            className="flex-1 bg-status-deleting/80 text-red-700! hover:bg-status-deleting! border border-status-error disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Deleting..." : "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return {
    isDeleteDialogOpen,
    isDeleting,
    handleDelete,
    handleDeleteCancel,
    DeleteProjectDialog,
  };
}
