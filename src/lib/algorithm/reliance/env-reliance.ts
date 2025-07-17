"use client";

import type { ConnectionsByKind } from "@/lib/k8s/k8s-utils";
import {
  collectEnvByWorkload,
  extractEnvironmentVariables,
  extractResourceNames,
  mergeConnectFromByWorkload,
  processIngressConnections,
} from "@/lib/k8s/k8s-utils";
import type { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";

/**
 * Remove ingress resources from the workload candidate map.
 * These resources get their own dedicated connection handling so we avoid
 * duplicate/self references.
 */
const omitIngressFromCandidates = (
  candidates: Record<string, string[]>
): Record<string, string[]> => {
  const { ingress: _ingress, ...rest } = candidates;
  return rest;
};

/**
 * Derive connection information between project resources.
 *
 * The algorithm works in two complementary stages:
 *   1. ENV-based discovery — look at environment variables defined on
 *      Deployments & StatefulSets. If a variable value (or referenced
 *      Secret/ConfigMap name) contains another resource's name we treat that
 *      as a connection from the workload defining the variable to the
 *      matching resource.
 *   2. Ingress convention — if an Ingress shares the same metadata.name with
 *      a Deployment/StatefulSet we consider the Ingress to connect **from**
 *      that workload. This follows the common "one Ingress per workload"
 *      convention.
 *
 * The result groups connections by Kubernetes kind so that downstream
 * consumers (e.g. the flow visualiser) can easily map kinds to edge types.
 */
export const processProjectConnections = (
  resources: Record<string, { items: K8sResource[] }>
): ConnectionsByKind => {
  // Stage 1 — ENV-based connections
  const envConnections = mergeConnectFromByWorkload(
    collectEnvByWorkload(extractEnvironmentVariables(resources)),
    omitIngressFromCandidates(extractResourceNames(resources))
  );

  // Stage 2 — Ingress-to-workload connections
  const ingressConnections = processIngressConnections(resources);

  // Merge both maps. If there are no ingress resources we just return the env map.
  return {
    ...envConnections,
    ...(ingressConnections.ingress
      ? { ingress: ingressConnections.ingress }
      : {}),
  };
};

export type { ConnectionsByKind };
