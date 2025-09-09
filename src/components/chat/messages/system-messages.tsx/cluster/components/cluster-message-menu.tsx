"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pause, Trash2, PencilLine, Power } from "lucide-react";
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

interface ClusterMessageMenuProps {
  target: CustomResourceTarget;
}

export default function ClusterMessageMenu({
  target,
}: ClusterMessageMenuProps) {
  const { cluster: clusterTrpcClient } = useTRPCClients();
  const queryClient = useQueryClient();
  const k8sContext = createK8sContext();

  // Extract name and status from the target using the hook
  const { resource, status } = useResourceStatus(target);
  const clusterName = resource?.name || target.name || "";
  const currentStatus = status || "Pending";

  const removeFromProject = useRemoveFromProjectMutation(k8sContext);

  // Use the new resource hooks
  const startHook = useResourceStart(target);
  const pauseHook = useResourcePause(target);

  // Use tRPC mutations from cluster router
  const deleteCluster = useMutation(
    clusterTrpcClient.delete.mutationOptions()
  );

  const handleDelete = () => {
    if (!clusterName) return;
    deleteCluster.mutate(
      { name: clusterName },
      {
        onSuccess: () => {
          // Invalidate relevant queries
          queryClient.invalidateQueries({
            queryKey: clusterTrpcClient.get.queryKey(target),
          });
        },
      }
    );
  };

  const handleStart = () => {
    if (!clusterName) return;
    // startHook.start(clusterName);
  };

  const handlePause = () => {
    if (!clusterName) return;
    // pauseHook.pause(clusterName);
  };

  // Don't render if we don't have a valid cluster name
  if (!clusterName) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
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
              disabled={
                currentStatus === "Creating" ||
                currentStatus === "Updating" ||
                startHook.isPending
              }
              className={
                currentStatus === "Creating" || currentStatus === "Updating"
                  ? "opacity-50"
                  : ""
              }
            >
              <Power className="mr-2 h-4 w-4" />
              Start
            </DropdownMenuItem>
          )}
          {currentStatus !== "Stopped" && currentStatus !== "Shutdown" && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handlePause();
              }}
              disabled={
                currentStatus === "Creating" ||
                currentStatus === "Updating" ||
                pauseHook.isPending
              }
              className={
                currentStatus === "Creating" || currentStatus === "Updating"
                  ? "opacity-50"
                  : ""
              }
            >
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            disabled={
              currentStatus === "Creating" || currentStatus === "Updating"
            }
            className={
              currentStatus === "Creating" || currentStatus === "Updating"
                ? "opacity-50"
                : ""
            }
          >
            <PencilLine className="mr-2 h-4 w-4" />
            Update
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className={`text-destructive ${
              currentStatus === "Creating" || currentStatus === "Updating"
                ? "opacity-50"
                : ""
            }`}
            disabled={
              currentStatus === "Creating" || currentStatus === "Updating"
            }
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
