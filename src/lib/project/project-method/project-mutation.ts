"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useBatchPatchResourcesMetadataMutation,
  useBatchRemoveResourcesMetadataMutation,
  useApplyInstanceYamlMutation,
  useDeleteInstanceRelatedMutation,
  useDeleteClusterRelatedMutation,
  useDeleteResourcesByLabelSelectorMutation,
} from "@/lib/k8s/k8s-method/k8s-mutation";
import {
  listCustomResourcesOptions,
  getCustomResourceOptions,
} from "@/lib/k8s/k8s-method/k8s-query";
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

const BRAIN_RESOURCES_ANNOTATION_KEY = "brain-resources";

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
      // First add the project label to resources
      await batchPatchMutation.mutateAsync({
        targets: resources,
        metadataType: "labels",
        key: PROJECT_NAME_LABEL_KEY,
        value: projectName,
      });

      // Then update the project instance annotation with affiliated resources
      try {
        // Get current project instance to check for existing annotation
        const projectInstanceQuery = getCustomResourceOptions(context, {
          type: "custom",
          group: CUSTOM_RESOURCES.instance.group,
          version: CUSTOM_RESOURCES.instance.version,
          plural: CUSTOM_RESOURCES.instance.plural,
          name: projectName,
        });

        const projectInstance = await queryClient.ensureQueryData(
          projectInstanceQuery
        );
        const currentAnnotation =
          projectInstance?.metadata?.annotations?.[
            BRAIN_RESOURCES_ANNOTATION_KEY
          ];

        // Parse existing resources or start with empty arrays
        let existingResources: {
          custom: Array<{ kind: string; name: string }>;
          builtin: Array<{ kind: string; name: string }>;
        } = { custom: [], builtin: [] };
        if (currentAnnotation) {
          try {
            existingResources = JSON.parse(currentAnnotation);
          } catch (e) {
            // If parsing fails, start fresh
          }
        }

        // Add new resources to the appropriate arrays
        const newResourcesData = {
          custom: [...existingResources.custom],
          builtin: [...existingResources.builtin],
        };

        resources.forEach((resource) => {
          if (!resource.name) return; // Skip resources without names

          const resourceData = {
            kind:
              resource.type === "custom"
                ? `${resource.group}/${resource.version}/${resource.plural}`
                : resource.resourceType,
            name: resource.name,
          };

          if (resource.type === "custom") {
            // Check if not already exists
            if (
              !newResourcesData.custom.some(
                (r) =>
                  r.kind === resourceData.kind && r.name === resourceData.name
              )
            ) {
              newResourcesData.custom.push(resourceData);
            }
          } else {
            // Check if not already exists
            if (
              !newResourcesData.builtin.some(
                (r) =>
                  r.kind === resourceData.kind && r.name === resourceData.name
              )
            ) {
              newResourcesData.builtin.push(resourceData);
            }
          }
        });

        // Update the project instance annotation
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
          value: JSON.stringify(newResourcesData),
        });
      } catch (error) {
        console.warn("Failed to update project instance annotation:", error);
        // Don't fail the whole operation if annotation update fails
      }
    },
    onSuccess: () => {
      toast.success("Project name label added to resources");
      // Invalidate project-related queries
      queryClient.invalidateQueries({
        queryKey: ["project", "resources", context.namespace],
      });
      queryClient.invalidateQueries({
        queryKey: ["inventory"],
      });
      // Invalidate project instance queries to refresh annotation
      queryClient.invalidateQueries({
        queryKey: ["custom", "get", context.namespace],
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
    mutationFn: ({
      resources,
    }: {
      resources: (CustomResourceTarget | BuiltinResourceTarget)[];
    }) => {
      return batchRemoveMutation.mutateAsync({
        targets: resources,
        metadataType: "labels",
        key: PROJECT_NAME_LABEL_KEY,
      });
    },
    onSuccess: () => {
      toast.success("Project name label removed from resources");
      // Invalidate project-related queries
      queryClient.invalidateQueries({
        queryKey: ["project", "resources", context.namespace],
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
        key: BRAIN_RESOURCES_ANNOTATION_KEY,
      });
    },
    onSuccess: () => {
      toast.success("Project annotation removed successfully");
      // Invalidate project-related queries
      queryClient.invalidateQueries({
        queryKey: ["project", "resources", context.namespace],
      });
      queryClient.invalidateQueries({
        queryKey: ["custom", "get", context.namespace],
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
      // The useApplyInstanceYamlMutation already handles query invalidation
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
        // Extract instances and clusters directly without using problematic listAllResources
        const { instanceNames, clusterNames } =
          await extractProjectResourcesDirectly(
            context,
            projectName,
            queryClient
          );

        // Step 1: Delete cluster-related resources (not clusters themselves)
        const clusterDeletions = await Promise.allSettled(
          clusterNames.map((clusterName: string) => {
            return deleteClusterRelated.mutateAsync({
              instanceName: clusterName,
            });
          })
        );

        // Step 2: Delete instance-related resources (not instances themselves)
        const instanceDeletions = await Promise.allSettled(
          instanceNames.map((instanceName: string) => {
            return deleteInstanceRelated.mutateAsync({ instanceName });
          })
        );

        // Step 3: Delete all remaining resources with the project label (final cleanup)
        const labelSelector = `${PROJECT_NAME_LABEL_KEY}=${projectName}`;

        // Delete remaining builtin resources by label
        const builtinDeletions = await Promise.allSettled(
          Object.entries(BUILTIN_RESOURCES).map(([name, config]) => {
            return deleteByLabel.mutateAsync({
              target: {
                type: "builtin",
                resourceType: config.resourceType,
                labelSelector,
              },
            });
          })
        );

        // Delete remaining custom resources by label
        const customDeletions = await Promise.allSettled(
          Object.entries(CUSTOM_RESOURCES).map(([name, config]) => {
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

      // Invalidate project-related queries
      queryClient.invalidateQueries({
        queryKey: ["projects", context.namespace],
      });
      queryClient.invalidateQueries({
        queryKey: ["project", "get", context.namespace],
      });

      // Invalidate cluster-related queries
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
