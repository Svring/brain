"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { listProjectsOptions } from "@/lib/app/project/project-method/project-query";
import { createK8sContext } from "@/lib/k8s/k8s-method/k8s-utils";
import { CustomResourceListResponse } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/res-list-schemas";
import { useEffect } from "react";
import { useProjectContext } from "@/contexts/project-context/project-context";

const useProjects = (): UseQueryResult<CustomResourceListResponse, Error> => {
  const { send } = useProjectContext();
  const queryResult = useQuery(listProjectsOptions(createK8sContext()));

  useEffect(() => {
    if (queryResult.data) {
      const projects = queryResult.data?.items || [];
      send({ type: "SET_HOMEPAGE_DATA", projects });
    }
  }, [queryResult.data, send]);

  return queryResult;
};

export default useProjects;
