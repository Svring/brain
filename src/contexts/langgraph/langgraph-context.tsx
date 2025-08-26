"use client";

import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/react";
import { createContext, type ReactNode, useContext } from "react";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import { langgraphMachine } from "@/contexts/langgraph/langgraph-machine";
import { useLanggraphAgent } from "@/hooks/langgraph/use-langgraph-agent";
import { ProjectContextState } from "../project/project-machine";

// const inspector = createBrowserInspector();

interface LanggraphContextValue {
  state: StateFrom<typeof langgraphMachine>;
  send: (event: EventFrom<typeof langgraphMachine>) => void;
  actorRef: ActorRefFrom<typeof langgraphMachine>;
}

export const LanggraphContext = createContext<
  LanggraphContextValue | undefined
>(undefined);

export const LanggraphProvider = ({ children }: { children: ReactNode }) => {
  const [state, send, actorRef] = useMachine(langgraphMachine, {
    // inspect: inspector.inspect,
  });

  return (
    <LanggraphContext.Provider value={{ state, send, actorRef }}>
      {children}
    </LanggraphContext.Provider>
  );
};

export function useLanggraphContext() {
  const ctx = useContext(LanggraphContext);
  if (!ctx)
    throw new Error(
      "useLanggraphContext must be used within LanggraphProvider"
    );
  return ctx;
}

export function useLanggraphState() {
  const { state } = useLanggraphContext();
  return {
    baseUrl: state.context.base_url,
    apiKey: state.context.api_key,
    model: state.context.model,
    contextWindowUsage: state.context.context_window_usage,
    stage: state.context.stage,
    isIdle: state.matches("idle"),
    isActive: state.matches("active"),
  };
}

export function useLanggraphActions() {
  const { send, state } = useLanggraphContext();
  const { state: langgraphState, setState: setLanggraphState } =
    useLanggraphAgent(state.context.stage);

  return {
    setConfig: (config: {
      base_url?: string;
      api_key?: string;
      model?: string;
    }) => {
      send({ type: "SET_CONFIG", ...config });
      setLanggraphState({ ...state.context, ...config });
    },
    setStage: (stage: "propose_project" | "manage_project") => {
      send({ type: "SET_STAGE", stage });
      setLanggraphState({ ...state.context, stage });
    },
    setProjectContext: (projectContext: ProjectContextState) => {
      send({ type: "SET_PROJECT_CONTEXT", project_context: projectContext });
      setLanggraphState({ ...state.context, project_context: projectContext });
    },
    setContextWindowUsage: (contextWindowUsage: number) => {
      send({
        type: "SET_CONTEXT_WINDOW_USAGE",
        context_window_usage: contextWindowUsage,
      });
    },
  };
}
