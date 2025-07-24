"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import { applyInstanceYaml } from "../k8s-api/k8s-api-mutation";
import { createK8sContext } from "@/lib/auth/auth-utils";
import {
  BuiltinResourceTarget,
  CustomResourceTarget,
  ResourceTarget,
} from "../k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { K8sApiContext } from "../k8s-api/k8s-api-schemas/context-schemas";
import { CUSTOM_RESOURCES } from "../k8s-constant/k8s-constant-custom-resource";
import {
  invalidateResourceQueries,
  convertAndFilterResourceToTarget,
  flattenProjectResources,
  EnvVar,
  getContainerPath,
  getContainersFromResource,
  buildEnvVarPatchOps,
  fetchResource,
  applyResourcePatch,
  deleteResource,
  patchResourceMetadata,
  removeResourceMetadata,
  deleteResourcesByLabelSelector,
  invalidateQueriesAfterMutation,
  processBatchOperation,
} from "./k8s-utils";

/**
 * Mutation for patching resource metadata (annotations or labels)
 */
export function usePatchResourceMetadataMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      target,
      metadataType,
      key,
      value,
    }: {
      target: CustomResourceTarget | BuiltinResourceTarget;
      metadataType: "annotations" | "labels";
      key: string;
      value: string;
    }) => {
      return await patchResourceMetadata(
        context,
        target,
        metadataType,
        key,
        value
      );
    },
    onSuccess: (_data, variables) => {
      invalidateQueriesAfterMutation(queryClient, context, variables.target);
    },
  });
}

/**
 * Mutation for removing resource metadata (annotations or labels)
 */
export function useRemoveResourceMetadataMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      target,
      metadataType,
      key,
    }: {
      target: CustomResourceTarget | BuiltinResourceTarget;
      metadataType: "annotations" | "labels";
      key: string;
    }) => {
      return await removeResourceMetadata(context, target, metadataType, key);
    },
    onSuccess: (_, { target }) => {
      invalidateQueriesAfterMutation(queryClient, context, target);
    },
  });
}

/**
 * Mutation for deleting a single resource
 */
export function useDeleteResourceMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      target,
    }: {
      target: CustomResourceTarget | BuiltinResourceTarget;
    }) => {
      return await deleteResource(context, target);
    },
    onSuccess: (_data, variables) => {
      invalidateQueriesAfterMutation(queryClient, context, variables.target);
    },
  });
}

/**
 * Mutation for batch patching multiple resources metadata
 */
export function useBatchPatchResourcesMetadataMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      targets,
      metadataType,
      key,
      value,
    }: {
      targets: (CustomResourceTarget | BuiltinResourceTarget)[];
      metadataType: "annotations" | "labels";
      key: string;
      value: string;
    }) => {
      return await processBatchOperation(targets, (target) =>
        patchResourceMetadata(context, target, metadataType, key, value)
      );
    },
    onSuccess: (_data, variables) => {
      for (const target of variables.targets) {
        invalidateQueriesAfterMutation(queryClient, context, target);
      }
    },
  });
}

/**
 * Mutation for batch removing multiple resources metadata
 */
export function useBatchRemoveResourcesMetadataMutation(
  context: K8sApiContext
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      targets,
      metadataType,
      key,
    }: {
      targets: (CustomResourceTarget | BuiltinResourceTarget)[];
      metadataType: "annotations" | "labels";
      key: string;
    }) => {
      return await processBatchOperation(targets, (target) =>
        removeResourceMetadata(context, target, metadataType, key)
      );
    },
    onSuccess: (_data, variables) => {
      for (const target of variables.targets) {
        invalidateQueriesAfterMutation(queryClient, context, target);
      }
    },
  });
}

/**
 * Mutation for batch deleting multiple resources
 */
export function useBatchDeleteResourcesMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      targets,
    }: {
      targets: (CustomResourceTarget | BuiltinResourceTarget)[];
    }) => {
      return await processBatchOperation(targets, (target) =>
        deleteResource(context, target)
      );
    },
    onSuccess: (_data, variables) => {
      for (const target of variables.targets) {
        invalidateQueriesAfterMutation(queryClient, context, target);
      }
    },
  });
}

/**
 * Mutation for deleting resources by label selector
 */
export function useDeleteResourcesByLabelSelectorMutation(
  context: K8sApiContext
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      target,
    }: {
      target: (CustomResourceTarget | BuiltinResourceTarget) & {
        labelSelector: string;
      };
    }) => {
      return await deleteResourcesByLabelSelector(context, target);
    },
    onSuccess: (_data, variables) => {
      invalidateQueriesAfterMutation(
        queryClient,
        context,
        variables.target,
        true
      );
    },
  });
}

/**
 * Mutation for applying instance YAML
 */
export function useApplyInstanceYamlMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ yamlContent }: { yamlContent: string }) => {
      return await runParallelAction(applyInstanceYaml(context, yamlContent));
    },
    onSuccess: () => {
      const instanceConfig = CUSTOM_RESOURCES.instance;
      if (instanceConfig) {
        invalidateQueriesAfterMutation(queryClient, context, {
          type: "custom",
          group: instanceConfig.group,
          version: instanceConfig.version,
          plural: instanceConfig.plural,
        });
      }
    },
  });
}

/**
 * Mutation for deleting all resources related to a project.
 * This function takes the resources returned by the project-relevance algorithm
 * and converts them to resource targets before deletion.
 */
export function useDeleteAllResourcesMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      resources,
    }: {
      resources: any; // Resources from project-relevance algorithm
    }) => {
      // Flatten project resources to individual K8s resources
      const flattenedResources = flattenProjectResources(resources);

      // Convert each resource to resource target using the utility function
      const allResourceTargets = flattenedResources
        .map(convertAndFilterResourceToTarget)
        .filter(Boolean) as (CustomResourceTarget | BuiltinResourceTarget)[];

      if (allResourceTargets.length === 0) {
        return { success: true, results: [], resourceCount: 0 };
      }

      // Use the batch operation utility
      return await processBatchOperation(allResourceTargets, (target) =>
        deleteResource(context, target)
      );
    },
    onSuccess: () => {
      invalidateQueriesAfterMutation(queryClient, context, undefined, true);
    },
    onError: () => {
      invalidateQueriesAfterMutation(queryClient, context, undefined, true);
    },
  });
}
/**
 * Mutation for adding environment variables to a Kubernetes resource
 * Supports both direct values and secret references
 */
export function useAddEnvToResourceMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      target,
      envVars,
    }: {
      target: ResourceTarget;
      envVars: EnvVar[];
    }) => {
      // Get the resource first
      const resource = await fetchResource(context, target);

      // Determine the container path based on the resource kind
      const containerPath = getContainerPath(resource.kind);
      if (!containerPath) {
        throw new Error(`Unsupported resource kind: ${resource.kind}`);
      }

      // Get containers from the resource
      const containers = getContainersFromResource(resource);
      if (!containers || containers.length === 0) {
        throw new Error("No containers found in the resource");
      }

      // Build patch operations
      const patchOps = buildEnvVarPatchOps(containers, envVars, containerPath);

      // Apply the patch
      return await applyResourcePatch(context, target, patchOps);
    },
    onSuccess: (_data, variables) => {
      invalidateQueriesAfterMutation(queryClient, context, variables.target);
    },
  });
}
