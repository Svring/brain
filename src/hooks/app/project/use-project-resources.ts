"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { getProjectResourcesOptions } from "@/lib/app/project/project-method/project-query";
import { createK8sContext } from "@/lib/k8s/k8s-method/k8s-utils";
import { ListAllResourcesResponse } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/res-list-schemas";

export function useProjectResources(
  projectName: string
): UseQueryResult<ListAllResourcesResponse, Error> {
  const context = createK8sContext();

  return useQuery(getProjectResourcesOptions(context, projectName));
}
