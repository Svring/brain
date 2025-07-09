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
import { load } from "js-yaml";
import { createParallelAction } from "next-server-actions-parallel";

type ApiClients = {
  customApi: CustomObjectsApi;
  appsApi: AppsV1Api;
  autoscalingApi: AutoscalingV2Api;
  batchApi: BatchV1Api;
  coreApi: CoreV1Api;
  networkingApi: NetworkingV1Api;
  rbacApi: RbacAuthorizationV1Api;
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
    autoscalingApi: kc.makeApiClient(AutoscalingV2Api),
    batchApi: kc.makeApiClient(BatchV1Api),
    coreApi: kc.makeApiClient(CoreV1Api),
    networkingApi: kc.makeApiClient(NetworkingV1Api),
    rbacApi: kc.makeApiClient(RbacAuthorizationV1Api),
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

    try {
      const result = await clients.customApi.deleteNamespacedCustomObject({
        group,
        version,
        namespace,
        plural,
        name,
      });
      return JSON.parse(JSON.stringify(result));
    } catch (error: unknown) {
      // Check if it's a 404 error (resource not found)
      const errorObj = error as {
        code?: number;
        response?: { status?: number };
        statusCode?: number;
        message?: string;
        body?: string;
      };

      const is404 =
        errorObj?.code === 404 ||
        errorObj?.response?.status === 404 ||
        errorObj?.statusCode === 404 ||
        errorObj?.message?.includes("404") ||
        errorObj?.message?.includes("not found") ||
        (errorObj?.body &&
          typeof errorObj.body === "string" &&
          errorObj.body.includes('"code":404'));

      if (is404) {
        // Resource not found, return success indicator
        return { success: true, notFound: true };
      }

      // Re-throw other errors
      throw error;
    }
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

// Helper function to add missing apiVersion and kind to builtin resources
function addMissingFields(items: unknown[], apiVersion: string, kind: string) {
  return {
    apiVersion: `${apiVersion}List`,
    kind: `${kind}List`,
    items: items.map((item) => ({
      apiVersion,
      kind,
      ...(item as Record<string, unknown>),
    })),
  };
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

    try {
      const result = await clients.appsApi.deleteNamespacedDeployment({
        namespace,
        name,
        propagationPolicy: "Foreground",
      });
      return JSON.parse(JSON.stringify(result));
    } catch (error: unknown) {
      // Check if it's a 404 error (resource not found)
      const errorObj = error as {
        code?: number;
        response?: { status?: number };
        statusCode?: number;
        message?: string;
        body?: string;
      };

      const is404 =
        errorObj?.code === 404 ||
        errorObj?.response?.status === 404 ||
        errorObj?.statusCode === 404 ||
        errorObj?.message?.includes("404") ||
        errorObj?.message?.includes("not found") ||
        (errorObj?.body &&
          typeof errorObj.body === "string" &&
          errorObj.body.includes('"code":404'));

      if (is404) {
        // Resource not found, return success indicator
        return { success: true, notFound: true };
      }

      // Re-throw other errors
      throw error;
    }
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

    try {
      const result = await clients.coreApi.deleteNamespacedService({
        namespace,
        name,
      });
      return JSON.parse(JSON.stringify(result));
    } catch (error: unknown) {
      // Check if it's a 404 error (resource not found)
      const errorObj = error as {
        code?: number;
        response?: { status?: number };
        statusCode?: number;
        message?: string;
        body?: string;
      };

      const is404 =
        errorObj?.code === 404 ||
        errorObj?.response?.status === 404 ||
        errorObj?.statusCode === 404 ||
        errorObj?.message?.includes("404") ||
        errorObj?.message?.includes("not found") ||
        (errorObj?.body &&
          typeof errorObj.body === "string" &&
          errorObj.body.includes('"code":404'));

      if (is404) {
        // Resource not found, return success indicator
        return { success: true, notFound: true };
      }

      // Re-throw other errors
      throw error;
    }
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

    try {
      const result = await clients.networkingApi.deleteNamespacedIngress({
        namespace,
        name,
      });
      return JSON.parse(JSON.stringify(result));
    } catch (error: unknown) {
      // Check if it's a 404 error (resource not found)
      const errorObj = error as {
        code?: number;
        response?: { status?: number };
        statusCode?: number;
        message?: string;
        body?: string;
      };

      const is404 =
        errorObj?.code === 404 ||
        errorObj?.response?.status === 404 ||
        errorObj?.statusCode === 404 ||
        errorObj?.message?.includes("404") ||
        errorObj?.message?.includes("not found") ||
        (errorObj?.body &&
          typeof errorObj.body === "string" &&
          errorObj.body.includes('"code":404'));

      if (is404) {
        // Resource not found, return success indicator
        return { success: true, notFound: true };
      }

      // Re-throw other errors
      throw error;
    }
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
        const parsed = JSON.parse(JSON.stringify(res));
        return addMissingFields(parsed.items || [], "apps/v1", "Deployment");
      }
      case "service": {
        const res = await clients.coreApi.listNamespacedService({
          namespace,
          labelSelector,
        });
        const parsed = JSON.parse(JSON.stringify(res));
        return addMissingFields(parsed.items || [], "v1", "Service");
      }
      case "ingress": {
        const res = await clients.networkingApi.listNamespacedIngress({
          namespace,
          labelSelector,
        });
        const parsed = JSON.parse(JSON.stringify(res));
        return addMissingFields(
          parsed.items || [],
          "networking.k8s.io/v1",
          "Ingress"
        );
      }
      case "statefulset": {
        const res = await clients.appsApi.listNamespacedStatefulSet({
          namespace,
          labelSelector,
        });
        const parsed = JSON.parse(JSON.stringify(res));
        return addMissingFields(parsed.items || [], "apps/v1", "StatefulSet");
      }
      case "daemonset": {
        const res = await clients.appsApi.listNamespacedDaemonSet({
          namespace,
          labelSelector,
        });
        const parsed = JSON.parse(JSON.stringify(res));
        return addMissingFields(parsed.items || [], "apps/v1", "DaemonSet");
      }
      case "configmap": {
        const res = await clients.coreApi.listNamespacedConfigMap({
          namespace,
          labelSelector,
        });
        const parsed = JSON.parse(JSON.stringify(res));
        return addMissingFields(parsed.items || [], "v1", "ConfigMap");
      }
      case "secret": {
        const res = await clients.coreApi.listNamespacedSecret({
          namespace,
          labelSelector,
        });
        const parsed = JSON.parse(JSON.stringify(res));
        return addMissingFields(parsed.items || [], "v1", "Secret");
      }
      case "pod": {
        const res = await clients.coreApi.listNamespacedPod({
          namespace,
          labelSelector,
        });
        const parsed = JSON.parse(JSON.stringify(res));
        return addMissingFields(parsed.items || [], "v1", "Pod");
      }
      case "pvc": {
        const res = await clients.coreApi.listNamespacedPersistentVolumeClaim({
          namespace,
          labelSelector,
        });
        const parsed = JSON.parse(JSON.stringify(res));
        return addMissingFields(
          parsed.items || [],
          "v1",
          "PersistentVolumeClaim"
        );
      }
      case "horizontalpodautoscaler": {
        const res =
          await clients.autoscalingApi.listNamespacedHorizontalPodAutoscaler({
            namespace,
            labelSelector,
          });
        const parsed = JSON.parse(JSON.stringify(res));
        return addMissingFields(
          parsed.items || [],
          "autoscaling/v2",
          "HorizontalPodAutoscaler"
        );
      }
      case "role": {
        const res = await clients.rbacApi.listNamespacedRole({
          namespace,
          labelSelector,
        });
        const parsed = JSON.parse(JSON.stringify(res));
        return addMissingFields(
          parsed.items || [],
          "rbac.authorization.k8s.io/v1",
          "Role"
        );
      }
      case "rolebinding": {
        const res = await clients.rbacApi.listNamespacedRoleBinding({
          namespace,
          labelSelector,
        });
        const parsed = JSON.parse(JSON.stringify(res));
        return addMissingFields(
          parsed.items || [],
          "rbac.authorization.k8s.io/v1",
          "RoleBinding"
        );
      }
      case "serviceaccount": {
        const res = await clients.coreApi.listNamespacedServiceAccount({
          namespace,
          labelSelector,
        });
        const parsed = JSON.parse(JSON.stringify(res));
        return addMissingFields(parsed.items || [], "v1", "ServiceAccount");
      }
      case "job": {
        const res = await clients.batchApi.listNamespacedJob({
          namespace,
          labelSelector,
        });
        const parsed = JSON.parse(JSON.stringify(res));
        return addMissingFields(parsed.items || [], "batch/v1", "Job");
      }
      case "cronjob": {
        const res = await clients.batchApi.listNamespacedCronJob({
          namespace,
          labelSelector,
        });
        const parsed = JSON.parse(JSON.stringify(res));
        return addMissingFields(parsed.items || [], "batch/v1", "CronJob");
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
      case "horizontalpodautoscaler": {
        const res =
          await clients.autoscalingApi.readNamespacedHorizontalPodAutoscaler({
            namespace,
            name,
          });
        return JSON.parse(JSON.stringify(res));
      }
      case "role": {
        const res = await clients.rbacApi.readNamespacedRole({
          namespace,
          name,
        });
        return JSON.parse(JSON.stringify(res));
      }
      case "rolebinding": {
        const res = await clients.rbacApi.readNamespacedRoleBinding({
          namespace,
          name,
        });
        return JSON.parse(JSON.stringify(res));
      }
      case "serviceaccount": {
        const res = await clients.coreApi.readNamespacedServiceAccount({
          namespace,
          name,
        });
        return JSON.parse(JSON.stringify(res));
      }
      case "job": {
        const res = await clients.batchApi.readNamespacedJob({
          namespace,
          name,
        });
        return JSON.parse(JSON.stringify(res));
      }
      case "cronjob": {
        const res = await clients.batchApi.readNamespacedCronJob({
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

    try {
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
          const res =
            await clients.coreApi.deleteNamespacedPersistentVolumeClaim({
              namespace,
              name,
              propagationPolicy: "Foreground",
            });
          return JSON.parse(JSON.stringify(res));
        }
        case "horizontalpodautoscaler": {
          const res =
            await clients.autoscalingApi.deleteNamespacedHorizontalPodAutoscaler(
              {
                namespace,
                name,
                propagationPolicy: "Foreground",
              }
            );
          return JSON.parse(JSON.stringify(res));
        }
        case "role": {
          const res = await clients.rbacApi.deleteNamespacedRole({
            namespace,
            name,
            propagationPolicy: "Foreground",
          });
          return JSON.parse(JSON.stringify(res));
        }
        case "rolebinding": {
          const res = await clients.rbacApi.deleteNamespacedRoleBinding({
            namespace,
            name,
            propagationPolicy: "Foreground",
          });
          return JSON.parse(JSON.stringify(res));
        }
        case "serviceaccount": {
          const res = await clients.coreApi.deleteNamespacedServiceAccount({
            namespace,
            name,
            propagationPolicy: "Foreground",
          });
          return JSON.parse(JSON.stringify(res));
        }
        case "job": {
          const res = await clients.batchApi.deleteNamespacedJob({
            namespace,
            name,
            propagationPolicy: "Foreground",
          });
          return JSON.parse(JSON.stringify(res));
        }
        case "cronjob": {
          const res = await clients.batchApi.deleteNamespacedCronJob({
            namespace,
            name,
            propagationPolicy: "Foreground",
          });
          return JSON.parse(JSON.stringify(res));
        }
        default:
          throw new Error(`Unsupported builtin resource type: ${resourceType}`);
      }
    } catch (error: unknown) {
      // Check if it's a 404 error (resource not found)
      const errorObj = error as {
        code?: number;
        response?: { status?: number };
        statusCode?: number;
        message?: string;
        body?: string;
      };

      const is404 =
        errorObj?.code === 404 ||
        errorObj?.response?.status === 404 ||
        errorObj?.statusCode === 404 ||
        errorObj?.message?.includes("404") ||
        errorObj?.message?.includes("not found") ||
        (errorObj?.body &&
          typeof errorObj.body === "string" &&
          errorObj.body.includes('"code":404'));

      if (is404) {
        // Resource not found, return success indicator
        return { success: true, notFound: true };
      }

      // Re-throw other errors
      throw error;
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

    try {
      const result = await clients.appsApi.deleteNamespacedStatefulSet({
        namespace,
        name,
      });
      return JSON.parse(JSON.stringify(result));
    } catch (error: unknown) {
      // Check if it's a 404 error (resource not found)
      const errorObj = error as {
        code?: number;
        response?: { status?: number };
        statusCode?: number;
        message?: string;
        body?: string;
      };

      const is404 =
        errorObj?.code === 404 ||
        errorObj?.response?.status === 404 ||
        errorObj?.statusCode === 404 ||
        errorObj?.message?.includes("404") ||
        errorObj?.message?.includes("not found") ||
        (errorObj?.body &&
          typeof errorObj.body === "string" &&
          errorObj.body.includes('"code":404'));

      if (is404) {
        // Resource not found, return success indicator
        return { success: true, notFound: true };
      }

      // Re-throw other errors
      throw error;
    }
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

    try {
      const result = await clients.appsApi.deleteNamespacedDaemonSet({
        namespace,
        name,
      });
      return JSON.parse(JSON.stringify(result));
    } catch (error: unknown) {
      // Check if it's a 404 error (resource not found)
      const errorObj = error as {
        code?: number;
        response?: { status?: number };
        statusCode?: number;
        message?: string;
        body?: string;
      };

      const is404 =
        errorObj?.code === 404 ||
        errorObj?.response?.status === 404 ||
        errorObj?.statusCode === 404 ||
        errorObj?.message?.includes("404") ||
        errorObj?.message?.includes("not found") ||
        (errorObj?.body &&
          typeof errorObj.body === "string" &&
          errorObj.body.includes('"code":404'));

      if (is404) {
        // Resource not found, return success indicator
        return { success: true, notFound: true };
      }

      // Re-throw other errors
      throw error;
    }
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

    try {
      const result = await clients.coreApi.deleteNamespacedConfigMap({
        namespace,
        name,
      });
      return JSON.parse(JSON.stringify(result));
    } catch (error: unknown) {
      // Check if it's a 404 error (resource not found)
      const errorObj = error as {
        code?: number;
        response?: { status?: number };
        statusCode?: number;
        message?: string;
        body?: string;
      };

      const is404 =
        errorObj?.code === 404 ||
        errorObj?.response?.status === 404 ||
        errorObj?.statusCode === 404 ||
        errorObj?.message?.includes("404") ||
        errorObj?.message?.includes("not found") ||
        (errorObj?.body &&
          typeof errorObj.body === "string" &&
          errorObj.body.includes('"code":404'));

      if (is404) {
        // Resource not found, return success indicator
        return { success: true, notFound: true };
      }

      // Re-throw other errors
      throw error;
    }
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

    try {
      const result = await clients.coreApi.deleteNamespacedSecret({
        namespace,
        name,
      });
      return JSON.parse(JSON.stringify(result));
    } catch (error: unknown) {
      // Check if it's a 404 error (resource not found)
      const errorObj = error as {
        code?: number;
        response?: { status?: number };
        statusCode?: number;
        message?: string;
        body?: string;
      };

      const is404 =
        errorObj?.code === 404 ||
        errorObj?.response?.status === 404 ||
        errorObj?.statusCode === 404 ||
        errorObj?.message?.includes("404") ||
        errorObj?.message?.includes("not found") ||
        (errorObj?.body &&
          typeof errorObj.body === "string" &&
          errorObj.body.includes('"code":404'));

      if (is404) {
        // Resource not found, return success indicator
        return { success: true, notFound: true };
      }

      // Re-throw other errors
      throw error;
    }
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

    try {
      const result = await clients.coreApi.deleteNamespacedPod({
        namespace,
        name,
      });
      return JSON.parse(JSON.stringify(result));
    } catch (error: unknown) {
      // Check if it's a 404 error (resource not found)
      const errorObj = error as {
        code?: number;
        response?: { status?: number };
        statusCode?: number;
        message?: string;
        body?: string;
      };

      const is404 =
        errorObj?.code === 404 ||
        errorObj?.response?.status === 404 ||
        errorObj?.statusCode === 404 ||
        errorObj?.message?.includes("404") ||
        errorObj?.message?.includes("not found") ||
        (errorObj?.body &&
          typeof errorObj.body === "string" &&
          errorObj.body.includes('"code":404'));

      if (is404) {
        // Resource not found, return success indicator
        return { success: true, notFound: true };
      }

      // Re-throw other errors
      throw error;
    }
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

    try {
      const result =
        await clients.coreApi.deleteNamespacedPersistentVolumeClaim({
          namespace,
          name,
        });
      return JSON.parse(JSON.stringify(result));
    } catch (error: unknown) {
      // Check if it's a 404 error (resource not found)
      const errorObj = error as {
        code?: number;
        response?: { status?: number };
        statusCode?: number;
        message?: string;
        body?: string;
      };

      const is404 =
        errorObj?.code === 404 ||
        errorObj?.response?.status === 404 ||
        errorObj?.statusCode === 404 ||
        errorObj?.message?.includes("404") ||
        errorObj?.message?.includes("not found") ||
        (errorObj?.body &&
          typeof errorObj.body === "string" &&
          errorObj.body.includes('"code":404'));

      if (is404) {
        // Resource not found, return success indicator
        return { success: true, notFound: true };
      }

      // Re-throw other errors
      throw error;
    }
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

/**
 * Delete resources by label selector for builtin resources.
 */
export const deleteBuiltinResourcesByLabelSelector = createParallelAction(
  async (
    kubeconfig: string,
    namespace: string,
    resourceType: string,
    labelSelector: string
  ) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);

    try {
      switch (resourceType) {
        case "service": {
          const res = await clients.coreApi.deleteCollectionNamespacedService({
            namespace,
            labelSelector,
          });
          return JSON.parse(JSON.stringify(res));
        }
        case "ingress": {
          const res =
            await clients.networkingApi.deleteCollectionNamespacedIngress({
              namespace,
              labelSelector,
            });
          return JSON.parse(JSON.stringify(res));
        }
        case "pvc": {
          const res =
            await clients.coreApi.deleteCollectionNamespacedPersistentVolumeClaim(
              {
                namespace,
                labelSelector,
              }
            );
          return JSON.parse(JSON.stringify(res));
        }
        default:
          throw new Error(
            `Bulk deletion not supported for resource type: ${resourceType}`
          );
      }
    } catch (error: unknown) {
      // Check if it's a 404 error (resource not found)
      const errorObj = error as {
        code?: number;
        response?: { status?: number };
        statusCode?: number;
        message?: string;
        body?: string;
      };

      const is404 =
        errorObj?.code === 404 ||
        errorObj?.response?.status === 404 ||
        errorObj?.statusCode === 404 ||
        errorObj?.message?.includes("404") ||
        errorObj?.message?.includes("not found") ||
        (errorObj?.body &&
          typeof errorObj.body === "string" &&
          errorObj.body.includes('"code":404'));

      if (is404) {
        // Resource not found, return success indicator
        return { success: true, notFound: true };
      }

      // Re-throw other errors
      throw error;
    }
  }
);

/**
 * Delete custom resources by label selector and then delete each individually.
 */
export const deleteCustomResourcesByLabelSelector = createParallelAction(
  async (
    kubeconfig: string,
    group: string,
    version: string,
    namespace: string,
    plural: string,
    labelSelector: string
  ) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);

    try {
      // First, list all resources matching the label selector
      const listResult = await clients.customApi.listNamespacedCustomObject({
        group,
        version,
        namespace,
        plural,
        labelSelector,
      });

      const resources = JSON.parse(JSON.stringify(listResult));
      const items = resources.items || [];

      // Delete each resource individually
      const deletePromises = items.map((item: { metadata: { name: string } }) =>
        clients.customApi
          .deleteNamespacedCustomObject({
            group,
            version,
            namespace,
            plural,
            name: item.metadata.name,
          })
          .catch((error: unknown) => {
            // Check if it's a 404 error (resource not found)
            const errorObj = error as {
              code?: number;
              response?: { status?: number };
              statusCode?: number;
              message?: string;
              body?: string;
            };

            const is404 =
              errorObj?.code === 404 ||
              errorObj?.response?.status === 404 ||
              errorObj?.statusCode === 404 ||
              errorObj?.message?.includes("404") ||
              errorObj?.message?.includes("not found") ||
              (errorObj?.body &&
                typeof errorObj.body === "string" &&
                errorObj.body.includes('"code":404'));

            if (is404) {
              // Resource not found, return success indicator
              return { success: true, notFound: true };
            }

            // Re-throw other errors
            throw error;
          })
      );

      const results = await Promise.allSettled(deletePromises);
      return {
        success: true,
        deletedCount: items.length,
        results: results.map((result) => ({
          success: result.status === "fulfilled",
          error: result.status === "rejected" ? result.reason : null,
        })),
      };
    } catch (error: unknown) {
      // Check if it's a 404 error (resource not found)
      const errorObj = error as {
        code?: number;
        response?: { status?: number };
        statusCode?: number;
        message?: string;
        body?: string;
      };

      const is404 =
        errorObj?.code === 404 ||
        errorObj?.response?.status === 404 ||
        errorObj?.statusCode === 404 ||
        errorObj?.message?.includes("404") ||
        errorObj?.message?.includes("not found") ||
        (errorObj?.body &&
          typeof errorObj.body === "string" &&
          errorObj.body.includes('"code":404'));

      if (is404) {
        // Resource not found, return success indicator
        return {
          success: true,
          deletedCount: 0,
          results: [],
          notFound: true,
        };
      }

      // Re-throw other errors
      throw error;
    }
  }
);

/**
 * Apply YAML for instance kind custom resources.
 * This function parses YAML content and creates or updates the instance custom resource.
 */
export const applyInstanceYaml = createParallelAction(
  async (kubeconfig: string, yamlContent: string) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);

    // Parse YAML content
    const resource = load(yamlContent);
    const resourceObj = resource as Record<string, unknown>;
    const metadata = resourceObj.metadata as Record<string, unknown>;
    const { name, namespace } = metadata;

    try {
      // Try to get the existing resource
      await clients.customApi.getNamespacedCustomObject({
        group: "app.sealos.io",
        version: "v1",
        namespace: namespace as string,
        plural: "instances",
        name: name as string,
      });

      // If found, update it
      const result = await clients.customApi.replaceNamespacedCustomObject({
        group: "app.sealos.io",
        version: "v1",
        namespace: namespace as string,
        plural: "instances",
        name: name as string,
        body: resource,
      });

      return {
        action: "updated",
        resource: JSON.parse(JSON.stringify(result)),
      };
    } catch (err: unknown) {
      // Check if it's a 404 error (resource not found)
      const error = err as {
        code?: number;
        body?: string;
        statusCode?: number;
      };
      const errorObj = error as {
        code?: number;
        response?: { status?: number };
        statusCode?: number;
        message?: string;
        body?: string;
      };

      const is404 =
        errorObj?.code === 404 ||
        errorObj?.statusCode === 404 ||
        (errorObj?.body &&
          typeof errorObj.body === "string" &&
          errorObj.body.includes('"code":404'));

      if (is404) {
        // Resource doesn't exist, create it
        const result = await clients.customApi.createNamespacedCustomObject({
          group: "app.sealos.io",
          version: "v1",
          namespace: namespace as string,
          plural: "instances",
          body: resource,
        });

        return {
          action: "created",
          resource: JSON.parse(JSON.stringify(result)),
        };
      }

      // Re-throw other errors
      throw err;
    }
  }
);
