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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { AlertCircleIcon } from "lucide-react";
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
  const [deleteConfirmationValue, setDeleteConfirmationValue] = useState("");

  const handleDeleteClick = () => {
    setDeleteConfirmationValue("");
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmationValue.trim() === devboxName) {
      executeAction("delete", devboxName);
      onDelete?.(devboxName);
      setShowDeleteDialog(false);
      setDeleteConfirmationValue("");
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setDeleteConfirmationValue("");
  };

  const isDeleteConfirmationValid =
    deleteConfirmationValue.trim() === devboxName;

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
          </AlertDialogHeader>

          <Alert
            variant="destructive"
            className="bg-status-deleting text-red-700 border-none"
          >
            <AlertCircleIcon />
            <AlertDescription className="text-red-700!">
              This action cannot be undone and will permanently remove the
              devbox and all its data.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Type the devbox name{" "}
              <span className="font-semibold text-foreground">
                "{devboxName}"
              </span>{" "}
              to confirm:
            </p>
            <Input
              value={deleteConfirmationValue}
              onChange={(e) => setDeleteConfirmationValue(e.target.value)}
              placeholder={devboxName}
              className="w-full"
              autoFocus
            />
            {deleteConfirmationValue && !isDeleteConfirmationValid && (
              <p className="text-sm text-destructive">
                Devbox name does not match. Please type "{devboxName}" to
                confirm.
              </p>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isPending("delete") || !isDeleteConfirmationValid}
              className="flex-1 bg-status-deleting/80 text-red-700! hover:bg-status-deleting! border border-status-error disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending("delete") ? "Deleting..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
