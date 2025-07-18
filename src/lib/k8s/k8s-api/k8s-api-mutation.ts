"use server";

import { createParallelAction } from "next-server-actions-parallel";
import { load } from "js-yaml";
import {
  getApiClients,
  invokeApiMethod,
  getBuiltinApiClient,
  escapeSlash,
} from "./k8s-api-utils";
import { K8sApiContext } from "./k8s-api-schemas/context-schemas";
import {
  BuiltinResourceTarget,
  CustomResourceTarget,
} from "./k8s-api-schemas/req-res-schemas/req-target-schemas";
import _ from "lodash";
import { Operation } from "fast-json-patch";
import {
  BuiltinResourceGetResponse,
  CustomResourceGetResponse,
} from "./k8s-api-schemas/req-res-schemas/res-get-schemas";
import {
  BuiltinResourceDeleteResponse,
  CustomResourceDeleteResponse,
} from "./k8s-api-schemas/req-res-schemas/res-delete-schemas";
import {
  BuiltinResourcePatchResponse,
  CustomResourcePatchResponse,
} from "./k8s-api-schemas/req-res-schemas/res-patch-schemas";
import {
  CustomResourceListResponse,
  BuiltinResourceListResponse,
} from "./k8s-api-schemas/req-res-schemas/res-list-schemas";

/**
 * Delete a custom resource by name in Kubernetes.
 */
export const deleteCustomResource = createParallelAction(
  async (context: K8sApiContext, target: CustomResourceTarget) => {
    const { clients } = await getApiClients(context.kubeconfig);

    if (_.isNil(target.name)) {
      throw new Error("Resource name is required for deletion");
    }

    const result = await invokeApiMethod<CustomResourceDeleteResponse>(
      clients.customApi,
      "deleteNamespacedCustomObject",
      {
        group: target.group,
        version: target.version,
        namespace: context.namespace,
        plural: target.plural,
        name: target.name,
      }
    );
    return JSON.parse(JSON.stringify(result));
  }
);

/**
 * Delete a builtin resource by name in Kubernetes.
 */
export const deleteBuiltinResource = createParallelAction(
  async (context: K8sApiContext, target: BuiltinResourceTarget) => {
    const { client, resourceConfig } = await getBuiltinApiClient(
      context.kubeconfig,
      target.resourceType
    );

    if (_.isNil(target.name)) {
      throw new Error("Resource name is required for deletion");
    }

    const result = await invokeApiMethod<BuiltinResourceDeleteResponse>(
      client,
      resourceConfig.deleteMethod,
      {
        namespace: context.namespace,
        name: target.name,
        propagationPolicy: "Foreground",
      }
    );
    return JSON.parse(JSON.stringify(result));
  }
);

/**
 * Patch custom resource metadata (annotations or labels).
 */
export const patchCustomResourceMetadata = createParallelAction(
  async (
    context: K8sApiContext,
    target: CustomResourceTarget,
    metadataType: "annotations" | "labels",
    key: string,
    value: string
  ) => {
    const { clients } = await getApiClients(context.kubeconfig);

    if (_.isNil(target.name)) {
      throw new Error("Resource name is required for metadata patching");
    }

    // Get current resource to check if metadata field exists
    const currentResource = await invokeApiMethod<CustomResourceGetResponse>(
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

    const patchBody = currentResource.metadata?.[metadataType]
      ? [
          {
            op: "add",
            path: `/metadata/${metadataType}/${await escapeSlash(key)}`,
            value,
          },
        ]
      : [
          {
            op: "add",
            path: `/metadata/${metadataType}`,
            value: { [key]: value },
          },
        ];

    const result = await invokeApiMethod<CustomResourcePatchResponse>(
      clients.customApi,
      "patchNamespacedCustomObject",
      {
        group: target.group,
        version: target.version,
        namespace: context.namespace,
        plural: target.plural,
        name: target.name,
        body: patchBody,
      }
    );

    return JSON.parse(JSON.stringify(result));
  }
);

/**
 * Remove custom resource metadata (annotations or labels).
 */
export const removeCustomResourceMetadata = createParallelAction(
  async (
    context: K8sApiContext,
    target: CustomResourceTarget,
    metadataType: "annotations" | "labels",
    key: string
  ) => {
    const { clients } = await getApiClients(context.kubeconfig);

    if (_.isNil(target.name)) {
      throw new Error("Resource name is required for metadata removal");
    }

    const patchBody = [
      {
        op: "remove",
        path: `/metadata/${metadataType}/${await escapeSlash(key)}`,
      },
    ];

    const result = await invokeApiMethod<CustomResourcePatchResponse>(
      clients.customApi,
      "patchNamespacedCustomObject",
      {
        group: target.group,
        version: target.version,
        namespace: context.namespace,
        plural: target.plural,
        name: target.name,
        body: patchBody,
      }
    );

    return JSON.parse(JSON.stringify(result));
  }
);

/**
 * Patch builtin resource metadata (annotations or labels).
 */
export const patchBuiltinResourceMetadata = createParallelAction(
  async (
    context: K8sApiContext,
    target: BuiltinResourceTarget,
    metadataType: "annotations" | "labels",
    key: string,
    value: string
  ) => {
    const { client, resourceConfig } = await getBuiltinApiClient(
      context.kubeconfig,
      target.resourceType
    );

    if (_.isNil(target.name)) {
      throw new Error("Resource name is required for metadata patching");
    }

    // Get current resource to check if metadata field exists
    const currentResource = await invokeApiMethod<BuiltinResourceGetResponse>(
      client,
      resourceConfig.getMethod,
      {
        namespace: context.namespace,
        name: target.name,
      }
    );

    const patchBody = currentResource.metadata?.[metadataType]
      ? [
          {
            op: "add",
            path: `/metadata/${metadataType}/${await escapeSlash(key)}`,
            value,
          },
        ]
      : [
          {
            op: "add",
            path: `/metadata/${metadataType}`,
            value: { [key]: value },
          },
        ];

    const result = await invokeApiMethod<BuiltinResourcePatchResponse>(
      client,
      resourceConfig.patchMethod,
      {
        namespace: context.namespace,
        name: target.name,
        body: patchBody,
      }
    );

    return JSON.parse(JSON.stringify(result));
  }
);

/**
 * Remove builtin resource metadata (annotations or labels).
 */
export const removeBuiltinResourceMetadata = createParallelAction(
  async (
    context: K8sApiContext,
    target: BuiltinResourceTarget,
    metadataType: "annotations" | "labels",
    key: string
  ) => {
    const { client, resourceConfig } = await getBuiltinApiClient(
      context.kubeconfig,
      target.resourceType
    );

    if (_.isNil(target.name)) {
      throw new Error("Resource name is required for metadata removal");
    }

    const patchBody = [
      {
        op: "remove",
        path: `/metadata/${metadataType}/${await escapeSlash(key)}`,
      },
    ];

    const result = await invokeApiMethod<BuiltinResourcePatchResponse>(
      client,
      resourceConfig.patchMethod,
      {
        namespace: context.namespace,
        name: target.name,
        body: patchBody,
      }
    );

    return JSON.parse(JSON.stringify(result));
  }
);

/**
 * Delete builtin resources by label selector.
 */
export const deleteBuiltinResourcesByLabelSelector = createParallelAction(
  async (
    context: K8sApiContext,
    target: BuiltinResourceTarget & { labelSelector: string }
  ) => {
    const { client, resourceConfig } = await getBuiltinApiClient(
      context.kubeconfig,
      target.resourceType
    );

    if (_.isNil(resourceConfig.deleteCollectionMethod)) {
      // Fall back to individual deletion for resources that don't support bulk deletion
      // First, list all resources matching the label selector
      const listResult = await invokeApiMethod<BuiltinResourceListResponse>(
        client,
        resourceConfig.listMethod,
        {
          namespace: context.namespace,
          labelSelector: target.labelSelector,
        }
      );

      const items = listResult.items || [];

      if (_.isEmpty(items)) {
        return { deletedCount: 0, results: [] };
      }

      // Delete each resource individually with parallel processing
      const deletePromises = items.map((item: any, index: number) => {
        const resourceName = item.metadata?.name || "unknown";

        return invokeApiMethod<BuiltinResourceDeleteResponse>(
          client,
          resourceConfig.deleteMethod,
          {
            namespace: context.namespace,
            name: resourceName,
            propagationPolicy: "Foreground",
          }
        )
          .then((result) => {
            return JSON.parse(JSON.stringify(result));
          })
          .catch((error) => {
            throw error;
          });
      });

      const results = await Promise.allSettled(deletePromises);
      const deletedCount = results.filter(
        (r: any) => r.status === "fulfilled"
      ).length;
      const failedCount = results.filter(
        (r: any) => r.status === "rejected"
      ).length;

      // Convert results to plain objects to avoid serialization issues
      const plainResults = results.map((result) => {
        if (result.status === "fulfilled") {
          return {
            status: "fulfilled",
            value: result.value
              ? JSON.parse(JSON.stringify(result.value))
              : null,
          };
        } else {
          return {
            status: "rejected",
            reason: {
              message: result.reason?.message || "Unknown error",
              name: result.reason?.name || "Error",
            },
          };
        }
      });

      return { deletedCount, results: plainResults };
    }

    const result = await invokeApiMethod<BuiltinResourceDeleteResponse>(
      client,
      resourceConfig.deleteCollectionMethod,
      {
        namespace: context.namespace,
        labelSelector: target.labelSelector,
      }
    );

    return JSON.parse(JSON.stringify(result));
  }
);

/**
 * Delete custom resources by label selector.
 */
export const deleteCustomResourcesByLabelSelector = createParallelAction(
  async (context: K8sApiContext, target: CustomResourceTarget) => {
    const { clients } = await getApiClients(context.kubeconfig);

    // First, list all resources matching the label selector
    const listResult = await invokeApiMethod<CustomResourceListResponse>(
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

    const items = listResult.items || [];

    if (_.isEmpty(items)) {
      return [];
    }

    // Delete each resource individually with parallel processing
    const deletePromises = items.map((item: any) => {
      const resourceName = item.metadata?.name || "unknown";

      return invokeApiMethod<CustomResourceDeleteResponse>(
        clients.customApi,
        "deleteNamespacedCustomObject",
        {
          group: target.group,
          version: target.version,
          namespace: context.namespace,
          plural: target.plural,
          name: resourceName,
        }
      )
        .then((result) => {
          return JSON.parse(JSON.stringify(result));
        })
        .catch((error) => {
          throw error;
        });
    });

    const results = await Promise.allSettled(deletePromises);
    const deletedCount = results.filter(
      (r: any) => r.status === "fulfilled"
    ).length;
    const failedCount = results.filter(
      (r: any) => r.status === "rejected"
    ).length;

    // Convert results to plain objects to avoid serialization issues
    const plainResults = results.map((result) => {
      if (result.status === "fulfilled") {
        return {
          status: "fulfilled",
          value: result.value ? JSON.parse(JSON.stringify(result.value)) : null,
        };
      } else {
        return {
          status: "rejected",
          reason: {
            message: result.reason?.message || "Unknown error",
            name: result.reason?.name || "Error",
          },
        };
      }
    });

    return plainResults;
  }
);

/**
 * Apply YAML for instance kind custom resources.
 * This function parses YAML content and creates or updates the instance custom resource.
 */
export const applyInstanceYaml = createParallelAction(
  async (context: K8sApiContext, yamlContent: string) => {
    const { clients } = await getApiClients(context.kubeconfig);

    // Parse YAML content
    const resource = load(yamlContent) as Record<string, unknown>;
    const { name } = resource.metadata as { name: string };

    if (_.isNil(name)) {
      throw new Error("Resource name is required in YAML metadata");
    }

    try {
      // Try to get the existing resource
      await invokeApiMethod<CustomResourceGetResponse>(
        clients.customApi,
        "getNamespacedCustomObject",
        {
          group: "app.sealos.io",
          version: "v1",
          namespace: context.namespace,
          plural: "instances",
          name,
        }
      );

      // If found, update it
      const result = await invokeApiMethod<CustomResourcePatchResponse>(
        clients.customApi,
        "replaceNamespacedCustomObject",
        {
          group: "app.sealos.io",
          version: "v1",
          namespace: context.namespace,
          plural: "instances",
          name,
          body: resource,
        }
      );

      return JSON.parse(JSON.stringify(result));
    } catch (error: unknown) {
      // Assume resource doesn't exist, create it
      const result = await invokeApiMethod<CustomResourcePatchResponse>(
        clients.customApi,
        "createNamespacedCustomObject",
        {
          group: "app.sealos.io",
          version: "v1",
          namespace: context.namespace,
          plural: "instances",
          body: resource,
        }
      );

      return JSON.parse(JSON.stringify(result));
    }
  }
);

/**
 * Patch a custom resource with arbitrary patch operations.
 */
export const patchCustomResource = createParallelAction(
  async (
    context: K8sApiContext,
    target: CustomResourceTarget,
    patchBody: Operation[]
  ) => {
    const { clients } = await getApiClients(context.kubeconfig);

    if (_.isNil(target.name)) {
      throw new Error("Resource name is required for patching");
    }

    const result = await invokeApiMethod<CustomResourcePatchResponse>(
      clients.customApi,
      "patchNamespacedCustomObject",
      {
        group: target.group,
        version: target.version,
        namespace: context.namespace,
        plural: target.plural,
        name: target.name,
        body: patchBody,
      }
    );

    return JSON.parse(JSON.stringify(result));
  }
);

/**
 * Patch a builtin resource with arbitrary patch operations.
 */
export const patchBuiltinResource = createParallelAction(
  async (
    context: K8sApiContext,
    target: BuiltinResourceTarget,
    patchBody: Operation[]
  ) => {
    const { client, resourceConfig } = await getBuiltinApiClient(
      context.kubeconfig,
      target.resourceType
    );

    if (_.isNil(target.name)) {
      throw new Error("Resource name is required for patching");
    }

    const result = await invokeApiMethod<BuiltinResourcePatchResponse>(
      client,
      resourceConfig.patchMethod,
      {
        namespace: context.namespace,
        name: target.name,
        body: patchBody,
      }
    );

    return JSON.parse(JSON.stringify(result));
  }
);
