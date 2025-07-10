"use client";

import { queryOptions } from "@tanstack/react-query";
import {
  getResourceOptions,
  listAllResourcesOptions,
  listResourcesOptions,
} from "@/lib/k8s/k8s-method/k8s-query";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import { CUSTOM_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-custom-resource";
import { PROJECT_NAME_LABEL_KEY } from "@/lib/k8s/k8s-constant/k8s-constant-label";

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
    queryKey: ["project", "list", context.namespace],
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
    queryKey: ["project", "get", context.namespace, projectName],
    enabled: !!context.namespace && !!projectName,
  });
};

/**
 * Query options for getting all resources related to a specific project
 */
export const getProjectResourcesOptions = (
  context: K8sApiContext,
  projectName: string
) => {
  const labelSelector = `${PROJECT_NAME_LABEL_KEY}=${projectName}`;

  const baseOptions = listAllResourcesOptions(context, labelSelector);

  return queryOptions({
    ...baseOptions,
    queryKey: ["project", "resources", context.namespace, projectName],
    enabled: !!context.namespace && !!projectName,
  });
};
