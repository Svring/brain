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
 * List custom resources in Kubernetes.
 */
export const listCustomResources = createParallelAction(
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
 * Delete a custom resource by name in Kubernetes.
 */
export const deleteCustomResource = createParallelAction(
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
    const result = await clients.customApi.deleteNamespacedCustomObject({
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

/**
 * Delete a deployment by name in a namespace.
 * @param kubeconfig - The kubeconfig string.
 * @param namespace - The namespace of the deployment.
 * @param name - The name of the deployment.
 * @returns The deletion result as returned by the Kubernetes client.
 */
export const deleteDeployment = createParallelAction(
  async (kubeconfig: string, namespace: string, name: string) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);
    const result = await clients.appsApi.deleteNamespacedDeployment({
      namespace,
      name,
      propagationPolicy: "Foreground",
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
 * Delete a service by name in a namespace.
 * @param kubeconfig - The kubeconfig string.
 * @param namespace - The namespace of the service.
 * @param name - The name of the service.
 * @returns The deletion result as returned by the Kubernetes client.
 */
export const deleteService = createParallelAction(
  async (kubeconfig: string, namespace: string, name: string) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);
    const result = await clients.coreApi.deleteNamespacedService({
      namespace,
      name,
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

/**
 * Delete an ingress by name in a namespace.
 * @param kubeconfig - The kubeconfig string.
 * @param namespace - The namespace of the ingress.
 * @param name - The name of the ingress.
 * @returns The deletion result as returned by the Kubernetes client.
 */
export const deleteIngress = createParallelAction(
  async (kubeconfig: string, namespace: string, name: string) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);
    const result = await clients.networkingApi.deleteNamespacedIngress({
      namespace,
      name,
    });
    return JSON.parse(JSON.stringify(result));
  }
);

/**
 * Get the current namespace from a kubeconfig string.
 * @param kubeconfig - The kubeconfig string.
 * @returns The current namespace, or 'default' if not set.
 */
export const getCurrentNamespaceFromKubeconfig = createParallelAction(
  async (kubeconfig: string) => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    const kc = createKubeConfig(kubeconfig);
    const currentContext = kc.getCurrentContext();
    const contextObj = kc.getContextObject(currentContext);
    return contextObj?.namespace;
  }
);

/**
 * Generalized function to list builtin Kubernetes resources.
 */
export const listBuiltinResources = createParallelAction(
  async (
    kubeconfig: string,
    namespace: string,
    resourceType: string,
    labelSelector?: string
  ) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);

    switch (resourceType) {
      case "deployment": {
        const res = await clients.appsApi.listNamespacedDeployment({
          namespace,
          labelSelector,
        });
        return JSON.parse(JSON.stringify(res));
      }
      case "service": {
        const res = await clients.coreApi.listNamespacedService({
          namespace,
          labelSelector,
        });
        return JSON.parse(JSON.stringify(res));
      }
      case "ingress": {
        const res = await clients.networkingApi.listNamespacedIngress({
          namespace,
          labelSelector,
        });
        return JSON.parse(JSON.stringify(res));
      }
      case "statefulset": {
        const res = await clients.appsApi.listNamespacedStatefulSet({
          namespace,
          labelSelector,
        });
        return JSON.parse(JSON.stringify(res));
      }
      case "daemonset": {
        const res = await clients.appsApi.listNamespacedDaemonSet({
          namespace,
          labelSelector,
        });
        return JSON.parse(JSON.stringify(res));
      }
      case "configmap": {
        const res = await clients.coreApi.listNamespacedConfigMap({
          namespace,
          labelSelector,
        });
        return JSON.parse(JSON.stringify(res));
      }
      case "secret": {
        const res = await clients.coreApi.listNamespacedSecret({
          namespace,
          labelSelector,
        });
        return JSON.parse(JSON.stringify(res));
      }
      case "pod": {
        const res = await clients.coreApi.listNamespacedPod({
          namespace,
          labelSelector,
        });
        return JSON.parse(JSON.stringify(res));
      }
      case "pvc": {
        const res = await clients.coreApi.listNamespacedPersistentVolumeClaim({
          namespace,
          labelSelector,
        });
        return JSON.parse(JSON.stringify(res));
      }
      default:
        throw new Error(`Unsupported builtin resource type: ${resourceType}`);
    }
  }
);

/**
 * Generalized function to get a builtin Kubernetes resource by name.
 */
export const getBuiltinResource = createParallelAction(
  async (
    kubeconfig: string,
    namespace: string,
    resourceType: string,
    name: string
  ) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);
    switch (resourceType) {
      case "deployment": {
        const res = await clients.appsApi.readNamespacedDeployment({
          namespace,
          name,
        });
        return JSON.parse(JSON.stringify(res));
      }
      case "service": {
        const res = await clients.coreApi.readNamespacedService({
          namespace,
          name,
        });
        return JSON.parse(JSON.stringify(res));
      }
      case "ingress": {
        const res = await clients.networkingApi.readNamespacedIngress({
          namespace,
          name,
        });
        return JSON.parse(JSON.stringify(res));
      }
      case "statefulset": {
        const res = await clients.appsApi.readNamespacedStatefulSet({
          namespace,
          name,
        });
        return JSON.parse(JSON.stringify(res));
      }
      case "daemonset": {
        const res = await clients.appsApi.readNamespacedDaemonSet({
          namespace,
          name,
        });
        return JSON.parse(JSON.stringify(res));
      }
      case "configmap": {
        const res = await clients.coreApi.readNamespacedConfigMap({
          namespace,
          name,
        });
        return JSON.parse(JSON.stringify(res));
      }
      case "secret": {
        const res = await clients.coreApi.readNamespacedSecret({
          namespace,
          name,
        });
        return JSON.parse(JSON.stringify(res));
      }
      case "pod": {
        const res = await clients.coreApi.readNamespacedPod({
          namespace,
          name,
        });
        return JSON.parse(JSON.stringify(res));
      }
      case "pvc": {
        const res = await clients.coreApi.readNamespacedPersistentVolumeClaim({
          namespace,
          name,
        });
        return JSON.parse(JSON.stringify(res));
      }
      default:
        throw new Error(`Unsupported builtin resource type: ${resourceType}`);
    }
  }
);

/**
 * Generalized function to delete a builtin Kubernetes resource by name.
 */
export const deleteBuiltinResource = createParallelAction(
  async (
    kubeconfig: string,
    namespace: string,
    resourceType: string,
    name: string
  ) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);
    switch (resourceType) {
      case "deployment": {
        const res = await clients.appsApi.deleteNamespacedDeployment({
          namespace,
          name,
          propagationPolicy: "Foreground",
        });
        return JSON.parse(JSON.stringify(res));
      }
      case "service": {
        const res = await clients.coreApi.deleteNamespacedService({
          namespace,
          name,
          propagationPolicy: "Foreground",
        });
        return JSON.parse(JSON.stringify(res));
      }
      case "ingress": {
        const res = await clients.networkingApi.deleteNamespacedIngress({
          namespace,
          name,
          propagationPolicy: "Foreground",
        });
        return JSON.parse(JSON.stringify(res));
      }
      case "statefulset": {
        const res = await clients.appsApi.deleteNamespacedStatefulSet({
          namespace,
          name,
          propagationPolicy: "Foreground",
        });
        return JSON.parse(JSON.stringify(res));
      }
      case "daemonset": {
        const res = await clients.appsApi.deleteNamespacedDaemonSet({
          namespace,
          name,
          propagationPolicy: "Foreground",
        });
        return JSON.parse(JSON.stringify(res));
      }
      case "configmap": {
        const res = await clients.coreApi.deleteNamespacedConfigMap({
          namespace,
          name,
          propagationPolicy: "Foreground",
        });
        return JSON.parse(JSON.stringify(res));
      }
      case "secret": {
        const res = await clients.coreApi.deleteNamespacedSecret({
          namespace,
          name,
          propagationPolicy: "Foreground",
        });
        return JSON.parse(JSON.stringify(res));
      }
      case "pod": {
        const res = await clients.coreApi.deleteNamespacedPod({
          namespace,
          name,
          propagationPolicy: "Foreground",
        });
        return JSON.parse(JSON.stringify(res));
      }
      case "pvc": {
        const res = await clients.coreApi.deleteNamespacedPersistentVolumeClaim(
          { namespace, name, propagationPolicy: "Foreground" }
        );
        return JSON.parse(JSON.stringify(res));
      }
      default:
        throw new Error(`Unsupported builtin resource type: ${resourceType}`);
    }
  }
);

/**
 * Generalized function to patch builtin resource metadata.
 */
export const patchBuiltinResourceMetadata = createParallelAction(
  async (
    kubeconfig: string,
    namespace: string,
    resourceType: string,
    name: string,
    metadataType: "annotations" | "labels",
    key: string,
    value: string
  ) => {
    switch (resourceType) {
      case "deployment":
        return await patchDeploymentMetadata(
          kubeconfig,
          namespace,
          name,
          metadataType,
          key,
          value
        );
      case "statefulset":
        return await patchStatefulSetMetadata(
          kubeconfig,
          namespace,
          name,
          metadataType,
          key,
          value
        );
      case "daemonset":
        return await patchDaemonSetMetadata(
          kubeconfig,
          namespace,
          name,
          metadataType,
          key,
          value
        );
      default:
        throw new Error(
          `Metadata patching not supported for resource type: ${resourceType}`
        );
    }
  }
);

/**
 * Generalized function to remove builtin resource metadata.
 */
export const removeBuiltinResourceMetadata = createParallelAction(
  async (
    kubeconfig: string,
    namespace: string,
    resourceType: string,
    name: string,
    metadataType: "annotations" | "labels",
    key: string
  ) => {
    switch (resourceType) {
      case "deployment":
        return await removeDeploymentMetadata(
          kubeconfig,
          namespace,
          name,
          metadataType,
          key
        );
      case "statefulset":
        return await removeStatefulSetMetadata(
          kubeconfig,
          namespace,
          name,
          metadataType,
          key
        );
      case "daemonset":
        return await removeDaemonSetMetadata(
          kubeconfig,
          namespace,
          name,
          metadataType,
          key
        );
      default:
        throw new Error(
          `Metadata removal not supported for resource type: ${resourceType}`
        );
    }
  }
);

/**
 * Get a statefulset by name in a namespace.
 */
export const getStatefulSet = createParallelAction(
  async (kubeconfig: string, namespace: string, name: string) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);
    const result = await clients.appsApi.readNamespacedStatefulSet({
      namespace,
      name,
    });
    return JSON.parse(JSON.stringify(result));
  }
);

/**
 * Delete a statefulset by name in a namespace.
 */
export const deleteStatefulSet = createParallelAction(
  async (kubeconfig: string, namespace: string, name: string) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);
    const result = await clients.appsApi.deleteNamespacedStatefulSet({
      namespace,
      name,
    });
    return JSON.parse(JSON.stringify(result));
  }
);

/**
 * Get a daemonset by name in a namespace.
 */
export const getDaemonSet = createParallelAction(
  async (kubeconfig: string, namespace: string, name: string) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);
    const result = await clients.appsApi.readNamespacedDaemonSet({
      namespace,
      name,
    });
    return JSON.parse(JSON.stringify(result));
  }
);

/**
 * Delete a daemonset by name in a namespace.
 */
export const deleteDaemonSet = createParallelAction(
  async (kubeconfig: string, namespace: string, name: string) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);
    const result = await clients.appsApi.deleteNamespacedDaemonSet({
      namespace,
      name,
    });
    return JSON.parse(JSON.stringify(result));
  }
);

/**
 * Get a configmap by name in a namespace.
 */
export const getConfigMap = createParallelAction(
  async (kubeconfig: string, namespace: string, name: string) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);
    const result = await clients.coreApi.readNamespacedConfigMap({
      namespace,
      name,
    });
    return JSON.parse(JSON.stringify(result));
  }
);

/**
 * Delete a configmap by name in a namespace.
 */
export const deleteConfigMap = createParallelAction(
  async (kubeconfig: string, namespace: string, name: string) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);
    const result = await clients.coreApi.deleteNamespacedConfigMap({
      namespace,
      name,
    });
    return JSON.parse(JSON.stringify(result));
  }
);

/**
 * Get a secret by name in a namespace.
 */
export const getSecret = createParallelAction(
  async (kubeconfig: string, namespace: string, name: string) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);
    const result = await clients.coreApi.readNamespacedSecret({
      namespace,
      name,
    });
    return JSON.parse(JSON.stringify(result));
  }
);

/**
 * Delete a secret by name in a namespace.
 */
export const deleteSecret = createParallelAction(
  async (kubeconfig: string, namespace: string, name: string) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);
    const result = await clients.coreApi.deleteNamespacedSecret({
      namespace,
      name,
    });
    return JSON.parse(JSON.stringify(result));
  }
);

/**
 * Get a pod by name in a namespace.
 */
export const getPod = createParallelAction(
  async (kubeconfig: string, namespace: string, name: string) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);
    const result = await clients.coreApi.readNamespacedPod({
      namespace,
      name,
    });
    return JSON.parse(JSON.stringify(result));
  }
);

/**
 * Delete a pod by name in a namespace.
 */
export const deletePod = createParallelAction(
  async (kubeconfig: string, namespace: string, name: string) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);
    const result = await clients.coreApi.deleteNamespacedPod({
      namespace,
      name,
    });
    return JSON.parse(JSON.stringify(result));
  }
);

/**
 * Get a persistent volume claim by name in a namespace.
 */
export const getPersistentVolumeClaim = createParallelAction(
  async (kubeconfig: string, namespace: string, name: string) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);
    const result = await clients.coreApi.readNamespacedPersistentVolumeClaim({
      namespace,
      name,
    });
    return JSON.parse(JSON.stringify(result));
  }
);

/**
 * Delete a persistent volume claim by name in a namespace.
 */
export const deletePersistentVolumeClaim = createParallelAction(
  async (kubeconfig: string, namespace: string, name: string) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);
    const result = await clients.coreApi.deleteNamespacedPersistentVolumeClaim({
      namespace,
      name,
    });
    return JSON.parse(JSON.stringify(result));
  }
);

export const patchStatefulSetMetadata = createParallelAction(
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
    const currentStatefulSetResult =
      await clients.appsApi.readNamespacedStatefulSet({
        namespace,
        name,
      });
    const currentStatefulSet = JSON.parse(
      JSON.stringify(currentStatefulSetResult)
    );

    const patchBody = currentStatefulSet.metadata?.[metadataType]
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

    const result = await clients.appsApi.patchNamespacedStatefulSet({
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

export const removeStatefulSetMetadata = createParallelAction(
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
    await clients.appsApi.patchNamespacedStatefulSet({
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

export const patchDaemonSetMetadata = createParallelAction(
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
    const currentDaemonSetResult =
      await clients.appsApi.readNamespacedDaemonSet({
        namespace,
        name,
      });
    const currentDaemonSet = JSON.parse(JSON.stringify(currentDaemonSetResult));

    const patchBody = currentDaemonSet.metadata?.[metadataType]
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

    const result = await clients.appsApi.patchNamespacedDaemonSet({
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

export const removeDaemonSetMetadata = createParallelAction(
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
    await clients.appsApi.patchNamespacedDaemonSet({
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
