"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { Trash2 } from "lucide-react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRemoveFromProjectMutation } from "@/lib/brain/resources/project/project-method/project-mutation";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";

interface ObjectStorageMessageMenuProps {
  target: CustomResourceTarget;
}

export default function ObjectStorageMessageMenu({
  target,
}: ObjectStorageMessageMenuProps) {
  const { objectstorage: objectstorageTrpcClient } = useTRPCClients();
  const queryClient = useQueryClient();
  const k8sContext = createK8sContext();
  const { invalidateQueries } = useInvalidateQueries();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Extract name and status from the target using the hook
  const { resource, status } = useResourceStatus(target);
  const objectStorageName = resource?.name || target.name || "";
  const currentStatus = status || "Pending";

  const removeFromProject = useRemoveFromProjectMutation(k8sContext);

  // Mutations using objectstorage router
  const deleteObjectStorage = useMutation(
    objectstorageTrpcClient.delete.mutationOptions()
  );

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (!objectStorageName) return;
    deleteObjectStorage.mutate(
      { bucketName: objectStorageName },
      {
        onSuccess: () => {
          // Invalidate relevant queries
          invalidateQueries([
            objectstorageTrpcClient.get.queryKey(target),
            true,
          ]);
          setShowDeleteDialog(false);
        },
      }
    );
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  // Don't render if we don't have a valid object storage name
  if (!objectStorageName) {
    return null;
  }

  return (
    <>
      <TooltipProvider>
        <div className="flex items-center gap-1">
          {/* Delete Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick();
                }}
                disabled={deleteObjectStorage.isPending}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Delete</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Object Storage</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{objectStorageName}"? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteObjectStorage.isPending}
            >
              {deleteObjectStorage.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
