"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { listProjectsOptions } from "@/lib/project/project-method/project-query";
import { createK8sContext } from "@/lib/k8s/k8s-method/k8s-utils";
import { CustomResourceListResponse } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/res-list-schemas";
import { useEffect } from "react";
import { useProjectActions } from "@/contexts/project-context/project-context";
import _ from "lodash";

const useProjects = (): UseQueryResult<CustomResourceListResponse, Error> => {
  const { setHomepageData } = useProjectActions();
  const queryResult = useQuery(listProjectsOptions(createK8sContext()));

  useEffect(() => {
    if (queryResult.data) {
      const projects = _.map(queryResult.data?.items, (project) => {
        return {
          name: project.metadata.name,
        };
      });
      setHomepageData(projects);
    }
  }, [queryResult.data]);

  return queryResult;
};

export default useProjects;
