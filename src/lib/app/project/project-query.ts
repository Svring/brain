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
import type {
  GetProjectRequest,
  ListProjectsRequest,
  ProjectResources,
} from "./schemas";

export const listProjectOptions = (
  request: ListProjectsRequest,
  context: K8sApiContext,
  postprocess?: (data: ProjectResources) => ProjectResources
) => {
  // Use the existing listAllResourcesOptions without postprocessing
  const baseOptions = listAllResourcesOptions(
    { labelSelector: request.labelSelector },
    context
  );

  return queryOptions({
    ...baseOptions,
    queryKey: ["project", "list", context.namespace, request.labelSelector],
    select: (data) => {
      // Transform the raw data to grouped projects
      const groupedProjects = groupResourcesByProject(
        data as Record<string, AnyKubernetesList>
      );
      return postprocess?.(groupedProjects) ?? groupedProjects;
    },
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
    context
  );

  return queryOptions({
    ...baseOptions,
    queryKey: ["project", "get", context.namespace, request.projectName],
    select: (data) => {
      // Transform the raw data to grouped projects, then extract the specific project
      const projectGroups = groupResourcesByProject(
        data as Record<string, AnyKubernetesList>
      );
      // Return resources for the specific project, or empty array if not found
      const projectResources = projectGroups[request.projectName] || [];
      return postprocess?.(projectResources) ?? projectResources;
    },
    enabled: !!context.namespace && !!request.projectName,
  });
};
