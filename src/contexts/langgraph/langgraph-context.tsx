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
import { Button } from "@/components/ui/button";

interface LanggraphContextValue {
  state: StateFrom<typeof langgraphMachine>;
  send: (event: EventFrom<typeof langgraphMachine>) => void;
  actorRef: ActorRefFrom<typeof langgraphMachine>;
}

export const LanggraphContext = createContext<
  LanggraphContextValue | undefined
>(undefined);

// Wrapper component that handles configuration extraction and management
export const LanggraphConfigWrapper = ({
  children,
}: {
  children: ReactNode;
}) => {
  const isProduction = process.env.NEXT_PUBLIC_MODE === "production";

  // In development mode, skip configuration and directly render children
  if (!isProduction) {
    return <LanggraphProvider config={{}}>{children}</LanggraphProvider>;
  }

  const aiProxyContext = useAiProxyContext();
  const { data: aiProxyTokens, isLoading } = useQuery(
    listAiProxyTokensOptions(aiProxyContext)
  );

  const brainToken = aiProxyTokens?.tokens?.find(
    (token) => token.name === "brain"
  );

  const createTokenMutation = useCreateAiProxyTokenMutation(aiProxyContext);

  // Extract configuration values
  const config = {
    apiKey: brainToken ? `sk-${brainToken.key}` : undefined,
    baseUrl: aiProxyContext.baseUrl
      ? `https://aiproxy.${aiProxyContext.baseUrl}/v1`
      : undefined,
    modelName: aiProxyContext.baseUrl?.endsWith("io")
      ? "gpt-4.1"
      : "qwen3-235b-a22b",
  };

  // Check if configuration is ready
  const isConfigReady = config.apiKey && config.baseUrl && config.modelName;

  if (isProduction && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <Spinner variant="bars" className="text-primary" />
        <p className="text-muted-foreground">
          {isLoading
            ? "Checking token configuration..."
            : "Waiting for configuration..."}
        </p>
      </div>
    );
  }

  // Handle token creation if brain token is missing
  const handleCreateToken = () => {
    createTokenMutation.mutate({
      name: "brain",
    });
  };

  // Only render LanggraphProvider when config is ready
  if (!isConfigReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h1 className="text-2xl font-bold">Token Required</h1>
        {!brainToken && aiProxyContext.baseUrl && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              No 'brain' token found. Create one to continue.
            </p>
            <Button
              onClick={handleCreateToken}
              disabled={createTokenMutation.isPending}
              className="w-full max-w-xs"
            >
              {createTokenMutation.isPending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Creating Token...
                </>
              ) : (
                "Create Token"
              )}
            </Button>
            {createTokenMutation.isError && (
              <p className="text-sm text-destructive">
                Failed to create token. Please try again.
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return <LanggraphProvider config={config}>{children}</LanggraphProvider>;
};

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
  const isProduction = process.env.NEXT_PUBLIC_MODE === "production";

  useEffect(() => {
    if (isProduction && config.apiKey && config.baseUrl && config.modelName) {
      send({
        type: "SET_CONFIG",
        api_key: config.apiKey,
        base_url: config.baseUrl,
        model_name: config.modelName,
      });
    }
  }, [isProduction, config.apiKey, config.baseUrl, config.modelName]);

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
