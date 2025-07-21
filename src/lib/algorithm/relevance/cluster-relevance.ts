import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import { listAllResources, getAllResourcesByName } from "@/lib/k8s/k8s-method/k8s-query";
import { CLUSTER_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";
import _ from "lodash";

export const getClusterRelatedResources = async (context: K8sApiContext, clusterName: string) => {
  const labelSelector = `${CLUSTER_RELATE_RESOURCE_LABELS.APP_KUBERNETES_INSTANCE}=${clusterName}`;
  
  // Get resources by label
  const labeledResourcesResult = await listAllResources(context, labelSelector);
  
  const allItems: any[] = [];
  if (labeledResourcesResult) {
      _.forEach(labeledResourcesResult.builtin, (resourceList) => {
          if (resourceList && resourceList.items) {
              allItems.push(...resourceList.items);
          }
      });
      _.forEach(labeledResourcesResult.custom, (resourceList) => {
          if (resourceList && resourceList.items) {
              allItems.push(...resourceList.items);
          }
      });
  }

  // Get resources by name
  const namedResources = await getAllResourcesByName(context, clusterName);
  const exportService = await getAllResourcesByName(context, `${clusterName}-export`);
  allItems.push(...namedResources, ...exportService);

  // Remove duplicates, as some resources might be fetched by both label and name
  return _.uniqWith(allItems, (a, b) => 
    a.metadata?.selfLink === b.metadata?.selfLink ||
    (a.kind === b.kind && a.metadata?.name === b.metadata?.name && a.metadata?.namespace === b.metadata?.namespace)
  );
};