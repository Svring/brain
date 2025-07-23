"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import {
  getProjectResourcesOptions,
  getProjectOptions,
} from "@/lib/project/project-method/project-query";
import {
  createK8sContext,
  BrainResourcesSimplified,
  convertResourcesToAnnotation,
} from "@/lib/k8s/k8s-method/k8s-utils";
import { ListAllResourcesResponse } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/res-list-schemas";
import { useEffect, useMemo } from "react";
import {
  useProjectState,
  useProjectActions,
} from "@/contexts/project/project-context";
import _ from "lodash";
import { listAnnotationBasedResourcesOptions } from "@/lib/k8s/k8s-method/k8s-query";
import { useBatchPatchResourcesMetadataMutation } from "@/lib/k8s/k8s-method/k8s-mutation";
import { CUSTOM_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-custom-resource";
import { BRAIN_RESOURCES_ANNOTATION_KEY } from "@/lib/project/project-constant/project-constant-label";

export function useProjectResources(
  projectName: string
): UseQueryResult<ListAllResourcesResponse, Error> {
  const context = createK8sContext();
  const { flowGraphData } = useProjectState();
  const { setFlowGraphData } = useProjectActions();
  const patchMutation = useBatchPatchResourcesMetadataMutation();

  const { data: project, isSuccess } = useQuery(
    getProjectOptions(context, projectName)
  );

  const annotationResources = project?.metadata?.annotations?.[
    BRAIN_RESOURCES_ANNOTATION_KEY
  ]
    ? (JSON.parse(
        project.metadata.annotations[BRAIN_RESOURCES_ANNOTATION_KEY]
      ) as BrainResourcesSimplified)
    : null;

  const flowGraphResources = useMemo(() => {
    const { resources } = flowGraphData;
    return resources || null;
  }, [flowGraphData]);

  const resourcesData = useMemo(() => {
    return annotationResources || flowGraphResources;
  }, [annotationResources, flowGraphResources]);

  // Full resources query when no annotation exists
  const fullResourcesQuery = useQuery({
    ...getProjectResourcesOptions(context, projectName, [
      "devbox",
      "cluster",
      "deployment",
      "statefulset",
    ]),
    enabled: isSuccess && !annotationResources,
  });

  // Optimized annotation-based query when annotation exists
  const annotationBasedQuery = useQuery({
    ...listAnnotationBasedResourcesOptions(
      context,
      resourcesData!,
      projectName
    ),
    enabled: isSuccess && !!resourcesData,
  });

  // Use annotation-based query if available, otherwise use full query
  const resourcesQuery = resourcesData
    ? annotationBasedQuery
    : fullResourcesQuery;

  // Send simplified data to state machine for flow graph state
  useEffect(() => {
    if (resourcesQuery.data) {
      const simplifiedData = convertResourcesToAnnotation(resourcesQuery.data);
      setFlowGraphData(projectName, simplifiedData);
    }
  }, [projectName, resourcesQuery.data]);

  // Store simplified data in annotation when full resources are loaded and no annotation exists
  useEffect(() => {
    const { project, resources } = flowGraphData;
    if (project === projectName && resources) {
      patchMutation.mutate({
        targets: [
          {
            type: "custom",
            group: CUSTOM_RESOURCES.instance.group,
            version: CUSTOM_RESOURCES.instance.version,
            plural: CUSTOM_RESOURCES.instance.plural,
            name: projectName,
          },
        ],
        metadataType: "annotations",
        key: BRAIN_RESOURCES_ANNOTATION_KEY,
        value: JSON.stringify(resources),
      });
    }
  }, [projectName, flowGraphData]);

  return resourcesQuery;
}
