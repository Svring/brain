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
  generateNewProjectName,
  generateInstanceTemplate,
  gatherRelatedResources,
  createProjectTarget,
  getProjectQueryInvalidationKeys,
  invalidateProjectQueries,
} from "./project-utils";
import { getProjectRelatedResources } from "@/lib/algorithm/relevance/project/project-relevance";
import { PROJECT_DISPLAY_NAME_ANNOTATION_KEY } from "@/lib/project/project-constant/project-constant-label";
import { INSTANCE_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";

/**
 * Hook to add project name label to multiple resources
 */
export const useAddToProjectMutation = (context: K8sApiContext) => {
  const queryClient = useQueryClient();
  const patchMutation = usePatchResourceMetadataMutation(context);

  return useMutation({
    mutationFn: async ({
      resources,
      projectName,
    }: {
      resources: (CustomResourceTarget | BuiltinResourceTarget)[];
      projectName: string;
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
        value: projectName,
      });

      // Resources are now added to project via labels only
    },
    onSuccess: (_, { projectName }) => {
      toast.success(`Resources added to project ${projectName}`);
      invalidateProjectQueries(queryClient, context.namespace, projectName);
    },
  });
};

/**
 * Hook to remove project name label from multiple resources
 */
export const useRemoveFromProjectMutation = (context: K8sApiContext) => {
  const queryClient = useQueryClient();
  const removeMutation = useRemoveResourceMetadataMutation(context);

  return useMutation({
    mutationFn: async ({
      resources,
      projectName,
    }: {
      resources: (CustomResourceTarget | BuiltinResourceTarget)[];
      projectName: string;
    }) => {
      // Gather all related resources using the utility function
      const allTargetsToRemove = await gatherRelatedResources(
        context,
        resources
      );

      // Remove project label from all targets completely
      await removeMutation.mutateAsync({
        target: allTargetsToRemove,
        metadataType: "labels",
        key: INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS,
      });

      // Resources are now removed from project via labels only
    },
    onSuccess: (_, { projectName }) => {
      toast.success(`Resources removed from project ${projectName}`);
      invalidateProjectQueries(queryClient, context.namespace, projectName);
    },
  });
};

/**
 * Hook to refresh project data (no longer removes annotations)
 */
// export const useRemoveProjectAnnotationMutation = (context: K8sApiContext) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({ projectName }: { projectName: string }) => {
//       // No longer removes annotations, just invalidates queries
//       return Promise.resolve();
//     },
//     onSuccess: (_, { projectName }) => {
//       toast.success("Project resources refreshed successfully");
//       invalidateProjectQueries(queryClient, context.namespace, projectName);
//     },
//     onError: (error) => {
//       toast.error("Failed to refresh project resources");
//       throw error;
//     },
//   });
// };

/**
 * Hook to create a new project instance
 */
export const useCreateProjectMutation = (context: K8sApiContext) => {
  const queryClient = useQueryClient();
  const createInstanceMutation = useApplyInstanceYamlMutation(context);

  return useMutation({
    mutationFn: async ({ projectName }: { projectName?: string }) => {
      const finalProjectName = projectName || generateNewProjectName();
      const projectYaml = generateInstanceTemplate(
        finalProjectName,
        context.namespace
      );

      return createInstanceMutation.mutateAsync({ yamlContent: projectYaml });
    },
    onSuccess: (data, { projectName }) => {
      const finalProjectName = projectName || generateNewProjectName();
      toast.success("Project created successfully");
      invalidateProjectQueries(
        queryClient,
        context.namespace,
        finalProjectName
      );
      return data;
    },
    onError: (error) => {
      console.log("error", error);
      toast.error("Failed to create project");
      throw error;
    },
  });
};

/**
 * Hook to rename a project by updating its display name annotation
 */
export const useRenameProjectMutation = (context: K8sApiContext) => {
  const queryClient = useQueryClient();
  const patchMutation = usePatchResourceMetadataMutation(context);

  return useMutation({
    mutationFn: async ({
      projectName,
      newDisplayName,
    }: {
      projectName: string;
      newDisplayName: string;
    }) => {
      return await patchMutation.mutateAsync({
        target: createProjectTarget(projectName),
        metadataType: "annotations",
        key: PROJECT_DISPLAY_NAME_ANNOTATION_KEY,
        value: newDisplayName,
      });
    },
    onSuccess: (_, { projectName, newDisplayName }) => {
      toast.success(`Project renamed to "${newDisplayName}"`);
      invalidateProjectQueries(queryClient, context.namespace, projectName);
    },
    onError: (error) => {
      toast.error("Failed to rename project");
      throw error;
    },
  });
};

/**
 * Hook to delete a project and all its associated resources
 *
 * This mutation follows a clean 3-step approach:
 * 1. Delete cluster-related resources (not clusters themselves)
 * 2. Delete instance-related resources (not instances themselves)
 * 3. Delete all remaining resources with the project label (final cleanup)
 */
export const useDeleteProjectMutation = (context: K8sApiContext) => {
  const queryClient = useQueryClient();
  const deleteAllResources = useDeleteAllResourcesMutation(context);

  return useMutation({
    mutationFn: async ({ projectName }: { projectName: string }) => {
      try {
        // 1. Get all resources related to the project
        const projectResources = await getProjectRelatedResources(
          context,
          projectName,
          ["deployment", "statefulset", "instance", "devbox"]
        );

        // 2. Delete all found resources
        const result = await deleteAllResources.mutateAsync({
          resources: projectResources,
        });

        return {
          projectName,
          ...result,
        };
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success(`Project "${data.projectName}" deleted successfully`);
      invalidateProjectQueries(
        queryClient,
        context.namespace,
        data.projectName
      );
    },
    onError: (error) => {
      toast.error("Failed to delete project");
      throw error;
    },
  });
};
