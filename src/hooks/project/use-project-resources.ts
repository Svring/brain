"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProjectResourcesOptions } from "@/lib/project/project-method/project-query";
import {
  createK8sContext,
  BrainResourcesSimplified,
  convertResourcesToAnnotation,
} from "@/lib/k8s/k8s-method/k8s-utils";
import { ListAllResourcesResponse } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/res-list-schemas";
import { useEffect, useMemo } from "react";
import { useProjectContext } from "@/contexts/project-context/project-context";
import _ from "lodash";
import { listAnnotationBasedResourcesOptions } from "@/lib/k8s/k8s-method/k8s-query";
import { useBatchPatchResourcesMetadataMutation } from "@/lib/k8s/k8s-method/k8s-mutation";
import { CUSTOM_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-custom-resource";
import { BRAIN_RESOURCES_ANNOTATION_KEY } from "@/lib/project/project-constant/project-constant-label";
import { listProjectsOptions } from "@/lib/project/project-method/project-query";

export function useProjectResources(
  projectName: string
): UseQueryResult<ListAllResourcesResponse, Error> {
  const { send } = useProjectContext();
  const context = createK8sContext();
  const queryClient = useQueryClient();
  const patchMutation = useBatchPatchResourcesMetadataMutation(context);

  const {
    data: projectList,
    isLoading,
    isSuccess,
  } = useQuery(listProjectsOptions(context));

  const annotation = projectList?.items?.find(
    (item) => item.metadata.name === projectName
  )?.metadata?.annotations?.[BRAIN_RESOURCES_ANNOTATION_KEY];

  // Parse annotation data
  const annotationData = useMemo(() => {
    if (!annotation) return null;
    return JSON.parse(annotation) as BrainResourcesSimplified;
  }, [annotation]);

  // Full resources query when no annotation exists
  const fullResourcesQuery = useQuery({
    ...getProjectResourcesOptions(context, projectName),
    enabled: isSuccess && !annotationData,
  });

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

  // Store simplified data in annotation when full resources are loaded and no annotation exists
  useEffect(() => {
    if (fullResourcesQuery.data && !annotation && !patchMutation.isPending) {
      const simplifiedData = convertResourcesToAnnotation(
        fullResourcesQuery.data
      );

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
        value: JSON.stringify(simplifiedData),
      });
    }
  }, [fullResourcesQuery.data, patchMutation, projectName]);

  // Send simplified data to state machine for flow graph
  useEffect(() => {
    if (resourcesQuery.data) {
      const simplifiedData = convertResourcesToAnnotation(resourcesQuery.data);
      send({
        type: "SET_FLOW_GRAPH_DATA",
        project: projectName,
        resources: [...simplifiedData.builtin, ...simplifiedData.custom],
      });
    }
  }, [resourcesQuery.data, projectName, send]);

  return resourcesQuery;
}
