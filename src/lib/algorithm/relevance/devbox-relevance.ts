import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import { listAllResources } from "@/lib/k8s/k8s-method/k8s-query";
import { DEVBOX_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";
import _ from "lodash";

export const getDevboxRelatedResources = async (
  context: K8sApiContext,
  devboxName: string
) => {
  const labelSelector = `${DEVBOX_RELATE_RESOURCE_LABELS.DEVBOX_MANAGER}=${devboxName}`;
  const resources = await listAllResources(
    context,
    labelSelector,
    ["ingress", "service"], // Only fetch service and ingress builtin resources
    ["issuers", "certificates"] // No custom resources
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
