import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import {
  flattenListAllResourcesResponse,
  convertResourceToTarget,
} from "@/lib/k8s/k8s-method/k8s-utils";
import { INSTANCE_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";

export default function useProjectResources(projectName: string) {
  const { k8s } = useTRPCClients();

  const labelSelector = useMemo(
    () => `${INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS}=${projectName}`,
    [projectName]
  );

  const {
    data: allResourcesResponse,
    isLoading,
    error,
  } = useQuery({
    ...k8s.listAllResources.queryOptions({
      labelSelector,
      builtinResourceTypes: ["deployment", "statefulset"],
      customResourceTypes: ["devbox", "cluster", "objectstoragebucket"],
    }),
  });

  // Convert resources to targets (memoized to prevent infinite re-renders)
  const { resources, k8sResources } = useMemo(() => {
    if (!allResourcesResponse) return { resources: [], k8sResources: [] };

    const flattened = flattenListAllResourcesResponse(allResourcesResponse);
    const targets = flattened.map(convertResourceToTarget).filter(Boolean);

    return {
      resources: targets,
      k8sResources: flattened,
    };
  }, [allResourcesResponse, projectName]);

  return {
    resources,
    k8sResources,
    isLoading,
    error,
  };
}
