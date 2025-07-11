"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { listProjectsOptions } from "@/lib/app/project/project-method/project-query";
import { createK8sContext } from "@/lib/k8s/k8s-method/k8s-utils";
import { CustomResourceListResponse } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/res-list-schemas";

const useProjects = (): UseQueryResult<CustomResourceListResponse, Error> =>
  useQuery(listProjectsOptions(createK8sContext()));

export default useProjects;
