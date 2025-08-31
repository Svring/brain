"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pause,
  RotateCcw,
  Trash2,
  PencilLine,
  Power,
} from "lucide-react";
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
import { createSealosContext } from "@/lib/auth/auth-utils";
import {
  useDeleteLaunchpadMutation,
  useStartLaunchpadMutation,
  usePauseLaunchpadMutation,
} from "@/lib/sealos/resources/launchpad/launchpad-method/launchpad-mutation";
import { DeploymentObject } from "@/lib/sealos/resources/deployment/deployment-object-schema";

export default function DeploymentNodeMenu({
  object,
}: {
  object: DeploymentObject;
}) {
  const [open, setOpen] = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const sealosContext = createSealosContext();

  const deleteLaunchpad = useDeleteLaunchpadMutation(sealosContext);
  const startLaunchpad = useStartLaunchpadMutation(sealosContext);
  const pauseLaunchpad = usePauseLaunchpadMutation(sealosContext);

  console.log("object", object);

  const { name, resource, status } = object;
  const replicas = resource?.replicas || 0;
  const isRunning = status === "Running";
  const isPending = status === "Pending";

  const handleDelete = () => {
    if (!name) return;
    deleteLaunchpad.mutate({ name });
  };

  const handleStart = () => {
    if (!name) return;
    startLaunchpad.mutate({ name });
  };

  const handlePause = () => {
    if (!name) return;
    pauseLaunchpad.mutate({ name });
  };

  // Don't render if we don't have a valid name
  if (!name) {
    return null;
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="rounded-xl bg-background-secondary"
          align="start"
        >
          {!isRunning && !isPending && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleStart();
              }}
              onSelect={(e) => e.preventDefault()}
              disabled={isPending || startLaunchpad.isPending}
              className={isPending ? "opacity-50" : ""}
            >
              <Power className="mr-2 h-4 w-4" />
              Start
            </DropdownMenuItem>
          )}
          {isRunning && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handlePause();
              }}
              onSelect={(e) => e.preventDefault()}
              disabled={isPending || pauseLaunchpad.isPending}
              className={isPending ? "opacity-50" : ""}
            >
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </DropdownMenuItem>
          )}
          {isPending && (
            <>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleStart();
                }}
                onSelect={(e) => e.preventDefault()}
                disabled={true}
                className="opacity-50"
              >
                <Power className="mr-2 h-4 w-4" />
                Start
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handlePause();
                }}
                onSelect={(e) => e.preventDefault()}
                disabled={true}
                className="opacity-50"
              >
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              // Update functionality
            }}
            onSelect={(e) => e.preventDefault()}
            disabled={isPending}
            className={isPending ? "opacity-50" : ""}
          >
            <PencilLine className="mr-2 h-4 w-4" />
            Update
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              // Restart functionality
            }}
            onSelect={(e) => e.preventDefault()}
            disabled={isPending}
            className={isPending ? "opacity-50" : ""}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restart
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              setAlertOpen(true);
            }}
            onSelect={(e) => e.preventDefault()}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deployment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
                setAlertOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
