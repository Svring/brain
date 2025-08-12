"use client";

import { queryOptions } from "@tanstack/react-query";
import {
  getResourceOptions,
  listResourcesOptions,
} from "@/lib/k8s/k8s-method/k8s-query";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { CUSTOM_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-custom-resource";
import {
  createInstanceTarget,
  getListInstancesQueryKey,
  getInstanceQueryKey,
  getInstanceResourcesQueryKey,
} from "./instance-utils";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import { INSTANCE_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";
import { getRelatedResources } from "@/lib/sealos/services/relevance/relevance-utils";

export const getInstanceRelatedResources = async (
  context: K8sApiContext,
  instanceName: string,
  builtinResources?: string[],
  customResources?: string[]
): Promise<K8sResource[]> => {
  const labelSelectors = [
    `${INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS}=${instanceName}`,
  ];
  return getRelatedResources(
    context,
    labelSelectors,
    builtinResources ?? ["configmap", "deployment", "statefulset"],
    customResources ?? [
      "devbox",
      "cluster",
      "objectstoragebucket",
      "app",
      "objectstoragebucket",
    ]
  );
};

/**
 * Query options for listing all instances (instances)
 */
export const listInstancesOptions = (context: K8sApiContext) => {
  const baseOptions = listResourcesOptions(
    context,
    convertResourceTypeToTarget("instance")
  );

  return queryOptions({
    ...baseOptions,
    queryKey: getListInstancesQueryKey(context.namespace),
  });
};

/**
 * Query options for getting a specific instance by name
 */
export const getInstanceOptions = (
  context: K8sApiContext,
  instanceName: string
) => {
  const baseOptions = getResourceOptions(
    context,
    createInstanceTarget(instanceName)
  );

  return queryOptions({
    ...baseOptions,
    queryKey: getInstanceQueryKey(context.namespace, instanceName),
    enabled: !!context.namespace && !!instanceName,
  });
};

/**
 * Query options for getting all resources related to a specific instance
 */
export const getInstanceResourcesOptions = (
  context: K8sApiContext,
  instanceName: string,
  enabledSubModules: string[] = []
) => {
  return queryOptions({
    queryKey: ["instance", instanceName],
    queryFn: async () => {
      const resources = await getInstanceRelatedResources(
        context,
        instanceName,
        enabledSubModules
      );
      return resources;
    },
    enabled: !!context.namespace && !!instanceName && !!context.kubeconfig,
    staleTime: 60 * 1000, // 5 minutes
  });
};
