"use client";

import { queryOptions } from "@tanstack/react-query";
import { RESOURCES } from "@/lib/k8s/k8s-constant";
import {
  getCustomResourceOptions,
  listCustomResourceOptions,
} from "@/lib/k8s/k8s-query";
import type {
  InstanceList,
  InstanceResource,
  K8sApiContext,
} from "@/lib/k8s/schemas";
import type { GetProjectRequest } from "./schemas";

export const listProjectsOptions = (
  context: K8sApiContext,
  postprocess?: (data: InstanceList) => InstanceList
) => {
  const instanceConfig = RESOURCES.instance;

  const baseOptions = listCustomResourceOptions(
    {
      group: instanceConfig.group,
      version: instanceConfig.version,
      plural: instanceConfig.plural,
    },
    context
  );

  return queryOptions({
    ...baseOptions,
    queryKey: ["project", "list", context.namespace],
    select: (data) => {
      const instanceList = data as InstanceList;
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

  const baseOptions = getCustomResourceOptions(
    {
      group: instanceConfig.group,
      version: instanceConfig.version,
      plural: instanceConfig.plural,
      name: request.projectName,
    },
    context
  );

  return queryOptions({
    ...baseOptions,
    queryKey: ["project", "get", context.namespace, request.projectName],
    select: (data) => {
      const instance = data as InstanceResource;
      return postprocess?.(instance) ?? instance;
    },
    enabled: !!context.namespace && !!request.projectName,
  });
};
