"use server";

import {
  AppsV1Api,
  AutoscalingV2Api,
  BatchV1Api,
  CoreV1Api,
  CustomObjectsApi,
  KubeConfig,
  NetworkingV1Api,
  RbacAuthorizationV1Api,
} from "@kubernetes/client-node";
import {
  BUILTIN_RESOURCES,
  type BuiltinResourceConfig,
} from "../k8s-constant/k8s-constant-builtin-resource";
import { K8sApiClients } from "../k8s-constant/k8s-constant-client";
import _ from "lodash";

/**
 * Get the current namespace from a kubeconfig string.
 * @param kubeconfig - The kubeconfig string.
 * @returns The current namespace, or 'default' if not set.
 */
export async function getCurrentNamespace(
  kubeconfig: string
): Promise<string | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  const kc = new KubeConfig();
  kc.loadFromString(kubeconfig);
  const currentContext = kc.getCurrentContext();
  const contextObj = kc.getContextObject(currentContext);
  return contextObj?.namespace;
}

/**
 * Helper to add missing apiVersion and kind to builtin resource lists.
 */
export function addMissingFields<T extends Record<string, unknown>>(
  items: T[],
  apiVersion: string,
  kind: string
) {
  return {
    apiVersion: `${apiVersion}List`,
    kind: `${kind}List`,
    items: items.map((item) => ({
      apiVersion,
      kind,
      ...item,
    })),
  };
}

const clientCache: Record<string, { kc: KubeConfig; clients: K8sApiClients }> =
  {};

export function getApiClients(kubeconfig: string): {
  kc: KubeConfig;
  clients: K8sApiClients;
} {
  if (_.has(clientCache, kubeconfig)) {
    return _.get(clientCache, kubeconfig);
  }
  const kc = new KubeConfig();
  kc.loadFromString(kubeconfig);
  const clients: K8sApiClients = {
    customApi: kc.makeApiClient(CustomObjectsApi),
    appsApi: kc.makeApiClient(AppsV1Api),
    autoscalingApi: kc.makeApiClient(AutoscalingV2Api),
    batchApi: kc.makeApiClient(BatchV1Api),
    coreApi: kc.makeApiClient(CoreV1Api),
    networkingApi: kc.makeApiClient(NetworkingV1Api),
    rbacApi: kc.makeApiClient(RbacAuthorizationV1Api),
  };
  _.set(clientCache, kubeconfig, { kc, clients });
  return { kc, clients };
}

/**
 * Type-safe method invoker for API clients
 */
export async function invokeApiMethod<T>(
  client: K8sApiClients[keyof K8sApiClients],
  methodName: string,
  params: Record<string, unknown> | unknown[] = {}
): Promise<T> {
  if (!_.isObject(client)) {
    throw new Error("Client must be a valid API client object");
  }
  if (!_.isString(methodName) || _.isEmpty(methodName)) {
    throw new Error("Method name must be a non-empty string");
  }
  if (!_.isObject(params) && !_.isArray(params)) {
    throw new Error("Params must be an object or array");
  }

  const method = _.get(client, methodName);
  if (!_.isFunction(method)) {
    throw new Error(
      `Method ${methodName} not found or not a function on client: ${JSON.stringify(
        client
      )}`
    );
  }

  const args = _.isArray(params) ? params : [params];

  const result = await _.attempt(async () => method.call(client, ...args));
  if (_.isError(result)) {
    throw new Error(`Failed to invoke ${methodName}: ${result.message}`);
  }

  return result as T;
}

/**
 * Get the correct API client for a builtin resource type, given kubeconfig and resourceType.
 */
export function getBuiltinApiClient(
  kubeconfig: string,
  resourceType: string
): {
  client: K8sApiClients[keyof K8sApiClients];
  resourceConfig: BuiltinResourceConfig;
} {
  const { clients } = getApiClients(kubeconfig);
  const resourceConfig = BUILTIN_RESOURCES[
    resourceType
  ] as BuiltinResourceConfig;
  if (_.isNil(resourceConfig)) {
    throw new Error(`Unknown builtin resource type: ${resourceType}`);
  }
  return {
    client: clients[resourceConfig.apiClient as keyof K8sApiClients],
    resourceConfig,
  };
}

/**
 * Helper function to escape slashes in keys for JSON Patch paths
 */
export function escapeSlash(key: string): string {
  return key.replace(/\//g, "~1");
}

/**
 * Helper function to invalidate resource queries for both custom and builtin resources
 */
export function invalidateResourceQueries(
  queryClient: any,
  context: { namespace: string },
  target: any
) {
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
