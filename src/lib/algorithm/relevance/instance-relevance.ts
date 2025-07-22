import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import { listAllResources } from "@/lib/k8s/k8s-method/k8s-query";
import { INSTANCE_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";
import _ from "lodash";

export const getInstanceRelatedResources = async (
  context: K8sApiContext,
  instanceName: string
) => {
  const allItems: any[] = [];

  // 1. Get resources by label selector
  const labelSelector = `${INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS}=${instanceName}`;

  const labeledResources = await listAllResources(
    context,
    labelSelector,
    ["configmap", "deployment", "statefulset"],
    ["devbox", "cluster", "objectstoragebucket"]
  );

  if (labeledResources) {
    _.forEach(labeledResources.builtin, (resourceList) => {
      if (resourceList && resourceList.items) {
        allItems.push(...resourceList.items);
      }
    });
    _.forEach(labeledResources.custom, (resourceList) => {
      if (resourceList && resourceList.items) {
        allItems.push(...resourceList.items);
      }
    });
  }

  return allItems;
};
