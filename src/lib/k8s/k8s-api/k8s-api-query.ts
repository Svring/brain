"use server";

import { createParallelAction } from "next-server-actions-parallel";
import {
  getApiClients,
  invokeApiMethod,
  getBuiltinApiClient,
  addMissingFields,
} from "./k8s-api-utils";
import { K8sApiContext } from "./k8s-api-schemas/context-schemas";
import {
  BuiltinResourceTarget,
  CustomResourceTarget,
} from "./k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
  BuiltinResourceListResponse,
  CustomResourceListResponse,
  BuiltinResourceListResponseSchema,
  CustomResourceListResponseSchema,
} from "./k8s-api-schemas/req-res-schemas/res-list-schemas";
import {
  BuiltinResourceGetResponse,
  CustomResourceGetResponse,
  BuiltinResourceGetResponseSchema,
  CustomResourceGetResponseSchema,
} from "./k8s-api-schemas/req-res-schemas/res-get-schemas";

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
    return CustomResourceListResponseSchema.parse(
      JSON.parse(JSON.stringify(customResourceListResponse))
    );
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
    return CustomResourceGetResponseSchema.parse(
      JSON.parse(JSON.stringify(customResourceGetResponse))
    );
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

    return BuiltinResourceListResponseSchema.parse(
      JSON.parse(
        JSON.stringify(
          await addMissingFields(
            builtinResourceListResponse.items,
            resourceConfig.apiVersion,
            resourceConfig.kind
          )
        )
      )
    );
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

    return BuiltinResourceGetResponseSchema.parse(
      JSON.parse(JSON.stringify(builtinResourceGetResponse))
    );
  }
);

/**
 * Get pods owned by a specific resource (filtered by ownerReferences).
 */
export const getPodsByOwnerReference = createParallelAction(
  async (context: K8sApiContext, ownerKind: string, ownerName: string) => {
    const { client } = await getBuiltinApiClient(context.kubeconfig, "pod");

    const podListResponse = await invokeApiMethod<BuiltinResourceListResponse>(
      client,
      "listNamespacedPod",
      {
        namespace: context.namespace,
      }
    );

    // Filter pods by ownerReferences
    const filteredPods = podListResponse.items.filter((pod: any) => {
      if (!pod.metadata?.ownerReferences) return false;
      return pod.metadata.ownerReferences.some(
        (owner: any) => owner.kind === ownerKind && owner.name === ownerName
      );
    });

    const result = {
      ...podListResponse,
      items: filteredPods,
    };

    return BuiltinResourceListResponseSchema.parse(
      JSON.parse(
        JSON.stringify(await addMissingFields(result.items, "v1", "Pod"))
      )
    );
  }
);

/**
 * Get secrets owned by a specific resource (filtered by ownerReferences).
 */
export const getSecretsByOwnerReference = createParallelAction(
  async (context: K8sApiContext, ownerKind: string, ownerName: string) => {
    const { client } = await getBuiltinApiClient(context.kubeconfig, "secret");

    const secretListResponse =
      await invokeApiMethod<BuiltinResourceListResponse>(
        client,
        "listNamespacedSecret",
        {
          namespace: context.namespace,
        }
      );

    // Filter secrets by ownerReferences
    const filteredSecrets = secretListResponse.items.filter((secret: any) => {
      if (!secret.metadata?.ownerReferences) return false;
      return secret.metadata.ownerReferences.some(
        (owner: any) => owner.kind === ownerKind && owner.name === ownerName
      );
    });

    const result = {
      ...secretListResponse,
      items: filteredSecrets,
    };

    return BuiltinResourceListResponseSchema.parse(
      JSON.parse(
        JSON.stringify(await addMissingFields(result.items, "v1", "Secret"))
      )
    );
  }
);
