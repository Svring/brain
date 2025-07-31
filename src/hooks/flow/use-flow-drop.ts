import type { DragEndEvent } from "@dnd-kit/core";
import type { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { useAddToProjectMutation } from "@/lib/project/project-method/project-mutation";
import { useProjectActions } from "@/contexts/project/project-context";
import { toast } from "sonner";
import _ from "lodash";

/**
 * Custom hook for handling drop events in the flow
 * @param projectName The name of the project
 * @returns handleDrop function
 */
export function useFlowDrop(context: K8sApiContext, projectName: string) {
  const addToProjectMutation = useAddToProjectMutation(context);
  const { setFlowGraphData } = useProjectActions();

  const handleDrop = (event: DragEndEvent) => {
    const { active } = event;
    const resources = _.castArray(
      _.get(active, "data.current.resources") ??
        _.get(active, "data.current.resourceTarget", [])
    );
    if (_.isEmpty(resources)) return;

    addToProjectMutation.mutate(
      { resources, projectName },
      {
        onSuccess: (data) => {
          setFlowGraphData(projectName, null);
          toast.success(
            `Added ${resources.length} resource${
              resources.length === 1 ? "" : "s"
            } to project ${projectName}`
          );
        },
        onError: () => toast.error("Failed to add resources to project"),
      }
    );
  };

  return { handleDrop };
}
