// "use client";

// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { runParallelAction } from "next-server-actions-parallel";
// import { toast } from "sonner";
// import {
//   deleteCustomResource,
//   listBuiltinResources,
//   listCustomResources,
// } from "@/lib/k8s/k8s-api";
// import { RESOURCES } from "@/lib/k8s/k8s-constant";
// import {
//   useBatchPatchResourcesMetadataMutation,
//   useBatchRemoveResourcesMetadataMutation,
//   useCreateInstanceMutation,
//   useDeleteClusterRelatedMutation,
//   useDeleteInstanceRelatedMutation,
//   useDeleteResourceMutation,
// } from "@/lib/k8s/k8s-mutation";
// import { filterEmptyResources } from "@/lib/k8s/k8s-utils";
// import type {
//   AnyKubernetesResource,
//   K8sApiContext,
//   ResourceTarget,
// } from "@/lib/k8s/schemas";
// import { PROJECT_NAME_LABEL_KEY } from "./project-constant";
// import {
//   generateNewProjectName,
//   generateProjectYaml,
//   getClusterNamesFromProjectResources,
//   getDeploymentNamesFromProjectResources,
//   getInstanceNamesFromProjectResources,
//   getOtherResourceNamesFromProjectResources,
//   getStatefulSetNamesFromProjectResources,
// } from "./project-utils";

// /**
//  * Hook to add project name label to multiple resources
//  */
// export function useAddProjectLabelToResourcesMutation(context: K8sApiContext) {
//   const queryClient = useQueryClient();
//   const batchPatchMutation = useBatchPatchResourcesMetadataMutation(context);

//   return useMutation({
//     mutationFn: ({
//       resources,
//       projectName,
//     }: {
//       resources: ResourceTarget[];
//       projectName: string;
//     }) => {
//       return batchPatchMutation.mutateAsync({
//         resources,
//         metadataType: "labels",
//         key: PROJECT_NAME_LABEL_KEY,
//         value: projectName,
//       });
//     },
//     onSuccess: () => {
//       toast.success("Project name label added to resources");
//       // Invalidate project-related queries
//       queryClient.invalidateQueries({
//         queryKey: ["project"],
//       });
//     },
//   });
// }

// /**
//  * Hook to remove project name label from multiple resources
//  */
// export function useRemoveProjectLabelFromResourcesMutation(
//   context: K8sApiContext
// ) {
//   const queryClient = useQueryClient();
//   const batchRemoveMutation = useBatchRemoveResourcesMetadataMutation(context);

//   return useMutation({
//     mutationFn: ({ resources }: { resources: ResourceTarget[] }) => {
//       return batchRemoveMutation.mutateAsync({
//         resources,
//         metadataType: "labels",
//         key: PROJECT_NAME_LABEL_KEY,
//       });
//     },
//     onSuccess: () => {
//       // Invalidate project-related queries
//       queryClient.invalidateQueries({
//         queryKey: ["project", "list", context.namespace],
//       });
//       queryClient.invalidateQueries({
//         queryKey: ["project", "get", context.namespace],
//       });
//     },
//   });
// }

// /**
//  * Hook to delete a project and all its associated resources
//  *
//  * This mutation performs comprehensive cleanup of all resources associated with a project.
//  * It dynamically discovers project resources and uses appropriate deletion strategies for each type:
//  *
//  * ## PROJECT DELETION WORKFLOW:
//  *
//  * ### Step 1: Resource Discovery
//  * 1. **Fetch Project Resources** - Uses label selector: `${PROJECT_NAME_LABEL_KEY}=${projectName}`
//  * 2. **Extract Resource Names by Type** - Categorizes resources into different types
//  * 3. **Prepare Deletion Plan** - Creates deletion tasks for each resource type
//  *
//  * ### Step 2: Parallel Deletion Execution
//  *
//  * ## DELETION STRATEGIES BY RESOURCE TYPE:
//  *
//  * ### A. INSTANCE RESOURCES (Uses useDeleteInstanceRelatedMutation):
//  * For each instance found in project resources, deletes related resources in phases:
//  * **NOTE**: This deletes all resources RELATED to the instance, but NOT the instance resource itself.
//  *
//  * **Phase 1 - Dependent Resources (parallel):**
//  * - Services (by label selector: `cloud.sealos.io/app-deploy-manager=${instanceName}`)
//  * - ConfigMap (by name: `${instanceName}`)
//  * - Secret (by name: `${instanceName}`)
//  * - Ingresses (by label selector: `cloud.sealos.io/app-deploy-manager=${instanceName}`)
//  * - Cert-Manager Issuers (by label selector: `cloud.sealos.io/app-deploy-manager=${instanceName}`)
//  * - Cert-Manager Certificates (by label selector: `cloud.sealos.io/app-deploy-manager=${instanceName}`)
//  * - PVCs (by label selector: `app=${instanceName}`)
//  * - HorizontalPodAutoscaler (by name: `${instanceName}`)
//  * - Job (by name: `${instanceName}`)
//  * - CronJob (by name: `${instanceName}`)
//  * - App Custom Resource (by name: `${instanceName}`)
//  *
//  * **Phase 2 - Main Workloads (parallel):**
//  * - Deployment (by name: `${instanceName}`)
//  * - StatefulSet (by name: `${instanceName}`)
//  *
//  * ### B. CLUSTER RESOURCES (Uses useDeleteClusterRelatedMutation):
//  * For each cluster found in project resources, deletes related resources in phases:
//  *
//  * **Phase 1 - Database Backups:**
//  * - KubeBlocks Backups (by label selector: `app.kubernetes.io/instance=${clusterName}`)
//  *
//  * **Phase 2 - Export Service:**
//  * - Export Service (by name: `${clusterName}-export`)
//  *
//  * **Phase 3 - RBAC Resources (parallel):**
//  * - Role (by name: `${clusterName}`)
//  * - RoleBinding (by name: `${clusterName}`)
//  * - ServiceAccount (by name: `${clusterName}`)
//  *
//  * **Phase 4 - Database Cluster:**
//  * - KubeBlocks Cluster (by name: `${clusterName}`)
//  *
//  * ### C. DIRECT RESOURCE DELETION (Uses useDeleteResourceMutation):
//  * For individual resources found in project resources:
//  *
//  * **Deployments:** Each deployment deleted by its actual name
//  * **StatefulSets:** Each statefulset deleted by its actual name
//  * **Other Resources:** Each resource deleted by its actual name and type
//  * - Supports: services, configmaps, secrets, ingresses, pods, pvcs, etc.
//  * - Custom resources: devboxes, apps, objectstoragebuckets, etc.
//  *
//  * ### D. FINAL INSTANCE CLEANUP (Direct deletion after all other resources):
//  * **Main Instance Resource:** The instance resource with the project name is deleted last
//  * - API: `app.sealos.io/v1/instances`
//  * - Name: `${projectName}`
//  * - **Purpose**: Ensures the main project instance is removed after all related resources are gone
//  *
//  * ## EXECUTION ORDER:
//  * 1. **Resource Discovery**: Fetch all project resources and categorize by type
//  * 2. **Parallel Deletion**: All deletion strategies run in parallel
//  *    - Instance deletions (for each instance found)
//  *    - Cluster deletions (for each cluster found)
//  *    - Direct resource deletions (for each individual resource found)
//  * 3. **Final Cleanup**: Delete the main instance resource with project name
//  *    - This happens AFTER all related resources are deleted
//  *    - Uses the project name as the instance resource name
//  * 4. **Error Handling**: Ignores 404 errors (resource not found) but fails on other errors
//  *
//  * ## EXPECTED RESULTS:
//  * - **Success**: All project resources are cleaned up comprehensively
//  * - **Partial Success**: Some resources may not exist (404s are ignored)
//  * - **Failure**: Non-404 errors will cause the entire operation to fail
//  * - **Query Invalidation**: All relevant React Query caches are invalidated on success
//  *
//  * ## RESOURCE DISCOVERY STRATEGIES:
//  * - **Project Label**: Uses `${PROJECT_NAME_LABEL_KEY}=${projectName}` to find all project resources
//  * - **Dynamic Detection**: Extracts actual resource names from project resources (no assumptions)
//  * - **Type-Specific Handling**: Uses appropriate deletion strategy for each resource type
//  * - **Comprehensive Coverage**: Handles instances, clusters, and individual resources
//  *
//  * @param context - K8s API context containing namespace and kubeconfig
//  * @returns Mutation hook that accepts { projectName: string } and returns deletion results
//  */
// export function useDeleteProjectResourcesMutation(context: K8sApiContext) {
//   const queryClient = useQueryClient();
//   const deleteInstanceMutation = useDeleteInstanceRelatedMutation(context);
//   const deleteClusterMutation = useDeleteClusterRelatedMutation(context);
//   const deleteResourceMutation = useDeleteResourceMutation(context);

//   return useMutation({
//     mutationFn: async ({ projectName }: { projectName: string }) => {
//       // Step 1: Fetch project resources to identify all resources
//       const labelSelector = `${PROJECT_NAME_LABEL_KEY}=${projectName}`;

//       let projectResources: Record<string, { items: AnyKubernetesResource[] }>;
//       try {
//         // Fetch all resources directly using the API functions
//         const resourcePromises = Object.entries(RESOURCES).map(
//           ([_, config]) => {
//             if (config.type === "custom") {
//               return runParallelAction(
//                 listCustomResources(
//                   context.kubeconfig,
//                   config.group,
//                   config.version,
//                   context.namespace,
//                   config.plural,
//                   labelSelector
//                 )
//               );
//             }
//             // All resources are now either custom or builtin
//             return runParallelAction(
//               listBuiltinResources(
//                 context.kubeconfig,
//                 context.namespace,
//                 config.resourceType,
//                 labelSelector
//               )
//             );
//           }
//         );

//         const results = await Promise.all(resourcePromises);
//         const rawResources = Object.fromEntries(
//           Object.keys(RESOURCES).map((name, i) => [name, results[i]])
//         );

//         projectResources = filterEmptyResources(
//           rawResources as Record<string, { items: AnyKubernetesResource[] }>
//         );
//       } catch (error) {
//         throw new Error(`Failed to fetch project resources: ${error}`);
//       }

//       // Step 2: Extract different resource types from project resources
//       const clusterNames =
//         getClusterNamesFromProjectResources(projectResources);
//       const instanceNames =
//         getInstanceNamesFromProjectResources(projectResources);
//       const deploymentNames =
//         getDeploymentNamesFromProjectResources(projectResources);
//       const statefulSetNames =
//         getStatefulSetNamesFromProjectResources(projectResources);
//       const otherResources =
//         getOtherResourceNamesFromProjectResources(projectResources);

//       // Step 3: Execute deletions in parallel
//       const deletionPromises: Promise<any>[] = [];

//       // Delete instances using useDeleteInstanceRelatedMutation
//       for (const instanceName of instanceNames) {
//         deletionPromises.push(
//           deleteInstanceMutation.mutateAsync({
//             instanceName,
//           })
//         );
//       }

//       // Delete clusters using useDeleteClusterRelatedMutation
//       for (const clusterName of clusterNames) {
//         deletionPromises.push(
//           deleteClusterMutation.mutateAsync({
//             instanceName: clusterName,
//           })
//         );
//       }

//       // Delete deployments directly
//       for (const deploymentName of deploymentNames) {
//         deletionPromises.push(
//           deleteResourceMutation.mutateAsync({
//             resource: {
//               type: "deployment",
//               namespace: context.namespace,
//               name: deploymentName,
//             },
//           })
//         );
//       }

//       // Delete statefulsets directly
//       for (const statefulSetName of statefulSetNames) {
//         deletionPromises.push(
//           deleteResourceMutation.mutateAsync({
//             resource: {
//               type: "statefulset",
//               namespace: context.namespace,
//               name: statefulSetName,
//             },
//           })
//         );
//       }

//       // Delete other resources directly
//       for (const [resourceType, resourceNames] of Object.entries(
//         otherResources
//       )) {
//         for (const resourceName of resourceNames) {
//           const resourceConfig =
//             RESOURCES[resourceType as keyof typeof RESOURCES];
//           if (resourceConfig) {
//             if (resourceConfig.type === "custom") {
//               deletionPromises.push(
//                 deleteResourceMutation.mutateAsync({
//                   resource: {
//                     type: "custom",
//                     namespace: context.namespace,
//                     group: resourceConfig.group,
//                     version: resourceConfig.version,
//                     plural: resourceConfig.plural,
//                     name: resourceName,
//                   },
//                 })
//               );
//             } else {
//               // Only delete resources that are supported by the ResourceTarget schema
//               const supportedBuiltinTypes = [
//                 "deployment",
//                 "service",
//                 "ingress",
//                 "statefulset",
//                 "daemonset",
//                 "configmap",
//                 "secret",
//                 "pod",
//                 "pvc",
//                 "horizontalpodautoscaler",
//                 "role",
//                 "rolebinding",
//                 "serviceaccount",
//                 "job",
//                 "cronjob",
//               ] as const;

//               if (
//                 supportedBuiltinTypes.includes(
//                   resourceConfig.resourceType as (typeof supportedBuiltinTypes)[number]
//                 )
//               ) {
//                 deletionPromises.push(
//                   deleteResourceMutation.mutateAsync({
//                     resource: {
//                       type: resourceConfig.resourceType as (typeof supportedBuiltinTypes)[number],
//                       namespace: context.namespace,
//                       name: resourceName,
//                     },
//                   })
//                 );
//               }
//             }
//           }
//         }
//       }

//       const results = await Promise.allSettled(deletionPromises);

//       // Count deleted resources
//       let totalDeleted = 0;
//       const deletionSummary: Record<string, number> = {};

//       // Count instance-related deletions
//       const instanceResults = results.slice(0, instanceNames.length);
//       instanceResults.forEach((result, index) => {
//         if (result.status === "fulfilled") {
//           const instanceData = result.value;
//           const instanceName = instanceNames[index];

//           // Count dependent resources (Phase 1)
//           const dependentResourceTypes = [
//             "services (by label)",
//             "configmap",
//             "secret",
//             "ingresses (by label)",
//             "cert-manager issuers (by label)",
//             "cert-manager certificates (by label)",
//             "pvcs (by label)",
//             "horizontalpodautoscaler",
//             "job",
//             "cronjob",
//             "app custom resource",
//           ];

//           instanceData.dependentResults.forEach(
//             (depResult: unknown, depIndex: number) => {
//               const resourceType = dependentResourceTypes[depIndex];
//               const resultObj = depResult as {
//                 status: string;
//                 value?: unknown;
//               };
//               if (resultObj.status === "fulfilled") {
//                 const value = resultObj.value;
//                 let count = 0;

//                 if (value && typeof value === "object") {
//                   if (value.deletedCount !== undefined) {
//                     count = value.deletedCount;
//                   } else if (value.metadata || value.kind) {
//                     count = 1;
//                   }
//                 }

//                 if (count > 0) {
//                   const key = `${resourceType} (${instanceName})`;
//                   deletionSummary[key] = count;
//                   totalDeleted += count;
//                 }
//               }
//             }
//           );

//           // Count workload resources (Phase 2)
//           const workloadResourceTypes = ["deployment", "statefulset"];
//           instanceData.workloadResults.forEach(
//             (workloadResult: unknown, workloadIndex: number) => {
//               const resourceType = workloadResourceTypes[workloadIndex];
//               const resultObj = workloadResult as {
//                 status: string;
//                 value?: unknown;
//               };
//               if (resultObj.status === "fulfilled") {
//                 const value = resultObj.value;
//                 if (value && (value.metadata || value.kind)) {
//                   const key = `${resourceType} (${instanceName})`;
//                   deletionSummary[key] = 1;
//                   totalDeleted += 1;
//                 }
//               }
//             }
//           );
//         }
//       });

//       // Count cluster-related deletions
//       const clusterResults = results.slice(
//         instanceNames.length,
//         instanceNames.length + clusterNames.length
//       );
//       clusterResults.forEach((result, index) => {
//         if (result && result.status === "fulfilled") {
//           const clusterData = result.value;
//           const clusterName = clusterNames[index];

//           // Count backups
//           if (
//             clusterData.backupResults &&
//             clusterData.backupResults.deletedCount
//           ) {
//             const count = clusterData.backupResults.deletedCount;
//             const key = `kubeblocks backups (${clusterName})`;
//             deletionSummary[key] = count;
//             totalDeleted += count;
//           }

//           // Count export service
//           if (
//             clusterData.exportServiceResult &&
//             clusterData.exportServiceResult.length > 0
//           ) {
//             const result = clusterData.exportServiceResult[0];
//             if (result.status === "fulfilled") {
//               const value = result.value;
//               if (value && (value.metadata || value.kind)) {
//                 const key = `export service (${clusterName})`;
//                 deletionSummary[key] = 1;
//                 totalDeleted += 1;
//               }
//             }
//           }

//           // Count RBAC resources
//           const rbacResourceTypes = ["role", "rolebinding", "serviceaccount"];
//           if (clusterData.rbacResults) {
//             clusterData.rbacResults.forEach(
//               (result: any, rbacIndex: number) => {
//                 const resourceType = rbacResourceTypes[rbacIndex];
//                 if (result.status === "fulfilled") {
//                   const value = result.value;
//                   if (value && (value.metadata || value.kind)) {
//                     const key = `${resourceType} (${clusterName})`;
//                     deletionSummary[key] = 1;
//                     totalDeleted += 1;
//                   }
//                 }
//               }
//             );
//           }

//           // Count cluster
//           if (clusterData.clusterResult) {
//             const value = clusterData.clusterResult;
//             if (value && (value.metadata || value.kind)) {
//               const key = `kubeblocks cluster (${clusterName})`;
//               deletionSummary[key] = 1;
//               totalDeleted += 1;
//             }
//           }
//         }
//       });

//       // Count direct resource deletions
//       let resultIndex = instanceNames.length + clusterNames.length;

//       // Count deployments
//       for (const deploymentName of deploymentNames) {
//         if (resultIndex >= results.length) {
//           break;
//         }
//         const result = results[resultIndex++];
//         if (result && result.status === "fulfilled") {
//           const key = `deployment (${deploymentName})`;
//           deletionSummary[key] = 1;
//           totalDeleted += 1;
//         }
//       }

//       // Count statefulsets
//       for (const statefulSetName of statefulSetNames) {
//         if (resultIndex >= results.length) {
//           break;
//         }
//         const result = results[resultIndex++];
//         if (result && result.status === "fulfilled") {
//           const key = `statefulset (${statefulSetName})`;
//           deletionSummary[key] = 1;
//           totalDeleted += 1;
//         }
//       }

//       // Count other resources
//       for (const [resourceType, resourceNames] of Object.entries(
//         otherResources
//       )) {
//         for (const resourceName of resourceNames) {
//           if (resultIndex >= results.length) {
//             break;
//           }
//           const result = results[resultIndex++];
//           if (result && result.status === "fulfilled") {
//             const key = `${resourceType} (${resourceName})`;
//             deletionSummary[key] = 1;
//             totalDeleted += 1;
//           }
//         }
//       }

//       // Step 4: Delete the main instance resource with project name after all related resources are deleted
//       try {
//         const instanceConfig = RESOURCES.instance;
//         const instanceDeletionResult = await runParallelAction(
//           deleteCustomResource(
//             context.kubeconfig,
//             instanceConfig.group,
//             instanceConfig.version,
//             context.namespace,
//             instanceConfig.plural,
//             projectName
//           )
//         );

//         if (
//           instanceDeletionResult &&
//           (instanceDeletionResult.metadata || instanceDeletionResult.kind)
//         ) {
//           deletionSummary["main instance resource"] = 1;
//           totalDeleted += 1;
//         }
//       } catch {
//         // The API function now handles 404 errors silently, so we don't need to check for 404s here
//         // Any error that reaches here is a real error that should be logged or handled
//         // Failed to delete main instance resource - API function handles 404s silently
//       }

//       // Final summary
//       if (totalDeleted === 0) {
//         return {
//           success: true,
//           projectName,
//           instanceNames,
//           clusterNames,
//           deploymentNames,
//           statefulSetNames,
//           otherResources,
//           mainInstanceResourceDeleted:
//             !!deletionSummary["main instance resource"],
//           totalDeleted,
//           deletionSummary,
//         };
//       }

//       return {
//         success: true,
//         projectName,
//         instanceNames,
//         clusterNames,
//         deploymentNames,
//         statefulSetNames,
//         otherResources,
//         mainInstanceResourceDeleted:
//           !!deletionSummary["main instance resource"],
//         totalDeleted,
//         deletionSummary,
//       };
//     },
//     onSuccess: (data) => {
//       // Invalidate project-related queries
//       queryClient.invalidateQueries({
//         queryKey: ["project", "list", context.namespace],
//       });
//       queryClient.invalidateQueries({
//         queryKey: ["project", "get", context.namespace],
//       });
//       queryClient.invalidateQueries({
//         queryKey: ["project", "resources", context.namespace, data.projectName],
//       });

//       // Invalidate cluster-related queries
//       queryClient.invalidateQueries({
//         queryKey: ["cluster", "list", context.namespace],
//       });
//       queryClient.invalidateQueries({
//         queryKey: ["cluster", "get", context.namespace],
//       });
//     },
//     onError: (error, variables) => {
//       //
//     },
//   });
// }

// /**
//  * Hook to create a new project instance
//  */
// export function useCreateProjectMutation(context: K8sApiContext) {
//   const createInstanceMutation = useCreateInstanceMutation(context);

//   return useMutation({
//     mutationFn: async ({ projectName }: { projectName?: string }) => {
//       const finalProjectName = projectName || generateNewProjectName();
//       const projectYaml = generateProjectYaml(
//         finalProjectName,
//         context.namespace
//       );

//       return createInstanceMutation.mutateAsync({ yamlContent: projectYaml });
//     },
//     onSuccess: (data) => {
//       // The useCreateInstanceMutation already handles query invalidation
//       return data;
//     },
//     onError: (error) => {
//       throw error;
//     },
//   });
// }
