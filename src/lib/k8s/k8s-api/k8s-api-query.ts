"use server";

import { createParallelAction } from "next-server-actions-parallel";
import {
  getApiClients,
  invokeApiMethod,
  getBuiltinApiClient,
} from "./k8s-api-utils";
import { K8sApiContext } from "./k8s-api-schemas/context-schemas";
import {
  BuiltinResourceTarget,
  CustomResourceTarget,
} from "./k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
  BuiltinResourceListResponse,
  CustomResourceListResponse,
} from "./k8s-api-schemas/req-res-schemas/res-list-schemas";
import {
  BuiltinResourceGetResponse,
  CustomResourceGetResponse,
} from "./k8s-api-schemas/req-res-schemas/res-get-schemas";
import { BUILTIN_RESOURCES } from "../k8s-constant/k8s-constant-builtin-resource";
import { CUSTOM_RESOURCES } from "../k8s-constant/k8s-constant-custom-resource";
import _ from "lodash";

/**
 * List custom resources in Kubernetes.
 */
export const listCustomResources = createParallelAction(
  async (context: K8sApiContext, target: CustomResourceTarget) => {
    const { clients } = await getApiClients(context.kubeconfig);
    const customResourceListResponse =
      await invokeApiMethod<CustomResourceListResponse>(
        clients.customApi,
        "listNamespacedCustomObject",
        {
          group: target.group,
          version: target.version,
          namespace: context.namespace,
          plural: target.plural,
          labelSelector: target.labelSelector,
        }
      );
    return customResourceListResponse;
  }
);

/**
 * Get a custom resource by name in Kubernetes.
 */
export const getCustomResource = createParallelAction(
  async (context: K8sApiContext, target: CustomResourceTarget) => {
    const { clients } = await getApiClients(context.kubeconfig);
    const customResourceGetResponse =
      await invokeApiMethod<CustomResourceGetResponse>(
        clients.customApi,
        "getNamespacedCustomObject",
        {
          group: target.group,
          version: target.version,
          namespace: context.namespace,
          plural: target.plural,
          name: target.name,
        }
      );
    return customResourceGetResponse;
  }
);

/**
 * List builtin Kubernetes resources dynamically based on resource type.
 */
export const listBuiltinResources = createParallelAction(
  async (context: K8sApiContext, target: BuiltinResourceTarget) => {
    const { client, resourceConfig } = await getBuiltinApiClient(
      context.kubeconfig,
      target.resourceType
    );

    const builtinResourceListResponse =
      await invokeApiMethod<BuiltinResourceListResponse>(
        client,
        resourceConfig.listMethod,
        {
          namespace: context.namespace,
          labelSelector: target.labelSelector,
        }
      );

    return builtinResourceListResponse;
  }
);

/**
 * Get a builtin Kubernetes resource by name dynamically based on resource type.
 */
export const getBuiltinResource = createParallelAction(
  async (context: K8sApiContext, target: BuiltinResourceTarget) => {
    const { client, resourceConfig } = await getBuiltinApiClient(
      context.kubeconfig,
      target.resourceType
    );

    const builtinResourceGetResponse =
      await invokeApiMethod<BuiltinResourceGetResponse>(
        client,
        resourceConfig.getMethod,
        {
          namespace: context.namespace,
          name: target.name,
        }
      );

    return builtinResourceGetResponse;
  }
);

/**
 * List all resources (both custom and builtin) in parallel.
 */
export const listAllResources = createParallelAction(
  async (context: K8sApiContext, labelSelector?: string) => {
    // Prepare builtin resource promises
    const builtinPromises = _.map(BUILTIN_RESOURCES, (config, name) =>
      listBuiltinResources(context, {
        type: "builtin",
        resourceType: config.resourceType,
        labelSelector,
      }).then((result) => [name, result])
    );

    // Prepare custom resource promises
    const customPromises = _.map(CUSTOM_RESOURCES, (config, name) =>
      listCustomResources(context, {
        type: "custom",
        group: config.group,
        version: config.version,
        plural: config.plural,
        labelSelector,
      }).then((result) => [name, result])
    );

    // Execute all promises in parallel
    const [builtinResults, customResults] = await Promise.all([
      Promise.all(builtinPromises),
      Promise.all(customPromises),
    ]);

    return {
      builtin: _.fromPairs(builtinResults),
      custom: _.fromPairs(customResults),
    };
  }
);
