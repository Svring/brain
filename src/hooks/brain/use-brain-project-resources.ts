import { BrainProjectObject } from "@/lib/brain/brain-schemas/brain-project-object-schema";
import { getBrainProjectResourcesQuery } from "@/lib/brain/brain-methods/brain-query";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { useQuery } from "@tanstack/react-query";

export function useBrainProjectResources(projectName: string) {
  const k8sContext = createK8sContext();

  const {
    data: expandedResources,
    isLoading,
    error,
  } = useQuery(getBrainProjectResourcesQuery(k8sContext, projectName));

  return {
    expandedResources: expandedResources || [],
    isLoading,
    error,
  };
}
