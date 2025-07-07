"use client";

import _ from "lodash";
import { use } from "react";
import { AuthContext } from "@/contexts/auth-context";
import type { ResourceConfig } from "./k8s-constant";
import { RESOURCES } from "./k8s-constant";
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

export function getCurrentNamespace(): string | undefined {
  const { user } = use(AuthContext);
  return user?.namespace;
}

// Filter function to remove resource types with empty items arrays
export const filterEmptyResources = (
  data: Record<string, { items: AnyKubernetesResource[] }>
): Record<string, { items: AnyKubernetesResource[] }> => {
  const filtered: Record<string, { items: AnyKubernetesResource[] }> = {};

  for (const [resourceType, resourceData] of Object.entries(data)) {
    if (resourceData?.items && resourceData.items.length > 0) {
      filtered[resourceType] = resourceData;
    }
  }

  return filtered;
};

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

  if (config.type === "builtin") {
    return {
      type: config.resourceType,
      namespace: resource.metadata.namespace,
      name: resource.metadata.name,
    };
  }

  return null;
};

// Helper function to convert all resources to ResourceTarget format
export const convertAllResourcesToTargets = (
  data: Record<string, { items: AnyKubernetesResource[] }>
): ResourceTarget[] => {
  const resources: ResourceTarget[] = [];
  for (const [resourceName, resourceData] of Object.entries(data)) {
    const config = RESOURCES[resourceName as keyof typeof RESOURCES];
    if (config && resourceData?.items) {
      for (const resource of resourceData.items) {
        const target = convertToResourceTarget(resource, config);
        if (target) {
          resources.push(target);
        }
      }
    }
  }
  return resources;
};

// -------------------------------------------
// Simplified Environment variable extraction
// -------------------------------------------

export interface EnvironmentVariable {
  name: string;
  value?: string;
  valueFrom?: unknown;
}

// Helper to aggregate envs from containers / initContainers
const getContainerEnvs = (
  containers: Array<{ env?: EnvironmentVariable[] }> | undefined
): EnvironmentVariable[] => {
  if (!containers) {
    return [];
  }
  // Flatten all env arrays from containers
  return _.flatMap(containers, (c) => c.env ?? []);
};

/**
 * Extract environment variables from StatefulSet and Deployment resources.
 * Returns a simplified structure for easier processing.
 */
export const extractEnvironmentVariables = (
  resources: Record<string, { items: AnyKubernetesResource[] }>
): Record<string, Record<string, EnvironmentVariable[]>> => {
  const envRecord: Record<string, Record<string, EnvironmentVariable[]>> = {};

  const processWorkload = (
    workload: AnyKubernetesResource,
    kind: string
  ): void => {
    const name = workload?.metadata?.name;
    if (!name) {
      return;
    }

    const containersEnv = getContainerEnvs(
      // @ts-expect-error — spec is loosely typed for generic Kubernetes resources
      workload?.spec?.template?.spec?.containers
    );
    const initContainersEnv = getContainerEnvs(
      // @ts-expect-error — spec is loosely typed for generic Kubernetes resources
      workload?.spec?.template?.spec?.initContainers
    );
    const allEnvs = [...containersEnv, ...initContainersEnv];

    if (_.isEmpty(allEnvs)) {
      return;
    }

    if (!envRecord[kind]) {
      envRecord[kind] = {};
    }
    envRecord[kind][name] = allEnvs;
  };

  if (resources.statefulset?.items) {
    for (const w of resources.statefulset.items) {
      processWorkload(w, "statefulset");
    }
  }

  if (resources.deployment?.items) {
    for (const w of resources.deployment.items) {
      processWorkload(w, "deployment");
    }
  }

  return envRecord;
};

/**
 * Collect literal env values and referenced secret/configMap names.
 */
export const collectEnv = (
  envs: EnvironmentVariable[]
): { refs: string[]; values: string[] } => {
  const refs: string[] = [];
  const values: string[] = [];

  _.forEach(envs, (env) => {
    if (env.value !== undefined) {
      values.push(env.value);
      return;
    }

    if (env.valueFrom) {
      const vf = env.valueFrom as {
        secretKeyRef?: { name?: string };
        configMapKeyRef?: { name?: string };
      };
      if (vf.secretKeyRef?.name) {
        refs.push(vf.secretKeyRef.name);
      }
      if (vf.configMapKeyRef?.name) {
        refs.push(vf.configMapKeyRef.name);
      }
    }
  });

  return {
    refs: _.uniq(refs),
    values: _.uniq(values),
  };
};

/**
 * Apply `collectEnv` to each workload's env array.
 */
export const collectEnvByWorkload = (
  envsByKind: Record<string, Record<string, EnvironmentVariable[]>>
): Record<string, Record<string, { refs: string[]; values: string[] }>> => {
  const result: Record<
    string,
    Record<string, { refs: string[]; values: string[] }>
  > = {};

  for (const [kind, workloads] of Object.entries(envsByKind)) {
    const transformed: Record<string, { refs: string[]; values: string[] }> =
      {};
    for (const [name, envArray] of Object.entries(workloads)) {
      transformed[name] = collectEnv(envArray);
    }
    result[kind] = transformed;
  }

  return result;
};

/**
 * Extract the `metadata.name` from Kubernetes resources grouped by kind.
 */
export const extractResourceNames = (
  resources: Record<string, { items: AnyKubernetesResource[] }>
): Record<string, string[]> => {
  const result: Record<string, string[]> = {};

  for (const [kind, value] of Object.entries(resources)) {
    result[kind] = _.uniq(
      _.compact(
        _.map(
          value?.items ?? [],
          (item) => item?.metadata?.name as string | undefined
        )
      )
    );
  }

  return result;
};

// -------------------------------------------
// Connection Processing with Kind Information
// -------------------------------------------

// Helper types for connection processing
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
 * Connection processing that preserves kind information
 * Returns connections grouped by resource kind
 */
export const mergeConnectFromByWorkload = (
  envSummary: Record<
    string,
    Record<string, { refs: string[]; values: string[] }>
  >,
  candidatesByKind: Record<string, string[]>
): ConnectionsByKind =>
  _.mapValues(envSummary, (workloads) =>
    _.mapValues(workloads, ({ refs, values }) => {
      const isMatch = (candidate: string) =>
        refs.some((r) => r.includes(candidate)) ||
        values.some((v) => v.includes(candidate));

      const connectFrom = _.pickBy(
        _.mapValues(candidatesByKind, (names) => names.filter(isMatch)),
        (arr) => (arr as string[]).length > 0
      ) as KindMap;

      const others = _.pickBy(
        _.mapValues(candidatesByKind, (names) =>
          names.filter((name) => !isMatch(name))
        ),
        (arr) => (arr as string[]).length > 0
      ) as KindMap;

      return { connectFrom, others } as WorkloadConnections;
    })
  ) as ConnectionsByKind;
