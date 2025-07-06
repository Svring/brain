import type { KubernetesResource } from "@/lib/k8s/schemas/resource-schemas/kubernetes-resource-schemas";

export interface DatabaseNodeData {
  name: string;
  type: string;
  state: "Running" | "Stopped" | "Unknown" | "Creating" | "Failed";
  icon: string;
}

function getDatabaseType(resource: KubernetesResource): string {
  if (resource.metadata.labels?.["app.kubernetes.io/name"]) {
    return resource.metadata.labels["app.kubernetes.io/name"];
  }
  if (resource.metadata.labels?.app) {
    return resource.metadata.labels.app;
  }
  if (resource.kind) {
    return resource.kind;
  }
  return "Database";
}

function getDatabaseState(
  resource: KubernetesResource
): "Running" | "Stopped" | "Unknown" | "Creating" | "Failed" {
  if (
    resource.status?.conditions &&
    Array.isArray(resource.status.conditions)
  ) {
    const conditions = resource.status.conditions as Array<{
      type: string;
      status: string;
    }>;
    const readyCondition = conditions.find(
      (condition) => condition.type === "Ready"
    );
    const availableCondition = conditions.find(
      (condition) => condition.type === "Available"
    );

    if (
      readyCondition?.status === "True" ||
      availableCondition?.status === "True"
    ) {
      return "Running";
    }
    if (
      readyCondition?.status === "False" ||
      availableCondition?.status === "False"
    ) {
      return "Failed";
    }
    return "Creating";
  }

  if (resource.status?.phase) {
    const phase = resource.status.phase as string;
    if (phase === "Running" || phase === "Active") {
      return "Running";
    }
    if (phase === "Failed") {
      return "Failed";
    }
    if (phase === "Pending") {
      return "Creating";
    }
  }

  return "Unknown";
}

function getDatabaseIcon(resource: KubernetesResource, type: string): string {
  if (resource.metadata.annotations?.["app.kubernetes.io/icon"]) {
    return resource.metadata.annotations["app.kubernetes.io/icon"];
  }
  if (resource.metadata.annotations?.["sealos.io/icon"]) {
    return resource.metadata.annotations["sealos.io/icon"];
  }

  const lowerType = type.toLowerCase();
  if (lowerType.includes("postgres") || lowerType.includes("pg")) {
    return "/postgresql-icon.png";
  }
  if (lowerType.includes("mysql")) {
    return "/mysql-icon.png";
  }
  if (lowerType.includes("mongo")) {
    return "/mongodb-icon.png";
  }
  if (lowerType.includes("redis")) {
    return "/redis-icon.png";
  }

  return "/default-database-icon.png";
}

export function convertKubernetesResourceToDatabaseNodeData(
  resource: KubernetesResource
): DatabaseNodeData {
  const name = resource.metadata.name;
  const type = getDatabaseType(resource);
  const state = getDatabaseState(resource);
  const icon = getDatabaseIcon(resource, type);

  return {
    name,
    type,
    state,
    icon,
  };
}
