"use client";

import { useMachine } from "@xstate/react";
import { createContext, type ReactNode, useContext, useEffect } from "react";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import { orchestratorMachine } from "@/contexts/orchestrator/orchestrator-machine";
import { useProjectActions } from "../project/project-context";
import { useChatState } from "../chat/chat-context";
import { useLanggraphAgent } from "@/hooks/langgraph/use-langgraph-agent";
import { useLanggraphContext } from "../langgraph/langgraph-context";
import { useFlowgraphState } from "../flowgraph/flowgraph-context";
import { useReactFlow } from "@xyflow/react";

interface OrchestratorContextValue {
  state: StateFrom<typeof orchestratorMachine>;
  send: (event: EventFrom<typeof orchestratorMachine>) => void;
  actorRef: ActorRefFrom<typeof orchestratorMachine>;
}

export const OrchestratorContext = createContext<
  OrchestratorContextValue | undefined
>(undefined);

export const OrchestratorProvider = ({ children }: { children: ReactNode }) => {
  const [state, send, actorRef] = useMachine(orchestratorMachine);
  const { sidebarChatOpen, sidebarChatMaximized } = useChatState();
  const { clearSelectedResource } = useProjectActions();
  const { state: langgraphState } = useLanggraphContext();
  const { setState: setLanggraphState } = useLanggraphAgent();
  const { selectedNode } = useFlowgraphState();
  const { fitView } = useReactFlow();

  useEffect(() => {
    const prev = state.context.monitoredStates.sidebarChatOpen;
    if (prev !== sidebarChatOpen) {
      send({ type: "UPDATE_SIDEBAR_CHAT_STATE", open: sidebarChatOpen });
      if (prev && !sidebarChatOpen) clearSelectedResource();
    }
  }, [sidebarChatOpen, state.context.monitoredStates.sidebarChatOpen]);

  useEffect(() => {
    const prev = state.context.monitoredStates.sidebarChatMaximized;
    if (prev !== sidebarChatMaximized) {
      send({ type: "UPDATE_SIDEBAR_CHAT_MAXIMIZED", maximized: sidebarChatMaximized });
    }
  }, [sidebarChatMaximized, state.context.monitoredStates.sidebarChatMaximized]);

  // Handle fitView when chat is maximized and there's a selected node
  useEffect(() => {
    if (sidebarChatMaximized && selectedNode) {
      // Small delay to ensure the layout has updated
      const timer = setTimeout(() => {
        fitView({
          nodes: [{ id: selectedNode }],
          padding: 0.2,
          duration: 300,
          maxZoom: 1.5,
        });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [sidebarChatMaximized, selectedNode, fitView]);

  useEffect(() => {
    const { base_url, api_key, model_name } = langgraphState.context;
    if (base_url || api_key || model_name) {
      setLanggraphState(langgraphState.context);
    }
  }, [
    langgraphState.context.base_url,
    langgraphState.context.api_key,
    langgraphState.context.model_name,
  ]);

  // Sync stage changes with setLanggraphState
  useEffect(() => {
    const { stage } = langgraphState.context;
    if (stage) {
      setLanggraphState({ ...langgraphState.context, stage });
    }
  }, [langgraphState.context.stage, langgraphState.context]);

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
  return { monitoredStates: state.context.monitoredStates };
}

export function useOrchestratorActions() {
  const { send } = useOrchestratorContext();
  return {
    updateSidebarChatState: (open: boolean) =>
      send({ type: "UPDATE_SIDEBAR_CHAT_STATE", open }),
    updateSidebarChatMaximized: (maximized: boolean) =>
      send({ type: "UPDATE_SIDEBAR_CHAT_MAXIMIZED", maximized }),
  };
}
