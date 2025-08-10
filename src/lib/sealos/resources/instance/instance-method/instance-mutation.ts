"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import _ from "lodash";
import {
  usePatchResourceMetadataMutation,
  useRemoveResourceMetadataMutation,
  useApplyInstanceYamlMutation,
  useDeleteAllResourcesMutation,
} from "@/lib/k8s/k8s-method/k8s-mutation";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import {
  BuiltinResourceTarget,
  CustomResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
  generateNewInstanceName,
  generateInstanceTemplate,
  gatherRelatedResources,
  createInstanceTarget,
  getInstanceQueryInvalidationKeys,
  invalidateInstanceQueries,
} from "./instance-utils";
import { getInstanceRelatedResources } from "@/lib/sealos/services/relevance/instance/instance-relevance";
import { INSTANCE_DISPLAY_NAME_ANNOTATION_KEY } from "@/lib/sealos/resources/instance/instance-constant/instance-constant-label";
import { INSTANCE_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";

/**
 * Hook to add instance name label to multiple resources
 */
export const useAddToInstanceMutation = (context: K8sApiContext) => {
  const queryClient = useQueryClient();
  const patchMutation = usePatchResourceMetadataMutation(context);

  return useMutation({
    mutationFn: async ({
      resources,
      instanceName,
    }: {
      resources: (CustomResourceTarget | BuiltinResourceTarget)[];
      instanceName: string;
    }) => {
      // Gather all related resources using the utility function
      const allTargetsToPatch = await gatherRelatedResources(
        context,
        resources
      );

      // Add labels to all resources
      await patchMutation.mutateAsync({
        target: allTargetsToPatch,
        metadataType: "labels",
        key: INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS,
        value: instanceName,
      });

      // Resources are now added to instance via labels only
    },
    onSuccess: (_, { instanceName }) => {
      toast.success(`Resources added to instance ${instanceName}`);
      invalidateInstanceQueries(queryClient, context.namespace, instanceName);
    },
  });
};

/**
 * Hook to remove instance name label from multiple resources
 */
export const useRemoveFromInstanceMutation = (context: K8sApiContext) => {
  const queryClient = useQueryClient();
  const removeMutation = useRemoveResourceMetadataMutation(context);

  return useMutation({
    mutationFn: async ({
      resources,
      instanceName,
    }: {
      resources: (CustomResourceTarget | BuiltinResourceTarget)[];
      instanceName: string;
    }) => {
      // Gather all related resources using the utility function
      const allTargetsToRemove = await gatherRelatedResources(
        context,
        resources
      );

      // Remove instance label from all targets completely
      await removeMutation.mutateAsync({
        target: allTargetsToRemove,
        metadataType: "labels",
        key: INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS,
      });

      // Resources are now removed from instance via labels only
    },
    onSuccess: (_, { instanceName }) => {
      toast.success(`Resources removed from instance ${instanceName}`);
      invalidateInstanceQueries(queryClient, context.namespace, instanceName);
    },
  });
};

/**
 * Hook to refresh instance data (no longer removes annotations)
 */
// export const useRemoveInstanceAnnotationMutation = (context: K8sApiContext) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({ instanceName }: { instanceName: string }) => {
//       // No longer removes annotations, just invalidates queries
//       return Promise.resolve();
//     },
//     onSuccess: (_, { instanceName }) => {
//       toast.success("Instance resources refreshed successfully");
//       invalidateInstanceQueries(queryClient, context.namespace, instanceName);
//     },
//     onError: (error) => {
//       toast.error("Failed to refresh instance resources");
//       throw error;
//     },
//   });
// };

/**
 * Hook to create a new instance instance
 */
export const useCreateInstanceMutation = (context: K8sApiContext) => {
  const queryClient = useQueryClient();
  const createInstanceMutation = useApplyInstanceYamlMutation(context);

  return useMutation({
    mutationFn: async ({ instanceName }: { instanceName?: string }) => {
      const finalInstanceName = instanceName || generateNewInstanceName();
      const instanceYaml = generateInstanceTemplate(
        finalInstanceName,
        context.namespace
      );

      return createInstanceMutation.mutateAsync({ yamlContent: instanceYaml });
    },
    onSuccess: (data, { instanceName }) => {
      const finalInstanceName = instanceName || generateNewInstanceName();
      toast.success("Instance created successfully");
      invalidateInstanceQueries(
        queryClient,
        context.namespace,
        finalInstanceName
      );
      return data;
    },
    onError: (error) => {
      console.log("error", error);
      toast.error("Failed to create instance");
      throw error;
    },
  });
};

/**
 * Hook to rename a instance by updating its display name annotation
 */
export const useRenameInstanceMutation = (context: K8sApiContext) => {
  const queryClient = useQueryClient();
  const patchMutation = usePatchResourceMetadataMutation(context);

  return useMutation({
    mutationFn: async ({
      instanceName,
      newDisplayName,
    }: {
      instanceName: string;
      newDisplayName: string;
    }) => {
      return await patchMutation.mutateAsync({
        target: createInstanceTarget(instanceName),
        metadataType: "annotations",
        key: INSTANCE_DISPLAY_NAME_ANNOTATION_KEY,
        value: newDisplayName,
      });
    },
    onSuccess: (_, { instanceName, newDisplayName }) => {
      toast.success(`Instance renamed to "${newDisplayName}"`);
      invalidateInstanceQueries(queryClient, context.namespace, instanceName);
    },
    onError: (error) => {
      toast.error("Failed to rename instance");
      throw error;
    },
  });
};

/**
 * Hook to delete a instance and all its associated resources
 *
 * This mutation follows a clean 3-step approach:
 * 1. Delete cluster-related resources (not clusters themselves)
 * 2. Delete instance-related resources (not instances themselves)
 * 3. Delete all remaining resources with the instance label (final cleanup)
 */
export const useDeleteInstanceMutation = (context: K8sApiContext) => {
  const queryClient = useQueryClient();
  const deleteAllResources = useDeleteAllResourcesMutation(context);

  return useMutation({
    mutationFn: async ({ instanceName }: { instanceName: string }) => {
      try {
        // 1. Get all resources related to the instance
        const instanceResources = await getInstanceRelatedResources(
          context,
          instanceName,
          ["deployment", "statefulset", "instance", "devbox"]
        );

        // 2. Delete all found resources
        const result = await deleteAllResources.mutateAsync({
          resources: instanceResources,
        });

        return {
          instanceName,
          ...result,
        };
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success(`Instance "${data.instanceName}" deleted successfully`);
      invalidateInstanceQueries(
        queryClient,
        context.namespace,
        data.instanceName
      );
    },
    onError: (error) => {
      toast.error("Failed to delete instance");
      throw error;
    },
  });
};
