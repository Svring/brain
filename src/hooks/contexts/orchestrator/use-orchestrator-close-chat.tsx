import { useEffect } from "react";
import { useChatState, useChatActions } from "@/contexts/chat/chat-context";
import { useProjectActions } from "@/contexts/project/project-context";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import { orchestratorMachine } from "@/contexts/orchestrator/orchestrator-machine";

interface UseOrchestratorCloseChatParams {
  state: StateFrom<typeof orchestratorMachine>;
  send: (event: EventFrom<typeof orchestratorMachine>) => void;
}

export const useOrchestratorCloseChat = ({
  state,
  send,
}: UseOrchestratorCloseChatParams) => {
  const { sidebarChatOpen } = useChatState();
  const { selectThread } = useChatActions();
  const { clearSelectedResource } = useProjectActions();

  useEffect(() => {
    const prev = state.context.monitoredStates.sidebarChatOpen;
    if (prev !== sidebarChatOpen) {
      send({ type: "UPDATE_SIDEBAR_CHAT_STATE", open: sidebarChatOpen });
      if (prev && !sidebarChatOpen) {
        clearSelectedResource();
        // selectThread(null);
      }
    }
  }, [
    sidebarChatOpen,
    state.context.monitoredStates.sidebarChatOpen,
  ]);
};
