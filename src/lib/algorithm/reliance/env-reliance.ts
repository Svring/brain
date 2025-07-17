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

const getContainerEnvs = (
  containers: Array<{ env?: EnvironmentVariable[] }> | undefined
): EnvironmentVariable[] => _.flatMap(containers, (c) => c.env ?? []);

/**
 * Pull env arrays off Deployments / StatefulSets and return a nested map:
 *   kind -> workloadName -> env[]
 */
export const extractEnvironmentVariables = (
  resources: Record<string, { items: any[] }>
): Record<string, Record<string, EnvironmentVariable[]>> => {
  const pickWorkloads = _.pick(resources, ["statefulset", "deployment"]);

  return _.transform(
    pickWorkloads,
    (acc, { items = [] }, kind) => {
      const perWorkload = _.transform(
        items,
        (inner, wl) => {
          const name = wl?.metadata?.name;
          if (!name) return;

          const envs = [
            ...getContainerEnvs(wl?.spec?.template?.spec?.containers),
            ...getContainerEnvs(wl?.spec?.template?.spec?.initContainers),
          ];

          if (envs.length) inner[name] = envs;
        },
        {} as Record<string, EnvironmentVariable[]>
      );

      if (!_.isEmpty(perWorkload)) acc[kind] = perWorkload;
    },
    {} as Record<string, Record<string, EnvironmentVariable[]>>
  );
};

// Collapse an env array into literal values and name references (Secrets / ConfigMaps)
export const collectEnv = (
  envs: EnvironmentVariable[]
): { refs: string[]; values: string[] } => {
  const refs: string[] = [];
  const values: string[] = [];

  envs.forEach((env) => {
    if (env.value !== undefined) {
      values.push(env.value);
    } else if (env.valueFrom) {
      const vf: any = env.valueFrom;
      if (vf?.secretKeyRef?.name) refs.push(vf.secretKeyRef.name);
      if (vf?.configMapKeyRef?.name) refs.push(vf.configMapKeyRef.name);
    }
  });

  return { refs: _.uniq(refs), values: _.uniq(values) };
};

// Apply collectEnv per workload
export const collectEnvByWorkload = (
  envsByKind: Record<string, Record<string, EnvironmentVariable[]>>
): Record<string, Record<string, { refs: string[]; values: string[] }>> =>
  _.mapValues(envsByKind, (workloads) => _.mapValues(workloads, collectEnv));

/**
 * Extract metadata.name for every resource grouped by kind.
 */
export const extractResourceNames = (
  resources: Record<string, { items: any[] }>
): Record<string, string[]> =>
  _.mapValues(resources, (v) =>
    _.uniq(_.compact(_.map(v?.items, "metadata.name")))
  );

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
  const result: ConnectionsByKind = {} as any;

  _.forEach(envSummary, (workloads, kind) => {
    result[kind] = {} as any;

    _.forEach(workloads, ({ refs, values }, workloadName) => {
      const allMatches = _.uniq(
        _.compact(
          [...refs, ...values].map((v) => {
            const match = _.maxBy(
              _.flatten(_.values(candidatesByKind)).filter((c) =>
                v.includes(c)
              ),
              "length"
            );
            return match ?? null;
          })
        )
      );

      const connectFrom: KindMap = {};
      const others: KindMap = {};

      _.forEach(candidatesByKind, (names, k) => {
        const matched = names.filter((n) => allMatches.includes(n));
        if (matched.length) connectFrom[k] = matched;

        const remaining = names.filter((n) => !allMatches.includes(n));
        if (remaining.length) others[k] = remaining;
      });

      (result[kind] as Record<string, WorkloadConnections>)[workloadName] = {
        connectFrom,
        others,
      };
    });
  });

  return result;
};

/**
 * Map Ingress -> workload with same name.
 */
export const processIngressConnections = (
  resources: Record<string, { items: any[] }>
): ConnectionsByKind => {
  const ingressResources = resources.ingress?.items ?? [];
  if (!ingressResources.length) return {};

  const workloadsByKind = _.mapValues(
    _.pick(resources, ["deployment", "statefulset"]),
    (d) => _.compact(_.map(d?.items, "metadata.name"))
  );

  const ingressMap: Record<string, WorkloadConnections> = {};

  ingressResources.forEach((ing) => {
    const name = ing?.metadata?.name;
    if (!name) return;

    const connectFrom = _.pickBy(
      _.mapValues(workloadsByKind, (names) =>
        names.includes(name) ? [name] : []
      ),
      (v) => (v as string[]).length > 0
    ) as KindMap;

    ingressMap[name] = { connectFrom, others: {} };
  });

  return { ingress: ingressMap } as ConnectionsByKind;
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
