"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  useBatchPatchResourcesMetadataMutation,
  useBatchRemoveResourcesMetadataMutation,
  useDeleteInstanceRelatedMutation,
  useDeleteClusterRelatedMutation,
  useDeleteResourceMutation,
} from "@/lib/k8s/k8s-mutation";
import {
  listCustomResources,
  listBuiltinResources,
  deleteCustomResource,
} from "@/lib/k8s/k8s-api";
import { RESOURCES } from "@/lib/k8s/k8s-constant";
import { filterEmptyResources } from "@/lib/k8s/k8s-utils";
import type {
  K8sApiContext,
  ResourceTarget,
  AnyKubernetesResource,
} from "@/lib/k8s/schemas";
import { PROJECT_NAME_LABEL_KEY } from "./project-constant";
import {
  getClusterNamesFromProjectResources,
  getInstanceNamesFromProjectResources,
  getDeploymentNamesFromProjectResources,
  getStatefulSetNamesFromProjectResources,
  getOtherResourceNamesFromProjectResources,
} from "./project-utils";

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
 * Hook to delete a project and all its associated resources
 *
 * This mutation performs comprehensive cleanup of all resources associated with a project.
 * It dynamically discovers project resources and uses appropriate deletion strategies for each type:
 *
 * ## PROJECT DELETION WORKFLOW:
 *
 * ### Step 1: Resource Discovery
 * 1. **Fetch Project Resources** - Uses label selector: `${PROJECT_NAME_LABEL_KEY}=${projectName}`
 * 2. **Extract Resource Names by Type** - Categorizes resources into different types
 * 3. **Prepare Deletion Plan** - Creates deletion tasks for each resource type
 *
 * ### Step 2: Parallel Deletion Execution
 *
 * ## DELETION STRATEGIES BY RESOURCE TYPE:
 *
 * ### A. INSTANCE RESOURCES (Uses useDeleteInstanceRelatedMutation):
 * For each instance found in project resources, deletes related resources in phases:
 * **NOTE**: This deletes all resources RELATED to the instance, but NOT the instance resource itself.
 *
 * **Phase 1 - Dependent Resources (parallel):**
 * - Services (by label selector: `cloud.sealos.io/app-deploy-manager=${instanceName}`)
 * - ConfigMap (by name: `${instanceName}`)
 * - Secret (by name: `${instanceName}`)
 * - Ingresses (by label selector: `cloud.sealos.io/app-deploy-manager=${instanceName}`)
 * - Cert-Manager Issuers (by label selector: `cloud.sealos.io/app-deploy-manager=${instanceName}`)
 * - Cert-Manager Certificates (by label selector: `cloud.sealos.io/app-deploy-manager=${instanceName}`)
 * - PVCs (by label selector: `app=${instanceName}`)
 * - HorizontalPodAutoscaler (by name: `${instanceName}`)
 * - Job (by name: `${instanceName}`)
 * - CronJob (by name: `${instanceName}`)
 * - App Custom Resource (by name: `${instanceName}`)
 *
 * **Phase 2 - Main Workloads (parallel):**
 * - Deployment (by name: `${instanceName}`)
 * - StatefulSet (by name: `${instanceName}`)
 *
 * ### B. CLUSTER RESOURCES (Uses useDeleteClusterRelatedMutation):
 * For each cluster found in project resources, deletes related resources in phases:
 *
 * **Phase 1 - Database Backups:**
 * - KubeBlocks Backups (by label selector: `app.kubernetes.io/instance=${clusterName}`)
 *
 * **Phase 2 - Export Service:**
 * - Export Service (by name: `${clusterName}-export`)
 *
 * **Phase 3 - RBAC Resources (parallel):**
 * - Role (by name: `${clusterName}`)
 * - RoleBinding (by name: `${clusterName}`)
 * - ServiceAccount (by name: `${clusterName}`)
 *
 * **Phase 4 - Database Cluster:**
 * - KubeBlocks Cluster (by name: `${clusterName}`)
 *
 * ### C. DIRECT RESOURCE DELETION (Uses useDeleteResourceMutation):
 * For individual resources found in project resources:
 *
 * **Deployments:** Each deployment deleted by its actual name
 * **StatefulSets:** Each statefulset deleted by its actual name
 * **Other Resources:** Each resource deleted by its actual name and type
 * - Supports: services, configmaps, secrets, ingresses, pods, pvcs, etc.
 * - Custom resources: devboxes, apps, objectstoragebuckets, etc.
 *
 * ### D. FINAL INSTANCE CLEANUP (Direct deletion after all other resources):
 * **Main Instance Resource:** The instance resource with the project name is deleted last
 * - API: `app.sealos.io/v1/instances`
 * - Name: `${projectName}`
 * - **Purpose**: Ensures the main project instance is removed after all related resources are gone
 *
 * ## EXECUTION ORDER:
 * 1. **Resource Discovery**: Fetch all project resources and categorize by type
 * 2. **Parallel Deletion**: All deletion strategies run in parallel
 *    - Instance deletions (for each instance found)
 *    - Cluster deletions (for each cluster found)
 *    - Direct resource deletions (for each individual resource found)
 * 3. **Final Cleanup**: Delete the main instance resource with project name
 *    - This happens AFTER all related resources are deleted
 *    - Uses the project name as the instance resource name
 * 4. **Error Handling**: Ignores 404 errors (resource not found) but fails on other errors
 *
 * ## EXPECTED RESULTS:
 * - **Success**: All project resources are cleaned up comprehensively
 * - **Partial Success**: Some resources may not exist (404s are ignored)
 * - **Failure**: Non-404 errors will cause the entire operation to fail
 * - **Query Invalidation**: All relevant React Query caches are invalidated on success
 *
 * ## RESOURCE DISCOVERY STRATEGIES:
 * - **Project Label**: Uses `${PROJECT_NAME_LABEL_KEY}=${projectName}` to find all project resources
 * - **Dynamic Detection**: Extracts actual resource names from project resources (no assumptions)
 * - **Type-Specific Handling**: Uses appropriate deletion strategy for each resource type
 * - **Comprehensive Coverage**: Handles instances, clusters, and individual resources
 *
 * @param context - K8s API context containing namespace and kubeconfig
 * @returns Mutation hook that accepts { projectName: string } and returns deletion results
 */
export function useDeleteProjectResourcesMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();
  const deleteInstanceMutation = useDeleteInstanceRelatedMutation(context);
  const deleteClusterMutation = useDeleteClusterRelatedMutation(context);
  const deleteResourceMutation = useDeleteResourceMutation(context);

  return useMutation({
    mutationFn: async ({ projectName }: { projectName: string }) => {
      console.log(`🗑️ Starting deletion of project: ${projectName}`);
      console.log(`📍 Namespace: ${context.namespace}`);

      // Step 1: Fetch project resources to identify all resources
      console.log(`📋 Fetching project resources...`);
      const labelSelector = `${PROJECT_NAME_LABEL_KEY}=${projectName}`;

      let projectResources: Record<string, { items: AnyKubernetesResource[] }>;
      try {
        // Fetch all resources directly using the API functions
        const resourcePromises = Object.entries(RESOURCES).map(
          ([_, config]) => {
            if (config.type === "custom") {
              return runParallelAction(
                listCustomResources(
                  context.kubeconfig,
                  config.group,
                  config.version,
                  context.namespace,
                  config.plural,
                  labelSelector
                )
              );
            }
            // All resources are now either custom or builtin
            return runParallelAction(
              listBuiltinResources(
                context.kubeconfig,
                context.namespace,
                config.resourceType,
                labelSelector
              )
            );
          }
        );

        const results = await Promise.all(resourcePromises);
        const rawResources = Object.fromEntries(
          Object.keys(RESOURCES).map((name, i) => [name, results[i]])
        );

        projectResources = filterEmptyResources(
          rawResources as Record<string, { items: AnyKubernetesResource[] }>
        );
      } catch (error) {
        console.error(`❌ Failed to fetch project resources:`, error);
        throw new Error(`Failed to fetch project resources: ${error}`);
      }

      // Step 2: Extract different resource types from project resources
      const clusterNames =
        getClusterNamesFromProjectResources(projectResources);
      const instanceNames =
        getInstanceNamesFromProjectResources(projectResources);
      const deploymentNames =
        getDeploymentNamesFromProjectResources(projectResources);
      const statefulSetNames =
        getStatefulSetNamesFromProjectResources(projectResources);
      const otherResources =
        getOtherResourceNamesFromProjectResources(projectResources);

      console.log(`🔍 Found resources in project:`);
      console.log(
        `  • Clusters: ${clusterNames.length} (${clusterNames.join(", ")})`
      );
      console.log(
        `  • Instances: ${instanceNames.length} (${instanceNames.join(", ")})`
      );
      console.log(
        `  • Deployments: ${deploymentNames.length} (${deploymentNames.join(
          ", "
        )})`
      );
      console.log(
        `  • StatefulSets: ${statefulSetNames.length} (${statefulSetNames.join(
          ", "
        )})`
      );
      console.log(
        `  • Other resources: ${Object.keys(otherResources).length} types`
      );

      // Step 3: Execute deletions in parallel
      const deletionPromises: Promise<any>[] = [];

      // Delete instances using useDeleteInstanceRelatedMutation
      for (const instanceName of instanceNames) {
        deletionPromises.push(
          deleteInstanceMutation.mutateAsync({
            instanceName,
          })
        );
      }

      // Delete clusters using useDeleteClusterRelatedMutation
      for (const clusterName of clusterNames) {
        deletionPromises.push(
          deleteClusterMutation.mutateAsync({
            instanceName: clusterName,
          })
        );
      }

      // Delete deployments directly
      for (const deploymentName of deploymentNames) {
        deletionPromises.push(
          deleteResourceMutation.mutateAsync({
            resource: {
              type: "deployment",
              namespace: context.namespace,
              name: deploymentName,
            },
          })
        );
      }

      // Delete statefulsets directly
      for (const statefulSetName of statefulSetNames) {
        deletionPromises.push(
          deleteResourceMutation.mutateAsync({
            resource: {
              type: "statefulset",
              namespace: context.namespace,
              name: statefulSetName,
            },
          })
        );
      }

      // Delete other resources directly
      for (const [resourceType, resourceNames] of Object.entries(
        otherResources
      )) {
        for (const resourceName of resourceNames) {
          const resourceConfig =
            RESOURCES[resourceType as keyof typeof RESOURCES];
          if (resourceConfig) {
            if (resourceConfig.type === "custom") {
              deletionPromises.push(
                deleteResourceMutation.mutateAsync({
                  resource: {
                    type: "custom",
                    namespace: context.namespace,
                    group: resourceConfig.group,
                    version: resourceConfig.version,
                    plural: resourceConfig.plural,
                    name: resourceName,
                  },
                })
              );
            } else {
              // Only delete resources that are supported by the ResourceTarget schema
              const supportedBuiltinTypes = [
                "deployment",
                "service",
                "ingress",
                "statefulset",
                "daemonset",
                "configmap",
                "secret",
                "pod",
                "pvc",
                "horizontalpodautoscaler",
                "role",
                "rolebinding",
                "serviceaccount",
                "job",
                "cronjob",
              ] as const;

              if (
                supportedBuiltinTypes.includes(
                  resourceConfig.resourceType as any
                )
              ) {
                deletionPromises.push(
                  deleteResourceMutation.mutateAsync({
                    resource: {
                      type: resourceConfig.resourceType as (typeof supportedBuiltinTypes)[number],
                      namespace: context.namespace,
                      name: resourceName,
                    },
                  })
                );
              } else {
                console.log(
                  `⚠️ Skipping unsupported resource type: ${resourceConfig.resourceType} (${resourceName})`
                );
              }
            }
          }
        }
      }

      const results = await Promise.allSettled(deletionPromises);

      // Check for errors (ignore 404s as resources might not exist)
      const errors = results.filter((result) => {
        if (result.status !== "rejected") return false;

        const error = result.reason;
        // Check various ways 404 errors can be represented
        const is404 =
          error?.code === 404 ||
          error?.response?.status === 404 ||
          error?.message?.includes("404") ||
          error?.message?.includes("not found") ||
          (error?.body &&
            typeof error.body === "string" &&
            error.body.includes('"code":404'));

        return !is404;
      });

      if (errors.length > 0) {
        const errorMessages = errors
          .map((error) =>
            error.status === "rejected"
              ? error.reason?.message
              : "Unknown error"
          )
          .join(", ");
        console.error(
          `❌ Failed to delete project resources: ${errorMessages}`
        );
        throw new Error(`Failed to delete project resources: ${errorMessages}`);
      }

      // Count deleted resources
      let totalDeleted = 0;
      const deletionSummary: Record<string, number> = {};

      // Count instance-related deletions
      const instanceResults = results.slice(0, instanceNames.length);
      instanceResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
          const instanceData = result.value;
          const instanceName = instanceNames[index];
          console.log(
            `📊 Instance-related resources deletion results for "${instanceName}":`
          );

          // Count dependent resources (Phase 1)
          const dependentResourceTypes = [
            "services (by label)",
            "configmap",
            "secret",
            "ingresses (by label)",
            "cert-manager issuers (by label)",
            "cert-manager certificates (by label)",
            "pvcs (by label)",
            "horizontalpodautoscaler",
            "job",
            "cronjob",
            "app custom resource",
          ];

          instanceData.dependentResults.forEach(
            (result: any, depIndex: number) => {
              const resourceType = dependentResourceTypes[depIndex];
              if (result.status === "fulfilled") {
                const value = result.value;
                let count = 0;

                if (value && typeof value === "object") {
                  if (value.deletedCount !== undefined) {
                    count = value.deletedCount;
                  } else if (value.metadata || value.kind) {
                    count = 1;
                  }
                }

                if (count > 0) {
                  const key = `${resourceType} (${instanceName})`;
                  deletionSummary[key] = count;
                  totalDeleted += count;
                  console.log(`  ✅ ${resourceType}: ${count} deleted`);
                }
              } else if (result.status === "rejected") {
                const error = result.reason;
                const is404 =
                  error?.code === 404 ||
                  error?.response?.status === 404 ||
                  error?.message?.includes("404") ||
                  error?.message?.includes("not found") ||
                  (error?.body &&
                    typeof error.body === "string" &&
                    error.body.includes('"code":404'));

                if (!is404) {
                  console.log(`  ⚠️ ${resourceType}: failed to delete`);
                }
              }
            }
          );

          // Count workload resources (Phase 2)
          const workloadResourceTypes = ["deployment", "statefulset"];
          instanceData.workloadResults.forEach(
            (result: any, workloadIndex: number) => {
              const resourceType = workloadResourceTypes[workloadIndex];
              if (result.status === "fulfilled") {
                const value = result.value;
                if (value && (value.metadata || value.kind)) {
                  const key = `${resourceType} (${instanceName})`;
                  deletionSummary[key] = 1;
                  totalDeleted += 1;
                  console.log(`  ✅ ${resourceType}: 1 deleted`);
                }
              } else if (result.status === "rejected") {
                const error = result.reason;
                const is404 =
                  error?.code === 404 ||
                  error?.response?.status === 404 ||
                  error?.message?.includes("404") ||
                  error?.message?.includes("not found") ||
                  (error?.body &&
                    typeof error.body === "string" &&
                    error.body.includes('"code":404'));

                if (!is404) {
                  console.log(`  ⚠️ ${resourceType}: failed to delete`);
                }
              }
            }
          );
        }
      });

      // Count cluster-related deletions
      const clusterResults = results.slice(
        instanceNames.length,
        instanceNames.length + clusterNames.length
      );
      clusterResults.forEach((result, index) => {
        if (result && result.status === "fulfilled") {
          const clusterData = result.value;
          const clusterName = clusterNames[index];
          console.log(
            `📊 Cluster-related resources deletion results for "${clusterName}":`
          );

          // Count backups
          if (
            clusterData.backupResults &&
            clusterData.backupResults.deletedCount
          ) {
            const count = clusterData.backupResults.deletedCount;
            const key = `kubeblocks backups (${clusterName})`;
            deletionSummary[key] = count;
            totalDeleted += count;
            console.log(`  ✅ kubeblocks backups: ${count} deleted`);
          }

          // Count export service
          if (
            clusterData.exportServiceResult &&
            clusterData.exportServiceResult.length > 0
          ) {
            const result = clusterData.exportServiceResult[0];
            if (result.status === "fulfilled") {
              const value = result.value;
              if (value && (value.metadata || value.kind)) {
                const key = `export service (${clusterName})`;
                deletionSummary[key] = 1;
                totalDeleted += 1;
                console.log(`  ✅ export service: 1 deleted`);
              }
            }
          }

          // Count RBAC resources
          const rbacResourceTypes = ["role", "rolebinding", "serviceaccount"];
          if (clusterData.rbacResults) {
            clusterData.rbacResults.forEach(
              (result: any, rbacIndex: number) => {
                const resourceType = rbacResourceTypes[rbacIndex];
                if (result.status === "fulfilled") {
                  const value = result.value;
                  if (value && (value.metadata || value.kind)) {
                    const key = `${resourceType} (${clusterName})`;
                    deletionSummary[key] = 1;
                    totalDeleted += 1;
                    console.log(`  ✅ ${resourceType}: 1 deleted`);
                  }
                } else if (result.status === "rejected") {
                  const error = result.reason;
                  const is404 =
                    error?.code === 404 ||
                    error?.response?.status === 404 ||
                    error?.message?.includes("404") ||
                    error?.message?.includes("not found") ||
                    (error?.body &&
                      typeof error.body === "string" &&
                      error.body.includes('"code":404'));

                  if (!is404) {
                    console.log(`  ⚠️ ${resourceType}: failed to delete`);
                  }
                }
              }
            );
          }

          // Count cluster
          if (clusterData.clusterResult) {
            const value = clusterData.clusterResult;
            if (value && (value.metadata || value.kind)) {
              const key = `kubeblocks cluster (${clusterName})`;
              deletionSummary[key] = 1;
              totalDeleted += 1;
              console.log(`  ✅ kubeblocks cluster: 1 deleted`);
            }
          }
        }
      });

      // Count direct resource deletions
      let resultIndex = instanceNames.length + clusterNames.length;

      console.log(
        `📊 Direct resource deletion counting starts at index ${resultIndex} of ${results.length} total results`
      );

      // Count deployments
      for (const deploymentName of deploymentNames) {
        if (resultIndex >= results.length) {
          console.log(
            `⚠️ Result index ${resultIndex} is out of bounds for deployment ${deploymentName}`
          );
          break;
        }
        const result = results[resultIndex++];
        if (result && result.status === "fulfilled") {
          const key = `deployment (${deploymentName})`;
          deletionSummary[key] = 1;
          totalDeleted += 1;
          console.log(`  ✅ deployment ${deploymentName}: 1 deleted`);
        } else if (result && result.status === "rejected") {
          const error = result.reason;
          const is404 =
            error?.code === 404 ||
            error?.response?.status === 404 ||
            error?.message?.includes("404") ||
            error?.message?.includes("not found") ||
            (error?.body &&
              typeof error.body === "string" &&
              error.body.includes('"code":404'));

          if (is404) {
            console.log(
              `  ℹ️ deployment ${deploymentName}: not found (already deleted or never existed)`
            );
          } else {
            console.log(
              `  ⚠️ deployment ${deploymentName}: failed to delete - ${
                error?.message || "Unknown error"
              }`
            );
          }
        }
      }

      // Count statefulsets
      for (const statefulSetName of statefulSetNames) {
        if (resultIndex >= results.length) {
          console.log(
            `⚠️ Result index ${resultIndex} is out of bounds for statefulset ${statefulSetName}`
          );
          break;
        }
        const result = results[resultIndex++];
        if (result && result.status === "fulfilled") {
          const key = `statefulset (${statefulSetName})`;
          deletionSummary[key] = 1;
          totalDeleted += 1;
          console.log(`  ✅ statefulset ${statefulSetName}: 1 deleted`);
        } else if (result && result.status === "rejected") {
          const error = result.reason;
          const is404 =
            error?.code === 404 ||
            error?.response?.status === 404 ||
            error?.message?.includes("404") ||
            error?.message?.includes("not found") ||
            (error?.body &&
              typeof error.body === "string" &&
              error.body.includes('"code":404'));

          if (is404) {
            console.log(
              `  ℹ️ statefulset ${statefulSetName}: not found (already deleted or never existed)`
            );
          } else {
            console.log(
              `  ⚠️ statefulset ${statefulSetName}: failed to delete - ${
                error?.message || "Unknown error"
              }`
            );
          }
        }
      }

      // Count other resources
      for (const [resourceType, resourceNames] of Object.entries(
        otherResources
      )) {
        for (const resourceName of resourceNames) {
          if (resultIndex >= results.length) {
            console.log(
              `⚠️ Result index ${resultIndex} is out of bounds for ${resourceType} ${resourceName}`
            );
            break;
          }
          const result = results[resultIndex++];
          if (result && result.status === "fulfilled") {
            const key = `${resourceType} (${resourceName})`;
            deletionSummary[key] = 1;
            totalDeleted += 1;
            console.log(`  ✅ ${resourceType} ${resourceName}: 1 deleted`);
          } else if (result && result.status === "rejected") {
            const error = result.reason;
            const is404 =
              error?.code === 404 ||
              error?.response?.status === 404 ||
              error?.message?.includes("404") ||
              error?.message?.includes("not found") ||
              (error?.body &&
                typeof error.body === "string" &&
                error.body.includes('"code":404'));

            if (is404) {
              console.log(
                `  ℹ️ ${resourceType} ${resourceName}: not found (already deleted or never existed)`
              );
            } else {
              console.log(
                `  ⚠️ ${resourceType} ${resourceName}: failed to delete - ${
                  error?.message || "Unknown error"
                }`
              );
            }
          }
        }
      }

      // Step 4: Delete the main instance resource with project name after all related resources are deleted
      console.log(`📋 Deleting main instance resource: ${projectName}`);
      try {
        const instanceConfig = RESOURCES.instance;
        const instanceDeletionResult = await runParallelAction(
          deleteCustomResource(
            context.kubeconfig,
            instanceConfig.group,
            instanceConfig.version,
            context.namespace,
            instanceConfig.plural,
            projectName
          )
        );

        if (
          instanceDeletionResult &&
          (instanceDeletionResult.metadata || instanceDeletionResult.kind)
        ) {
          deletionSummary["main instance resource"] = 1;
          totalDeleted += 1;
          console.log(`  ✅ main instance resource: 1 deleted`);
        }
      } catch (error: any) {
        // Only log non-404 errors since the instance might not exist
        const is404 =
          error?.code === 404 ||
          error?.response?.status === 404 ||
          error?.message?.includes("404") ||
          error?.message?.includes("not found") ||
          (error?.body &&
            typeof error.body === "string" &&
            error.body.includes('"code":404'));

        if (!is404) {
          console.log(
            `  ⚠️ main instance resource: failed to delete - ${error.message}`
          );
        } else {
          console.log(
            `  ℹ️ main instance resource: not found (may have been already deleted)`
          );
        }
      }

      // Final summary
      console.log(`\n📋 Deletion Summary for project "${projectName}":`);
      console.log(`🔢 Total resources deleted: ${totalDeleted}`);
      console.log(`🗄️ Instances processed: ${instanceNames.length}`);
      console.log(`🗄️ Clusters processed: ${clusterNames.length}`);
      console.log(`🗄️ Deployments processed: ${deploymentNames.length}`);
      console.log(`🗄️ StatefulSets processed: ${statefulSetNames.length}`);
      console.log(
        `🗄️ Other resource types processed: ${
          Object.keys(otherResources).length
        }`
      );

      if (Object.keys(deletionSummary).length > 0) {
        console.log("📝 Breakdown by resource type:");
        Object.entries(deletionSummary).forEach(([type, count]) => {
          console.log(`  • ${type}: ${count}`);
        });
      }

      if (totalDeleted === 0) {
        console.log(
          "ℹ️ No resources were found to delete (project may have been empty or already deleted)"
        );
      }

      return {
        success: true,
        projectName,
        instanceNames,
        clusterNames,
        deploymentNames,
        statefulSetNames,
        otherResources,
        mainInstanceResourceDeleted:
          !!deletionSummary["main instance resource"],
        totalDeleted,
        deletionSummary,
      };
    },
    onSuccess: (data) => {
      // Log final success message
      console.log(
        `✅ Successfully deleted project "${data.projectName}" with ${data.totalDeleted} resources`
      );

      // Invalidate project-related queries
      queryClient.invalidateQueries({
        queryKey: ["project", "list", context.namespace],
      });
      queryClient.invalidateQueries({
        queryKey: ["project", "get", context.namespace],
      });
      queryClient.invalidateQueries({
        queryKey: ["project", "resources", context.namespace, data.projectName],
      });

      // Invalidate cluster-related queries
      queryClient.invalidateQueries({
        queryKey: ["cluster", "list", context.namespace],
      });
      queryClient.invalidateQueries({
        queryKey: ["cluster", "get", context.namespace],
      });
    },
    onError: (error, variables) => {
      console.error(
        `❌ Failed to delete project "${variables.projectName}":`,
        error
      );
    },
  });
}
