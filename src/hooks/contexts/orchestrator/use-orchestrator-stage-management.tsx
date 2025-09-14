import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  useProjectState,
  useProjectActions,
} from "@/contexts/project/project-context";
import {
  useLanggraphContext,
  useLanggraphActions,
} from "@/contexts/langgraph/langgraph-context";
import { useChatState } from "@/contexts/chat/chat-context";

export const useOrchestratorStageManagement = () => {
  const pathname = usePathname();
  const {
    selectedProject,
    selectedResource,
    selectedProjectResources,
    selectedResourceContext,
  } = useProjectState();
  const {
    setSelectedProjectResources,
    selectResource,
    clearSelectedResource,
    setSelectedResourceContext,
  } = useProjectActions();
  const { state: langgraphState } = useLanggraphContext();
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
      // Update resource context through project actions
      const resourceContext =
        langgraphState.context.resource_context?.selected_resource_context;
      if (resourceContext) {
        setSelectedResourceContext(resourceContext);
        updateResourceContext(resourceContext);
      }
      updatedContext.resource_context = {
        ...updatedContext.resource_context,
        selected_resource_context: resourceContext,
      };
    } else {
      stage = "manage_project";
      // Update project context through project actions
      setSelectedProjectResources(selectedProjectResources || []);
      updatedContext.project_context = {
        ...updatedContext.project_context,
        selectedProjectResources: selectedProjectResources,
      };
    }

    // Set the stage in the updated context
    updatedContext.stage = stage;

    // Sync to langgraph context/XState machine
    setStage(stage);
  }, [
    pathname,
    selectedResource,
    selectedProject,
    selectedProjectResources,
    selectedResourceContext,
    sidebarChatOpen,
    langgraphState.context.stage,
  ]);
};
