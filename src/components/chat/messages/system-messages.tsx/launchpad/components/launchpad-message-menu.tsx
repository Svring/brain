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
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
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

interface LaunchpadMessageMenuProps {
  target: BuiltinResourceTarget;
}

export default function LaunchpadMessageMenu({
  target,
}: LaunchpadMessageMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const { launchpad, k8s } = useTRPCClients();
  const queryClient = useQueryClient();

  // Extract name and status from the target using the hook
  const { resource, status } = useResourceStatus(target);
  const launchpadName = resource?.name || target.name || "";
  const currentStatus = status || "Pending";

  const deleteLaunchpad = useMutation(
    launchpad.deleteLaunchpad.mutationOptions()
  );
  const startLaunchpad = useMutation(
    launchpad.startLaunchpad.mutationOptions()
  );
  const pauseLaunchpad = useMutation(
    launchpad.pauseLaunchpad.mutationOptions()
  );

  const handleDelete = () => {
    deleteLaunchpad.mutate(
      { name: launchpadName },
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
      { name: launchpadName },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: launchpad.getLaunchpad.queryKey({ name: launchpadName }),
          });
        },
      }
    );
  };

  const handlePause = () => {
    pauseLaunchpad.mutate(
      { name: launchpadName },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: launchpad.getLaunchpad.queryKey({ name: launchpadName }),
          });
        },
      }
    );
  };

  // Don't render if we don't have a valid launchpad name
  if (!launchpadName) {
    return null;
  }

  // Determine if the launchpad is running based on status
  const isRunning = currentStatus === "Running";

  return (
    <div className="flex items-center gap-2">
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
          {!isRunning && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleStart();
              }}
              onSelect={(e) => e.preventDefault()}
              disabled={currentStatus === "Pending" || startLaunchpad.isPending}
              className={currentStatus === "Pending" ? "opacity-50" : ""}
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
              disabled={pauseLaunchpad.isPending}
              className=""
            >
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              // Update functionality
            }}
            onSelect={(e) => e.preventDefault()}
            disabled={currentStatus === "Pending"}
            className={currentStatus === "Pending" ? "opacity-50" : ""}
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
            disabled={currentStatus === "Pending"}
            className={currentStatus === "Pending" ? "opacity-50" : ""}
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
            <AlertDialogTitle>Delete Launchpad</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{launchpadName}"? This action cannot be undone.
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
    </div>
  );
}
