"use client";

import { queryOptions } from "@tanstack/react-query";
import { RESOURCES } from "@/lib/k8s/k8s-constant";
import { getResourceOptions, listResourcesOptions } from "@/lib/k8s/k8s-query";
import type {
  InstanceList,
  InstanceResource,
  K8sApiContext,
} from "@/lib/k8s/schemas";
import {
  ResourceTargetSchema,
  ResourceTypeTargetSchema,
} from "@/lib/k8s/schemas";
import type { GetProjectRequest } from "./schemas";

export const listProjectsOptions = (
  context: K8sApiContext,
  postprocess?: (data: InstanceList) => InstanceList
) => {
  const instanceConfig = RESOURCES.instance;

  const resourceTypeTarget = ResourceTypeTargetSchema.parse({
    type: "custom",
    group: instanceConfig.group,
    version: instanceConfig.version,
    namespace: context.namespace,
    plural: instanceConfig.plural,
  });

  const baseOptions = listResourcesOptions(resourceTypeTarget, context);

  return queryOptions({
    ...baseOptions,
    queryKey: ["project", "list", context.namespace],
    select: (data) => {
      // listResourcesOptions may return the result inside a single-element array
      const resolved = Array.isArray(data) ? (data[0] as unknown) : data;
      const instanceList = resolved as InstanceList;
      return postprocess?.(instanceList) ?? instanceList;
    },
  });
};

export const getProjectOptions = (
  request: GetProjectRequest,
  context: K8sApiContext,
  postprocess?: (data: InstanceResource) => InstanceResource
) => {
  const instanceConfig = RESOURCES.instance;

  const resourceTarget = ResourceTargetSchema.parse({
    type: "custom",
    group: instanceConfig.group,
    version: instanceConfig.version,
    namespace: context.namespace,
    plural: instanceConfig.plural,
    name: request.projectName,
  });

  const baseOptions = getResourceOptions(resourceTarget, context);

  return queryOptions({
    ...baseOptions,
    queryKey: ["project", "get", context.namespace, request.projectName],
    select: (data) => {
      const resolved = Array.isArray(data) ? (data[0] as unknown) : data;
      const instance = resolved as InstanceResource;
      return postprocess?.(instance) ?? instance;
    },
    enabled: !!context.namespace && !!request.projectName,
  });
};
