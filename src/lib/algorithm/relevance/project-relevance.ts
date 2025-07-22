import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import { getCustomResource } from "@/lib/k8s/k8s-api/k8s-api-query";
import { CUSTOM_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-custom-resource";
import { BUILTIN_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-builtin-resource";
import { ListAllResourcesResponseSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/res-list-schemas";
import { filterEmptyResources } from "@/lib/k8s/k8s-method/k8s-utils";
import { getInstanceRelatedResources } from "./instance-relevance";
import { getDevboxRelatedResources } from "./devbox-relevance";
import { getClusterRelatedResources } from "./cluster-relevance";
import { getDeployRelatedResources } from "./deploy-relevance";
import { getStatefulsetRelatedResources } from "./statefulset-relevance";
import { runParallelAction } from "next-server-actions-parallel";
import _ from "lodash";

export const getProjectRelatedResources = async (
  context: K8sApiContext,
  projectName: string,
  enabledSubModules: string[] = []
) => {
  const projectInstanceRaw = await runParallelAction(
    getCustomResource(context, {
      type: "custom",
      group: CUSTOM_RESOURCES.instance.group,
      version: CUSTOM_RESOURCES.instance.version,
      plural: CUSTOM_RESOURCES.instance.plural,
      name: projectName,
    })
  );

  if (!projectInstanceRaw) {
    const emptyResult = {
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
    return ListAllResourcesResponseSchema.parse(emptyResult);
  }

  const instanceRelatedResources = await getInstanceRelatedResources(
    context,
    projectName
  );

  const allItems = [projectInstanceRaw, ...instanceRelatedResources];

  // Process sub-modules based on enabled modules
  const subModuleHandlers = {
    devbox: { kind: "Devbox", handler: getDevboxRelatedResources },
    cluster: { kind: "Cluster", handler: getClusterRelatedResources },
    deployment: { kind: "Deployment", handler: getDeployRelatedResources },
    statefulset: {
      kind: "StatefulSet",
      handler: getStatefulsetRelatedResources,
    },
  };

  const subModuleResources = await Promise.all(
    enabledSubModules.map(async (module) => {
      const config =
        subModuleHandlers[module as keyof typeof subModuleHandlers];
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

  allItems.push(...subModuleResources.flat());

  // Deduplicate resources by kind and name
  const uniqueItems = _.uniqWith(allItems, (a, b) => 
    a.kind === b.kind && a.metadata.name === b.metadata.name
  );

  const builtinKinds = new Set(
    Object.values(BUILTIN_RESOURCES).map((config) => config.kind)
  );

  const categorizedResources = _.groupBy(uniqueItems, (resource) => 
    builtinKinds.has(resource.kind) ? "builtin" : "custom"
  );

  const builtinByType = _.groupBy(
    categorizedResources.builtin || [],
    (resource) => {
      const config = Object.values(BUILTIN_RESOURCES).find(
        (c) => c.kind === resource.kind
      );
      return config ? config.resourceType : "unknown";
    }
  );

  const customByType = _.groupBy(
    categorizedResources.custom || [],
    (resource) => {
      const config = Object.values(CUSTOM_RESOURCES).find(
        (c) => _.upperFirst(c.resourceType) === resource.kind
      );
      return config ? config.resourceType : "unknown";
    }
  );

  const result = {
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

  return filterEmptyResources(ListAllResourcesResponseSchema.parse(result));
};
