"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import _ from "lodash";
import {
  useBatchPatchResourcesMetadataMutation,
  useBatchRemoveResourcesMetadataMutation,
  useApplyInstanceYamlMutation,
  useDeleteAllResourcesMutation,
} from "@/lib/k8s/k8s-method/k8s-mutation";
import { createK8sContext } from "@/lib/k8s/k8s-method/k8s-utils";
import {
  BuiltinResourceTarget,
  CustomResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
  generateNewProjectName,
  generateProjectTemplate,
  gatherRelatedResources,
  convertTargetsToSimplifiedFormat,
  parseProjectAnnotation,
  mergeProjectAnnotation,
  removeFromProjectAnnotation,
  createProjectInstanceTarget,
  getProjectQueryInvalidationKeys,
} from "./project-utils";
import { getProjectRelatedResources } from "@/lib/algorithm/relevance/project-relevance";
import { BRAIN_RESOURCES_ANNOTATION_KEY } from "@/lib/project/project-constant/project-constant-label";
import { getProjectOptions } from "./project-query";
import { INSTANCE_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";

/**
 * Hook to add project name label to multiple resources
 */
export const useAddToProjectMutation = () => {
  const queryClient = useQueryClient();
  const batchPatchMutation = useBatchPatchResourcesMetadataMutation();

  return useMutation({
    mutationFn: async ({
      resources,
      projectName,
    }: {
      resources: (CustomResourceTarget | BuiltinResourceTarget)[];
      projectName: string;
    }) => {
      const context = createK8sContext();
      
      // Gather all related resources using the utility function
      const allTargetsToPatch = await gatherRelatedResources(context, resources);

      // Add labels to all resources
      await batchPatchMutation.mutateAsync({
        targets: allTargetsToPatch,
        metadataType: "labels",
        key: INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS,
        value: projectName,
      });

      // Update brain-resources annotation using utility functions
      const projectQuery = getProjectOptions(context, projectName);
      const currentProject = await queryClient.ensureQueryData(projectQuery);
      
      const currentAnnotation = parseProjectAnnotation(
        currentProject?.metadata?.annotations?.[BRAIN_RESOURCES_ANNOTATION_KEY]
      );
      const newSimplifiedResources = convertTargetsToSimplifiedFormat(allTargetsToPatch);
      const updatedAnnotation = mergeProjectAnnotation(currentAnnotation, newSimplifiedResources);
      
      await batchPatchMutation.mutateAsync({
        targets: [createProjectInstanceTarget(projectName)],
        metadataType: "annotations",
        key: BRAIN_RESOURCES_ANNOTATION_KEY,
        value: JSON.stringify(updatedAnnotation),
      });
    },
    onSuccess: (_, { projectName }) => {
      const context = createK8sContext();
      toast.success(`Resources added to project ${projectName}`);
      const invalidationKeys = getProjectQueryInvalidationKeys(context.namespace, projectName);
      invalidationKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};

/**
 * Hook to remove project name label from multiple resources
 */
export const useRemoveFromProjectMutation = () => {
  const queryClient = useQueryClient();
  const batchRemoveMutation = useBatchRemoveResourcesMetadataMutation();
  const batchPatchMutation = useBatchPatchResourcesMetadataMutation();

  return useMutation({
    mutationFn: async ({
      resources,
      projectName,
    }: {
      resources: (CustomResourceTarget | BuiltinResourceTarget)[];
      projectName: string;
    }) => {
      const context = createK8sContext();
      
      // Gather all related resources using the utility function
      const allTargetsToRemove = await gatherRelatedResources(context, resources);

      // Remove labels from all resources
      await batchRemoveMutation.mutateAsync({
        targets: allTargetsToRemove,
        metadataType: "labels",
        key: INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS,
      });

      // Update brain-resources annotation using utility functions
      const projectQuery = getProjectOptions(context, projectName);
      const currentProject = await queryClient.ensureQueryData(projectQuery);
      
      const currentAnnotation = parseProjectAnnotation(
        currentProject?.metadata?.annotations?.[BRAIN_RESOURCES_ANNOTATION_KEY]
      );
      const removedSimplifiedResources = convertTargetsToSimplifiedFormat(allTargetsToRemove);
      const updatedAnnotation = removeFromProjectAnnotation(currentAnnotation, removedSimplifiedResources);
      
      await batchPatchMutation.mutateAsync({
        targets: [createProjectInstanceTarget(projectName)],
        metadataType: "annotations",
        key: BRAIN_RESOURCES_ANNOTATION_KEY,
        value: JSON.stringify(updatedAnnotation),
      });
    },
    onSuccess: (_, { projectName }) => {
      const context = createK8sContext();
      toast.success(`Resources removed from project ${projectName}`);
      const invalidationKeys = getProjectQueryInvalidationKeys(context.namespace, projectName);
      invalidationKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};

/**
 * Hook to remove brain-resources annotation from a project instance
 */
export const useRemoveProjectAnnotationMutation = () => {
  const queryClient = useQueryClient();
  const batchRemoveMutation = useBatchRemoveResourcesMetadataMutation();

  return useMutation({
    mutationFn: async ({ projectName }: { projectName: string }) => {
      return batchRemoveMutation.mutateAsync({
        targets: [createProjectInstanceTarget(projectName)],
        metadataType: "annotations",
        key: BRAIN_RESOURCES_ANNOTATION_KEY,
      });
    },
    onSuccess: (_, { projectName }) => {
      const context = createK8sContext();
      toast.success("Project annotation removed successfully");
      const invalidationKeys = getProjectQueryInvalidationKeys(context.namespace, projectName);
      invalidationKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
    onError: (error) => {
      toast.error("Failed to remove project annotation");
      throw error;
    },
  });
};

/**
 * Hook to create a new project instance
 */
export const useCreateProjectMutation = () => {
  const queryClient = useQueryClient();
  const createInstanceMutation = useApplyInstanceYamlMutation();

  return useMutation({
    mutationFn: async ({ projectName }: { projectName?: string }) => {
      const context = createK8sContext();
      const finalProjectName = projectName || generateNewProjectName();
      const projectYaml = generateProjectTemplate(
        finalProjectName,
        context.namespace
      );

      return createInstanceMutation.mutateAsync({ yamlContent: projectYaml });
    },
    onSuccess: (data, { projectName }) => {
      const context = createK8sContext();
      const finalProjectName = projectName || generateNewProjectName();
      toast.success("Project created successfully");
      const invalidationKeys = getProjectQueryInvalidationKeys(context.namespace, finalProjectName);
      invalidationKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
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
 * Hook to delete a project and all its associated resources
 *
 * This mutation follows a clean 3-step approach:
 * 1. Delete cluster-related resources (not clusters themselves)
 * 2. Delete instance-related resources (not instances themselves)
 * 3. Delete all remaining resources with the project label (final cleanup)
 */
export const useDeleteProjectMutation = () => {
  const queryClient = useQueryClient();
  const deleteAllResources = useDeleteAllResourcesMutation();

  return useMutation({
    mutationFn: async ({ projectName }: { projectName: string }) => {
      try {
        const context = createK8sContext();
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
      const context = createK8sContext();
      toast.success(`Project "${data.projectName}" deleted successfully`);
      const invalidationKeys = getProjectQueryInvalidationKeys(context.namespace, data.projectName);
      invalidationKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
    onError: (error) => {
      toast.error("Failed to delete project");
      throw error;
    },
  });
};
