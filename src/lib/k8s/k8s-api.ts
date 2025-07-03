"use server";

import {
  AppsV1Api,
  BatchV1Api,
  CoreV1Api,
  CustomObjectsApi,
  KubeConfig,
  NetworkingV1Api,
} from "@kubernetes/client-node";
import { createParallelAction } from "next-server-actions-parallel";

type ApiClients = {
  customApi: CustomObjectsApi;
  appsApi: AppsV1Api;
  batchApi: BatchV1Api;
  coreApi: CoreV1Api;
  networkingApi: NetworkingV1Api;
};

function createKubeConfig(kubeconfig: string): KubeConfig {
  const kc = new KubeConfig();
  kc.loadFromString(kubeconfig);
  return kc;
}

function createApiClients(kc: KubeConfig): ApiClients {
  return {
    customApi: kc.makeApiClient(CustomObjectsApi),
    appsApi: kc.makeApiClient(AppsV1Api),
    batchApi: kc.makeApiClient(BatchV1Api),
    coreApi: kc.makeApiClient(CoreV1Api),
    networkingApi: kc.makeApiClient(NetworkingV1Api),
  };
}

/**
 * List a custom resource in Kubernetes.
 * @param kubeconfig - The kubeconfig string.
 * @param group - The API group of the custom resource.
 * @param version - The API version of the custom resource.
 * @param namespace - The namespace to list resources in.
 * @param plural - The plural name of the custom resource.
 * @param labelSelector - Optional label selector to filter resources.
 * @returns The list of custom resources as returned by the Kubernetes client.
 */
export const listCustomResource = createParallelAction(
  async (
    kubeconfig: string,
    group: string,
    version: string,
    namespace: string,
    plural: string,
    labelSelector?: string
  ) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);
    const res = await clients.customApi.listNamespacedCustomObject({
      group,
      version,
      namespace,
      plural,
      labelSelector,
    });
    return JSON.parse(JSON.stringify(res));
  }
);

/**
 * Get a custom resource by name in Kubernetes.
 * @param kubeconfig - The kubeconfig string.
 * @param group - The API group of the custom resource.
 * @param version - The API version of the custom resource.
 * @param namespace - The namespace of the resource.
 * @param plural - The plural name of the custom resource.
 * @param name - The name of the custom resource instance.
 * @returns The custom resource object as returned by the Kubernetes client.
 */
export const getCustomResource = createParallelAction(
  async (
    kubeconfig: string,
    group: string,
    version: string,
    namespace: string,
    plural: string,
    name: string
  ) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);
    const result = await clients.customApi.getNamespacedCustomObject({
      group,
      version,
      namespace,
      plural,
      name,
    });
    return JSON.parse(JSON.stringify(result));
  }
);

/**
 * Patch a custom resource in Kubernetes.
 */
export const patchCustomResource = createParallelAction(
  async (
    kubeconfig: string,
    group: string,
    version: string,
    namespace: string,
    plural: string,
    name: string,
    patchBody: unknown[]
  ) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);
    const result = await clients.customApi.patchNamespacedCustomObject({
      group,
      version,
      namespace,
      plural,
      name,
      body: patchBody,
    });
    return JSON.parse(JSON.stringify(result));
  }
);

/**
 * Helper function to escape slashes in keys for JSON Patch paths.
 */
function escapeSlash(key: string): string {
  return key.replace(/\//g, "~1");
}

export const patchCustomResourceMetadata = createParallelAction(
  async (
    kubeconfig: string,
    group: string,
    version: string,
    namespace: string,
    plural: string,
    name: string,
    metadataType: "annotations" | "labels",
    key: string,
    value: string
  ) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);

    const encodedKey = escapeSlash(key);
    const currentResourceResult =
      await clients.customApi.getNamespacedCustomObject({
        group,
        version,
        namespace,
        plural,
        name,
      });
    const currentResource = JSON.parse(JSON.stringify(currentResourceResult));

    const patchBody = currentResource.metadata?.[metadataType]
      ? [
          {
            op: "add",
            path: `/metadata/${metadataType}/${encodedKey}`,
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

    const result = await clients.customApi.patchNamespacedCustomObject({
      group,
      version,
      namespace,
      plural,
      name,
      body: patchBody,
    });

    return {
      [metadataType]: result.metadata?.[metadataType] || {},
      success: true,
      name,
      key,
    };
  }
);

export const removeCustomResourceMetadata = createParallelAction(
  async (
    kubeconfig: string,
    group: string,
    version: string,
    namespace: string,
    plural: string,
    name: string,
    metadataType: "annotations" | "labels",
    key: string
  ) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);

    const encodedKey = escapeSlash(key);
    const patchBody = [
      { op: "remove", path: `/metadata/${metadataType}/${encodedKey}` },
    ];
    await clients.customApi.patchNamespacedCustomObject({
      group,
      version,
      namespace,
      plural,
      name,
      body: patchBody,
    });

    return {
      success: true,
      name,
      key,
    };
  }
);

/**
 * List deployments in a namespace.
 * @param kubeconfig - The kubeconfig string.
 * @param namespace - The namespace to list deployments in.
 * @param labelSelector - Optional label selector to filter deployments.
 * @returns The list of deployments as returned by the Kubernetes client.
 */
export const listDeployments = createParallelAction(
  async (kubeconfig: string, namespace: string, labelSelector?: string) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);
    const result = await clients.appsApi.listNamespacedDeployment({
      namespace,
      labelSelector,
    });
    return JSON.parse(JSON.stringify(result));
  }
);

/**
 * Get a deployment by name in a namespace.
 * @param kubeconfig - The kubeconfig string.
 * @param namespace - The namespace of the deployment.
 * @param name - The name of the deployment.
 * @returns The deployment object as returned by the Kubernetes client.
 */
export const getDeployment = createParallelAction(
  async (kubeconfig: string, namespace: string, name: string) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);
    const result = await clients.appsApi.readNamespacedDeployment({
      namespace,
      name,
    });
    return JSON.parse(JSON.stringify(result));
  }
);

export const patchDeploymentMetadata = createParallelAction(
  async (
    kubeconfig: string,
    namespace: string,
    name: string,
    metadataType: "annotations" | "labels",
    key: string,
    value: string
  ) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);

    const encodedKey = escapeSlash(key);
    const currentDeploymentResult =
      await clients.appsApi.readNamespacedDeployment({
        namespace,
        name,
      });
    const currentDeployment = JSON.parse(
      JSON.stringify(currentDeploymentResult)
    );

    const patchBody = currentDeployment.metadata?.[metadataType]
      ? [
          {
            op: "add",
            path: `/metadata/${metadataType}/${encodedKey}`,
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

    const result = await clients.appsApi.patchNamespacedDeployment({
      namespace,
      name,
      body: patchBody,
    });

    return {
      [metadataType]: result.metadata?.[metadataType] || {},
      success: true,
      name,
      key,
    };
  }
);

export const removeDeploymentMetadata = createParallelAction(
  async (
    kubeconfig: string,
    namespace: string,
    name: string,
    metadataType: "annotations" | "labels",
    key: string
  ) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);

    const encodedKey = escapeSlash(key);
    const patchBody = [
      { op: "remove", path: `/metadata/${metadataType}/${encodedKey}` },
    ];
    await clients.appsApi.patchNamespacedDeployment({
      namespace,
      name,
      body: patchBody,
    });

    return {
      success: true,
      name,
      key,
    };
  }
);

/**
 * List services in a namespace.
 * @param kubeconfig - The kubeconfig string.
 * @param namespace - The namespace to list services in.
 * @param labelSelector - Optional label selector to filter services.
 * @returns The list of services as returned by the Kubernetes client.
 */
export const listServices = createParallelAction(
  async (kubeconfig: string, namespace: string, labelSelector?: string) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);
    const result = await clients.coreApi.listNamespacedService({
      namespace,
      labelSelector,
    });
    return JSON.parse(JSON.stringify(result));
  }
);

/**
 * Get a service by name in a namespace.
 * @param kubeconfig - The kubeconfig string.
 * @param namespace - The namespace of the service.
 * @param name - The name of the service.
 * @returns The service object as returned by the Kubernetes client.
 */
export const getService = createParallelAction(
  async (kubeconfig: string, namespace: string, name: string) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);
    const result = await clients.coreApi.readNamespacedService({
      namespace,
      name,
    });
    return JSON.parse(JSON.stringify(result));
  }
);

/**
 * List ingresses in a namespace.
 * @param kubeconfig - The kubeconfig string.
 * @param namespace - The namespace to list ingresses in.
 * @param labelSelector - Optional label selector to filter ingresses.
 * @returns The list of ingresses as returned by the Kubernetes client.
 */
export const listIngresses = createParallelAction(
  async (kubeconfig: string, namespace: string, labelSelector?: string) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);
    const result = await clients.networkingApi.listNamespacedIngress({
      namespace,
      labelSelector,
    });
    return JSON.parse(JSON.stringify(result));
  }
);

/**
 * Get an ingress by name in a namespace.
 * @param kubeconfig - The kubeconfig string.
 * @param namespace - The namespace of the ingress.
 * @param name - The name of the ingress.
 * @returns The ingress object as returned by the Kubernetes client.
 */
export const getIngress = createParallelAction(
  async (kubeconfig: string, namespace: string, name: string) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);
    const result = await clients.networkingApi.readNamespacedIngress({
      namespace,
      name,
    });
    return JSON.parse(JSON.stringify(result));
  }
);
