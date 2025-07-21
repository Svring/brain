import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import { listAllResources, getAllResourcesByName } from "@/lib/k8s/k8s-method/k8s-query";
import { PROJECT_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";
import _ from "lodash";

export const getInstanceRelatedResources = async (context: K8sApiContext, instanceName: string) => {
  const allItems: any[] = [];

  // 1. Get resources by label selectors
  const labelSelectors = [
    `${PROJECT_RELATE_RESOURCE_LABELS.MANAGED_BY}=${instanceName}`,
    `${PROJECT_RELATE_RESOURCE_LABELS.APP}=${instanceName}`,
  ];

  const labeledResourcesPromises = labelSelectors.map(selector => listAllResources(context, selector));
  const labeledResourcesResults = await Promise.allSettled(labeledResourcesPromises);

  labeledResourcesResults.forEach(result => {
    if (result.status === 'fulfilled' && result.value) {
      _.forEach(result.value.builtin, (resourceList) => {
        if (resourceList && resourceList.items) {
          allItems.push(...resourceList.items);
        }
      });
      _.forEach(result.value.custom, (resourceList) => {
        if (resourceList && resourceList.items) {
          allItems.push(...resourceList.items);
        }
      });
    }
  });

  // 2. Get resources by name
  const namedResources = await getAllResourcesByName(context, instanceName);
  allItems.push(...namedResources);

  // 3. Remove duplicates
  return _.uniqWith(allItems, (a, b) => 
    a.metadata?.selfLink === b.metadata?.selfLink ||
    (a.kind === b.kind && a.metadata?.name === b.metadata?.name && a.metadata?.namespace === b.metadata?.namespace)
  );
};