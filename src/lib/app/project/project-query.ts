"use client";

import { queryOptions } from "@tanstack/react-query";
import { listAllResourcesOptions } from "@/lib/k8s/k8s-query";
import type {
  AnyKubernetesList,
  K8sApiContext,
  ResourceTarget,
} from "@/lib/k8s/schemas";
import { PROJECT_NAME_LABEL_KEY } from "./project-constant";
import { groupResourcesByProject } from "./project-transform";
import type { GetProjectRequest, ProjectResources } from "./schemas";

export const listProjectOptions = (
  context: K8sApiContext,
  postprocess?: (data: ProjectResources) => ProjectResources
) => {
  // Use the existing listAllResourcesOptions with postprocessing
  const baseOptions = listAllResourcesOptions(
    { labelSelector: undefined },
    context,
    (data) => groupResourcesByProject(data as Record<string, AnyKubernetesList>)
  );

  return queryOptions({
    ...baseOptions,
    queryKey: ["project", "list", context.namespace],
    select: (data) =>
      postprocess?.(data as ProjectResources) ?? (data as ProjectResources),
  });
};

export const getProjectOptions = (
  request: GetProjectRequest,
  context: K8sApiContext,
  postprocess?: (data: ResourceTarget[]) => ResourceTarget[]
) => {
  // Use label selector to filter resources at the API level
  const labelSelector = `${PROJECT_NAME_LABEL_KEY}=${request.projectName}`;

  const baseOptions = listAllResourcesOptions(
    {
      labelSelector,
    },
    context,
    (data) => {
      const projectGroups = groupResourcesByProject(
        data as Record<string, AnyKubernetesList>
      );
      // Return resources for the specific project, or empty array if not found
      return projectGroups[request.projectName] || [];
    }
  );

  return queryOptions({
    ...baseOptions,
    queryKey: ["project", "get", context.namespace, request.projectName],
    select: (data) =>
      postprocess?.(data as ResourceTarget[]) ?? (data as ResourceTarget[]),
    enabled: !!context.namespace && !!request.projectName,
  });
};
