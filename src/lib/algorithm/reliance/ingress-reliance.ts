"use client";

import _ from "lodash";
import type { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import type { ConnectionsByKind, KindMap, WorkloadConnections } from "./env-reliance";

/**
 * Creates connections for Ingress resources based on a naming convention.
 * If an Ingress resource shares the same `metadata.name` as a Deployment or
 * StatefulSet, a connection is inferred from the Ingress to that workload.
 * @param resources A map of all project resources, grouped by kind.
 * @returns A `ConnectionsByKind` map specifically for `ingress` resources.
 */
export const processIngressConnections = (
  resources: Record<string, { items: K8sResource[] }>
): ConnectionsByKind => {
  const ingressResources = resources.ingress?.items ?? [];
  if (!ingressResources.length) return {};

  // Create a map of workload kinds to their resource names for quick lookups.
  const workloadsByKind = _.mapValues(
    _.pick(resources, ["deployment", "statefulset"]),
    (d) => {
      const names =
        d?.items?.map((i) => i?.metadata?.name).filter(Boolean) ?? [];
      return Array.from(new Set(names));
    }
  );

  const ingressMap: Record<string, WorkloadConnections> = {};

  ingressResources.forEach((ing) => {
    const name = ing?.metadata?.name;
    if (!name) return;

    // Find workloads that have the same name as the Ingress resource.
    const connectFrom = _.pickBy(
      _.mapValues(workloadsByKind, (names) =>
        names.includes(name) ? [name] : []
      ),
      (v) => v.length > 0
    ) as KindMap;

    ingressMap[name] = { connectFrom, others: {} };
  });

  return { ingress: ingressMap };
};