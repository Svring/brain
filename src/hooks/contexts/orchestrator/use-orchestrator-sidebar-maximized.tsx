import { useEffect } from "react";
import { useChatState } from "@/contexts/chat/chat-context";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import { orchestratorMachine } from "@/contexts/orchestrator/orchestrator-machine";

interface UseOrchestratorSidebarMaximizedParams {
  state: StateFrom<typeof orchestratorMachine>;
  send: (event: EventFrom<typeof orchestratorMachine>) => void;
}

export const useOrchestratorSidebarMaximized = ({ state, send }: UseOrchestratorSidebarMaximizedParams) => {
  const { sidebarChatMaximized } = useChatState();

  useEffect(() => {
    const prev = state.context.monitoredStates.sidebarChatMaximized;
    if (prev !== sidebarChatMaximized) {
      send({
        type: "UPDATE_SIDEBAR_CHAT_MAXIMIZED",
        maximized: sidebarChatMaximized,
      });
    }
  }, [sidebarChatMaximized, state.context.monitoredStates.sidebarChatMaximized]);
};
