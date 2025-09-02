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
} from "lucide-react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRemoveFromProjectMutation } from "@/lib/brain/resources/project/project-method/project-mutation";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useResourceStart } from "@/hooks/sealos/resource/use-resource-start";
import { useResourcePause } from "@/hooks/sealos/resource/use-resource-pause";
import { Badge } from "@/components/ui/badge";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DevboxMessageMenuProps {
  target: CustomResourceTarget;
}

export default function DevboxMessageMenu({ target }: DevboxMessageMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const { devbox: devboxTrpcClient } = useTRPCClients();
  const queryClient = useQueryClient();
  const k8sContext = createK8sContext();

  // Extract name and status from the target using the hook
  const { resource, status } = useResourceStatus(target);
  const devboxName = resource?.name || target.name || "";
  const currentStatus = status || "Pending";

  const removeFromProject = useRemoveFromProjectMutation(k8sContext);

  // Use the new resource hooks
  const startHook = useResourceStart(target);
  const pauseHook = useResourcePause(target);

  // Mutations using devbox router
  const deleteDevbox = useMutation(
    devboxTrpcClient.deleteDevbox.mutationOptions()
  );

  const handleDelete = () => {
    if (!devboxName) return;
    deleteDevbox.mutate(devboxName, {
      onSuccess: () => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: devboxTrpcClient.getDevbox.queryKey(target),
        });
        queryClient.invalidateQueries({
          queryKey: devboxTrpcClient.listDevboxes.queryKey(),
        });
      },
    });
  };

  const handleStart = () => {
    if (!devboxName) return;
    // startHook.start({ action: "start", devboxName });
  };

  const handlePause = () => {
    if (!devboxName) return;
    // pauseHook.pause({ action: "stop", devboxName });
  };

  // Don't render if we don't have a valid devbox name
  if (!devboxName) {
    return null;
  }

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
          {currentStatus !== "Running" && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleStart();
              }}
              onSelect={(e) => e.preventDefault()}
              disabled={currentStatus === "Pending" || startHook.isPending}
              className={currentStatus === "Pending" ? "opacity-50" : ""}
            >
              <PencilLine className="mr-2 h-4 w-4" />
              Start
            </DropdownMenuItem>
          )}
          {currentStatus !== "Stopped" && currentStatus !== "Shutdown" && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handlePause();
              }}
              onSelect={(e) => e.preventDefault()}
              disabled={currentStatus === "Pending" || pauseHook.isPending}
              className={currentStatus === "Pending" ? "opacity-50" : ""}
            >
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              // startHook.start({ action: "restart", devboxName });
            }}
            onSelect={(e) => e.preventDefault()}
            disabled={currentStatus === "Pending" || startHook.isPending}
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
            className={`text-destructive ${
              currentStatus === "Pending" ? "opacity-50" : ""
            }`}
            disabled={currentStatus === "Pending"}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Devbox</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{devboxName}"? This action cannot be undone.
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
