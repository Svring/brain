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
import { Pause, RotateCcw, Trash2, Play } from "lucide-react";
import { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { useDevboxLifecycle } from "@/hooks/sealos/devbox/use-devbox-lifecycle";

interface DevboxDropdownMenuProps {
  object: DevboxObject;
  onDelete?: (devboxName: string) => void;
}

export default function DevboxDropdownMenu({
  object,
  onDelete,
}: DevboxDropdownMenuProps) {
  const { name: devboxName, status } = object;
  const { executeAction, isPending } = useDevboxLifecycle();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    executeAction("delete", devboxName);
    onDelete?.(devboxName);
    setShowDeleteDialog(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  return (
    <>
      <DropdownMenuContent align="start">
        {status !== "Running" && (
          <DropdownMenuItem
            onClick={() => executeAction("start", devboxName)}
            disabled={status === "Pending" || isPending("start")}
            className={status === "Pending" ? "opacity-50" : ""}
          >
            <Play className="mr-2 h-4 w-4" />
            Start
          </DropdownMenuItem>
        )}
        {status !== "Stopped" && status !== "Shutdown" && (
          <DropdownMenuItem
            onClick={() => executeAction("pause", devboxName)}
            disabled={status === "Pending" || isPending("pause")}
            className={status === "Pending" ? "opacity-50" : ""}
          >
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => executeAction("restart", devboxName)}
          disabled={status === "Pending" || isPending("restart")}
          className={status === "Pending" ? "opacity-50" : ""}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Restart
        </DropdownMenuItem>
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
            <AlertDialogTitle>Delete Devbox</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{devboxName}"? This action cannot
              be undone and will permanently remove the devbox and all its data.
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