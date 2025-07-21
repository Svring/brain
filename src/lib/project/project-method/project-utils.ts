import { customAlphabet } from "nanoid";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import { INSTANCE_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";

export { inferRelianceFromEnv } from "@/lib/algorithm/reliance/env-reliance";

export const getProjectNameFromResource = (
  resource: K8sResource
): string | null => {
  return (
    resource.metadata.labels?.[
      INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS
    ] ?? null
  );
};

export const generateNewProjectName = () => {
  const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 7);
  return `project-${nanoid()}`;
};

export const generateProjectTemplate = (
  projectName: string,
  namespace: string
) => {
  return `apiVersion: app.sealos.io/v1
kind: Instance
metadata:
  name: ${projectName}
  namespace: ${namespace}
  labels:
    ${INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS}: ${projectName}
spec:
  templateType: inline
  defaults:
    app_name:
      type: string
      value: ${projectName}
  title: ${projectName}`;
};

export const filterResourcesWithoutProject = (
  resources: K8sResource[]
): K8sResource[] => {
  return resources.filter((resource) => !getProjectNameFromResource(resource));
};
