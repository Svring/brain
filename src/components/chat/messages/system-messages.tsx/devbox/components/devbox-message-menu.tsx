"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
} from "lucide-react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import DevboxDropdownMenu from "./universal/devbox-dropdown-menu";

interface DevboxMessageMenuProps {
  target: CustomResourceTarget;
}

export default function DevboxMessageMenu({ target }: DevboxMessageMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const { devbox: devboxTrpcClient } = useTRPCClients();
  const queryClient = useQueryClient();

  // Extract name and status from the target using the hook
  const { resource, status } = useResourceStatus(target);
  const devboxName = resource?.name || target.name || "";
  const currentStatus = status || "Pending";

  // Use the new resource hooks
  const startHook = useResourceStart(target);
  const pauseHook = useResourcePause(target);

  const deleteDevbox = useMutation(
    devboxTrpcClient.delete.mutationOptions()
  );

  const handleDelete = () => {
    if (!devboxName) return;
    deleteDevbox.mutate(devboxName, {
      onSuccess: () => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: devboxTrpcClient.get.queryKey(target),
        });
        queryClient.invalidateQueries({
          queryKey: devboxTrpcClient.list.queryKey(),
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

  // Create a DevboxObject from the target
  const devboxObject = {
    name: devboxName,
    status: currentStatus,
    // Add other required properties if needed
  } as DevboxObject;

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
        <DevboxDropdownMenu
          object={devboxObject}
          onDelete={(devboxName) => {
            setOpen(false);
            setAlertOpen(true);
          }}
        />
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
