"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProjectResourcesOptions } from "@/lib/app/project/project-method/project-query";
import {
  createK8sContext,
  BrainResourcesSimplified,
  convertResourcesToAnnotation,
} from "@/lib/k8s/k8s-method/k8s-utils";
import { ListAllResourcesResponse } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/res-list-schemas";
import { useEffect, useMemo } from "react";
import { useProjectContext } from "@/contexts/project-context/project-context";
import _ from "lodash";
import {
  getCustomResourceOptions,
  listAnnotationBasedResourcesOptions,
} from "@/lib/k8s/k8s-method/k8s-query";
import { useBatchPatchResourcesMetadataMutation } from "@/lib/k8s/k8s-method/k8s-mutation";
import { CUSTOM_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-custom-resource";

const BRAIN_RESOURCES_ANNOTATION_KEY = "brain-resources";

export function useProjectResources(
  projectName: string
): UseQueryResult<ListAllResourcesResponse, Error> {
  const { send } = useProjectContext();
  const context = createK8sContext();
  const queryClient = useQueryClient();
  const patchMutation = useBatchPatchResourcesMetadataMutation(context);

  const projectInstanceQueryOptions = getCustomResourceOptions(context, {
    type: "custom",
    group: CUSTOM_RESOURCES.instance.group,
    version: CUSTOM_RESOURCES.instance.version,
    plural: CUSTOM_RESOURCES.instance.plural,
    name: projectName,
  });

  const projectInstanceQuery = useQuery(projectInstanceQueryOptions);

  const annotation =
    projectInstanceQuery.data?.metadata?.annotations?.[
      BRAIN_RESOURCES_ANNOTATION_KEY
    ];

  // Parse annotation data
  const annotationData = useMemo(() => {
    if (!annotation) return null;
    try {
      return JSON.parse(annotation) as BrainResourcesSimplified;
    } catch (error) {
      console.warn("Failed to parse brain resources annotation:", error);
      return null;
    }
  }, [annotation]);

  // Full resources query when no annotation exists
  const fullResourcesQuery = useQuery({
    ...getProjectResourcesOptions(context, projectName),
    enabled: projectInstanceQuery.isSuccess && !annotationData,
  });

  // Optimized annotation-based query when annotation exists
  const annotationBasedQuery = useQuery({
    ...listAnnotationBasedResourcesOptions(
      context,
      annotationData!,
      projectName
    ),
    enabled: projectInstanceQuery.isSuccess && !!annotationData,
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

      patchMutation.mutate(
        {
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
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: projectInstanceQueryOptions.queryKey,
            });
          },
        }
      );
    }
  }, [
    fullResourcesQuery.data,
    annotation,
    patchMutation,
    projectName,
    queryClient,
    projectInstanceQueryOptions.queryKey,
  ]);

  // Send simplified data to state machine for flow graph
  useEffect(() => {
    if (resourcesQuery.data) {
      send({
        type: "SET_FLOW_GRAPH_DATA",
        project: projectName,
        resources: _.flatMap(
          [resourcesQuery.data.builtin, resourcesQuery.data.custom],
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
  }, [resourcesQuery.data, projectName, send]);

  return resourcesQuery;
}
