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
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
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
  createProjectTarget,
  getProjectQueryInvalidationKeys,
  invalidateProjectQueries,
} from "./project-utils";
import { getProjectRelatedResources } from "@/lib/algorithm/relevance/project/project-relevance";
import { BRAIN_RESOURCES_ANNOTATION_KEY } from "@/lib/project/project-constant/project-constant-label";
import { getProjectOptions } from "./project-query";
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

      // Update brain-resources annotation using utility functions
      const projectQuery = getProjectOptions(context, projectName);
      const currentProject = await queryClient.ensureQueryData(projectQuery);

      const currentAnnotation = parseProjectAnnotation(
        currentProject?.metadata?.annotations?.[BRAIN_RESOURCES_ANNOTATION_KEY]
      );
      const newSimplifiedResources =
        convertTargetsToSimplifiedFormat(allTargetsToPatch);
      const updatedAnnotation = mergeProjectAnnotation(
        currentAnnotation,
        newSimplifiedResources
      );

      await patchMutation.mutateAsync({
        target: [createProjectTarget(projectName)],
        metadataType: "annotations",
        key: BRAIN_RESOURCES_ANNOTATION_KEY,
        value: JSON.stringify(updatedAnnotation),
      });
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
      const allTargetsToRemove = await gatherRelatedResources(
        context,
        resources
      );

      // Remove labels from all resources
      await removeMutation.mutateAsync({
        target: allTargetsToRemove,
        metadataType: "labels",
        key: INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS,
      });

      // Update brain-resources annotation using utility functions
      const projectQuery = getProjectOptions(context, projectName);
      const currentProject = await queryClient.ensureQueryData(projectQuery);

      const currentAnnotation = parseProjectAnnotation(
        currentProject?.metadata?.annotations?.[BRAIN_RESOURCES_ANNOTATION_KEY]
      );
      const removedSimplifiedResources =
        convertTargetsToSimplifiedFormat(allTargetsToRemove);
      const updatedAnnotation = removeFromProjectAnnotation(
        currentAnnotation,
        removedSimplifiedResources
      );

      await patchMutation.mutateAsync({
        target: [createProjectTarget(projectName)],
        metadataType: "annotations",
        key: BRAIN_RESOURCES_ANNOTATION_KEY,
        value: JSON.stringify(updatedAnnotation),
      });
    },
    onSuccess: (_, { projectName }) => {
      toast.success(`Resources removed from project ${projectName}`);
      invalidateProjectQueries(queryClient, context.namespace, projectName);
    },
  });
};

/**
 * Hook to remove brain-resources annotation from a project instance
 */
export const useRemoveProjectAnnotationMutation = (context: K8sApiContext) => {
  const queryClient = useQueryClient();
  const removeMutation = useRemoveResourceMetadataMutation(context);

  return useMutation({
    mutationFn: async ({ projectName }: { projectName: string }) => {
      return removeMutation.mutateAsync({
        target: [createProjectTarget(projectName)],
        metadataType: "annotations",
        key: BRAIN_RESOURCES_ANNOTATION_KEY,
      });
    },
    onSuccess: (_, { projectName }) => {
      toast.success("Project annotation removed successfully");
      invalidateProjectQueries(queryClient, context.namespace, projectName);
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
export const useCreateProjectMutation = (context: K8sApiContext) => {
  const queryClient = useQueryClient();
  const createInstanceMutation = useApplyInstanceYamlMutation(context);

  return useMutation({
    mutationFn: async ({ projectName }: { projectName?: string }) => {
      const finalProjectName = projectName || generateNewProjectName();
      const projectYaml = generateProjectTemplate(
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
