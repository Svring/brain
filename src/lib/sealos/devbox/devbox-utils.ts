"use client";

import type { DevboxListResponse } from "./schemas";
import { DevboxApiContextSchema } from "./schemas";
import { nanoid } from "nanoid";
import { useAuthState } from "@/contexts/auth/auth-context";
import {
  DevboxResourceK8s,
  DevboxSecret,
  DevboxPod,
  DevboxIngress,
} from "./schemas/devbox-k8s-schemas";
import { DevboxNodeData } from "./schemas/devbox-node-schemas";
import _ from "lodash";

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
  return _.get(devbox, "metadata.name");
}

// Extract image from Kubernetes Devbox resource
export function extractDevboxImage(devbox: DevboxResourceK8s): string {
  return _.get(devbox, "spec.image");
}

// Extract status from Kubernetes Devbox resource
export function extractDevboxStatus(devbox: DevboxResourceK8s): string {
  return _.get(devbox, "status.phase", "Unknown");
}

// Extract resources from Kubernetes Devbox resource
export function extractDevboxResources(devbox: DevboxResourceK8s): {
  cpu: string;
  memory: string;
} {
  return _.pick(devbox.spec.resource, ["cpu", "memory"]);
}

// Extract ports from Kubernetes Devbox resource
export function extractDevboxPorts(devbox: DevboxResourceK8s): Array<{
  number: number;
  protocol: string;
}> {
  const appPorts = _.get(devbox, "spec.config.appPorts", []);
  return _.map(appPorts, (port) => ({
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
  const host = _.chain(auth.regionUrl)
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .value();

  // Extract port from devbox.status.network.nodePort
  const port = _.get(devbox, "status.network.nodePort", "").toString();

  // Set default user to 'devbox'
  const user = "devbox";

  // Base64 decode the private key from secret
  const privateKey = atob(_.get(secret, "data.SEALOS_DEVBOX_PRIVATE_KEY"));

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
  return _.map(pods, (pod) => ({
    name: _.get(pod, "metadata.name"),
  }));
}

// Convert a list of pod resources to the 'pods' field of DevboxNodeDataSchema
export function convertPodsToDevboxNodeData(pods: DevboxPod[]): Array<{
  name: string;
}> {
  return extractDevboxPods(pods);
}

// Extract public domain from ingress resources
export function extractPublicDomainsFromIngress(
  ingressResources: DevboxIngress[]
): Record<number, string> {
  const domains = _.chain(ingressResources)
    .flatMap((ingress) => _.get(ingress, "spec.rules", []))
    .flatMap((rule) => {
      const host = rule.host;
      const paths = _.get(rule, "http.paths", []);
      return _.map(paths, (path) => {
        const port = _.get(path, "backend.service.port.number");
        return port && host ? { port, host } : null;
      });
    })
    .compact() // Remove null values
    .reduce((acc: Record<number, string>, item) => {
      if (item && item.port) {
        acc[item.port] = item.host;
      }
      return acc;
    }, {})
    .value();

  return domains as Record<number, string>;
}

// Update ports with public domains
export function updatePortsWithDomains(
  ports: Array<{ number: number; protocol: string; publicDomain?: string }>,
  domains: Record<number, string>
): Array<{ number: number; protocol: string; publicDomain?: string }> {
  return _.map(ports, (port) => ({
    ...port,
    publicDomain: _.get(domains, port.number, port.publicDomain),
  }));
}

// Convert Kubernetes Devbox resource to DevboxNodeData
export function convertDevboxK8sToNodeData(
  devbox: DevboxResourceK8s,
  pods?: DevboxPod[],
  secret?: DevboxSecret,
  ingress?: DevboxIngress[]
): Partial<DevboxNodeData> {
  // Extract basic information
  const result: Partial<DevboxNodeData> = {
    name: extractDevboxName(devbox),
    image: extractDevboxImage(devbox),
    status: extractDevboxStatus(devbox),
    resources: extractDevboxResources(devbox),
    ports: extractDevboxPorts(devbox),
    pods: pods ? convertPodsToDevboxNodeData(pods) : [],
  };

  // Add SSH information if secret is provided
  if (secret) {
    _.set(result, "ssh", composeDevboxSsh(devbox, secret));
  }

  // Update ports with public domains if ingress data is provided
  if (!_.isEmpty(ingress)) {
    const domains = extractPublicDomainsFromIngress(ingress!);
    if (!_.isEmpty(domains) && result.ports) {
      result.ports = updatePortsWithDomains(result.ports, domains);
    }
  }

  return result;
}
