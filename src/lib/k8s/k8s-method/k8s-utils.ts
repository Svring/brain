"use client";

import { use } from "react";
import { AuthContext } from "@/contexts/auth-context";
import type { K8sApiContext } from "../k8s-api/k8s-api-schemas/context-schemas";
import { K8sApiContextSchema } from "../k8s-api/k8s-api-schemas/context-schemas";

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
