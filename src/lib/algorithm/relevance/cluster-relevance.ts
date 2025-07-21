import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import { listAllResources } from "@/lib/k8s/k8s-method/k8s-query";
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

  return allItems;
};