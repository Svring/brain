"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { listProjectsOptions } from "@/lib/app/project/project-method/project-query";
import { createK8sContext } from "@/lib/k8s/k8s-method/k8s-utils";
import { CustomResourceListResponse } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/res-list-schemas";
import { use, useEffect } from "react";
import { ProjectContext } from "@/contexts/project-context";

const useProjects = (): UseQueryResult<CustomResourceListResponse, Error> => {
  const { setProjects } = use(ProjectContext);
  const queryResult = useQuery(listProjectsOptions(createK8sContext()));

  useEffect(() => {
    const projects =
      queryResult.data?.items.map((item) => item.metadata.name) || [];
    setProjects(projects);
  }, [queryResult.data, setProjects]);

  return queryResult;
};

export default useProjects;
