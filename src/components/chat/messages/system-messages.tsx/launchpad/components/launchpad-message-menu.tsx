"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
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
import LaunchpadDropdownMenu from "./universal/launchpad-dropdown-menu";

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

  // Create a LaunchpadObject from the target
  const launchpadObject = {
    name: launchpadName,
    status: currentStatus,
    resource: resource,
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
        <LaunchpadDropdownMenu
          object={launchpadObject}
          onDelete={(name) => {
            setOpen(false);
            setAlertOpen(true);
          }}
          showRestart={true}
        />
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
