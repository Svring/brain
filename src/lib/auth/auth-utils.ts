"use client";

import {
  SessionV1,
  createSealosApp,
  sealosApp,
} from "@zjy365/sealos-desktop-sdk/app";
import { setCookie } from "nookies";
import { getRegionUrlFromKubeconfig } from "@/lib/k8s/k8s-api/k8s-api-utils";
import type { Auth } from "@/contexts/auth/auth-machine";
import type { User } from "@/payload-types";
import {
  type K8sApiContext,
  K8sApiContextSchema,
} from "../k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import {
  LAUNCHPAD_METRICS_TEST_URL,
  LAUNCHPAD_METRICS_URL,
  CLUSTER_METRICS_TEST_URL,
  CLUSTER_METRICS_URL,
} from "../sealos/services/metrics";
import { useAuthState } from "@/contexts/auth/auth-context";
import { ClusterApiContextSchema } from "@/lib/sealos/resources/cluster/schemas/cluster-api-context-schemas";
import { DevboxApiContextSchema } from "@/lib/sealos/resources/devbox/devbox-api/devbox-open-api-schemas";
import { DeployApiContextSchema } from "@/lib/sealos/resources/deployment/schemas/deploy-api-context-schemas";
import { AiProxyApiContextSchema } from "@/lib/sealos/resources/ai-proxy/schemas/ai-proxy-api-context";
import { SealosApiContextSchema } from "@/lib/sealos/sealos-api-context-schema";
import { TemplateApiContextSchema } from "@/lib/sealos/resources/template/schemas/template-api-context-schemas";
import { ObjectStorageApiContextSchema } from "../sealos/resources/objectstorage/schemas/objectstorage-api-context-schemas";
import { MetricsApiContextSchema } from "../sealos/services/metrics/schemas/metrics-api-context-schema";
import { TrafficApiContextSchema } from "../sealos/services/traffic/schemas/traffic-api-context-schema";
import {
  TRAFFIC_TEST_URL,
  TRAFFIC_URL,
} from "../sealos/services/traffic/traffic-constant/traffic-constant-url";

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
  const k8sContext = K8sApiContextSchema.parse({
    namespace: getCurrentNamespace(),
    kubeconfig: getDecodedKubeconfig(),
    regionUrl: getCurrentRegionUrl(),
  });
  setCookie(null, "kubeconfig", k8sContext.kubeconfig);
  setCookie(null, "namespace", k8sContext.namespace);
  setCookie(null, "regionUrl", k8sContext.regionUrl);
  return k8sContext;
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
export function getCurrentRegionUrl(): string | undefined {
  const { auth } = useAuthState();
  return auth?.regionUrl;
}

export function createClusterContext() {
  const { auth } = useAuthState();
  if (!auth) {
    throw new Error("User not found");
  }
  const clusterContext = ClusterApiContextSchema.parse({
    baseURL: auth?.regionUrl,
    authorization: auth?.kubeconfig,
  });
  return clusterContext;
}

export function createSealosContext() {
  const { auth } = useAuthState();
  if (!auth) {
    throw new Error("User not found");
  }
  const sealosContext = SealosApiContextSchema.parse({
    baseURL: auth.regionUrl,
    authorization: auth.kubeconfig,
  });
  return sealosContext;
}

export function createObjectStorageContext() {
  const { auth } = useAuthState();
  if (!auth) {
    throw new Error("User not found");
  }
  const objectStorageContext = ObjectStorageApiContextSchema.parse({
    baseURL: auth.regionUrl,
    authorization: auth.kubeconfig,
    authorizationBearer: auth.appToken,
  });
  setCookie(null, "appToken", auth.appToken);
  return objectStorageContext;
}

export function createDevboxContext() {
  const { auth } = useAuthState();
  if (!auth) {
    throw new Error("User not found");
  }
  const devboxContext = DevboxApiContextSchema.parse({
    baseURL: auth.regionUrl,
    authorization: auth.kubeconfig,
    authorizationBearer: auth.appToken,
  });
  setCookie(null, "appToken", auth.appToken);
  return devboxContext;
}

export function createDeployContext() {
  const { auth } = useAuthState();
  if (!auth) {
    throw new Error("User not found");
  }
  const deployContext = DeployApiContextSchema.parse({
    baseURL: auth.regionUrl,
    authorization: auth.kubeconfig,
  });
  return deployContext;
}

export function createAiProxyContext() {
  const { auth } = useAuthState();
  if (!auth) {
    throw new Error("User not found");
  }
  const aiProxyContext = AiProxyApiContextSchema.parse({
    baseURL: auth.regionUrl,
    authorization: auth.appToken,
  });
  setCookie(null, "appToken", auth.appToken);
  return aiProxyContext;
}

export function createTemplateApiContext() {
  const { auth } = useAuthState();
  if (!auth) {
    throw new Error("User not found");
  }
  return TemplateApiContextSchema.parse({
    baseURL: auth.regionUrl,
    authorization: auth.kubeconfig,
  });
}

export function createTrafficApiContext() {
  const { auth } = useAuthState();
  const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";

  if (!auth) {
    throw new Error("Auth context is not available");
  }

  return TrafficApiContextSchema.parse({
    baseURL: isDevelopment ? TRAFFIC_TEST_URL : TRAFFIC_URL,
    kubeconfig: auth.kubeconfig,
  });
}

export function createLaunchPadMetricsContext() {
  const { auth } = useAuthState();
  const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";

  if (!auth) {
    throw new Error("User not found");
  }

  return MetricsApiContextSchema.parse({
    baseURL: isDevelopment ? LAUNCHPAD_METRICS_TEST_URL : LAUNCHPAD_METRICS_URL,
    kubeconfig: auth.kubeconfig,
  });
}

export function createClusterMetricsContext() {
  const { auth } = useAuthState();
  const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";

  if (!auth) {
    throw new Error("User not found");
  }

  return MetricsApiContextSchema.parse({
    baseURL: isDevelopment ? CLUSTER_METRICS_TEST_URL : CLUSTER_METRICS_URL,
    kubeconfig: auth.kubeconfig,
  });
}

export function activateContextCookies() {
  createK8sContext();
  createAiProxyContext();
  createLaunchPadMetricsContext();
  createClusterMetricsContext();
}
