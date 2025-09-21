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
import { AlertCircleIcon } from "lucide-react";
import { Pause, Trash2, PencilLine, Power } from "lucide-react";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { useClusterLifecycle } from "@/hooks/sealos/cluster/use-cluster-lifecycle";

interface ClusterDropdownMenuProps {
  object: ClusterObject;
  onDelete?: (clusterName: string) => void;
}

export default function ClusterDropdownMenu({
  object,
  onDelete,
}: ClusterDropdownMenuProps) {
  const { name: clusterName, status } = object;
  const { executeAction, isPending: isActionPending } = useClusterLifecycle();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isCreating = status === "Creating";
  const isUpdating = status === "Updating";
  const isPending = isCreating || isUpdating;

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    executeAction("delete", clusterName);
    onDelete?.(clusterName);
    setShowDeleteDialog(false);
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
      {status !== "Running" && (
        <DropdownMenuItem
          onClick={() => executeAction("start", clusterName)}
          disabled={isPending || isActionPending("start")}
          className={isPending ? "opacity-50" : ""}
        >
          <Power className="mr-2 h-4 w-4" />
          Start
        </DropdownMenuItem>
      )}
      {status !== "Stopped" && status !== "Shutdown" && (
        <DropdownMenuItem
          onClick={() => executeAction("pause", clusterName)}
          disabled={isPending || isActionPending("pause")}
          className={isPending ? "opacity-50" : ""}
        >
          <Pause className="mr-2 h-4 w-4" />
          Pause
        </DropdownMenuItem>
      )}
      <DropdownMenuItem
        disabled={isPending}
        className={isPending ? "opacity-50" : ""}
      >
        <PencilLine className="mr-2 h-4 w-4" />
        Update
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={handleDeleteClick}
        className="text-destructive"
        disabled={isActionPending("delete")}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>

    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Cluster</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the cluster{" "}
            <span className="font-semibold text-foreground">
              "{clusterName}"
            </span>
            ?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Alert
          variant="destructive"
          className="bg-status-deleting text-red-700 border-none"
        >
          <AlertCircleIcon />
          <AlertDescription className="text-red-700!">
            This action cannot be undone and will permanently remove the
            cluster and all its data.
          </AlertDescription>
        </Alert>

        <AlertDialogFooter>
          <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteConfirm}
            disabled={isActionPending("delete")}
            className="flex-1 bg-status-deleting/80 text-red-700! hover:bg-status-deleting! border border-status-error"
          >
            {isActionPending("delete") ? "Deleting..." : "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
