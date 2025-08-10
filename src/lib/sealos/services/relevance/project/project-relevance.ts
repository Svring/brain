import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { getCustomResource } from "@/lib/k8s/k8s-api/k8s-api-query";
import { CUSTOM_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-custom-resource";
import { ListAllResourcesResponseSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/res-list-schemas";
import { filterEmptyResources } from "@/lib/k8s/k8s-method/k8s-utils";
import { getInstanceRelatedResources } from "../instance/instance-relevance";
import { getDevboxRelatedResources } from "../devbox/devbox-relevance";
import { getClusterRelatedResources } from "../cluster/cluster-relevance";
import { getDeploymentRelatedResources } from "../deployment/deployment-relevance";
import { getStatefulsetRelatedResources } from "../statefulset/statefulset-relevance";
import {
  createEmptyResourceResult,
  deduplicateResources,
  categorizeResources,
  groupBuiltinResourcesByType,
  groupCustomResourcesByType,
  createStructuredResourceResult,
  processSubModuleResources,
} from "../relevance-utils";
import { runParallelAction } from "next-server-actions-parallel";

export const getProjectRelatedResources = async (
  context: K8sApiContext,
  projectName: string,
  enabledSubModules: string[] = []
) => {
  const projectInstanceRaw = await runParallelAction(
    getCustomResource(context, {
      type: "custom",
      resourceType: CUSTOM_RESOURCES.instance.resourceType,
      group: CUSTOM_RESOURCES.instance.group,
      version: CUSTOM_RESOURCES.instance.version,
      plural: CUSTOM_RESOURCES.instance.plural,
      name: projectName,
    })
  );

  if (!projectInstanceRaw) {
    const emptyResult = createEmptyResourceResult();
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
    deployment: { kind: "Deployment", handler: getDeploymentRelatedResources },
    statefulset: {
      kind: "StatefulSet",
      handler: getStatefulsetRelatedResources,
    },
  };

  const subModuleResources = await processSubModuleResources(
    context,
    instanceRelatedResources,
    enabledSubModules,
    subModuleHandlers
  );

  allItems.push(...subModuleResources);

  // Deduplicate resources by kind and name
  const uniqueItems = deduplicateResources(allItems);
  const categorizedResources = categorizeResources(uniqueItems);

  const builtinByType = groupBuiltinResourcesByType(
    categorizedResources.builtin || []
  );
  const customByType = groupCustomResourcesByType(
    categorizedResources.custom || []
  );

  const result = createStructuredResourceResult(builtinByType, customByType);

  return filterEmptyResources(ListAllResourcesResponseSchema.parse(result));
};
