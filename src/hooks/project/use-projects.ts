"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { listProjectsOptions } from "@/lib/project/project-method/project-query";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { CustomResourceListResponse } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/res-list-schemas";
import { useEffect } from "react";
import { useProjectActions } from "@/contexts/project/project-context";
import _ from "lodash";

const useProjects = (
  context: K8sApiContext
): UseQueryResult<CustomResourceListResponse, Error> => {
  const { setHomepageData } = useProjectActions();
  const queryResult = useQuery(listProjectsOptions(context));

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
