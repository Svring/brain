"use client";

import { useMachine } from "@xstate/react";
import { useQuery } from "@tanstack/react-query";
import { createContext, type ReactNode, useContext, useEffect } from "react";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import { langgraphMachine } from "@/contexts/langgraph/langgraph-machine";
import { useLanggraphAgent } from "@/hooks/langgraph/use-langgraph-agent";
import { ProjectContextState } from "../project/project-machine";
import { useAiProxyContext } from "@/lib/auth/auth-utils";
import { listAiProxyTokensOptions } from "@/lib/sealos/resources/ai-proxy/ai-proxy-method/ai-proxy-query";
import { useCreateAiProxyTokenMutation } from "@/lib/sealos/resources/ai-proxy/ai-proxy-method/ai-proxy-mutation";
import { Spinner } from "@/components/ui/spinner";

interface LanggraphContextValue {
  state: StateFrom<typeof langgraphMachine>;
  send: (event: EventFrom<typeof langgraphMachine>) => void;
  actorRef: ActorRefFrom<typeof langgraphMachine>;
}

export const LanggraphContext = createContext<
  LanggraphContextValue | undefined
>(undefined);

const BrainTokenNotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-screen p-6">
    <div>Brain Token Not Found</div>
  </div>
);

export const LanggraphProvider = ({ children }: { children: ReactNode }) => {
  const aiProxyContext = useAiProxyContext();
  const [state, send, actorRef] = useMachine(langgraphMachine);
  const isProduction = process.env.NEXT_PUBLIC_MODE === "production";
  const {
    data: aiProxyTokens,
    isLoading,
    error,
  } = useQuery(listAiProxyTokensOptions(aiProxyContext));
  const brainToken = aiProxyTokens?.tokens?.find(
    (token) => token.name === "brain"
  );

  useEffect(() => {
    if (isProduction && brainToken && aiProxyContext.baseUrl) {
      const apiKey = `sk-${brainToken.key}`;
      const baseUrl = `https://aiproxy.${aiProxyContext.baseUrl}/v1`;
      const modelName = aiProxyContext.baseUrl.endsWith("io")
        ? "gpt-4.1"
        : "qwen3-235b-a22b";
      send({
        type: "SET_CONFIG",
        api_key: apiKey,
        base_url: baseUrl,
        model_name: modelName,
      });
    }
  }, [isProduction, brainToken, aiProxyContext.baseUrl]);

  if (isProduction && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <Spinner variant="bars" size={48} className="text-primary" />
        <h1 className="text-2xl font-bold">Loading...</h1>
        <p className="text-muted-foreground">Checking token configuration...</p>
      </div>
    );
  }

  if (isProduction && (error || !brainToken)) {
    return <BrainTokenNotFound />;
  }

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
    modelName: state.context.model_name,
    contextWindowUsage: state.context.context_window_usage,
    stage: state.context.stage,
    isIdle: state.matches("idle"),
    isActive: state.matches("active"),
  };
}

export function useLanggraphActions() {
  const { send, state } = useLanggraphContext();
  const { setState: setLanggraphState } = useLanggraphAgent(
    state.context.stage
  );

  return {
    setConfig: (config: {
      base_url?: string;
      api_key?: string;
      model_name?: string;
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
