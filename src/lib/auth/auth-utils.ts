"use client";

import {
  SessionV1,
  createSealosApp,
  sealosApp,
} from "@zjy365/sealos-desktop-sdk/app";
import {
  getCurrentNamespace,
  getRegionUrlFromKubeconfig,
} from "@/lib/k8s/k8s-api/k8s-api-utils";
import type { Auth } from "@/contexts/auth-context/auth-machine";
import type { User } from "@/payload-types";
import {
  getAiProxyTokens,
  createAiProxyToken,
} from "@/lib/sealos/ai-proxy/ai-proxy-old-api";
import type { AiProxyApiContext } from "@/lib/sealos/ai-proxy/schemas/ai-proxy-api-context";
import { runParallelAction } from "next-server-actions-parallel";

export async function extractAuthFromSession(
  session: SessionV1
): Promise<Auth | null> {
  // Validate session properties
  if (!session?.kubeconfig || !session?.token) {
    return null;
  }
  // Fetch namespace and regionUrl concurrently
  const [namespace, regionUrl] = await Promise.all([
    getCurrentNamespace(session.kubeconfig),
    getRegionUrlFromKubeconfig(session.kubeconfig),
  ]);

  // Check if both values are valid strings
  if (typeof namespace !== "string" || typeof regionUrl !== "string") {
    return null;
  }

  return {
    namespace,
    kubeconfig: encodeURIComponent(session.kubeconfig),
    regionUrl,
    appToken: session.token,
    baseUrl: "",
    apiKey: "",
  };
}

export function authenticateDev(payloadUser: User, send: (event: any) => void) {
  if (!payloadUser) {
    send({ type: "FAIL", error: "No User available" });
    return;
  }
  const auth: Auth = { ...payloadUser };
  send({ type: "SET_AUTH", auth });
}

export async function authenticateProd(send: (event: any) => void) {
  try {
    createSealosApp();
    const sessionData = await sealosApp.getSession();
    if (!sessionData) {
      send({ type: "FAIL", error: "No session data available" });
      return;
    }
    const authFromSession = await extractAuthFromSession(sessionData);
    if (!authFromSession) {
      send({ type: "FAIL", error: "Failed to extract auth from session" });
      return;
    }

    // Create AI Proxy context
    const aiProxyContext: AiProxyApiContext = {
      baseURL: authFromSession.regionUrl,
      authorization: authFromSession.appToken,
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
    const baseUrl = `https://aiproxy.${authFromSession.regionUrl}/v1`;

    // Update auth with AI proxy credentials
    const enhancedAuth: Auth = {
      ...authFromSession,
      apiKey: brainToken.key,
      baseUrl: baseUrl,
    };

    send({ type: "SET_AUTH", auth: enhancedAuth });
  } catch (error) {
    send({
      type: "FAIL",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
