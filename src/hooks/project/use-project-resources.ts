"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import {
  getProjectResourcesOptions,
} from "@/lib/project/project-method/project-query";
import {
  convertResourcesToAnnotation,
} from "@/lib/k8s/k8s-method/k8s-utils";
import { ListAllResourcesResponse } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/res-list-schemas";
import { useEffect } from "react";
import {
  useProjectState,
  useProjectActions,
} from "@/contexts/project/project-context";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";

export function useProjectResources(
  context: K8sApiContext,
  projectName: string
): UseQueryResult<ListAllResourcesResponse, Error> {
  const { setFlowGraphData } = useProjectActions();

  // Always fetch all resources directly
  const resourcesQuery = useQuery({
    ...getProjectResourcesOptions(context, projectName, [
      "devbox",
      "cluster",
      "deployment",
      "statefulset",
    ]),
  });

  // Send simplified data to state machine for flow graph state
  useEffect(() => {
    if (resourcesQuery.data) {
      const simplifiedData = convertResourcesToAnnotation(resourcesQuery.data);
      setFlowGraphData(projectName, simplifiedData);
    }
  }, [projectName, resourcesQuery.data, setFlowGraphData]);

  return resourcesQuery;
}
