"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { getProjectResourcesOptions } from "@/lib/app/project/project-query";
import { getCurrentNamespace, getDecodedKubeconfig } from "@/lib/k8s/k8s-utils";
import { K8sApiContextSchema } from "@/lib/k8s/schemas";

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
