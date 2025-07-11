"use client";

import { use } from "react";
import { AuthContext } from "@/contexts/auth-context";
import type { K8sApiContext } from "../k8s-api/k8s-api-schemas/context-schemas";
import { K8sApiContextSchema } from "../k8s-api/k8s-api-schemas/context-schemas";
import type { QueryClient } from "@tanstack/react-query";
import type {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "../k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { K8sResource } from "../k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import { BuiltinResourceConfig } from "../k8s-constant/k8s-constant-builtin-resource";
import { CustomResourceConfig } from "../k8s-constant/k8s-constant-custom-resource";

function getUserKubeconfig(): string | undefined {
  const { user } = use(AuthContext);
  return user?.kubeconfig;
}

export function getDecodedKubeconfig(): string {
  const kc = getUserKubeconfig();
  if (!kc) {
    throw new Error("Kubeconfig not available");
  }
  return decodeURIComponent(kc);
}

export function getCurrentNamespace(): string | undefined {
  const { user } = use(AuthContext);
  return user?.namespace;
}

/**
 * Helper function to create K8s API context from user data
 */
export function createK8sContext(): K8sApiContext {
  return K8sApiContextSchema.parse({
    namespace: getCurrentNamespace(),
    kubeconfig: getDecodedKubeconfig(),
  });
}

/**
 * Filters out resource types with empty items arrays from builtin and custom resource maps.
 */
export function filterEmptyResources<T extends { items: unknown[] }>(data: {
  builtin: Record<string, T>;
  custom: Record<string, T>;
}): { builtin: Record<string, T>; custom: Record<string, T> } {
  const filteredBuiltin = Object.fromEntries(
    Object.entries(data.builtin).filter(
      ([_, value]) =>
        value &&
        typeof value === "object" &&
        "items" in value &&
        Array.isArray(value.items) &&
        value.items.length > 0
    )
  );

  const filteredCustom = Object.fromEntries(
    Object.entries(data.custom).filter(
      ([_, value]) =>
        value &&
        typeof value === "object" &&
        "items" in value &&
        Array.isArray(value.items) &&
        value.items.length > 0
    )
  );

  return {
    builtin: filteredBuiltin,
    custom: filteredCustom,
  };
}

export const convertToResourceTarget = (
  resource: K8sResource,
  config: BuiltinResourceConfig | CustomResourceConfig
): CustomResourceTarget | BuiltinResourceTarget => {
  if (!resource.metadata.name) {
    throw new Error("Resource name is required");
  }

  if (config.type === "custom") {
    return {
      type: "custom",
      group: config.group,
      version: config.version,
      plural: config.plural,
      name: resource.metadata.name,
    };
  }

  if (config.type === "builtin") {
    return {
      type: "builtin",
      resourceType: config.resourceType,
      name: resource.metadata.name,
    };
  }

  throw new Error("Invalid resource type");
};

/**
 * Helper function to invalidate resource queries for both custom and builtin resources
 * Note: This function should only be called from client-side code where QueryClient is available
 */
export async function invalidateResourceQueries(
  queryClient: QueryClient,
  context: K8sApiContext,
  target: CustomResourceTarget | BuiltinResourceTarget
): Promise<void> {
  if (target.type === "custom") {
    // Invalidate custom resource queries
    queryClient.invalidateQueries({
      queryKey: [
        "k8s",
        "custom-resource",
        "get",
        target.group,
        target.version,
        context.namespace,
        target.plural,
        target.name,
      ],
    });
    queryClient.invalidateQueries({
      queryKey: [
        "k8s",
        "custom-resources",
        "list",
        target.group,
        target.version,
        context.namespace,
        target.plural,
      ],
    });
  } else {
    // Invalidate builtin resource queries
    queryClient.invalidateQueries({
      queryKey: [
        "k8s",
        "builtin-resource",
        "get",
        target.resourceType,
        context.namespace,
        target.name,
      ],
    });
    queryClient.invalidateQueries({
      queryKey: [
        "k8s",
        "builtin-resources",
        "list",
        target.resourceType,
        context.namespace,
      ],
    });
  }

  // Invalidate all-resources query
  queryClient.invalidateQueries({
    queryKey: ["k8s", "all-resources", "list", context.namespace],
  });
}
