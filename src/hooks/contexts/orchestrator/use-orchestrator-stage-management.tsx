import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useProjectState } from "@/contexts/project/project-context";
import { useLanggraphAgent } from "@/hooks/langgraph/use-langgraph-agent";
import {
  useLanggraphContext,
  useLanggraphActions,
} from "@/contexts/langgraph/langgraph-context";
import { useChatState } from "@/contexts/chat/chat-context";

export const useOrchestratorStageManagement = () => {
  const pathname = usePathname();
  const { selectedProject, selectedResource, selectedProjectResources } =
    useProjectState();
  const { state: langgraphState } = useLanggraphContext();
  const { setState: setLanggraphState } = useLanggraphAgent();
  const { sidebarChatOpen } = useChatState();
  const { setStage, setProjectContext, updateResourceContext } =
    useLanggraphActions();

  useEffect(() => {
    let stage: "propose_project" | "manage_project" | "manage_resource";
    let updatedContext = { ...langgraphState.context };

    if (pathname === "/home") {
      stage = "propose_project";
    } else if (selectedResource !== null) {
      stage = "manage_resource";
      // Set resource context with selected_resource_context from langgraph state
      const selectedResourceContext =
        langgraphState.context.resource_context?.selected_resource_context;
      updatedContext.resource_context = {
        ...updatedContext.resource_context,
        selected_resource_context: selectedResourceContext,
      };
    } else {
      stage = "manage_project";
      // Set project context to selectedProjectResources
      updatedContext.project_context = {
        ...updatedContext.project_context,
        selectedProjectResources: selectedProjectResources,
      };
    }

    // Set the stage in the updated context
    updatedContext.stage = stage;

    // Sync to langgraph agent state (as before)
    setLanggraphState({ ...updatedContext, stage });

    // Also sync to langgraph context/XState machine
    setStage(stage);
  }, [
    pathname,
    selectedResource,
    selectedProject,
    selectedProjectResources,
    sidebarChatOpen,
    langgraphState.context.stage,
  ]);
};
