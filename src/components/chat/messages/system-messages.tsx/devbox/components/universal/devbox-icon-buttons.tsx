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
import { Pause, RotateCcw, Trash2, Play } from "lucide-react";
import { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { useDevboxLifecycle } from "@/hooks/sealos/devbox/use-devbox-lifecycle";

interface DevboxIconButtonsProps {
  object: DevboxObject;
  onDelete?: (devboxName: string) => void;
}

export default function DevboxIconButtons({
  object,
  onDelete,
}: DevboxIconButtonsProps) {
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
      <TooltipProvider>
        <div className="flex items-center gap-1">
          {/* Start Button - Only show when not running */}
          {status !== "Running" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => executeAction("start", devboxName)}
                  disabled={status === "Pending" || isPending("start")}
                  className={`h-8 w-8 p-0 ${
                    status === "Pending" ? "opacity-50" : ""
                  }`}
                >
                  <Play className="h-4 w-4" />
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
                  onClick={() => executeAction("pause", devboxName)}
                  disabled={status === "Pending" || isPending("pause")}
                  className={`h-8 w-8 p-0 ${
                    status === "Pending" ? "opacity-50" : ""
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

          {/* Restart Button - Always show */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => executeAction("restart", devboxName)}
                disabled={status === "Pending" || isPending("restart")}
                className={`h-8 w-8 p-0 ${
                  status === "Pending" ? "opacity-50" : ""
                }`}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Restart</p>
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
            <AlertDialogTitle>Delete Devbox</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{devboxName}"? This action cannot
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
