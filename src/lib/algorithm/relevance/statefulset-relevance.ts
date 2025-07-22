import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import { listAllResources } from "@/lib/k8s/k8s-method/k8s-query";
import { STATEFULSET_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";
import _ from "lodash";

export const getStatefulsetRelatedResources = async (
  context: K8sApiContext,
  statefulsetName: string
) => {
  const labelSelector = `${STATEFULSET_RELATE_RESOURCE_LABELS.APP_DEPLOY_MANAGER}=${statefulsetName}`;
  const resources = await listAllResources(
    context,
    labelSelector,
    ["ingress"],
    []
  );

  const allItems: any[] = [];
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
};
