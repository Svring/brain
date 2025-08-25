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
import { DevboxLifecycleAction } from "@/lib/sealos/resources/devbox/devbox-api/devbox-open-api-schemas/devbox-lifecycle-schema";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { Badge } from "@/components/ui/badge";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

interface DevboxMessageMenuProps {
  target: CustomResourceTarget;
}

export default function DevboxMessageMenu({ target }: DevboxMessageMenuProps) {
  const { devbox: devboxTrpcClient } = useTRPCClients();
  const queryClient = useQueryClient();
  const k8sContext = createK8sContext();

  // Extract name and status from the target using the hook
  const { resource, status } = useResourceStatus(target);
  const devboxName = resource?.name || target.name || "";
  const currentStatus = status || "Pending";

  const removeFromProject = useRemoveFromProjectMutation(k8sContext);

  // Mutations using devbox router
  const deleteDevbox = useMutation(
    devboxTrpcClient.deleteDevbox.mutationOptions()
  );

  const manageDevboxLifecycle = useMutation(
    devboxTrpcClient.manageDevboxLifecycle.mutationOptions()
  );

  const handleDelete = () => {
    if (!devboxName) return;
    deleteDevbox.mutate(devboxName, {
      onSuccess: () => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: devboxTrpcClient.getDevbox.queryKey({ target }),
        });
        queryClient.invalidateQueries({
          queryKey: devboxTrpcClient.listDevboxes.queryKey(),
        });
      },
    });
  };

  const handleLifecycleAction = (action: DevboxLifecycleAction) => {
    if (!devboxName) return;
    manageDevboxLifecycle.mutate({ devboxName, action }, {
      onSuccess: () => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: devboxTrpcClient.getDevbox.queryKey({ target }),
        });
        queryClient.invalidateQueries({
          queryKey: devboxTrpcClient.listDevboxes.queryKey(),
        });
      },
    });
  };

  // Don't render if we don't have a valid devbox name
  if (!devboxName) {
    return null;
  }

  // Get badge variant based on status
  const getBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "running":
        return "default";
      case "stopped":
      case "shutdown":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant={getBadgeVariant(currentStatus)} className="text-xs">
        {currentStatus}
      </Badge>
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
                handleLifecycleAction("start");
              }}
              disabled={currentStatus === "Pending"}
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
                handleLifecycleAction("stop");
              }}
              disabled={currentStatus === "Pending"}
              className={currentStatus === "Pending" ? "opacity-50" : ""}
            >
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleLifecycleAction("restart");
            }}
            disabled={currentStatus === "Pending"}
            className={currentStatus === "Pending" ? "opacity-50" : ""}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restart
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              // Convert devbox to resource target format for the mutation
              const devboxTarget = convertResourceTypeToTarget("devbox", devboxName);
              removeFromProject.mutate({
                resources: [devboxTarget],
              });
            }}
            disabled={currentStatus === "Pending"}
            className={currentStatus === "Pending" ? "opacity-50" : ""}
          >
            <PencilLine className="mr-2 h-4 w-4" />
            Remove from Project
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
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
    </div>
  );
}
