"use server";

import { createParallelAction } from "next-server-actions-parallel";
import {
  getApiClients,
  invokeApiMethod,
  getBuiltinApiClient,
  addMissingFields,
} from "./k8s-api-utils";
import { K8sApiContext } from "./k8s-api-schemas/k8s-api-context-schemas";
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
 * Get resources owned by a specific resource (filtered by ownerReferences).
 */
export const getResourceByOwner = createParallelAction(
  async (
    context: K8sApiContext,
    resourceType: string,
    ownerKind: string,
    ownerName: string
  ) => {
    const { client, resourceConfig } = await getBuiltinApiClient(
      context.kubeconfig,
      resourceType
    );

    const resourceListResponse =
      await invokeApiMethod<BuiltinResourceListResponse>(
        client,
        resourceConfig.listMethod,
        {
          namespace: context.namespace,
        }
      );

    // Filter resources by ownerReferences
    const filteredResources = resourceListResponse.items.filter(
      (resource: any) => {
        if (!resource.metadata?.ownerReferences) return false;
        return resource.metadata.ownerReferences.some(
          (owner: any) => owner.kind === ownerKind && owner.name === ownerName
        );
      }
    );

    const result = {
      ...resourceListResponse,
      items: filteredResources,
    };

    return BuiltinResourceListResponseSchema.parse(
      JSON.parse(
        JSON.stringify(
          await addMissingFields(
            result.items,
            resourceConfig.apiVersion,
            resourceConfig.kind
          )
        )
      )
    );
  }
);
