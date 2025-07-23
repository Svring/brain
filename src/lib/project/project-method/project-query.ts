"use client";

import { queryOptions } from "@tanstack/react-query";
import {
  getResourceOptions,
  listResourcesOptions,
} from "@/lib/k8s/k8s-method/k8s-query";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import { CUSTOM_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-custom-resource";
import { getProjectRelatedResources } from "@/lib/algorithm/relevance/project-relevance";
import {
  getListProjectsQueryKey,
  getProjectQueryKey,
  getProjectResourcesQueryKey,
} from "./project-utils";

/**
 * Query options for listing all projects (instances)
 */
export const listProjectsOptions = (context: K8sApiContext) => {
  const instanceConfig = CUSTOM_RESOURCES.instance;

  const baseOptions = listResourcesOptions(context, {
    type: "custom",
    group: instanceConfig.group,
    version: instanceConfig.version,
    plural: instanceConfig.plural,
  });

  return queryOptions({
    ...baseOptions,
    queryKey: getListProjectsQueryKey(context.namespace),
  });
};

/**
 * Query options for getting a specific project by name
 */
export const getProjectOptions = (
  context: K8sApiContext,
  projectName: string
) => {
  const instanceConfig = CUSTOM_RESOURCES.instance;

  const baseOptions = getResourceOptions(context, {
    type: "custom",
    group: instanceConfig.group,
    version: instanceConfig.version,
    plural: instanceConfig.plural,
    name: projectName,
  });

  return queryOptions({
    ...baseOptions,
    queryKey: getProjectQueryKey(context.namespace, projectName),
    enabled: !!context.namespace && !!projectName,
  });
};

/**
 * Query options for getting all resources related to a specific project
 */
export const getProjectResourcesOptions = (
  context: K8sApiContext,
  projectName: string,
  enabledSubModules: string[] = []
) => {
  return queryOptions({
    queryKey: getProjectResourcesQueryKey(context.namespace, projectName),
    queryFn: async () => {
      const resources = await getProjectRelatedResources(
        context,
        projectName,
        enabledSubModules
      );
      return resources;
    },
    enabled: !!context.namespace && !!projectName && !!context.kubeconfig,
    staleTime: 60 * 1000, // 5 minutes
  });
};
