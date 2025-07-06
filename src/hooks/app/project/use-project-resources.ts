"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { getProjectResourcesOptions } from "@/lib/app/project/project-query";
import {
  filterEmptyResources,
  getCurrentNamespace,
  getDecodedKubeconfig,
} from "@/lib/k8s/k8s-utils";
import type { AnyKubernetesResource } from "@/lib/k8s/schemas";
import { K8sApiContextSchema } from "@/lib/k8s/schemas";

export function useProjectResources(
  projectName: string
): UseQueryResult<Record<string, { items: AnyKubernetesResource[] }>, Error> {
  const context = K8sApiContextSchema.parse({
    namespace: getCurrentNamespace(),
    kubeconfig: getDecodedKubeconfig(),
  });

  return useQuery({
    ...getProjectResourcesOptions(projectName, context),
    enabled: !!context && !!projectName,
    select: (data) => {
      const typedData = data as Record<
        string,
        { items: AnyKubernetesResource[] }
      >;
      return filterEmptyResources(typedData);
    },
  });
}
