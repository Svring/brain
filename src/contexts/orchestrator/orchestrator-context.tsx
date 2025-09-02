"use client";

import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/react";
import { createContext, type ReactNode, useContext, useEffect } from "react";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import { orchestratorMachine } from "@/contexts/orchestrator/orchestrator-machine";
import { useProjectActions } from "../project/project-context";
import { useChatState } from "../chat/chat-context";

// const inspector = createBrowserInspector();

interface OrchestratorContextValue {
  state: StateFrom<typeof orchestratorMachine>;
  send: (event: EventFrom<typeof orchestratorMachine>) => void;
  actorRef: ActorRefFrom<typeof orchestratorMachine>;
}

export const OrchestratorContext = createContext<
  OrchestratorContextValue | undefined
>(undefined);

export const OrchestratorProvider = ({ children }: { children: ReactNode }) => {
  const [state, send, actorRef] = useMachine(orchestratorMachine, {
    // inspect: inspector.inspect,
  });

  const { sidebarChatOpen } = useChatState();
  const { clearSelectedResource } = useProjectActions();

  // Monitor sidebar chat state changes and perform side effects
  useEffect(() => {
    const previousState = state.context.monitoredStates.sidebarChatOpen;

    // Only update if the state actually changed
    if (previousState !== sidebarChatOpen) {
      send({ type: "UPDATE_SIDEBAR_CHAT_STATE", open: sidebarChatOpen });

      // Perform side effect: clear selected resource when sidebar chat closes
      if (previousState === true && sidebarChatOpen === false) {
        clearSelectedResource();
      }
    }
  }, [sidebarChatOpen, state.context.monitoredStates.sidebarChatOpen]);

  return (
    <OrchestratorContext.Provider value={{ state, send, actorRef }}>
      {children}
    </OrchestratorContext.Provider>
  );
};

export function useOrchestratorContext() {
  const ctx = useContext(OrchestratorContext);
  if (!ctx)
    throw new Error(
      "useOrchestratorContext must be used within OrchestratorProvider"
    );
  return ctx;
}

export function useOrchestratorState() {
  const { state } = useOrchestratorContext();
  return {
    monitoredStates: state.context.monitoredStates,
  };
}

export function useOrchestratorActions() {
  const { send } = useOrchestratorContext();

  return {
    updateSidebarChatState: (open: boolean) =>
      send({ type: "UPDATE_SIDEBAR_CHAT_STATE", open }),
  };
}
