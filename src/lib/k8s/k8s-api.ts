"use server";

import {
  AppsV1Api,
  BatchV1Api,
  CoreV1Api,
  CustomObjectsApi,
  KubeConfig,
} from "@kubernetes/client-node";
import { createParallelAction } from "next-server-actions-parallel";

type ApiClients = {
  customApi: CustomObjectsApi;
  appsApi: AppsV1Api;
  batchApi: BatchV1Api;
  coreApi: CoreV1Api;
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
  };
}

/**
 * List a custom resource in Kubernetes.
 * @param kubeconfig - The kubeconfig string.
 * @param group - The API group of the custom resource.
 * @param version - The API version of the custom resource.
 * @param namespace - The namespace to list resources in.
 * @param plural - The plural name of the custom resource.
 * @returns The list of custom resources as returned by the Kubernetes client.
 */
export const listCustomResource = createParallelAction(
  async (
    kubeconfig: string,
    group: string,
    version: string,
    namespace: string,
    plural: string
  ) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);
    const res = await clients.customApi.listNamespacedCustomObject({
      group,
      version,
      namespace,
      plural,
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

export const patchCustomResourceAnnotation = createParallelAction(
  async (
    kubeconfig: string,
    group: string,
    version: string,
    namespace: string,
    plural: string,
    name: string,
    annotationKey: string,
    annotationValue: string
  ) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);

    const encodedAnnotationKey = escapeSlash(annotationKey);
    const currentResourceResult =
      await clients.customApi.getNamespacedCustomObject({
        group,
        version,
        namespace,
        plural,
        name,
      });
    const currentResource = JSON.parse(JSON.stringify(currentResourceResult));

    const patchBody = currentResource.metadata?.annotations
      ? [
          {
            op: "add",
            path: `/metadata/annotations/${encodedAnnotationKey}`,
            value: annotationValue,
          },
        ]
      : [
          {
            op: "add",
            path: "/metadata/annotations",
            value: { [annotationKey]: annotationValue },
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
      annotations: result.metadata?.annotations || {},
      success: true,
      name,
      annotationKey,
    };
  }
);

export const removeCustomResourceAnnotation = createParallelAction(
  async (
    kubeconfig: string,
    group: string,
    version: string,
    namespace: string,
    plural: string,
    name: string,
    annotationKey: string
  ) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);

    const encodedAnnotationKey = escapeSlash(annotationKey);
    const patchBody = [
      { op: "remove", path: `/metadata/annotations/${encodedAnnotationKey}` },
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
      annotationKey,
    };
  }
);

export const patchCustomResourceLabel = createParallelAction(
  async (
    kubeconfig: string,
    group: string,
    version: string,
    namespace: string,
    plural: string,
    name: string,
    labelKey: string,
    labelValue: string
  ) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);

    const encodedLabelKey = escapeSlash(labelKey);
    const currentResourceResult =
      await clients.customApi.getNamespacedCustomObject({
        group,
        version,
        namespace,
        plural,
        name,
      });
    const currentResource = JSON.parse(JSON.stringify(currentResourceResult));

    const patchBody = currentResource.metadata?.labels
      ? [
          {
            op: "add",
            path: `/metadata/labels/${encodedLabelKey}`,
            value: labelValue,
          },
        ]
      : [
          {
            op: "add",
            path: "/metadata/labels",
            value: { [labelKey]: labelValue },
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
      labels: result.metadata?.labels || {},
      success: true,
      name,
      labelKey,
    };
  }
);

export const removeCustomResourceLabel = createParallelAction(
  async (
    kubeconfig: string,
    group: string,
    version: string,
    namespace: string,
    plural: string,
    name: string,
    labelKey: string
  ) => {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);

    const encodedLabelKey = escapeSlash(labelKey);
    const patchBody = [
      { op: "remove", path: `/metadata/labels/${encodedLabelKey}` },
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
      labelKey,
    };
  }
);
