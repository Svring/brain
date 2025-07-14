"use client";

import _ from "lodash";
import type { ResourceConfig } from "./k8s-constant";
import { RESOURCES } from "./k8s-constant";
import type {
  AnyKubernetesResource,
  K8sApiContext,
  ResourceTarget,
} from "./schemas";
import { K8sApiContextSchema } from "./schemas";
import { useAuthContext } from "@/contexts/auth-context";

function getUserKubeconfig(): string | undefined {
  const { auth } = useAuthContext();
  return auth?.kubeconfig;
}

export function getDecodedKubeconfig(): string {
  const kc = getUserKubeconfig();
  if (!kc) {
    throw new Error("Kubeconfig not available");
  }
  return decodeURIComponent(kc);
}

export function getCurrentNamespace(): string | undefined {
  const { auth } = useAuthContext();
  return auth?.namespace;
}

// Filter function to remove resource types with empty items arrays
export const filterEmptyResources = (
  data: Record<string, { items: AnyKubernetesResource[] }>
): Record<string, { items: AnyKubernetesResource[] }> =>
  _.pickBy(data, (resourceData) => resourceData?.items?.length > 0);

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
): ResourceTarget[] =>
  _.compact(
    _.flatMap(data, (resourceData, resourceName) => {
      const config = RESOURCES[resourceName as keyof typeof RESOURCES];
      return config && resourceData?.items
        ? _.map(resourceData.items, (resource) =>
            convertToResourceTarget(resource, config)
          )
        : [];
    })
  );

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
): EnvironmentVariable[] => _.flatMap(containers, (c) => c.env ?? []);

/**
 * Extract environment variables from StatefulSet and Deployment resources.
 * Returns a simplified structure for easier processing.
 */
export const extractEnvironmentVariables = (
  resources: Record<string, { items: AnyKubernetesResource[] }>
): Record<string, Record<string, EnvironmentVariable[]>> => {
  const processWorkload = (workload: AnyKubernetesResource) => {
    const name = workload?.metadata?.name;
    if (!name) {
      return null;
    }

    const allEnvs = [
      // @ts-expect-error — spec is loosely typed for generic Kubernetes resources
      ...getContainerEnvs(workload?.spec?.template?.spec?.containers),
      // @ts-expect-error — spec is loosely typed for generic Kubernetes resources
      ...getContainerEnvs(workload?.spec?.template?.spec?.initContainers),
    ];

    return _.isEmpty(allEnvs) ? null : { [name]: allEnvs };
  };

  return _.pickBy(
    _.mapValues(
      _.pick(resources, ["statefulset", "deployment"]),
      (resourceData) =>
        _.assign({}, ..._.compact(_.map(resourceData?.items, processWorkload)))
    ),
    (workloads) => !_.isEmpty(workloads)
  );
};

/**
 * Collect literal env values and referenced secret/configMap names.
 */
export const collectEnv = (
  envs: EnvironmentVariable[]
): { refs: string[]; values: string[] } => {
  const { refs, values } = _.groupBy(envs, (env) =>
    env.value !== undefined ? "values" : "refs"
  );

  return {
    refs: _.uniq(
      _.compact(
        _.flatMap(refs || [], (env) => {
          const vf = env.valueFrom as {
            secretKeyRef?: { name?: string };
            configMapKeyRef?: { name?: string };
          };
          return _.compact([vf?.secretKeyRef?.name, vf?.configMapKeyRef?.name]);
        })
      )
    ),
    values: _.uniq(_.compact(_.map(values || [], "value"))),
  };
};

/**
 * Apply `collectEnv` to each workload's env array.
 */
export const collectEnvByWorkload = (
  envsByKind: Record<string, Record<string, EnvironmentVariable[]>>
): Record<string, Record<string, { refs: string[]; values: string[] }>> =>
  _.mapValues(envsByKind, (workloads) => _.mapValues(workloads, collectEnv));

/**
 * Extract the `metadata.name` from Kubernetes resources grouped by kind.
 */
export const extractResourceNames = (
  resources: Record<string, { items: AnyKubernetesResource[] }>
): Record<string, string[]> =>
  _.mapValues(resources, (value) =>
    _.uniq(_.compact(_.map(value?.items, "metadata.name")))
  );

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
 * For each env value, only the longest matching candidate is included
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
      const allMatches = _.uniq(
        _.compact(
          _.flatMap([...refs, ...values], (v) =>
            _.maxBy(
              _.filter(_.flatMap(candidatesByKind), (c) => v.includes(c)),
              "length"
            )
          )
        )
      );

      const connectFrom = _.pickBy(
        _.mapValues(candidatesByKind, (names) =>
          _.intersection(names, allMatches)
        ),
        (arr) => (arr as string[]).length > 0
      ) as KindMap;

      const others = _.pickBy(
        _.mapValues(candidatesByKind, (names) =>
          _.difference(names, allMatches)
        ),
        (arr) => (arr as string[]).length > 0
      ) as KindMap;

      return { connectFrom, others } as WorkloadConnections;
    })
  ) as ConnectionsByKind;

/**
 * Process ingress resources to establish connections to workload resources.
 * Ingress resources always have a workload resource with the same name.
 */
export const processIngressConnections = (
  resources: Record<string, { items: AnyKubernetesResource[] }>
): ConnectionsByKind => {
  const ingressResources = resources.ingress?.items || [];
  if (_.isEmpty(ingressResources)) {
    return {};
  }

  const workloadsByKind = _.mapValues(
    _.pick(resources, ["deployment", "statefulset"]),
    (resourceData) => _.compact(_.map(resourceData?.items, "metadata.name"))
  );

  return {
    ingress: _.fromPairs(
      _.compact(
        _.map(ingressResources, (ingress) => {
          const ingressName = ingress.metadata.name;
          if (!ingressName) {
            return null;
          }

          // Find workload with same name as ingress
          const connectFrom = _.pickBy(
            _.mapValues(workloadsByKind, (names) =>
              names.includes(ingressName) ? [ingressName] : []
            ),
            (matches) => matches.length > 0
          );

          return [ingressName, { connectFrom, others: {} }];
        })
      )
    ),
  };
};

/**
 * Helper function to create K8s API context from user data
 */
export function createK8sContext(): K8sApiContext {
  return K8sApiContextSchema.parse({
    namespace: getCurrentNamespace(),
    kubeconfig: getDecodedKubeconfig(),
  });
}
