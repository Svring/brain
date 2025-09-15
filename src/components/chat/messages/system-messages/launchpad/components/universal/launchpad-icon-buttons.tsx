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
import { Pause, Trash2, Power } from "lucide-react";
import { useLaunchpadLifecycle } from "@/hooks/sealos/launchpad/use-launchpad-lifecycle";

interface LaunchpadObject {
  name: string;
  status: string;
  resource?: any;
}

interface LaunchpadIconButtonsProps {
  object: LaunchpadObject;
  onDelete?: (name: string) => void;
}

export default function LaunchpadIconButtons({
  object,
  onDelete,
}: LaunchpadIconButtonsProps) {
  const { name, status } = object;
  const { executeAction, isPending } = useLaunchpadLifecycle();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isRunning = status === "Running";
  const isResourcePending = status === "Pending";

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
      <TooltipProvider>
        <div className="flex items-center gap-1">
          {/* Start Button - Only show when not running and not pending */}
          {!isRunning && !isResourcePending && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => executeAction("start", name)}
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

          {/* Pause Button - Only show when running */}
          {isRunning && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => executeAction("pause", name)}
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

      <AlertDialog 
        open={showDeleteDialog} 
        onOpenChange={(open) => {
          // Prevent closing dialog while delete is in progress
          if (!open && isPending("delete")) {
            return;
          }
          setShowDeleteDialog(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Launchpad</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={handleDeleteCancel}
              disabled={isPending("delete")}
            >
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
