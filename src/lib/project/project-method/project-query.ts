"use client";

import { queryOptions } from "@tanstack/react-query";
import {
  getResourceOptions,
  listResourcesOptions,
} from "@/lib/k8s/k8s-method/k8s-query";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { CUSTOM_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-custom-resource";
import { getProjectRelatedResources } from "@/lib/algorithm/relevance/project/project-relevance";
import {
  createProjectTarget,
  getListProjectsQueryKey,
  getProjectQueryKey,
  getProjectResourcesQueryKey,
} from "./project-utils";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

/**
 * Query options for listing all projects (instances)
 */
export const listProjectsOptions = (context: K8sApiContext) => {
  const baseOptions = listResourcesOptions(
    context,
    convertResourceTypeToTarget("instance")
  );

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
  const baseOptions = getResourceOptions(
    context,
    convertResourceTypeToTarget("instance")
  );

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
