"use client";

import { use } from "react";
import { AuthContext } from "@/contexts/auth-context";
import type { ResourceConfig } from "./k8s-constant";
import type { AnyKubernetesResource, ResourceTarget } from "./schemas";

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

// Helper function to convert resource to ResourceTarget
export const convertToResourceTarget = (
  resource: AnyKubernetesResource,
  config: ResourceConfig
): ResourceTarget | null => {
  if (!(resource.metadata.name && resource.metadata.namespace)) {
    return null;
  }

  if (config.type === "custom") {
    return {
      type: "custom",
      group: config.group,
      version: config.version,
      namespace: resource.metadata.namespace,
      plural: config.plural,
      name: resource.metadata.name,
    };
  }

  if (config.type === "deployment") {
    return {
      type: "deployment",
      namespace: resource.metadata.namespace,
      name: resource.metadata.name,
    };
  }

  return null;
};
