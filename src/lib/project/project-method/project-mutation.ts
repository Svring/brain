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
import { listCustomResourcesOptions } from "@/lib/k8s/k8s-method/k8s-query";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import {
  BuiltinResourceTarget,
  CustomResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { INSTANCE_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";
import { CUSTOM_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-custom-resource";
import { BUILTIN_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-builtin-resource";
import {
  generateNewProjectName,
  generateProjectTemplate,
} from "./project-utils";
import { getClusterRelatedResources } from "@/lib/algorithm/relevance/cluster-relevance";
import { getDeployRelatedResources } from "@/lib/algorithm/relevance/deploy-relevance";
import { getDevboxRelatedResources } from "@/lib/algorithm/relevance/devbox-relevance";
import { getInstanceRelatedResources } from "@/lib/algorithm/relevance/instance-relevance";
import { getProjectRelatedResources } from "@/lib/algorithm/relevance/project-relevance";
import { convertAndFilterResourceToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { BRAIN_RESOURCES_ANNOTATION_KEY } from "@/lib/project/project-constant/project-constant-label";
import { getProjectOptions } from "./project-query";

/**
 * Hook to add project name label to multiple resources
 */
export const useAddToProjectMutation = (context: K8sApiContext) => {
  const queryClient = useQueryClient();
  const batchPatchMutation = useBatchPatchResourcesMetadataMutation(context);

  return useMutation({
    mutationFn: async ({
      resources,
      projectName,
    }: {
      resources: (CustomResourceTarget | BuiltinResourceTarget)[];
      projectName: string;
    }) => {
      let allTargetsToPatch: (CustomResourceTarget | BuiltinResourceTarget)[] =
        [...resources];
      const relatedResourcesPromises: Promise<any[]>[] = [];

      for (const resource of resources) {
        if (!resource.name) continue;

        if (
          CUSTOM_RESOURCES.cluster &&
          resource.type === "custom" &&
          resource.plural === CUSTOM_RESOURCES.cluster.plural
        ) {
          relatedResourcesPromises.push(
            getClusterRelatedResources(context, resource.name)
          );
        } else if (
          resource.type === "builtin" &&
          resource.resourceType === "deployment"
        ) {
          relatedResourcesPromises.push(
            getDeployRelatedResources(context, resource.name)
          );
        } else if (
          CUSTOM_RESOURCES.instance &&
          resource.type === "custom" &&
          resource.plural === CUSTOM_RESOURCES.instance.plural
        ) {
          relatedResourcesPromises.push(
            getInstanceRelatedResources(context, resource.name)
          );
        } else if (
          CUSTOM_RESOURCES.devbox &&
          resource.type === "custom" &&
          resource.plural === CUSTOM_RESOURCES.devbox.plural
        ) {
          relatedResourcesPromises.push(
            getDevboxRelatedResources(context, resource.name)
          );
        }
      }

      const relatedResourceArrays = await Promise.all(relatedResourcesPromises);
      const allRelatedResources = relatedResourceArrays.flat();
      const relatedTargets = allRelatedResources
        .map(convertAndFilterResourceToTarget)
        .filter(Boolean) as (CustomResourceTarget | BuiltinResourceTarget)[];

      allTargetsToPatch.push(...relatedTargets);
      allTargetsToPatch = _.uniqWith(allTargetsToPatch, _.isEqual);

      // Add labels to all resources
      await batchPatchMutation.mutateAsync({
        targets: allTargetsToPatch,
        metadataType: "labels",
        key: INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS,
        value: projectName,
      });

      // Update brain-resources annotation

      // Get current project to read existing annotation
      const projectQuery = getProjectOptions(context, projectName);
      const currentProject = await queryClient.ensureQueryData(projectQuery);

      // Parse existing annotation or create new one
      let currentAnnotation: any = { builtin: [], custom: [] };
      if (
        currentProject?.metadata?.annotations?.[BRAIN_RESOURCES_ANNOTATION_KEY]
      ) {
        try {
          currentAnnotation = JSON.parse(
            currentProject.metadata.annotations[BRAIN_RESOURCES_ANNOTATION_KEY]
          );
        } catch (error) {
          console.warn(
            "Failed to parse existing annotation, using empty:",
            error
          );
        }
      }

      // Convert new resources to simplified format
      const newSimplifiedResources = allTargetsToPatch.map((target) => {
        if (target.type === "custom") {
          const config = Object.values(CUSTOM_RESOURCES).find(
            (c) =>
              c.group === target.group &&
              c.version === target.version &&
              c.plural === target.plural
          );
          // For custom resources, capitalize the resourceType as kind
          const kind = config?.resourceType
            ? config.resourceType.charAt(0).toUpperCase() +
              config.resourceType.slice(1)
            : target.plural;
          return {
            kind,
            name: target.name,
          };
        } else {
          const config = Object.values(BUILTIN_RESOURCES).find(
            (c) => c.resourceType === target.resourceType
          );
          return {
            kind: config?.kind || target.resourceType,
            name: target.name,
          };
        }
      });

      // Merge with existing annotation
      const builtinResources = newSimplifiedResources.filter((r) => {
        return Object.values(BUILTIN_RESOURCES).some((c) => c.kind === r.kind);
      });
      const customResources = newSimplifiedResources.filter((r) => {
        return Object.values(CUSTOM_RESOURCES).some((c) => {
          const kind =
            c.resourceType.charAt(0).toUpperCase() + c.resourceType.slice(1);
          return kind === r.kind;
        });
      });

      const updatedAnnotation = {
        builtin: _.uniqWith(
          [...(currentAnnotation.builtin || []), ...builtinResources],
          _.isEqual
        ),
        custom: _.uniqWith(
          [...(currentAnnotation.custom || []), ...customResources],
          _.isEqual
        ),
      };

      // Update the annotation
      await batchPatchMutation.mutateAsync({
        targets: [
          {
            type: "custom",
            group: CUSTOM_RESOURCES.instance.group,
            version: CUSTOM_RESOURCES.instance.version,
            plural: CUSTOM_RESOURCES.instance.plural,
            name: projectName,
          },
        ],
        metadataType: "annotations",
        key: BRAIN_RESOURCES_ANNOTATION_KEY,
        value: JSON.stringify(updatedAnnotation),
      });
    },
    onSuccess: (_, { projectName }) => {
      toast.success(`Resources added to project ${projectName}`);
      queryClient.invalidateQueries({
        queryKey: ["project", "resources", context.namespace, projectName],
      });
      queryClient.invalidateQueries({
        queryKey: ["project", "get", context.namespace],
      });
      queryClient.invalidateQueries({
        queryKey: ["inventory"],
      });
    },
  });
};

/**
 * Hook to remove project name label from multiple resources
 */
export const useRemoveFromProjectMutation = (context: K8sApiContext) => {
  const queryClient = useQueryClient();
  const batchRemoveMutation = useBatchRemoveResourcesMetadataMutation(context);
  const batchPatchMutation = useBatchPatchResourcesMetadataMutation(context);

  return useMutation({
    mutationFn: async ({
      resources,
      projectName,
    }: {
      resources: (CustomResourceTarget | BuiltinResourceTarget)[];
      projectName: string;
    }) => {
      let allTargetsToRemove: (CustomResourceTarget | BuiltinResourceTarget)[] =
        [...resources];
      const relatedResourcesPromises: Promise<any[]>[] = [];

      for (const resource of resources) {
        if (!resource.name) continue;

        if (
          CUSTOM_RESOURCES.cluster &&
          resource.type === "custom" &&
          resource.plural === CUSTOM_RESOURCES.cluster.plural
        ) {
          relatedResourcesPromises.push(
            getClusterRelatedResources(context, resource.name)
          );
        } else if (
          resource.type === "builtin" &&
          resource.resourceType === "deployment"
        ) {
          relatedResourcesPromises.push(
            getDeployRelatedResources(context, resource.name)
          );
        } else if (
          CUSTOM_RESOURCES.instance &&
          resource.type === "custom" &&
          resource.plural === CUSTOM_RESOURCES.instance.plural
        ) {
          relatedResourcesPromises.push(
            getInstanceRelatedResources(context, resource.name)
          );
        } else if (
          CUSTOM_RESOURCES.devbox &&
          resource.type === "custom" &&
          resource.plural === CUSTOM_RESOURCES.devbox.plural
        ) {
          relatedResourcesPromises.push(
            getDevboxRelatedResources(context, resource.name)
          );
        }
      }

      const relatedResourceArrays = await Promise.all(relatedResourcesPromises);
      const allRelatedResources = relatedResourceArrays.flat();
      const relatedTargets = allRelatedResources
        .map(convertAndFilterResourceToTarget)
        .filter(Boolean) as (CustomResourceTarget | BuiltinResourceTarget)[];

      allTargetsToRemove.push(...relatedTargets);
      allTargetsToRemove = _.uniqWith(allTargetsToRemove, _.isEqual);

      // Remove labels from all resources
      await batchRemoveMutation.mutateAsync({
        targets: allTargetsToRemove,
        metadataType: "labels",
        key: INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS,
      });

      // Update brain-resources annotation

      // Get current project to read existing annotation
      const projectQuery = getProjectOptions(context, projectName);
      const currentProject = await queryClient.ensureQueryData(projectQuery);

      // Parse existing annotation
      let currentAnnotation: any = { builtin: [], custom: [] };
      if (
        currentProject?.metadata?.annotations?.[BRAIN_RESOURCES_ANNOTATION_KEY]
      ) {
        try {
          currentAnnotation = JSON.parse(
            currentProject.metadata.annotations[BRAIN_RESOURCES_ANNOTATION_KEY]
          );
        } catch (error) {
          console.warn(
            "Failed to parse existing annotation, using empty:",
            error
          );
        }
      }

      // Convert removed resources to simplified format for filtering
      const removedSimplifiedResources = allTargetsToRemove.map((target) => {
        if (target.type === "custom") {
          const config = Object.values(CUSTOM_RESOURCES).find(
            (c) =>
              c.group === target.group &&
              c.version === target.version &&
              c.plural === target.plural
          );
          // For custom resources, capitalize the resourceType as kind
          const kind = config?.resourceType
            ? config.resourceType.charAt(0).toUpperCase() +
              config.resourceType.slice(1)
            : target.plural;
          return {
            kind,
            name: target.name,
          };
        } else {
          const config = Object.values(BUILTIN_RESOURCES).find(
            (c) => c.resourceType === target.resourceType
          );
          return {
            kind: config?.kind || target.resourceType,
            name: target.name,
          };
        }
      });

      // Remove resources from annotation
      const updatedAnnotation = {
        builtin: (currentAnnotation.builtin || []).filter(
          (resource: any) =>
            !removedSimplifiedResources.some(
              (removed) =>
                removed.kind === resource.kind && removed.name === resource.name
            )
        ),
        custom: (currentAnnotation.custom || []).filter(
          (resource: any) =>
            !removedSimplifiedResources.some(
              (removed) =>
                removed.kind === resource.kind && removed.name === resource.name
            )
        ),
      };

      // Update the annotation
      await batchPatchMutation.mutateAsync({
        targets: [
          {
            type: "custom",
            group: CUSTOM_RESOURCES.instance.group,
            version: CUSTOM_RESOURCES.instance.version,
            plural: CUSTOM_RESOURCES.instance.plural,
            name: projectName,
          },
        ],
        metadataType: "annotations",
        key: BRAIN_RESOURCES_ANNOTATION_KEY,
        value: JSON.stringify(updatedAnnotation),
      });
    },
    onSuccess: (_, { projectName }) => {
      toast.success(`Resources removed from project ${projectName}`);
      queryClient.invalidateQueries({
        queryKey: ["project", "resources", context.namespace, projectName],
      });
      queryClient.invalidateQueries({
        queryKey: ["project", "get", context.namespace],
      });
      queryClient.invalidateQueries({
        queryKey: ["inventory"],
      });
    },
  });
};

/**
 * Hook to remove brain-resources annotation from a project instance
 */
export const useRemoveProjectAnnotationMutation = (context: K8sApiContext) => {
  const queryClient = useQueryClient();
  const batchRemoveMutation = useBatchRemoveResourcesMetadataMutation(context);

  return useMutation({
    mutationFn: async ({ projectName }: { projectName: string }) => {
      return batchRemoveMutation.mutateAsync({
        targets: [
          {
            type: "custom",
            group: CUSTOM_RESOURCES.instance.group,
            version: CUSTOM_RESOURCES.instance.version,
            plural: CUSTOM_RESOURCES.instance.plural,
            name: projectName,
          },
        ],
        metadataType: "annotations",
        key: "brain-resources",
      });
    },
    onSuccess: () => {
      toast.success("Project annotation removed successfully");
      queryClient.invalidateQueries({
        queryKey: ["project", "resources", context.namespace],
      });
      queryClient.invalidateQueries({
        queryKey: ["project", "get", context.namespace],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "k8s",
          "annotation-based-resources",
          "list",
          context.namespace,
        ],
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
    onSuccess: (data) => {
      toast.success("Project created successfully");
      queryClient.invalidateQueries({
        queryKey: ["projects", context.namespace],
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
      queryClient.invalidateQueries({
        queryKey: ["k8s"],
      });
      queryClient.invalidateQueries({
        queryKey: ["project", "resources", context.namespace],
      });
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
    onError: (error) => {
      toast.error("Failed to delete project");
      throw error;
    },
  });
};
