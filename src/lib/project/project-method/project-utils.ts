import { customAlphabet } from "nanoid";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import { PROJECT_NAME_LABEL_KEY } from "@/lib/k8s/k8s-constant/k8s-constant-label";

export { inferRelianceFromEnv } from "@/lib/algorithm/reliance/env-reliance";

export const getProjectNameFromResource = (
  resource: K8sResource
): string | null => {
  return resource.metadata.labels?.[PROJECT_NAME_LABEL_KEY] ?? null;
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
    ${PROJECT_NAME_LABEL_KEY}: ${projectName}
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
