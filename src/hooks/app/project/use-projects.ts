"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { listProjectsOptions } from "@/lib/app/project/project-query";
import type { ProjectList } from "@/lib/app/project/schemas";
import { createK8sContext } from "@/lib/k8s/k8s-utils";

export default function useProjects(): UseQueryResult<ProjectList, Error> {
  const context = createK8sContext();

  return useQuery({
    ...listProjectsOptions(context),
    enabled: !!context,
  });
}
