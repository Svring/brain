"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import {
  getProjectResourcesOptions,
  listProjectsOptions,
} from "@/lib/app/project/project-query";
import type { ProjectList } from "@/lib/app/project/schemas";
import { getCurrentNamespace, getDecodedKubeconfig } from "@/lib/k8s/k8s-utils";
import { K8sApiContextSchema } from "@/lib/k8s/schemas";

export function useProjects(): UseQueryResult<ProjectList, Error> {
  const context = K8sApiContextSchema.parse({
    namespace: getCurrentNamespace(),
    kubeconfig: getDecodedKubeconfig(),
  });

  return useQuery({
    ...listProjectsOptions(context),
    enabled: !!context,
  });
}

export function useProjectResources<T = unknown>(
  projectName: string,
  postprocess?: (data: unknown) => T
): UseQueryResult<T, Error> {
  const context = K8sApiContextSchema.parse({
    namespace: getCurrentNamespace(),
    kubeconfig: getDecodedKubeconfig(),
  });

  return useQuery({
    ...getProjectResourcesOptions(projectName, context, postprocess),
    enabled: !!context && !!projectName,
  });
}
