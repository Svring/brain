import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import { listAllResources } from "@/lib/k8s/k8s-method/k8s-query";
import { PROJECT_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";

export const getDeployRelatedResources = async (context: K8sApiContext, deployName: string) => {
  const labelSelector = `${PROJECT_RELATE_RESOURCE_LABELS.APP_DEPLOY_MANAGER}=${deployName}`;
  const resources = await listAllResources(context, labelSelector);
  return resources;
};
