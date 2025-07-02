"use client";

import { queryOptions } from "@tanstack/react-query";
import { listAllResourcesOptions } from "@/lib/k8s/k8s-query";
import type { AnyKubernetesList, ResourceTarget } from "@/lib/k8s/schemas";
import { PROJECT_NAME_LABEL_KEY } from "./project-constant";
import { groupResourcesByProject } from "./project-transform";
import type {
  GetProjectRequest,
  ListProjectsRequest,
  ProjectResources,
} from "./schemas";

export const listProjectOptions = (
  request: ListProjectsRequest,
  postprocess: (data: ProjectResources) => ProjectResources = (d) => d
) => {
  // Use the existing listAllResourcesOptions with postprocessing
  const baseOptions = listAllResourcesOptions(
    { namespace: request.namespace },
    (data) => groupResourcesByProject(data as Record<string, AnyKubernetesList>)
  );

  return queryOptions({
    ...baseOptions,
    queryKey: ["project", "list", request.namespace],
    select: (data) => postprocess(data as ProjectResources),
  });
};

export const getProjectOptions = (
  request: GetProjectRequest,
  postprocess: (data: ResourceTarget[]) => ResourceTarget[] = (d) => d
) => {
  // Use label selector to filter resources at the API level
  const labelSelector = `${PROJECT_NAME_LABEL_KEY}=${request.projectName}`;

  const baseOptions = listAllResourcesOptions(
    {
      namespace: request.namespace,
      labelSelector,
    },
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
    queryKey: ["project", "get", request.namespace, request.projectName],
    select: (data) => postprocess(data as ResourceTarget[]),
    enabled: !!request.namespace && !!request.projectName,
  });
};
