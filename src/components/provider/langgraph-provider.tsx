"use client";

import { useQuery } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { useAiProxyContext } from "@/lib/auth/auth-utils";
import { listAiProxyTokensOptions } from "@/lib/sealos/resources/ai-proxy/ai-proxy-method/ai-proxy-query";
import { useCreateAiProxyTokenMutation } from "@/lib/sealos/resources/ai-proxy/ai-proxy-method/ai-proxy-mutation";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { LanggraphProvider } from "@/contexts/langgraph/langgraph-context";
import { useAuthState } from "@/contexts/auth/auth-context";
import { toast } from "sonner";
import Image from "next/image";

export const LanggraphConfigWrapper = ({
  children,
}: {
  children: ReactNode;
}) => {
  const isProduction = process.env.NEXT_PUBLIC_MODE === "production";
  const { auth } = useAuthState();
  const aiProxyContext = useAiProxyContext();

  // Query AI proxy tokens in production
  const { data: aiProxyTokens, isLoading } = useQuery({
    ...listAiProxyTokensOptions(aiProxyContext),
    enabled: isProduction,
  });

  const brainToken = aiProxyTokens?.tokens?.find(
    (token) => token.name === "brain"
  );
  const createTokenMutation = useCreateAiProxyTokenMutation(aiProxyContext);

  // Build configuration
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

  // Show loading state in production
  if (isProduction && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <Spinner variant="bars" className="text-primary" />
        <p className="text-muted-foreground">Checking token configuration...</p>
      </div>
    );
  }

  // Show token creation UI if config is incomplete
  if (
    isProduction &&
    (!config.apiKey || !config.baseUrl || !config.modelName)
  ) {
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
            <p>
              To activate Sealos Brain agent features, generate an API token.
            </p>
            <p>Click the button below to create one in the AI proxy.</p>
          </div>
        </div>
        <Button
          onClick={handleCreateToken}
          disabled={createTokenMutation.isPending}
          className="max-w-xs"
          size='sm'
        >
          {createTokenMutation.isPending ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Generating...
            </>
          ) : (
            "Generate API Token"
          )}
        </Button>
      </div>
    );
  }

  // Render provider with config
  return <LanggraphProvider config={config}>{children}</LanggraphProvider>;
};
