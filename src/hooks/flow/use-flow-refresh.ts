import { useState } from "react";
import { useRemoveProjectAnnotationMutation } from "@/lib/project/project-method/project-mutation";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { useProjectActions } from "@/contexts/project/project-context";
import { toast } from "sonner";

/**
 * Custom hook for handling project refresh functionality
 * @param projectName The name of the project
 * @returns { handleRefresh, isRefreshing }
 */
export function useFlowRefresh(projectName: string) {
  const context = createK8sContext();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const removeProjectAnnotationMutation =
    useRemoveProjectAnnotationMutation(context);
  const { setFlowGraphData } = useProjectActions();

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await removeProjectAnnotationMutation.mutateAsync({ projectName });
      setFlowGraphData(projectName, null);
      toast.success("Project resources refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh project resources");
    } finally {
      setIsRefreshing(false);
    }
  };

  return { handleRefresh, isRefreshing };
}
