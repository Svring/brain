"use client";

import type { DevboxListResponse } from "./schemas";
import { DevboxApiContextSchema } from "./schemas";
import { nanoid } from "nanoid";
import { useAuthState } from "@/contexts/auth/auth-context";
import {
  DevboxResourceK8s,
  DevboxSecret,
  DevboxPod,
} from "./schemas/devbox-k8s-schemas";
import { DevboxNodeData } from "./schemas/devbox-node-schemas";

export function createDevboxContext() {
  const { auth } = useAuthState();
  if (!auth) {
    throw new Error("User not found");
  }
  return DevboxApiContextSchema.parse({
    baseURL: auth.regionUrl,
    authorization: auth.kubeconfig,
    authorizationBearer: auth.appToken,
  });
}

export function generateDevboxName() {
  return `devbox-${nanoid(6)}`;
}

// Extract name from Kubernetes Devbox resource
export function extractDevboxName(devbox: DevboxResourceK8s): string {
  return devbox.metadata.name;
}

// Extract image from Kubernetes Devbox resource
export function extractDevboxImage(devbox: DevboxResourceK8s): string {
  return devbox.spec.image;
}

// Extract status from Kubernetes Devbox resource
export function extractDevboxStatus(devbox: DevboxResourceK8s): string {
  return devbox.status?.phase || "Unknown";
}

// Extract resources from Kubernetes Devbox resource
export function extractDevboxResources(devbox: DevboxResourceK8s): {
  cpu: string;
  memory: string;
} {
  return {
    cpu: devbox.spec.resource.cpu,
    memory: devbox.spec.resource.memory,
  };
}

// Extract ports from Kubernetes Devbox resource
export function extractDevboxPorts(devbox: DevboxResourceK8s): Array<{
  number: number;
  protocol: string;
}> {
  const appPorts = devbox.spec.config.appPorts || [];

  return appPorts.map((port) => ({
    number: port.port,
    protocol: port.protocol,
  }));
}

// Compose SSH connection details from Devbox resource, secret, and auth context
export function composeDevboxSsh(
  devbox: DevboxResourceK8s,
  secret: DevboxSecret
): {
  host: string;
  port: string;
  user: string;
  privateKey: string;
} {
  // Get auth context to extract region URL as host
  const { auth } = useAuthState();
  if (!auth) {
    throw new Error("User not found");
  }

  // Extract host from auth.regionUrl
  const host = auth.regionUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

  // Extract port from devbox.status.network.nodePort
  const port = devbox.status?.network?.nodePort?.toString() || "";

  // Set default user to 'devbox'
  const user = "devbox";

  // Base64 decode the private key from secret
  const privateKey = atob(secret.data.SEALOS_DEVBOX_PRIVATE_KEY);

  return {
    host,
    port,
    user,
    privateKey,
  };
}

// Extract pod information from Kubernetes Pod resources
export function extractDevboxPods(pods: DevboxPod[]): Array<{
  name: string;
}> {
  return pods.map((pod) => ({
    name: pod.metadata.name,
  }));
}

// Convert a list of pod resources to the 'pods' field of DevboxNodeDataSchema
export function convertPodsToDevboxNodeData(pods: DevboxPod[]): Array<{
  name: string;
}> {
  return extractDevboxPods(pods);
}

// Convert Kubernetes Devbox resource to DevboxNodeData
export function convertDevboxK8sToNodeData(
  devbox: DevboxResourceK8s,
  pods?: DevboxPod[]
): Partial<DevboxNodeData> {
  return {
    name: extractDevboxName(devbox),
    image: extractDevboxImage(devbox),
    status: extractDevboxStatus(devbox),
    resources: extractDevboxResources(devbox),
    ports: extractDevboxPorts(devbox),
    // Add pods if provided
    pods: pods ? convertPodsToDevboxNodeData(pods) : [],
  };
}
