import type { StatefulSetResource } from "@/lib/k8s/schemas/resource-schemas/statefulset-schemas";

export interface StatefulSetNodeData {
  name: string;
  state: "Running" | "Stopped" | "Unknown";
}

export function convertStatefulSetResourceToNodeData(
  resource: StatefulSetResource
): StatefulSetNodeData {
  const name = resource.metadata.name;

  // Determine state based on statefulset status
  let state: "Running" | "Stopped" | "Unknown" = "Unknown";

  if (resource.status?.conditions) {
    const readyCondition = resource.status.conditions.find(
      (condition) => condition.type === "Ready"
    );
    if (readyCondition?.status === "True") {
      state = "Running";
    } else if (readyCondition?.status === "False") {
      state = "Stopped";
    }
  } else if (
    resource.status?.readyReplicas &&
    resource.status.readyReplicas > 0
  ) {
    state = "Running";
  } else if (resource.spec?.replicas === 0) {
    state = "Stopped";
  } else if (resource.status?.replicas === 0) {
    state = "Stopped";
  }

  return {
    name,
    state,
  };
}
