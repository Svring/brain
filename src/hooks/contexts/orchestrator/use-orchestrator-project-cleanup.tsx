import { useEffect } from "react";
import {
  useProjectState,
  useProjectActions,
} from "@/contexts/project/project-context";
import { useFlowgraphActions } from "@/contexts/flowgraph/flowgraph-context";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import { orchestratorMachine } from "@/contexts/orchestrator/orchestrator-machine";

interface UseOrchestratorProjectCleanupParams {
  state: StateFrom<typeof orchestratorMachine>;
  send: (event: EventFrom<typeof orchestratorMachine>) => void;
}

export const useOrchestratorProjectCleanup = ({
  state,
  send,
}: UseOrchestratorProjectCleanupParams) => {
  const { selectedProject } = useProjectState();
  const { clearSelectedResource, clearSelectedProjectResources } =
    useProjectActions();
  const { clearAllState: clearFlowgraphState } = useFlowgraphActions();

  useEffect(() => {
    const prev = state.context.monitoredStates.selectedProject;
    if (prev !== selectedProject) {
      send({ type: "UPDATE_SELECTED_PROJECT", project: selectedProject });

      // If there was a previous project and it's different from the new one, cleanup
      if (prev && prev !== selectedProject) {
        // Clear flowgraph nodes and edges
        clearFlowgraphState();
        // Clear project resources
        clearSelectedProjectResources();
        // Clear selected resource
        clearSelectedResource();
      }
    }
  }, [selectedProject, state.context.monitoredStates.selectedProject]);
};
