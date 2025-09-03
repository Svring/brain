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
import { useDevboxContext } from "@/lib/auth/auth-utils";
import {
  useDeleteDevboxMutation,
  useManageDevboxLifecycleMutation,
} from "@/lib/sealos/resources/devbox/devbox-method/devbox-mutation";
import { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function DevboxNodeMenu({ object }: { object: DevboxObject }) {
  const [open, setOpen] = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const devboxContext = useDevboxContext();
  const { project } = useTRPCClients();
  const queryClient = useQueryClient();

  const deleteDevbox = useDeleteDevboxMutation(devboxContext);
  const manageDevboxLifecycle = useManageDevboxLifecycleMutation(devboxContext);
  const removeFromProjectMutation = useMutation(
    project.removeFromProject.mutationOptions()
  );

  const { name: devboxName, status } = object;

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
          {status !== "Running" && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                manageDevboxLifecycle.mutate({ devboxName, action: "start" });
              }}
              onSelect={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              disabled={status === "Pending"}
              className={status === "Pending" ? "opacity-50" : ""}
            >
              <PencilLine className="mr-2 h-4 w-4" />
              Start
            </DropdownMenuItem>
          )}
          {status !== "Stopped" && status !== "Shutdown" && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                manageDevboxLifecycle.mutate({ devboxName, action: "stop" });
              }}
              onSelect={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              disabled={status === "Pending"}
              className={status === "Pending" ? "opacity-50" : ""}
            >
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              manageDevboxLifecycle.mutate({ devboxName, action: "restart" });
            }}
            onSelect={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            disabled={status === "Pending"}
            className={status === "Pending" ? "opacity-50" : ""}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restart
          </DropdownMenuItem>
          {/* <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              // Convert devbox to resource target format for the mutation
              const devboxTarget = convertResourceTypeToTarget("devbox", devboxName);
              removeFromProjectMutation.mutate({
                resources: [devboxTarget],
              });
            }}
            disabled={status === "Pending"}
            className={status === "Pending" ? "opacity-50" : ""}
          >
            <PencilLine className="mr-2 h-4 w-4" />
            Remove from Project
          </DropdownMenuItem> */}
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              setAlertOpen(true);
            }}
            onSelect={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className={`text-destructive ${
              status === "Pending" ? "opacity-50" : ""
            }`}
            disabled={status === "Pending"}
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
              Are you sure you want to delete "{devboxName}"? This action cannot
              be undone.
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
                deleteDevbox.mutate(devboxName);
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
