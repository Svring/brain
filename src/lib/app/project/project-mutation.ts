"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useBatchPatchResourcesMetadataMutation,
  useBatchRemoveResourcesMetadataMutation,
} from "@/lib/k8s/k8s-mutation";
import type { ResourceTarget } from "@/lib/k8s/schemas";
import { PROJECT_NAME_LABEL_KEY } from "./project-constant";

/**
 * Hook to add project name label to multiple resources
 */
export function useAddProjectLabelToResourcesMutation() {
  const queryClient = useQueryClient();
  const batchPatchMutation = useBatchPatchResourcesMetadataMutation();

  return useMutation({
    mutationFn: ({
      resources,
      projectName,
    }: {
      resources: ResourceTarget[];
      projectName: string;
    }) => {
      return batchPatchMutation.mutateAsync({
        resources,
        metadataType: "labels",
        key: PROJECT_NAME_LABEL_KEY,
        value: projectName,
      });
    },
    onSuccess: (_data, variables) => {
      // Invalidate project-related queries
      const namespaces = [
        ...new Set(variables.resources.map((r) => r.namespace)),
      ];
      for (const namespace of namespaces) {
        queryClient.invalidateQueries({
          queryKey: ["project", "list", namespace],
        });
        queryClient.invalidateQueries({
          queryKey: ["project", "get", namespace],
        });
      }
    },
  });
}

/**
 * Hook to remove project name label from multiple resources
 */
export function useRemoveProjectLabelFromResourcesMutation() {
  const queryClient = useQueryClient();
  const batchRemoveMutation = useBatchRemoveResourcesMetadataMutation();

  return useMutation({
    mutationFn: ({ resources }: { resources: ResourceTarget[] }) => {
      return batchRemoveMutation.mutateAsync({
        resources,
        metadataType: "labels",
        key: PROJECT_NAME_LABEL_KEY,
      });
    },
    onSuccess: (_data, variables) => {
      // Invalidate project-related queries
      const namespaces = [
        ...new Set(variables.resources.map((r) => r.namespace)),
      ];
      for (const namespace of namespaces) {
        queryClient.invalidateQueries({
          queryKey: ["project", "list", namespace],
        });
        queryClient.invalidateQueries({
          queryKey: ["project", "get", namespace],
        });
      }
    },
  });
}
