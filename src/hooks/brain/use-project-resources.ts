import { createK8sContext } from "@/lib/auth/auth-utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { listAllResourcesOptions } from "@/lib/k8s/k8s-method/k8s-query";
import {
  flattenListAllResourcesResponse,
  convertResourceToTarget,
} from "@/lib/k8s/k8s-method/k8s-utils";
import { INSTANCE_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";

export function useProjectResources(projectName: string) {
  const k8sContext = createK8sContext();

  const labelSelector = useMemo(
    () => `${INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS}=${projectName}`,
    [projectName]
  );

  const {
    data: allResourcesResponse,
    isLoading,
    error,
  } = useQuery(
    listAllResourcesOptions(
      k8sContext,
      labelSelector,
      ["deployment", "statefulset"], // builtin resources
      ["devbox", "cluster", "objectstoragebucket"] // custom resources
    )
  );

  // Convert resources to targets (memoized to prevent infinite re-renders)
  const resources = useMemo(() => {
    if (!allResourcesResponse) return [];

    return flattenListAllResourcesResponse(allResourcesResponse)
      .map(convertResourceToTarget)
      .filter(Boolean);
  }, [allResourcesResponse]);

  return {
    resources,
    isLoading,
    error,
  };
}
