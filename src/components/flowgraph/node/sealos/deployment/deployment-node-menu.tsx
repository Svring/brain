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
import { DeploymentObject } from "@/lib/sealos/resources/deployment/deployment-object-schema";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function DeploymentNodeMenu({
  object,
}: {
  object: DeploymentObject;
}) {
  const [open, setOpen] = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);

  const { launchpad, k8s } = useTRPCClients();
  const queryClient = useQueryClient();

  const deleteLaunchpad = useMutation(
    launchpad.deleteLaunchpad.mutationOptions()
  );
  const startLaunchpad = useMutation(
    launchpad.startLaunchpad.mutationOptions()
  );
  const pauseLaunchpad = useMutation(
    launchpad.pauseLaunchpad.mutationOptions()
  );

  // console.log("object", object);

  const { name, resource, status } = object;
  const isRunning = status === "Running";
  const isPending = status === "Pending";

  const handleDelete = () => {
    deleteLaunchpad.mutate(
      { name },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: k8s.listAllResources.queryKey(),
          });
        },
      }
    );
  };

  const handleStart = () => {
    startLaunchpad.mutate(
      { name },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: launchpad.getLaunchpad.queryKey({ name }),
          });
        },
      }
    );
  };

  const handlePause = () => {
    pauseLaunchpad.mutate(
      { name },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: launchpad.getLaunchpad.queryKey({ name }),
          });
        },
      }
    );
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
              Are you sure you want to delete "{name}"? This action cannot be
              undone.
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
