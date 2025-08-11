import { getProjectResourcesQuery } from "@/lib/brain/resources/project/project-method/project-query";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { useQuery } from "@tanstack/react-query";

export function useProjectResources(projectName: string) {
  const k8sContext = createK8sContext();

  const {
    data: expandedResources,
    isLoading,
    error,
  } = useQuery(getProjectResourcesQuery(k8sContext, projectName));

  return {
    expandedResources: expandedResources || [],
    isLoading,
    error,
  };
}
