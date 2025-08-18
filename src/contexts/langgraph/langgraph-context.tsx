"use client";

import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/react";
import { createContext, type ReactNode, useContext } from "react";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import { langgraphMachine } from "@/contexts/langgraph/langgraph-machine";
import type { BrainState, ProjectProposal } from "./langgraph-schema";
import { useLanggraphAgent } from "@/hooks/langgraph/use-langgraph-agent";
import _ from "lodash";

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
    stage: state.context.stage,
    projectProposal: state.context.project_proposal,
    resourceContext: state.context.resource_context,
    isIdle: state.matches("idle"),
    isActive: state.matches("active"),
  };
}

export function useLanggraphActions() {
  const { send, state } = useLanggraphContext();
  const { state: langgraphState, setState: setLanggraphState } =
    useLanggraphAgent();

  const syncStateToLanggraph = () => {
    const newState = _.cloneDeep(langgraphState);
    _.set(newState, "base_url", state.context.base_url);
    _.set(newState, "api_key", state.context.api_key);
    _.set(newState, "model", state.context.model);
    _.set(newState, "stage", state.context.stage);
    _.set(newState, "project_proposal", state.context.project_proposal);
    _.set(newState, "resource_context", state.context.resource_context);
    _.set(newState, "project_context", state.context.project_context);
    setLanggraphState(newState);
  };

  return {
    activate: () => {
      send({ type: "ACTIVATE" });
      syncStateToLanggraph();
    },
    deactivate: () => {
      send({ type: "DEACTIVATE" });
      syncStateToLanggraph();
    },
    setConfig: (config: {
      base_url?: string;
      api_key?: string;
      model?: string;
    }) => {
      send({ type: "SET_CONFIG", ...config });
      syncStateToLanggraph();
    },
    setStage: (stage: "project" | "resource") => {
      send({ type: "SET_STAGE", stage });
      syncStateToLanggraph();
    },
    setProjectProposal: (projectProposal: ProjectProposal) => {
      send({ type: "SET_PROJECT_PROPOSAL", project_proposal: projectProposal });
      syncStateToLanggraph();
    },
    setResourceContext: (resourceContext: any) => {
      send({ type: "SET_RESOURCE_CONTEXT", resource_context: resourceContext });
      syncStateToLanggraph();
    },
  };
}
