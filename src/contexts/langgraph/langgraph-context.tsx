"use client";

import { useMachine } from "@xstate/react";
import { createContext, type ReactNode, useContext, useEffect } from "react";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import { langgraphMachine } from "@/contexts/langgraph/langgraph-machine";
import { ProjectContextState } from "@/contexts/project/project-machine";
import { useLanggraphStream as useOriginalLanggraphStream } from "@/hooks/langgraph/use-langgraph-stream";
import type { BrainState } from "@/contexts/langgraph/langgraph-schema";
import { useProjectState } from "@/contexts/project/project-context";
import type { Message } from "@langchain/langgraph-sdk";

interface LanggraphContextValue {
  state: StateFrom<typeof langgraphMachine>;
  send: (event: EventFrom<typeof langgraphMachine>) => void;
  actorRef: ActorRefFrom<typeof langgraphMachine>;
  stream: ReturnType<typeof useOriginalLanggraphStream>;
}

export const LanggraphContext = createContext<
  LanggraphContextValue | undefined
>(undefined);

// Updated LanggraphProvider that receives config as props
export const LanggraphProvider = ({
  children,
  config,
}: {
  children: ReactNode;
  config: {
    apiKey?: string;
    baseUrl?: string;
    modelName?: string;
  };
}) => {
  const [state, send, actorRef] = useMachine(langgraphMachine);
  const stream = useOriginalLanggraphStream();

  // Only set config from props if provided (for backward compatibility)
  useEffect(() => {
    if (config.apiKey && config.baseUrl && config.modelName) {
      send({
        type: "SET_CONFIG",
        api_key: config.apiKey,
        base_url: config.baseUrl,
        model_name: config.modelName,
      });
    }
  }, [config.apiKey, config.baseUrl, config.modelName, send]);

  return (
    <LanggraphContext.Provider value={{ state, send, actorRef, stream }}>
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
    modelName: state.context.model_name,
    contextWindowUsage: state.context.context_window_usage,
    stage: state.context.stage,
    resourceContext: state.context.resource_context,
    isIdle: state.matches("idle"),
    isActive: state.matches("active"),
    isLoading: state.matches("loading"),
    isLoaded: state.matches("loaded"),
    isUnloaded: state.matches("unloaded"),
  };
}

export function useLanggraphActions() {
  const { send, state } = useLanggraphContext();

  return {
    setConfig: (config: {
      base_url?: string;
      api_key?: string;
      model_name?: string;
    }) => {
      send({ type: "SET_CONFIG", ...config });
    },
    setConfigFailed: () => {
      send({ type: "SET_CONFIG_FAILED" });
    },
    setStage: (
      stage: "propose_project" | "manage_project" | "manage_resource"
    ) => {
      send({ type: "SET_STAGE", stage });
    },
    setProjectContext: (projectContext: ProjectContextState) => {
      send({ type: "SET_PROJECT_CONTEXT", project_context: projectContext });
    },
    setContextWindowUsage: (contextWindowUsage: number) => {
      send({
        type: "SET_CONTEXT_WINDOW_USAGE",
        context_window_usage: contextWindowUsage,
      });
    },
    setResourceContext: (resourceContext: any) => {
      send({ type: "SET_RESOURCE_CONTEXT", resource_context: resourceContext });
    },
    updateResourceContext: (resourceContext: any) => {
      send({
        type: "UPDATE_RESOURCE_CONTEXT",
        resource_context: resourceContext,
      });
    },
    clearResourceContext: () => {
      send({ type: "CLEAR_RESOURCE_CONTEXT" });
    },
  };
}

export function useLanggraphStream() {
  const { stream } = useLanggraphContext();
  const { state } = useLanggraphContext();
  const { selectedProject, selectedResource, selectedProjectResources, selectedResourceContext } = useProjectState();

  // Create a wrapper that automatically includes BrainState context
  const submitWithContext = (data: {
    messages: Message[];
  }) => {
    const { api_key, base_url, model_name, context_window_usage, stage } = state.context;
    
    if (!api_key || !base_url || !model_name || !stage) {
      console.warn('Missing required langgraph configuration');
      return;
    }

    return stream.submit({
      ...data,
      api_key,
      base_url,
      model_name,
      context_window_usage,
      stage,
      project_context: {
        selectedProject,
        selectedProjectResources,
      },
      resource_context: selectedResource
        ? {
            selectedResource,
            selectedResourceContext,
          }
        : undefined,
    });
  };

  return {
    ...stream,
    submitWithContext,
  };
}
