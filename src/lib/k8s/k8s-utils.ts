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
// Environment variable extraction helpers
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
 *
 * @param resources - Record of resource lists keyed by resource kind in lowercase (e.g. "statefulset", "deployment").
 * @returns Record where key is workload name and value is array of env vars.
 */
export const extractEnvironmentVariables = (
  resources: Record<string, { items: AnyKubernetesResource[] }>
): Record<string, EnvironmentVariable[]> => {
  const envRecord: Record<string, EnvironmentVariable[]> = {};

  const processWorkload = (workload: AnyKubernetesResource): void => {
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

    if (!_.isEmpty(allEnvs)) {
      envRecord[name] = allEnvs;
    }
  };

  if (resources.statefulset?.items) {
    _.forEach(resources.statefulset.items, processWorkload);
  }

  if (resources.deployment?.items) {
    _.forEach(resources.deployment.items, processWorkload);
  }

  return envRecord;
};

/**
 * Apply `collectEnv` to each workload's env array.
 *
 * @param envsByWorkload Record<string, EnvironmentVariable[]>
 * @returns Record<string, { refs: string[]; values: string[] }>
 */
export const collectEnvByWorkload = (
  envsByWorkload: Record<string, EnvironmentVariable[]>
): Record<string, { refs: string[]; values: string[] }> =>
  _.mapValues(envsByWorkload, (envArray) => collectEnv(envArray));

/**
 * Collect literal env values and referenced secret/configMap names.
 *
 * @param envs Array of EnvironmentVariable objects.
 * @returns Record with `refs` (names from secretKeyRef/configMapKeyRef) and `values` (literal values).
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

export const processEnvRefs = (
  refs: string[],
  candidates: string[]
): { connectFrom: string[]; others: string[] } => {
  const connectFrom = _.uniq(
    _.filter(candidates, (candidate) =>
      _.some(refs, (ref) => ref.includes(candidate))
    )
  );
  const others = _.uniq(
    _.filter(
      candidates,
      (candidate) => !_.some(refs, (ref) => ref.includes(candidate))
    )
  );
  return { connectFrom, others };
};

/**
 * Process env values: if any string in additional array matches (whole or part) any env value, add it to 'connectFrom'.
 * @param values Array of env values (strings)
 * @param candidates Array of strings to match
 * @returns { connectFrom: string[]; others: string[] }
 */
export const processEnvValues = (
  values: string[],
  candidates: string[]
): { connectFrom: string[]; others: string[] } => {
  const connectFrom = _.uniq(
    _.filter(candidates, (candidate) =>
      _.some(values, (val) => val.includes(candidate))
    )
  );
  const others = _.uniq(
    _.filter(
      candidates,
      (candidate) => !_.some(values, (val) => val.includes(candidate))
    )
  );
  return { connectFrom, others };
};

/**
 * Extract the `metadata.name` from Kubernetes resources grouped by kind.
 *
 * @param resources Record keyed by kind (lowercase string) with `{ items: AnyKubernetesResource[] }`.
 * @returns Record where keys are the same kinds and values are unique arrays of resource names.
 */
export const extractResourceNames = (
  resources: Record<string, { items: AnyKubernetesResource[] }>
): Record<string, string[]> =>
  _.mapValues(resources, (value) =>
    _.uniq(
      _.compact(
        _.map(
          value?.items ?? [],
          (item) => item?.metadata?.name as string | undefined
        )
      )
    )
  );

/**
 * Apply `processEnvRefs` to each workload's refs array.
 *
 * @param envSummary Record<string, { refs: string[]; values: string[] }>
 * @param candidates Array of strings used for value matching.
 * @returns Record<string, { connectFrom: string[]; others: string[] }>
 */
export const processEnvRefsByWorkload = (
  envSummary: Record<string, { refs: string[]; values: string[] }>,
  candidates: string[]
): Record<string, { connectFrom: string[]; others: string[] }> =>
  _.mapValues(envSummary, ({ refs }) => processEnvRefs(refs, candidates));

/**
 * Apply `processEnvValues` to each workload's values array with a common candidate list.
 *
 * @param envSummary Record<string, { refs: string[]; values: string[] }>
 * @param candidates Array of strings to match against env values.
 * @returns Record<string, { connectFrom: string[]; others: string[] }>
 */
export const processEnvValuesByWorkload = (
  envSummary: Record<string, { refs: string[]; values: string[] }>,
  candidates: string[]
): Record<string, { connectFrom: string[]; others: string[] }> =>
  _.mapValues(envSummary, ({ values }) => processEnvValues(values, candidates));

const POD_SUFFIX_REGEX = /-\d+$/;

/**
 * Refine `connectFrom` arrays per workload.
 * Rules:
 * 1. Remove entries whose value equals the workload key itself.
 * 2. Remove entries that only differ by a trailing numeric pod suffix (e.g. "-0", "-1")
 *    when the base name (without the suffix) already exists in the same `connectFrom` list
 *    or equals the workload key.
 */
export const refineConnectFromByWorkload = (
  records: Record<string, { connectFrom: string[]; others: string[] }>
): Record<string, { connectFrom: string[]; others: string[] }> =>
  _.mapValues(records, (value, key) => {
    // 1. Remove self-references
    let filtered = _.filter(value.connectFrom, (name) => name !== key);

    // 2. Remove pod-suffix variants if base already present or equals key
    const existingSet = new Set(filtered);
    filtered = _.filter(filtered, (name) => {
      const base = name.replace(POD_SUFFIX_REGEX, "");
      if (base !== name) {
        return !(existingSet.has(base) || base === key);
      }
      return true;
    });

    return {
      ...value,
      connectFrom: _.uniq(filtered),
    };
  });

/**
 * Combine results of `processEnvRefsByWorkload` and `processEnvValuesByWorkload`.
 *
 * @param envSummary Record<string, { refs: string[]; values: string[] }>
 * @param candidates Array of strings used for value matching.
 * @returns Record<string, { connectFrom: string[]; others: string[] }>
 */
export const mergeConnectFromByWorkload = (
  envSummary: Record<string, { refs: string[]; values: string[] }>,
  candidates: string[]
): Record<string, { connectFrom: string[]; others: string[] }> => {
  const fromRefs = processEnvRefsByWorkload(envSummary, candidates);
  const fromValues = processEnvValuesByWorkload(envSummary, candidates);

  const keys = _.union(Object.keys(fromRefs), Object.keys(fromValues));

  return keys.reduce<
    Record<string, { connectFrom: string[]; others: string[] }>
  >((acc, key) => {
    const refsPart = fromRefs[key] ?? { connectFrom: [], others: [] };
    const valsPart = fromValues[key] ?? { connectFrom: [], others: [] };

    acc[key] = {
      connectFrom: _.uniq([...refsPart.connectFrom, ...valsPart.connectFrom]),
      others: _.uniq([...refsPart.others, ...valsPart.others]),
    };
    return acc;
  }, {});
};
