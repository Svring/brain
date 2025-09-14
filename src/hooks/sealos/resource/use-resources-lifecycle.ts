"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useDevboxLifecycle } from "@/hooks/sealos/devbox/use-devbox-lifecycle";
import { useClusterLifecycle } from "@/hooks/sealos/cluster/use-cluster-lifecycle";
import { useLaunchpadLifecycle } from "@/hooks/sealos/launchpad/use-launchpad-lifecycle";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { ResourceObject } from "@/contexts/project/project-context";

interface UseResourcesLifecycleOptions {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export const useResourcesLifecycle = (
  options: UseResourcesLifecycleOptions = {}
) => {
  const { onSuccess, onError } = options;
  const [isPerformingBatchAction, setIsPerformingBatchAction] = useState(false);
  const { invalidateQueries } = useInvalidateQueries();

  // Initialize lifecycle hooks
  const devboxLifecycle = useDevboxLifecycle({
    onSuccess: (message) => {
      toast.success(message);
      onSuccess?.(message);
    },
    onError: (message) => {
      toast.error(message);
      onError?.(message);
    },
  });

  const clusterLifecycle = useClusterLifecycle({
    onSuccess: (message) => {
      toast.success(message);
      onSuccess?.(message);
    },
    onError: (message) => {
      toast.error(message);
      onError?.(message);
    },
  });

  const launchpadLifecycle = useLaunchpadLifecycle({
    onSuccess: (message) => {
      toast.success(message);
      onSuccess?.(message);
    },
    onError: (message) => {
      toast.error(message);
      onError?.(message);
    },
  });

  // Execute lifecycle action for a single resource
  const executeResourceAction = async (
    action: string,
    resource: ResourceObject
  ) => {
    switch (resource.kind.toLowerCase()) {
      case "devbox":
        await devboxLifecycle.executeAction(action, resource.name);
        break;
      case "cluster":
        await clusterLifecycle.executeAction(action, resource.name);
        break;
      case "deployment":
      case "statefulset":
        await launchpadLifecycle.executeAction(action, resource.name);
        break;
      default:
        throw new Error(
          `Unsupported resource type for ${action}: ${resource.kind}`
        );
    }
  };

  // Batch start resources
  const batchStart = async (resources: ResourceObject[]) => {
    if (resources.length === 0) {
      toast.error("No resources selected");
      return;
    }

    setIsPerformingBatchAction(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const resource of resources) {
        try {
          await executeResourceAction("start", resource);
          successCount++;
        } catch (error) {
          console.error(
            `Failed to start ${resource.kind}/${resource.name}:`,
            error
          );
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Started ${successCount} resource(s) successfully`);
        // Invalidate queries to refresh project resources
        invalidateQueries([], true);
      }
      if (errorCount > 0) {
        toast.error(`Failed to start ${errorCount} resource(s)`);
      }
    } finally {
      setIsPerformingBatchAction(false);
    }
  };

  // Batch pause resources
  const batchPause = async (resources: ResourceObject[]) => {
    if (resources.length === 0) {
      toast.error("No resources selected");
      return;
    }

    setIsPerformingBatchAction(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const resource of resources) {
        try {
          await executeResourceAction("pause", resource);
          successCount++;
        } catch (error) {
          console.error(
            `Failed to pause ${resource.kind}/${resource.name}:`,
            error
          );
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Paused ${successCount} resource(s) successfully`);
        // Invalidate queries to refresh project resources
        invalidateQueries([], true);
      }
      if (errorCount > 0) {
        toast.error(`Failed to pause ${errorCount} resource(s)`);
      }
    } finally {
      setIsPerformingBatchAction(false);
    }
  };

  return {
    batchStart,
    batchPause,
    isPerformingBatchAction,
    executeResourceAction,
  };
};
