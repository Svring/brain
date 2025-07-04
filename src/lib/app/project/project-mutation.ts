"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RESOURCES } from "@/lib/k8s/k8s-constant";
import {
  useBatchPatchResourcesMetadataMutation,
  useBatchRemoveResourcesMetadataMutation,
  usePatchCustomResourceMutation,
} from "@/lib/k8s/k8s-mutation";
import type {
  K8sApiContext,
  PatchCustomResourceRequest,
  ResourceTarget,
} from "@/lib/k8s/schemas";
import { PROJECT_NAME_LABEL_KEY } from "./project-constant";

/**
 * Hook to add project name label to multiple resources
 */
export function useAddProjectLabelToResourcesMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();
  const batchPatchMutation = useBatchPatchResourcesMetadataMutation(context);

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
    onSuccess: () => {
      // Invalidate project-related queries
      queryClient.invalidateQueries({
        queryKey: ["project", "list", context.namespace],
      });
      queryClient.invalidateQueries({
        queryKey: ["project", "get", context.namespace],
      });
    },
  });
}

/**
 * Hook to remove project name label from multiple resources
 */
export function useRemoveProjectLabelFromResourcesMutation(
  context: K8sApiContext
) {
  const queryClient = useQueryClient();
  const batchRemoveMutation = useBatchRemoveResourcesMetadataMutation(context);

  return useMutation({
    mutationFn: ({ resources }: { resources: ResourceTarget[] }) => {
      return batchRemoveMutation.mutateAsync({
        resources,
        metadataType: "labels",
        key: PROJECT_NAME_LABEL_KEY,
      });
    },
    onSuccess: () => {
      // Invalidate project-related queries
      queryClient.invalidateQueries({
        queryKey: ["project", "list", context.namespace],
      });
      queryClient.invalidateQueries({
        queryKey: ["project", "get", context.namespace],
      });
    },
  });
}

/**
 * Hook to patch an Instance custom resource in k8s
 */
export function usePatchInstanceResourceMutation(context: K8sApiContext) {
  const patchMutation = usePatchCustomResourceMutation(context);

  return useMutation({
    mutationFn: ({
      name,
      patchBody,
    }: {
      name: string;
      patchBody: unknown[];
    }) => {
      const instanceConfig = RESOURCES.instance;
      const request: PatchCustomResourceRequest = {
        group: instanceConfig.group,
        version: instanceConfig.version,
        plural: instanceConfig.plural,
        name,
        patchBody,
      };
      return patchMutation.mutateAsync(request);
    },
    onSuccess: () => {
      // Invalidate instance-related queries if needed
      // (Handled by usePatchCustomResourceMutation's onSuccess)
    },
  });
}
