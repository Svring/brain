"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
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
import { StatefulsetObject } from "@/lib/sealos/resources/statefulset/statefulset-object-schema";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import LaunchpadDropdownMenu from "@/components/chat/messages/system-messages.tsx/launchpad/components/universal/launchpad-dropdown-menu";

export default function StatefulsetNodeMenu({
  object,
}: {
  object: StatefulsetObject;
}) {
  const [open, setOpen] = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);

  const { launchpad, k8s } = useTRPCClients();
  const queryClient = useQueryClient();

  const deleteLaunchpad = useMutation(
    launchpad.delete.mutationOptions()
  );

  const { name, resource, status } = object;
  const replicas = resource?.replicas || 0;
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
        <LaunchpadDropdownMenu
          object={{
            name: object.name,
            status: object.status || "Pending",
            resource: object.resource,
          }}
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
            <AlertDialogTitle>Delete StatefulSet</AlertDialogTitle>
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
