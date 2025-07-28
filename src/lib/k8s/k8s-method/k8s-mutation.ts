"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  applyInstanceYaml,
  upsertCustomResource,
  upsertBuiltinResource,
  applyResource,
  patchCustomResource,
  patchBuiltinResource,
  strategicMergePatchCustomResource,
  strategicMergePatchBuiltinResource,
  deleteCustomResource,
  deleteBuiltinResource,
  patchCustomResourceMetadata,
  patchBuiltinResourceMetadata,
  removeCustomResourceMetadata,
  removeBuiltinResourceMetadata,
} from "../k8s-api/k8s-api-mutation";
import {
  getCustomResource,
  getBuiltinResource,
} from "../k8s-api/k8s-api-query";
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
  flattenListAllResourcesResponse,
  EnvVar,
  getContainerPath,
  getContainersFromResource,
  buildEnvVarPatchOps,
  invalidateQueriesAfterMutation,
  processBatchOperation,
} from "./k8s-utils";
import { Operation } from "fast-json-patch";

/**
 * Mutation for patching resource metadata (annotations or labels)
 * Supports both single target and batch operations
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
      target:
        | (CustomResourceTarget | BuiltinResourceTarget)
        | (CustomResourceTarget | BuiltinResourceTarget)[];
      metadataType: "annotations" | "labels";
      key: string;
      value: string;
    }) => {
      const targets = Array.isArray(target) ? target : [target];

      return await processBatchOperation(targets, async (singleTarget) => {
        if (singleTarget.type === "custom") {
          return await runParallelAction(
            patchCustomResourceMetadata(
              context,
              singleTarget,
              metadataType,
              key,
              value
            )
          );
        }
        return await runParallelAction(
          patchBuiltinResourceMetadata(
            context,
            singleTarget,
            metadataType,
            key,
            value
          )
        );
      });
    },
    onSuccess: (_data, variables) => {
      const targets = Array.isArray(variables.target)
        ? variables.target
        : [variables.target];
      for (const singleTarget of targets) {
        invalidateQueriesAfterMutation(queryClient, context, singleTarget);
      }
    },
  });
}

/**
 * Mutation for removing resource metadata (annotations or labels)
 * Supports both single target and batch operations
 */
export function useRemoveResourceMetadataMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      target,
      metadataType,
      key,
    }: {
      target:
        | (CustomResourceTarget | BuiltinResourceTarget)
        | (CustomResourceTarget | BuiltinResourceTarget)[];
      metadataType: "annotations" | "labels";
      key: string;
    }) => {
      const targets = Array.isArray(target) ? target : [target];

      return await processBatchOperation(targets, async (singleTarget) => {
        if (singleTarget.type === "custom") {
          return await runParallelAction(
            removeCustomResourceMetadata(
              context,
              singleTarget,
              metadataType,
              key
            )
          );
        }
        return await runParallelAction(
          removeBuiltinResourceMetadata(
            context,
            singleTarget,
            metadataType,
            key
          )
        );
      });
    },
    onSuccess: (_, variables) => {
      const targets = Array.isArray(variables.target)
        ? variables.target
        : [variables.target];
      for (const singleTarget of targets) {
        invalidateQueriesAfterMutation(queryClient, context, singleTarget);
      }
    },
  });
}

/**
 * Mutation for deleting resources
 * Supports both single target and batch operations
 */
export function useDeleteResourceMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      target,
    }: {
      target:
        | (CustomResourceTarget | BuiltinResourceTarget)
        | (CustomResourceTarget | BuiltinResourceTarget)[];
    }) => {
      const targets = Array.isArray(target) ? target : [target];

      return await processBatchOperation(targets, async (singleTarget) => {
        if (singleTarget.type === "custom") {
          return await runParallelAction(
            deleteCustomResource(context, singleTarget)
          );
        }
        return await runParallelAction(
          deleteBuiltinResource(context, singleTarget)
        );
      });
    },
    onSuccess: (_data, variables) => {
      const targets = Array.isArray(variables.target)
        ? variables.target
        : [variables.target];
      for (const singleTarget of targets) {
        invalidateQueriesAfterMutation(queryClient, context, singleTarget);
      }
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
          resourceType: instanceConfig.resourceType,
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
      const flattenedResources = flattenListAllResourcesResponse(resources);

      // Convert each resource to resource target using the utility function
      const allResourceTargets = flattenedResources
        .map(convertAndFilterResourceToTarget)
        .filter(Boolean) as (CustomResourceTarget | BuiltinResourceTarget)[];

      if (allResourceTargets.length === 0) {
        return { success: true, results: [], resourceCount: 0 };
      }

      // Use the batch operation utility
      return await processBatchOperation(allResourceTargets, async (target) => {
        if (target.type === "custom") {
          return await runParallelAction(deleteCustomResource(context, target));
        }
        return await runParallelAction(deleteBuiltinResource(context, target));
      });
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
      const resource =
        target.type === "custom"
          ? await runParallelAction(getCustomResource(context, target))
          : await runParallelAction(getBuiltinResource(context, target));

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
      if (target.type === "custom") {
        return await runParallelAction(
          patchCustomResource(context, target, patchOps)
        );
      }
      return await runParallelAction(
        patchBuiltinResource(context, target, patchOps)
      );
    },
    onSuccess: (_data, variables) => {
      invalidateQueriesAfterMutation(queryClient, context, variables.target);
    },
  });
}

/**
 * Mutation for upserting (create or update) resources
 * Works with both custom and builtin resources
 */
export function useUpsertResourceMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      target,
      resourceBody,
    }: {
      target: CustomResourceTarget | BuiltinResourceTarget;
      resourceBody: Record<string, unknown>;
    }) => {
      if (target.type === "custom") {
        return await runParallelAction(
          upsertCustomResource(context, target, resourceBody)
        );
      }
      return await runParallelAction(
        upsertBuiltinResource(context, target, resourceBody)
      );
    },
    onSuccess: (_data, variables) => {
      invalidateQueriesAfterMutation(queryClient, context, variables.target);
    },
  });
}

/**
 * Mutation for applying resource content (JSON or YAML)
 * Works with both custom and builtin resources
 */
export function useApplyResourceMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      resourceContent,
      target,
    }: {
      resourceContent: string | Record<string, unknown>;
      target?: CustomResourceTarget | BuiltinResourceTarget;
    }) => {
      return await runParallelAction(
        applyResource(context, resourceContent, target)
      );
    },
    onSuccess: (_data, variables) => {
      if (variables.target) {
        invalidateQueriesAfterMutation(queryClient, context, variables.target);
      } else {
        // If no target specified, invalidate all queries
        invalidateQueriesAfterMutation(queryClient, context, undefined, true);
      }
    },
  });
}

/**
 * Mutation for patching resources with JSON patch operations
 * Works with both custom and builtin resources
 */
export function usePatchResourceMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      target,
      patchBody,
    }: {
      target: CustomResourceTarget | BuiltinResourceTarget;
      patchBody: Operation[];
    }) => {
      if (target.type === "custom") {
        return await runParallelAction(
          patchCustomResource(context, target, patchBody)
        );
      }
      return await runParallelAction(
        patchBuiltinResource(context, target, patchBody)
      );
    },
    onSuccess: (_data, variables) => {
      invalidateQueriesAfterMutation(queryClient, context, variables.target);
    },
  });
}

/**
 * Mutation for strategic merge patching resources
 * Works with both custom and builtin resources
 */
export function useStrategicMergePatchResourceMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      target,
      patchBody,
    }: {
      target: CustomResourceTarget | BuiltinResourceTarget;
      patchBody: Record<string, unknown>;
    }) => {
      if (target.type === "custom") {
        return await runParallelAction(
          strategicMergePatchCustomResource(context, target, patchBody)
        );
      }
      return await runParallelAction(
        strategicMergePatchBuiltinResource(context, target, patchBody)
      );
    },
    onSuccess: (_data, variables) => {
      invalidateQueriesAfterMutation(queryClient, context, variables.target);
    },
  });
}
