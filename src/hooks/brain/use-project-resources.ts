import { getProjectResourcesOptions } from "@/lib/brain/resources/project/project-method/project-query";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { useQuery } from "@tanstack/react-query";

export function useProjectResources(projectName: string) {
  const k8sContext = createK8sContext();

  const {
    data: resources,
    isLoading,
    error,
  } = useQuery(getProjectResourcesOptions(k8sContext, projectName));

  return {
    resources,
    isLoading,
    error,
  };
}
