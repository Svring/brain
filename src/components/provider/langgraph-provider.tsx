"use client";

import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useEffect } from "react";
import { useAiProxyContext } from "@/lib/auth/auth-utils";
import { listAiProxyTokensOptions } from "@/lib/sealos/resources/ai-proxy/ai-proxy-method/ai-proxy-query";
import { useCreateAiProxyTokenMutation } from "@/lib/sealos/resources/ai-proxy/ai-proxy-method/ai-proxy-mutation";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  LanggraphProvider,
  useLanggraphState,
  useLanggraphActions,
} from "@/contexts/langgraph/langgraph-context";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useEnv } from "@/components/provider/env-provider";
import { toast } from "sonner";
import Image from "next/image";
import { ThreadProvider } from "./thread-provider";
import { StreamProvider } from "./stream-provider";

// Inner component that uses langgraph state and actions
function LanggraphConfigInner({ children }: { children: ReactNode }) {
  const { auth } = useAuthState();
  const env = useEnv();
  const aiProxyContext = useAiProxyContext();
  const { isLoading, isLoaded, isUnloaded } = useLanggraphState();
  const { setConfig, setConfigFailed } = useLanggraphActions();

  const isProduction = env.MODE === "production";

  // Query AI proxy tokens in production - only when not loaded
  const { data: aiProxyTokens, isLoading: tokensLoading } = useQuery({
    ...listAiProxyTokensOptions(aiProxyContext),
    enabled: isProduction && !isLoaded,
  });

  // console.log("aiProxyTokens", aiProxyTokens);

  const brainToken = aiProxyTokens?.tokens?.find(
    (token) => token.name === "brain"
  );
  const createTokenMutation = useCreateAiProxyTokenMutation(aiProxyContext);

  // Handle initial config loading
  useEffect(() => {
    if (isLoading) {
      // Check if environment variables are available first
      if (env.AGENT_API_KEY && env.AGENT_BASE_URL && env.AGENT_MODEL_NAME) {
        // Use environment variables as first priority
        console.log("env", env);
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
              baseUrl: aiProxyContext.baseUrl
                ? `http://aiproxy.${aiProxyContext.baseUrl}/v1`
                : undefined,
              modelName:
                aiProxyContext.baseUrl?.endsWith("io") &&
                !aiProxyContext.baseUrl?.endsWith("nip.io")
                  ? "gpt-4.1"
                  : "kimi-k2-0711-preview",
            }
          : {
              apiKey: auth?.apiKey,
              baseUrl: auth?.baseUrl,
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
          setConfigFailed();
        }
      }
    }
  }, [
    isLoading,
    isProduction,
    brainToken,
    aiProxyContext.baseUrl,
    auth?.apiKey,
    auth?.baseUrl,
    tokensLoading,
    env.AGENT_API_KEY,
    env.AGENT_BASE_URL,
    env.AGENT_MODEL_NAME,
  ]);

  // Handle token creation
  const handleCreateToken = () => {
    createTokenMutation.mutateAsync(
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

  // Show loading state
  if (isLoading || (isProduction && tokensLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <LoadingScreen text="Checking token configuration..." />
      </div>
    );
  }

  // Show token creation UI if unloaded (no token found)
  if (isUnloaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="flex flex-col items-center space-y-4">
          <Image
            src="/sealos-brain-icon-grayscale.svg"
            alt="Sealos Brain"
            width={64}
            height={64}
            className="mb-2 rounded-2xl"
          />
          <div className="text-muted-foreground text-center space-y-2">
            <p>To activate Sealos Brain agent features, generate an API KEY.</p>
            <p>Click the button below to create one in the AI Proxy.</p>
          </div>
        </div>
        <Button
          onClick={handleCreateToken}
          disabled={createTokenMutation.isPending}
          className="max-w-xs"
          size="sm"
        >
          {createTokenMutation.isPending ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Generating...
            </>
          ) : (
            "Generate API KEY"
          )}
        </Button>
      </div>
    );
  }

  // Render children when loaded with nested providers
  return (
    <ThreadProvider>
      <StreamProvider>{children}</StreamProvider>
    </ThreadProvider>
  );
}

export const LanggraphConfigWrapper = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <LanggraphProvider config={{}}>
      <LanggraphConfigInner>{children}</LanggraphConfigInner>
    </LanggraphProvider>
  );
};
