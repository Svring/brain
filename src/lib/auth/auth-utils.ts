"use client";

import {
  SessionV1,
  createSealosApp,
  sealosApp,
} from "@zjy365/sealos-desktop-sdk/app";
import { getRegionUrlFromKubeconfig } from "@/lib/k8s/k8s-api/k8s-api-utils";
import type { Auth } from "@/contexts/auth/auth-machine";
import type { User } from "@/payload-types";
import {
  type K8sApiContext,
  K8sApiContextSchema,
} from "../k8s/k8s-api/k8s-api-schemas/context-schemas";
import { useAuthState } from "@/contexts/auth/auth-context";

export async function extractAuthFromSession(
  session: SessionV1
): Promise<Auth | null> {
  // Validate session properties
  if (!session?.kubeconfig || !session?.token) {
    return null;
  }
  // Fetch namespace and regionUrl concurrently
  const [namespace, regionUrl] = await Promise.all([
    getCurrentNamespace(),
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

    send({ type: "SET_AUTH", auth: authFromSession });
  } catch (error) {
    send({
      type: "FAIL",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export function createK8sContext(): K8sApiContext {
  return K8sApiContextSchema.parse({
    namespace: getCurrentNamespace(),
    kubeconfig: getDecodedKubeconfig(),
  });
}
export function getUserKubeconfig(): string | undefined {
  const { auth } = useAuthState();
  return auth?.kubeconfig;
}
export function getDecodedKubeconfig(): string | undefined {
  const kc = getUserKubeconfig();
  if (!kc) {
    throw new Error("Kubeconfig not available");
  }
  return decodeURIComponent(kc);
}
export function getCurrentNamespace(): string | undefined {
  const { auth } = useAuthState();
  return auth?.namespace;
}

/**
 * Converts URL format from subdomain.sealos.run to sealossubdomain.site
 * Example: bja.sealos.run -> sealosbja.site
 */
export function convertToDbconnUrl(url: string): string {
  // Remove protocol if present
  const cleanUrl = url.replace(/^https?:\/\//, "");

  // If URL ends with 'io', return as is
  if (cleanUrl.endsWith(".io")) {
    return url;
  }

  // Split by dots
  const parts = cleanUrl.split(".");

  // Check if it matches the expected pattern (subdomain.sealos.run)
  if (parts.length === 3 && parts[1] === "sealos" && parts[2] === "run") {
    const subdomain = parts[0];
    return `dbconn.sealos${subdomain}.site`;
  }

  // Return original if pattern doesn't match
  return url;
}
