import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import { listAllResources } from "@/lib/k8s/k8s-method/k8s-query";
import { DEPLOYMENT_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";
import _ from "lodash";

export const getDeployRelatedResources = async (
  context: K8sApiContext,
  deployName: string
) => {
  const labelSelector = `${DEPLOYMENT_RELATE_RESOURCE_LABELS.APP_DEPLOY_MANAGER}=${deployName}`;
  const resources = await listAllResources(
    context,
    labelSelector,
    ["ingress", "service", "pvc", "configmap"],
    ["issuers", "certificates"]
  );

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
};
