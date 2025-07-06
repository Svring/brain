import type { DeploymentResource } from "@/lib/k8s/schemas/resource-schemas/deployment-schemas";

export interface DeployNodeData {
  name: string;
  state: "Running" | "Stopped" | "Unknown";
  icon: string;
}

export function convertDeploymentResourceToNodeData(
  resource: DeploymentResource
): DeployNodeData {
  const name = resource.metadata.name;

  // Determine state based on deployment status
  let state: "Running" | "Stopped" | "Unknown" = "Unknown";

  if (resource.status?.conditions) {
    const availableCondition = resource.status.conditions.find(
      (condition) => condition.type === "Available"
    );
    const progressingCondition = resource.status.conditions.find(
      (condition) => condition.type === "Progressing"
    );

    if (availableCondition?.status === "True") {
      state = "Running";
    } else if (progressingCondition?.status === "False") {
      state = "Stopped";
    }
  } else if (
    resource.status?.readyReplicas &&
    resource.status.readyReplicas > 0
  ) {
    state = "Running";
  } else if (resource.spec?.replicas === 0) {
    state = "Stopped";
  }

  // Extract icon from annotations or use default
  const icon =
    resource.metadata.annotations?.["app.kubernetes.io/icon"] ||
    resource.metadata.annotations?.["sealos.io/icon"] ||
    "/default-app-icon.png";

  return {
    name,
    state,
    icon,
  };
}
