"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, PencilLine } from "lucide-react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRemoveFromProjectMutation } from "@/lib/brain/resources/project/project-method/project-mutation";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

interface ObjectStorageMessageMenuProps {
  target: CustomResourceTarget;
}

export default function ObjectStorageMessageMenu({
  target,
}: ObjectStorageMessageMenuProps) {
  const { objectstorage: objectstorageTrpcClient } = useTRPCClients();
  const queryClient = useQueryClient();
  const k8sContext = createK8sContext();

  // Extract name and status from the target using the hook
  const { resource, status } = useResourceStatus(target);
  const objectStorageName = resource?.name || target.name || "";
  const currentStatus = status || "Pending";

  const removeFromProject = useRemoveFromProjectMutation(k8sContext);

  // Mutations using objectstorage router
  const deleteObjectStorage = useMutation(
    objectstorageTrpcClient.deleteObjectStorage.mutationOptions()
  );

  const handleDelete = () => {
    if (!objectStorageName) return;
    deleteObjectStorage.mutate(
      { bucketName: objectStorageName },
      {
        onSuccess: () => {
          // Invalidate relevant queries
          queryClient.invalidateQueries({
            queryKey: objectstorageTrpcClient.getObjectStorage.queryKey(target),
          });
        },
      }
    );
  };

  // Don't render if we don't have a valid object storage name
  if (!objectStorageName) {
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
          <DropdownMenuItem>
            <PencilLine className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              const objectStorageTarget = convertResourceTypeToTarget(
                "objectstoragebucket",
                objectStorageName
              );
              removeFromProject.mutate({
                resources: [objectStorageTarget],
              });
            }}
            disabled={!objectStorageName}
          >
            <PencilLine className="mr-2 h-4 w-4" />
            Remove from Project
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
