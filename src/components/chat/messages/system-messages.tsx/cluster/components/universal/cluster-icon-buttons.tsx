"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { Pause, Power, PencilLine, Trash2 } from "lucide-react";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { useClusterLifecycle } from "@/hooks/sealos/cluster/use-cluster-lifecycle";

interface ClusterIconButtonsProps {
  object: ClusterObject;
  onDelete?: (clusterName: string) => void;
}

export default function ClusterIconButtons({
  object,
  onDelete,
}: ClusterIconButtonsProps) {
  const { name: clusterName, status } = object;
  const { executeAction, isPending } = useClusterLifecycle();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isCreating = status === "Creating";
  const isUpdating = status === "Updating";
  const isResourcePending = isCreating || isUpdating;

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
      <TooltipProvider>
        <div className="flex items-center gap-1">
          {/* Start Button - Only show when not running */}
          {status !== "Running" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => executeAction("start", clusterName)}
                  disabled={isResourcePending || isPending("start")}
                  className={`h-8 w-8 p-0 ${
                    isResourcePending ? "opacity-50" : ""
                  }`}
                >
                  <Power className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Start</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Pause Button - Only show when not stopped or shutdown */}
          {status !== "Stopped" && status !== "Shutdown" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => executeAction("pause", clusterName)}
                  disabled={isResourcePending || isPending("pause")}
                  className={`h-8 w-8 p-0 ${
                    isResourcePending ? "opacity-50" : ""
                  }`}
                >
                  <Pause className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Pause</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Update Button - Always show but disabled when pending */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={isResourcePending}
                className={`h-8 w-8 p-0 ${
                  isResourcePending ? "opacity-50" : ""
                }`}
              >
                <PencilLine className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Update</p>
            </TooltipContent>
          </Tooltip>

          {/* Delete Button - Always show */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteClick}
                disabled={isPending("delete")}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Delete</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Cluster</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{clusterName}"? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
