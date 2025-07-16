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
import type { Auth } from "@/contexts/auth-context/auth-context";
import type { User } from "@/payload-types";

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
    if (authFromSession) {
      send({ type: "SET_AUTH", auth: authFromSession });
    } else {
      send({ type: "FAIL", error: "Failed to extract auth from session" });
    }
  } catch (error) {
    send({
      type: "FAIL",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
