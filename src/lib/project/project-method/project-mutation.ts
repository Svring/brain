"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import _ from "lodash";
import {
  useBatchPatchResourcesMetadataMutation,
  useBatchRemoveResourcesMetadataMutation,
  useApplyInstanceYamlMutation,
  useDeleteInstanceRelatedMutation,
  useDeleteClusterRelatedMutation,
  useDeleteResourcesByLabelSelectorMutation,
} from "@/lib/k8s/k8s-method/k8s-mutation";
import { listCustomResourcesOptions } from "@/lib/k8s/k8s-method/k8s-query";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import {
  BuiltinResourceTarget,
  CustomResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { PROJECT_NAME_LABEL_KEY } from "@/lib/k8s/k8s-constant/k8s-constant-label";
import { CUSTOM_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-custom-resource";
import { BUILTIN_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-builtin-resource";
import {
  generateNewProjectName,
  generateProjectTemplate,
} from "./project-utils";
import { getClusterRelatedResources } from "@/lib/algorithm/relevance/cluster-relevance";
import { getDeployRelatedResources } from "@/lib/algorithm/relevance/deploy-relevance";
import { getInstanceRelatedResources } from "@/lib/algorithm/relevance/instance-relevance";
import {
  convertAndFilterResourceToTarget,
  convertToResourceTarget,
  getResourceConfigFromKind,
} from "@/lib/k8s/k8s-method/k8s-utils";

/**
 * Extract instance and cluster names from individual resource queries
 */
async function extractProjectResourcesDirectly(
  context: K8sApiContext,
  projectName: string,
  queryClient: any
) {
  const labelSelector = `${PROJECT_NAME_LABEL_KEY}=${projectName}`;
  const instanceNames: string[] = [];
  const clusterNames: string[] = [];

  try {
    // Query instances directly
    const instanceQuery = listCustomResourcesOptions(context, {
      type: "custom",
      group: CUSTOM_RESOURCES.instance.group,
      version: CUSTOM_RESOURCES.instance.version,
      plural: CUSTOM_RESOURCES.instance.plural,
      labelSelector,
    });

    const instancesResult = await queryClient.ensureQueryData(instanceQuery);

    if (instancesResult?.items) {
      instanceNames.push(
        ...instancesResult.items
          .map((item: any) => item.metadata?.name)
          .filter(Boolean)
      );
    }

    // Query clusters directly
    const clusterQuery = listCustomResourcesOptions(context, {
      type: "custom",
      group: CUSTOM_RESOURCES.cluster.group,
      version: CUSTOM_RESOURCES.cluster.version,
      plural: CUSTOM_RESOURCES.cluster.plural,
      labelSelector,
    });

    const clustersResult = await queryClient.ensureQueryData(clusterQuery);

    if (clustersResult?.items) {
      clusterNames.push(
        ...clustersResult.items
          .map((item: any) => item.metadata?.name)
          .filter(Boolean)
      );
    }
  } catch (error) {
    //
  }

  const result = { instanceNames, clusterNames };
  return result;
}

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
        }
      }

      const relatedResourceArrays = await Promise.all(relatedResourcesPromises);
      const allRelatedResources = relatedResourceArrays.flat();
      const relatedTargets = allRelatedResources
        .map(convertAndFilterResourceToTarget)
        .filter(Boolean) as (CustomResourceTarget | BuiltinResourceTarget)[];

      allTargetsToPatch.push(...relatedTargets);
      allTargetsToPatch = _.uniqWith(allTargetsToPatch, _.isEqual);

      await batchPatchMutation.mutateAsync({
        targets: allTargetsToPatch,
        metadataType: "labels",
        key: PROJECT_NAME_LABEL_KEY,
        value: projectName,
      });
    },
    onSuccess: (_, { projectName }) => {
      toast.success(`Resources added to project ${projectName}`);
      queryClient.invalidateQueries({
        queryKey: ["project", "resources", context.namespace, projectName],
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
        }
      }

      const relatedResourceArrays = await Promise.all(relatedResourcesPromises);
      const allRelatedResources = relatedResourceArrays.flat();
      const relatedTargets = allRelatedResources
        .map(convertAndFilterResourceToTarget)
        .filter(Boolean) as (CustomResourceTarget | BuiltinResourceTarget)[];

      allTargetsToRemove.push(...relatedTargets);
      allTargetsToRemove = _.uniqWith(allTargetsToRemove, _.isEqual);

      await batchRemoveMutation.mutateAsync({
        targets: allTargetsToRemove,
        metadataType: "labels",
        key: PROJECT_NAME_LABEL_KEY,
      });
    },
    onSuccess: (_, { projectName }) => {
      toast.success(`Resources removed from project ${projectName}`);
      queryClient.invalidateQueries({
        queryKey: ["project", "resources", context.namespace, projectName],
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
  const deleteInstanceRelated = useDeleteInstanceRelatedMutation(context);
  const deleteClusterRelated = useDeleteClusterRelatedMutation(context);
  const deleteByLabel = useDeleteResourcesByLabelSelectorMutation(context);

  return useMutation({
    mutationFn: async ({ projectName }: { projectName: string }) => {
      try {
        const { instanceNames, clusterNames } =
          await extractProjectResourcesDirectly(
            context,
            projectName,
            queryClient
          );

        const clusterDeletions = await Promise.allSettled(
          clusterNames.map((clusterName: string) => {
            return deleteClusterRelated.mutateAsync({
              instanceName: clusterName,
            });
          })
        );

        const instanceDeletions = await Promise.allSettled(
          instanceNames.map((instanceName: string) => {
            return deleteInstanceRelated.mutateAsync({ instanceName });
          })
        );

        const labelSelector = `${PROJECT_NAME_LABEL_KEY}=${projectName}`;

        const builtinDeletions = await Promise.allSettled(
          Object.entries(BUILTIN_RESOURCES).map(([, config]) => {
            return deleteByLabel.mutateAsync({
              target: {
                type: "builtin",
                resourceType: config.resourceType,
                labelSelector,
              },
            });
          })
        );

        const customDeletions = await Promise.allSettled(
          Object.entries(CUSTOM_RESOURCES).map(([, config]) => {
            return deleteByLabel.mutateAsync({
              target: {
                type: "custom",
                group: config.group,
                version: config.version,
                plural: config.plural,
                labelSelector,
              },
            });
          })
        );

        const result = {
          success: true,
          projectName,
          instanceNames,
          clusterNames,
          clusterDeletions: clusterDeletions.length,
          instanceDeletions: instanceDeletions.length,
          builtinDeletions: builtinDeletions.length,
          customDeletions: customDeletions.length,
        };

        return result;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success(`Project "${data.projectName}" deleted successfully`);
      queryClient.invalidateQueries({
        queryKey: ["projects", context.namespace],
      });
      queryClient.invalidateQueries({
        queryKey: ["project", "get", context.namespace],
      });
      queryClient.invalidateQueries({
        queryKey: ["cluster", "list", context.namespace],
      });
      queryClient.invalidateQueries({
        queryKey: ["cluster", "get", context.namespace],
      });
    },
    onError: (error) => {
      toast.error("Failed to delete project");
      throw error;
    },
  });
};
