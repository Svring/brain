"use client";

import _ from "lodash";
import type { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";

export type KindMap = Record<string, string[]>;

export interface WorkloadConnections {
  connectFrom: KindMap;
  others: KindMap;
}

export type ConnectionsByKind = Record<
  string,
  Record<string, WorkloadConnections>
>;

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

// -------------------------
// Local helper types
// -------------------------

export interface EnvironmentVariable {
  name: string;
  value?: string;
  valueFrom?: unknown;
}

// -------------------------
// Environment extraction
// -------------------------

/**
 * Flattens and collects all environment variables from a list of containers.
 * @param containers An array of container-like objects that may have an `env` property.
 * @returns A single array of all environment variables.
 */
const getContainerEnvs = (
  containers: Array<{ env?: EnvironmentVariable[] }> | undefined
): EnvironmentVariable[] => _.flatMap(containers, (c) => c.env ?? []);

/**
 * Pull env arrays off Deployments / StatefulSets and return a nested map:
 *   kind -> workloadName -> env[]
 */
export const extractEnvironmentVariables = (
  resources: Record<string, { items: K8sResource[] }>
): Record<string, Record<string, EnvironmentVariable[]>> => {
  const pickWorkloads = _.pick(resources, ["statefulset", "deployment"]);

  return _.transform(
    pickWorkloads,
    (acc, { items = [] }, kind) => {
      // For each workload kind, iterate through its resource items.
      const perWorkload = items.reduce<Record<string, EnvironmentVariable[]>>(
        (inner, wl) => {
          const name = wl?.metadata?.name;
          if (!name) return inner;

          // The spec is loosely typed; cast to access nested properties.
          const spec = wl.spec as any;

          // Combine envs from both regular and init containers.
          const envs = [
            ...getContainerEnvs(spec?.template?.spec?.containers),
            ...getContainerEnvs(spec?.template?.spec?.initContainers),
          ];

          if (envs.length) {
            inner[name] = envs;
          }
          return inner;
        },
        {}
      );

      if (!_.isEmpty(perWorkload)) acc[kind] = perWorkload;
    },
    {} as Record<string, Record<string, EnvironmentVariable[]>>
  );
};

/**
 * Collapses an environment variable array into its constituent parts:
 * - `refs`: Names of Secrets or ConfigMaps referenced via `valueFrom`.
 * - `values`: Literal string values from the `value` property.
 * This function ensures the returned names and values are unique.
 * @param envs The array of environment variables to process.
 * @returns An object containing unique arrays of `refs` and `values`.
 */
export const collectEnv = (
  envs: EnvironmentVariable[]
): { refs: string[]; values: string[] } => {
  const refs = new Set<string>();
  const values = new Set<string>();

  envs.forEach((env) => {
    if (env.value !== undefined) {
      values.add(env.value);
    } else if (env.valueFrom) {
      // If value is not literal, it might be a reference to a Secret or ConfigMap.
      const vf: any = env.valueFrom;
      if (vf?.secretKeyRef?.name) refs.add(vf.secretKeyRef.name);
      if (vf?.configMapKeyRef?.name) refs.add(vf.configMapKeyRef.name);
    }
  });

  return { refs: Array.from(refs), values: Array.from(values) };
};

/**
 * Applies the `collectEnv` function to each workload in a nested map.
 * @param envsByKind A map of envs, structured as kind -> workloadName -> env[].
 * @returns A map with the same structure, but with envs processed into refs and values.
 */
export const collectEnvByWorkload = (
  envsByKind: Record<string, Record<string, EnvironmentVariable[]>>
): Record<string, Record<string, { refs: string[]; values: string[] }>> =>
  _.mapValues(envsByKind, (workloads) => _.mapValues(workloads, collectEnv));

/**
 * Extract metadata.name for every resource grouped by kind.
 */
export const extractResourceNames = (
  resources: Record<string, { items: K8sResource[] }>
): Record<string, string[]> =>
  _.mapValues(resources, (v) => {
    const names =
      v?.items?.map((item) => item.metadata?.name).filter(Boolean) ?? [];
    return Array.from(new Set(names));
  });

// -------------------------
// Connection inference
// -------------------------

/**
 * For each workload compute which candidate resource names appear in its env
 * values. The longest match per env string wins to avoid partial overlaps.
 */
export const mergeConnectFromByWorkload = (
  envSummary: Record<
    string,
    Record<string, { refs: string[]; values: string[] }>
  >,
  candidatesByKind: Record<string, string[]>
): ConnectionsByKind => {
  // Pre-sort all candidate names by length descending. This allows us to find
  // the longest possible match efficiently using `Array.find()`.
  const allCandidates = _.sortBy(
    _.flatten(_.values(candidatesByKind)),
    (c) => -c.length
  );
  const result: ConnectionsByKind = {};

  _.forEach(envSummary, (workloads, kind) => {
    const kindConnections: Record<string, WorkloadConnections> = {};

    _.forEach(workloads, ({ refs, values }, workloadName) => {
      // For each environment value, find the first (and longest) candidate name that is a substring.
      const allMatches = _.uniq(
        _.compact(
          [...refs, ...values].map((v) =>
            allCandidates.find((c) => v.includes(c))
          )
        )
      );

      const connectFrom: KindMap = {};
      const others: KindMap = {};

      // Partition the candidates for this workload into 'connectFrom' (matched) and 'others' (unmatched).
      _.forEach(candidatesByKind, (names, k) => {
        // Find which of the candidate names for this kind were matched in the envs.
        const matched = names.filter((n) => allMatches.includes(n));
        if (matched.length) connectFrom[k] = matched;

        // Any candidate names not matched are stored in 'others'.
        const remaining = names.filter((n) => !allMatches.includes(n));
        if (remaining.length) others[k] = remaining;
      });

      kindConnections[workloadName] = {
        connectFrom,
        others,
      };
    });

    result[kind] = kindConnections;
  });

  return result;
};

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

// -------------------------
// Primary entry
// -------------------------

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
export const inferRelianceFromEnv = (
  resources: Record<string, { items: K8sResource[] }>
): ConnectionsByKind => {
  // Stage 1 — ENV-based connections from Deployments and StatefulSets.
  const envConnections = mergeConnectFromByWorkload(
    collectEnvByWorkload(extractEnvironmentVariables(resources)),
    omitIngressFromCandidates(extractResourceNames(resources))
  );

  // Stage 2 — Ingress-to-workload connections based on naming conventions.
  const ingressConnections = processIngressConnections(resources);

  // Merge both connection maps, with Ingress connections taking precedence.
  return {
    ...envConnections,
    ...(ingressConnections.ingress
      ? { ingress: ingressConnections.ingress }
      : {}),
  };
};
