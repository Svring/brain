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
  const { flowGraphData } = useProjectState();
  const { setFlowGraphData } = useProjectActions();
  const context = createK8sContext();
  const patchMutation = useBatchPatchResourcesMetadataMutation(context);

  const { data: project, isSuccess } = useQuery(
    getProjectOptions(context, projectName)
  );

  const annotationData = useMemo(() => {
    const annotation =
      project?.metadata?.annotations?.[BRAIN_RESOURCES_ANNOTATION_KEY];
    if (!annotation) return null;
    return JSON.parse(annotation) as BrainResourcesSimplified;
  }, [project]);

  // Full resources query when no annotation exists
  const fullResourcesQuery = useQuery({
    ...getProjectResourcesOptions(context, projectName),
    enabled: isSuccess && !annotationData,
  });

  console.log("fullResourcesQuery", fullResourcesQuery.data);

  // Optimized annotation-based query when annotation exists
  const annotationBasedQuery = useQuery({
    ...listAnnotationBasedResourcesOptions(
      context,
      annotationData!,
      projectName
    ),
    enabled: isSuccess && !!annotationData,
  });

  // Use annotation-based query if available, otherwise use full query
  const resourcesQuery = annotationData
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
    if (
      project === projectName &&
      resources &&
      !annotationData &&
      !patchMutation.isPending
    ) {
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
  }, [projectName, flowGraphData, annotationData, patchMutation]);

  return resourcesQuery;
}
