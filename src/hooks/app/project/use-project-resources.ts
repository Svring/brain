"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { getProjectResourcesOptions } from "@/lib/app/project/project-method/project-query";
import { createK8sContext } from "@/lib/k8s/k8s-method/k8s-utils";
import { ListAllResourcesResponse } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/res-list-schemas";
import { useEffect } from "react";
import { useProjectContext } from "@/contexts/project-context/project-context";
import _ from "lodash";

export function useProjectResources(
  projectName: string
): UseQueryResult<ListAllResourcesResponse, Error> {
  const { send } = useProjectContext();
  const queryResult = useQuery(
    getProjectResourcesOptions(createK8sContext(), projectName)
  );

  useEffect(() => {
    if (queryResult.data) {
      send({
        type: "SET_FLOW_GRAPH_DATA",
        project: projectName,
        resources: _.flatMap(
          [queryResult.data.builtin, queryResult.data.custom],
          (resourceGroup) =>
            _.map(resourceGroup, (resourceList) =>
              _.map(resourceList.items, (item) => ({
                kind: item.kind,
                name: item.metadata.name,
              }))
            )
        ).flat(),
      });
    }
  }, [queryResult.data, projectName, send]);

  return queryResult;
}
