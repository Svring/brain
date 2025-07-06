import type { ServiceResource } from "@/lib/k8s/schemas/resource-schemas/service-schemas";

export interface ServiceNodeData {
  name: string;
  state: "Running" | "Stopped" | "Unknown";
}

export function convertServiceResourceToNodeData(
  resource: ServiceResource
): ServiceNodeData {
  const name = resource.metadata.name;

  // Determine state based on resource conditions or default to "Unknown"
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
    resource.spec?.selector &&
    Object.keys(resource.spec.selector).length > 0
  ) {
    // If service has selectors, assume it's running
    state = "Running";
  }

  return {
    name,
    state,
  };
}
