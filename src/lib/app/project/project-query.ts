"use client";

import { queryOptions } from "@tanstack/react-query";
import { listAllResourcesOptions } from "@/lib/k8s/k8s-query";
import type { AnyKubernetesList, ResourceTarget } from "@/lib/k8s/schemas";
import {
  filterResourcesForProject,
  groupResourcesByProject,
} from "./project-transform";
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
  // Use the existing listAllResourcesOptions with postprocessing
  const baseOptions = listAllResourcesOptions(
    { namespace: request.namespace },
    (data) =>
      filterResourcesForProject(
        data as Record<string, AnyKubernetesList>,
        request.projectName
      )
  );

  return queryOptions({
    ...baseOptions,
    queryKey: ["project", "get", request.namespace, request.projectName],
    select: (data) => postprocess(data as ResourceTarget[]),
    enabled: !!request.namespace && !!request.projectName,
  });
};
