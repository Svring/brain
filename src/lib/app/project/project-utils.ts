// "use client";

// import _ from "lodash";
// import { customAlphabet } from "nanoid";

// // Re-export the refined algorithm from the env-reliance module to keep the
// // original public surface untouched for now. Consumers can gradually migrate
// // to the new import path but don't have to do so immediately.
// export { processProjectConnections } from "@/lib/algorithm/reliance/env-reliance";

// import { PROJECT_NAME_LABEL_KEY } from "./project-constant";
// import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";

// // Helper function to extract project name from resource metadata
// export const getProjectNameFromResource = (
//   resource: K8sResource
// ): string | null => {
//   return resource.metadata.labels?.[PROJECT_NAME_LABEL_KEY] ?? null;
// };

// /**
//  * Extract cluster names from project resources.
//  *
//  * @param resources Record of resource lists keyed by resource kind (from getProjectResourcesOptions)
//  * @returns Array of cluster names that belong to the project
//  */
// export const getClusterNamesFromProjectResources = (
//   resources: Record<string, { items: K8sResource[] }>
// ): string[] => {
//   const clusterResources = resources.cluster?.items || [];
//   return _.filter(
//     _.map(clusterResources, (cluster) => cluster.metadata.name),
//     (name): name is string => Boolean(name)
//   );
// };

// /**
//  * Extract instance names from project resources.
//  *
//  * @param resources Record of resource lists keyed by resource kind (from getProjectResourcesOptions)
//  * @returns Array of instance names that belong to the project
//  */
// export const getInstanceNamesFromProjectResources = (
//   resources: Record<string, { items: K8sResource[] }>
// ): string[] => {
//   const instanceResources = resources.instance?.items || [];
//   return _.filter(
//     _.map(instanceResources, (instance) => instance.metadata.name),
//     (name): name is string => Boolean(name)
//   );
// };

// /**
//  * Extract deployment names from project resources.
//  *
//  * @param resources Record of resource lists keyed by resource kind (from getProjectResourcesOptions)
//  * @returns Array of deployment names that belong to the project
//  */
// export const getDeploymentNamesFromProjectResources = (
//   resources: Record<string, { items: K8sResource[] }>
// ): string[] => {
//   const deploymentResources = resources.deployment?.items || [];
//   return _.filter(
//     _.map(deploymentResources, (deployment) => deployment.metadata.name),
//     (name): name is string => Boolean(name)
//   );
// };

// /**
//  * Extract statefulset names from project resources.
//  *
//  * @param resources Record of resource lists keyed by resource kind (from getProjectResourcesOptions)
//  * @returns Array of statefulset names that belong to the project
//  */
// export const getStatefulSetNamesFromProjectResources = (
//   resources: Record<string, { items: K8sResource[] }>
// ): string[] => {
//   const statefulSetResources = resources.statefulset?.items || [];
//   return _.filter(
//     _.map(statefulSetResources, (statefulSet) => statefulSet.metadata.name),
//     (name): name is string => Boolean(name)
//   );
// };

// /**
//  * Extract other resource names from project resources (excluding clusters, instances, deployments, and statefulsets).
//  *
//  * @param resources Record of resource lists keyed by resource kind (from getProjectResourcesOptions)
//  * @returns Record of resource type to array of resource names
//  */
// export const getOtherResourceNamesFromProjectResources = (
//   resources: Record<string, { items: K8sResource[] }>
// ): Record<string, string[]> => {
//   const excludedTypes = new Set([
//     "cluster",
//     "instance",
//     "deployment",
//     "statefulset",
//   ]);
//   return _.transform(
//     resources,
//     (result, resourceList, resourceType) => {
//       if (!excludedTypes.has(resourceType) && resourceList.items.length > 0) {
//         result[resourceType] = _.filter(
//           _.map(resourceList.items, (resource) => resource.metadata.name),
//           (name): name is string => Boolean(name)
//         );
//       }
//     },
//     {} as Record<string, string[]>
//   );
// };

// // Removed local implementation of `processProjectConnections` which has been
// // migrated to `@/lib/algorithm/reliance/env-reliance` for better cohesion.

// /**
//  * Generate a new project name in the format 'project-nanoid(7)'.
//  * @returns {string} The generated project name.
//  */
// export const generateNewProjectName = (): string => {
//   const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 7);
//   return `project-${nanoid()}`;
// };

// /**
//  * Generate YAML content for creating a new project instance.
//  * @param projectName - The name of the project
//  * @param namespace - The namespace where the project will be created
//  * @returns {string} The YAML content for the project instance
//  */
// export const generateProjectYaml = (
//   projectName: string,
//   namespace: string
// ): string => {
//   return `apiVersion: app.sealos.io/v1
// kind: Instance
// metadata:
//   name: ${projectName}
//   namespace: ${namespace}
// spec:
//   templateType: inline
//   defaults:
//     app_name:
//       type: string
//       value: ${projectName}
//   title: ${projectName}`;
// };
