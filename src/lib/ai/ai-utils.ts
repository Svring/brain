"use client";

import type { User } from "@/payload-types";
import type { Auth } from "@/contexts/auth/auth-machine";
import {
  getAiProxyTokens,
  createAiProxyToken,
} from "@/lib/sealos/ai-proxy/ai-proxy-api/ai-proxy-old-api";
import type { AiProxyApiContext } from "@/lib/sealos/ai-proxy/schemas/ai-proxy-api-context";
import { runParallelAction } from "next-server-actions-parallel";

export function getAiCredentialsDev(payloadUser: User): {
  baseUrl: string;
  apiKey: string;
} {
  return {
    baseUrl: payloadUser.baseUrl || "http://localhost:8080/v1",
    apiKey: payloadUser.apiKey || "mock-api-key",
  };
}

export async function getAiCredentialsProd(
  auth: Auth
): Promise<{ baseUrl: string; apiKey: string }> {
  try {
    // Create AI Proxy context
    const aiProxyContext: AiProxyApiContext = {
      baseURL: auth.regionUrl,
      authorization: auth.appToken,
    };

    // Fetch existing tokens
    const tokensResponse = await runParallelAction(
      getAiProxyTokens(aiProxyContext)
    );
    console.log("Tokens Response:", tokensResponse);
    let brainToken = tokensResponse.data.tokens.find(
      (token: any) => token.name === "brain"
    );

    // Create token if it doesn't exist
    if (!brainToken) {
      const createResponse = await runParallelAction(
        createAiProxyToken({ name: "brain" }, aiProxyContext)
      );
      brainToken = createResponse.data;
    }

    // Construct base URL similar to ai-proxy-old-api.ts
    const baseUrl = `https://aiproxy.${auth.regionUrl}/v1`;

    return {
      baseUrl,
      apiKey: brainToken.key,
    };
  } catch (error) {
    console.error("Failed to get AI credentials:", error);
    throw error;
  }
}
