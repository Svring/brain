import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import { listAllResources } from "@/lib/k8s/k8s-method/k8s-query";
import { ListAllResourcesResponseSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/res-list-schemas";
import { CUSTOM_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-custom-resource";
import { BUILTIN_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-builtin-resource";
import _ from "lodash";

/**
 * Flattens the result from listAllResources into a single array of K8sResource
 */
export function flattenResourcesResult(
  resources: Awaited<ReturnType<typeof listAllResources>>
): K8sResource[] {
  const allItems: K8sResource[] = [];
  
  if (resources) {
    _.forEach(resources.builtin, (resourceList) => {
      if (resourceList && resourceList.items) {
        allItems.push(...resourceList.items);
      }
    });
    _.forEach(resources.custom, (resourceList) => {
      if (resourceList && resourceList.items) {
        allItems.push(...resourceList.items);
      }
    });
  }
  
  return allItems;
}

/**
 * Generic function to get related resources by label selector
 */
export async function getRelatedResourcesByLabel(
  context: K8sApiContext,
  labelKey: string,
  labelValue: string,
  builtinResourceTypes: string[] = [],
  customResourceTypes: string[] = []
): Promise<K8sResource[]> {
  const labelSelector = `${labelKey}=${labelValue}`;
  
  const resources = await listAllResources(
    context,
    labelSelector,
    builtinResourceTypes,
    customResourceTypes
  );
  
  return flattenResourcesResult(resources);
}

/**
 * Deduplicates resources by kind and name
 */
export function deduplicateResources(resources: K8sResource[]): K8sResource[] {
  return _.uniqWith(
    resources,
    (a, b) => a.kind === b.kind && a.metadata.name === b.metadata.name
  );
}

/**
 * Categorizes resources into builtin and custom types
 */
export function categorizeResources(resources: K8sResource[]) {
  const builtinKinds = new Set(
    Object.values(BUILTIN_RESOURCES).map((config) => config.kind)
  );

  return _.groupBy(resources, (resource) =>
    builtinKinds.has(resource.kind) ? "builtin" : "custom"
  );
}

/**
 * Groups builtin resources by their resource type
 */
export function groupBuiltinResourcesByType(resources: K8sResource[]) {
  return _.groupBy(resources, (resource) => {
    const config = Object.values(BUILTIN_RESOURCES).find(
      (c) => c.kind === resource.kind
    );
    return config ? config.resourceType : "unknown";
  });
}

/**
 * Groups custom resources by their resource type
 */
export function groupCustomResourcesByType(resources: K8sResource[]) {
  return _.groupBy(resources, (resource) => {
    const config = Object.values(CUSTOM_RESOURCES).find(
      (c) => c.resourceType.toLowerCase() === resource.kind.toLowerCase()
    );
    return config ? config.resourceType : "unknown";
  });
}

/**
 * Creates a structured result object for ListAllResourcesResponse
 */
export function createStructuredResourceResult(
  builtinByType: Record<string, K8sResource[]>,
  customByType: Record<string, K8sResource[]>
) {
  return {
    builtin: _.mapValues(BUILTIN_RESOURCES, (config) => ({
      apiVersion: config.apiVersion,
      kind: `${config.kind}List`,
      items: builtinByType[config.resourceType] || [],
    })),
    custom: _.mapValues(CUSTOM_RESOURCES, (config) => ({
      apiVersion: `${config.group}/${config.version}`,
      kind: `${_.upperFirst(config.resourceType)}List`,
      items: customByType[config.resourceType] || [],
    })),
  };
}

/**
 * Creates an empty structured result for when no resources are found
 */
export function createEmptyResourceResult() {
  return {
    builtin: _.mapValues(BUILTIN_RESOURCES, (config) => ({
      apiVersion: config.apiVersion,
      kind: `${config.kind}List`,
      items: [],
    })),
    custom: _.mapValues(CUSTOM_RESOURCES, (config) => ({
      apiVersion: `${config.group}/${config.version}`,
      kind: `${_.upperFirst(config.resourceType)}List`,
      metadata: {},
      items: [],
    })),
  };
}

/**
 * Processes a list of resources into a structured ListAllResourcesResponse format
 */
export function processResourcesIntoStructuredResult(
  resources: K8sResource[]
): ReturnType<typeof ListAllResourcesResponseSchema.parse> {
  const uniqueResources = deduplicateResources(resources);
  const categorizedResources = categorizeResources(uniqueResources);
  
  const builtinByType = groupBuiltinResourcesByType(categorizedResources.builtin || []);
  const customByType = groupCustomResourcesByType(categorizedResources.custom || []);
  
  const result = createStructuredResourceResult(builtinByType, customByType);
  
  return ListAllResourcesResponseSchema.parse(result);
}

/**
 * Processes multiple resource arrays from sub-modules and combines them
 */
export async function processSubModuleResources(
  context: K8sApiContext,
  instanceRelatedResources: K8sResource[],
  enabledSubModules: string[],
  subModuleHandlers: Record<string, {
    kind: string;
    handler: (context: K8sApiContext, name: string) => Promise<K8sResource[]>;
  }>
): Promise<K8sResource[]> {
  const subModuleResources = await Promise.all(
    enabledSubModules.map(async (module) => {
      const config = subModuleHandlers[module];
      if (!config) return [];

      const resourceNames = instanceRelatedResources
        .filter((resource) => resource.kind === config.kind)
        .map((resource) => resource.metadata.name);

      if (resourceNames.length === 0) return [];

      const results = await Promise.all(
        resourceNames.map((name) => config.handler(context, name))
      );
      return results.flat();
    })
  );

  return subModuleResources.flat();
}