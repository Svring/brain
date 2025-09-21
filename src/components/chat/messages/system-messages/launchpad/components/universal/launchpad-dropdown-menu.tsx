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
import {
  Pause,
  RotateCcw,
  Trash2,
  Power,
} from "lucide-react";
import { useLaunchpadLifecycle } from "@/hooks/sealos/launchpad/use-launchpad-lifecycle";

interface LaunchpadObject {
  name: string;
  status: string;
  resource?: any;
}

interface LaunchpadDropdownMenuProps {
  object: LaunchpadObject;
  onDelete?: (name: string) => void;
  showRestart?: boolean;
}

export default function LaunchpadDropdownMenu({
  object,
  onDelete,
  showRestart = true,
}: LaunchpadDropdownMenuProps) {
  const { name, status } = object;
  const isRunning = status === "Running";
  const isPending = status === "Pending";
  const { executeAction, isPending: isActionPending } = useLaunchpadLifecycle();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await executeAction("delete", name);
      onDelete?.(name);
      setShowDeleteDialog(false);
    } catch (error) {
      // Error is already handled by the mutation, just keep dialog open
      console.error("Delete failed:", error);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  return (
    <>
    <DropdownMenuContent
      className="rounded-xl bg-background-secondary"
      align="start"
    >
      {!isRunning && !isPending && (
        <DropdownMenuItem
          onClick={() => executeAction("start", name)}
          disabled={isPending || isActionPending("start")}
          className={isPending ? "opacity-50" : ""}
        >
          <Power className="mr-2 h-4 w-4" />
          Start
        </DropdownMenuItem>
      )}
      {isRunning && (
        <DropdownMenuItem
          onClick={() => executeAction("pause", name)}
          disabled={isPending || isActionPending("pause")}
          className={isPending ? "opacity-50" : ""}
        >
          <Pause className="mr-2 h-4 w-4" />
          Pause
        </DropdownMenuItem>
      )}
      {isPending && (
        <>
          <DropdownMenuItem
            onClick={() => executeAction("start", name)}
            disabled={true}
            className="opacity-50"
          >
            <Power className="mr-2 h-4 w-4" />
            Start
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => executeAction("pause", name)}
            disabled={true}
            className="opacity-50"
          >
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </DropdownMenuItem>
        </>
      )}
      {showRestart && (
        <DropdownMenuItem
          onClick={() => {
            // Restart functionality
          }}
          disabled={isPending}
          className={isPending ? "opacity-50" : ""}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Restart
        </DropdownMenuItem>
      )}
      <DropdownMenuItem
        onClick={handleDeleteClick}
        className="text-destructive"
        disabled={isActionPending("delete")}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>

    <AlertDialog 
      open={showDeleteDialog} 
      onOpenChange={(open) => {
        // Prevent closing dialog while delete is in progress
        if (!open && isActionPending("delete")) {
          return;
        }
        setShowDeleteDialog(open);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Launchpad</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{name}"? This action cannot be undone
            and will permanently remove the launchpad and all its data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteConfirm}
            className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isActionPending("delete")}
          >
            {isActionPending("delete") ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
