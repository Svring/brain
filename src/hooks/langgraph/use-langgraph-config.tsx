"use client";

import { useLocalStorage } from "@reactuses/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { useEnv } from "@/components/provider/env-provider";
import { useAuthState } from "@/contexts/auth/auth-context";
import {
  useLanggraphActions,
  useLanggraphState,
} from "@/contexts/langgraph/langgraph-context";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useAiProxyContext } from "@/lib/auth/auth-utils";

export function useLanggraphConfig() {
  const { auth } = useAuthState();
  const env = useEnv();
  const aiProxyContext = useAiProxyContext();
  const { aiProxy } = useTRPCClients();
  const { isLoading, isLoaded, isUnloaded } = useLanggraphState();
  const { setConfig, setConfigFailed } = useLanggraphActions();

  const isProduction = env.MODE === "production";

  // Track if user has previously clicked the Create button
  const [hasClickedCreate, setHasClickedCreate] = useLocalStorage(
    "sealos-brain-create-clicked",
    false
  );

  // Query AI proxy tokens in production - only when not loaded
  const { data: aiProxyTokens, isLoading: tokensLoading } = useQuery({
    ...aiProxy.list.queryOptions(),
    enabled: isProduction && !isLoaded,
  });

  const brainToken = aiProxyTokens?.tokens?.find(
    (token) => token.name === "brain"
  );

  // Create token mutation using tRPC
  const createTokenMutation = useMutation(aiProxy.create.mutationOptions());

  // Handle initial config loading
  useEffect(() => {
    if (isLoading) {
      // Check if environment variables are available first
      if (env.AGENT_API_KEY && env.AGENT_BASE_URL && env.AGENT_MODEL_NAME) {
        // Use environment variables as first priority
        setConfig({
          base_url: env.AGENT_BASE_URL,
          api_key: env.AGENT_API_KEY,
          model_name: env.AGENT_MODEL_NAME,
        });
      } else {
        // Fall back to current logic if env vars are not complete
        const config = isProduction
          ? {
              apiKey: brainToken ? `sk-${brainToken.key}` : undefined,
              baseUrl: `http://aiproxy.${aiProxyContext.baseUrl}/v1`,
              modelName:
                aiProxyContext.baseUrl?.endsWith("io") &&
                !aiProxyContext.baseUrl?.endsWith("nip.io")
                  ? "gpt-4.1"
                  : "kimi-k2-0711-preview",
            }
          : {
              apiKey: auth?.apiKey,
              baseUrl: aiProxyContext.baseUrl
                ? `http://aiproxy.${aiProxyContext.baseUrl}/v1`
                : auth?.baseUrl,
              modelName: "gpt-4.1",
            };

        // Check if config is complete
        if (config.apiKey && config.baseUrl && config.modelName) {
          setConfig({
            base_url: config.baseUrl,
            api_key: config.apiKey,
            model_name: config.modelName,
          });
        } else if (isProduction && !tokensLoading) {
          // No brain token found in production
          if (!brainToken) {
            // If user has previously clicked Create, automatically create token
            if (hasClickedCreate) {
              createTokenMutation.mutate(
                { name: "brain" },
                {
                  onSuccess: () => {
                    toast.success("Token created successfully.");
                    window.location.reload();
                  },
                  onError: () => {
                    // If automatic creation fails, show the manual UI
                    setConfigFailed();
                    window.location.reload();
                  },
                }
              );
            } else {
              // Show UI for asking permission
              setConfigFailed();
            }
          } else {
            setConfigFailed();
          }
        }
      }
    }
  }, [
    isLoading,
    isProduction,
    brainToken,
    aiProxyTokens,
    tokensLoading,
    setConfig,
    setConfigFailed,
    env,
    aiProxyContext,
  ]);

  // Handle token creation
  const handleCreateToken = () => {
    // Store that user has clicked the Create button
    setHasClickedCreate(true);

    createTokenMutation.mutate(
      { name: "brain" },
      {
        onSuccess: () => {
          toast.success("Token created successfully.");
          window.location.reload();
        },
        onError: () => {
          toast.error(
            "Please complete real-name authentication before proceeding."
          );
        },
      }
    );
  };

  return {
    // State
    isLoading,
    isLoaded,
    isUnloaded,
    isProduction,
    tokensLoading,
    brainToken,
    createTokenMutation,
    hasClickedCreate,

    // Actions
    handleCreateToken,
  };
}
