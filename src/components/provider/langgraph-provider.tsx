"use client";

import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { useAiProxyContext } from "@/lib/auth/auth-utils";
import { listAiProxyTokensOptions } from "@/lib/sealos/resources/ai-proxy/ai-proxy-method/ai-proxy-query";
import { useCreateAiProxyTokenMutation } from "@/lib/sealos/resources/ai-proxy/ai-proxy-method/ai-proxy-mutation";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { LanggraphProvider } from "@/contexts/langgraph/langgraph-context";
import { useAuthState } from "@/contexts/auth/auth-context";

// Wrapper component that handles configuration extraction and management
export const LanggraphConfigWrapper = ({
  children,
}: {
  children: ReactNode;
}) => {
  const isProduction = process.env.NEXT_PUBLIC_MODE === "production";
  const { auth } = useAuthState();
  const [skipApiKey, setSkipApiKey] = useState(false);

  const aiProxyContext = useAiProxyContext();
  const { data: aiProxyTokens, isLoading } = useQuery({
    ...listAiProxyTokensOptions(aiProxyContext),
    enabled: isProduction,
  });

  const brainToken = aiProxyTokens?.tokens?.find(
    (token) => token.name === "brain"
  );

  const createTokenMutation = useCreateAiProxyTokenMutation(aiProxyContext);

  // In development mode, use auth state directly
  if (!isProduction) {
    const config = {
      apiKey: auth?.apiKey,
      baseUrl: auth?.baseUrl,
      modelName: "gpt-4.1",
    };
    return <LanggraphProvider config={config}>{children}</LanggraphProvider>;
  }

  // Extract configuration values
  const config = {
    apiKey: brainToken ? `sk-${brainToken.key}` : undefined,
    baseUrl: aiProxyContext.baseUrl
      ? `https://aiproxy.${aiProxyContext.baseUrl}/v1`
      : undefined,
    modelName: aiProxyContext.baseUrl?.endsWith("io")
      ? "gpt-4.1"
      : "kimi-k2-0711-preview",
  };

  // Check if configuration is ready
  const isConfigReady = config.apiKey && config.baseUrl && config.modelName;

  // If user chose to skip API key, use minimal config
  if (skipApiKey) {
    const minimalConfig = {
      apiKey: undefined,
      baseUrl: undefined,
      modelName: "gpt-4.1",
    };
    return (
      <LanggraphProvider config={minimalConfig}>{children}</LanggraphProvider>
    );
  }

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
    createTokenMutation.mutate(
      {
        name: "brain",
      },
      {
        onSuccess: () => {
          window.location.reload();
        },
      }
    );
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
            <Button
              onClick={() => setSkipApiKey(true)}
              variant="outline"
              className="w-full max-w-xs"
            >
              Enter App Without API Key
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
