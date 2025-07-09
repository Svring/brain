"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { listProjectsOptions } from "@/lib/app/project/project-query";
import type { ProjectList } from "@/lib/app/project/schemas";
import { getCurrentNamespace, getDecodedKubeconfig } from "@/lib/k8s/k8s-utils";
import { K8sApiContextSchema } from "@/lib/k8s/schemas";

export default function useProjects(): UseQueryResult<ProjectList, Error> {
  const context = K8sApiContextSchema.parse({
    namespace: getCurrentNamespace(),
    kubeconfig: getDecodedKubeconfig(),
  });

  return useQuery({
    ...listProjectsOptions(context),
    enabled: !!context,
  });
}
