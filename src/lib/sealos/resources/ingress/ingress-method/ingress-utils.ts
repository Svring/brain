import { runParallelAction } from "next-server-actions-parallel";

// Ingress API functions
import {
  checkHttps,
  checkWss,
  checkGrpcs,
} from "../ingress-api/ingress-api-utils";

import { ProtocolCheckResult } from "../ingress-api/ingress-api-schema";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";

// Types for ingress transformation
export interface IngressResource extends K8sResource {
  spec: {
    rules: {
      host: string;
      http: {
        paths: {
          backend: {
            service: {
              name: string;
              port: {
                number: number;
              };
            };
          };
          path: string;
          pathType: string;
        }[];
      };
    }[];
    tls?: {
      hosts: string[];
      secretName: string;
    }[];
  };
}

export interface TransformedIngress {
  networkName: string;
  port: number;
  protocol?: string;
  host: string;
}

// Import the unified interface from service utils
import { UnifiedPort } from "@/lib/sealos/resources/service/service-method/service-utils";

// Keep EnrichedPort for backward compatibility
export interface EnrichedPort extends UnifiedPort {}

/**
 * Check protocol availability by detecting the protocol from the URL.
 * Supports HTTPS, WSS, and gRPCS protocols.
 */
export const checkUrl = async (url: string): Promise<ProtocolCheckResult> => {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.startsWith("https://")) {
    return await runParallelAction(checkHttps(url));
  } else if (lowerUrl.startsWith("wss://")) {
    return await runParallelAction(checkWss(url));
  } else if (lowerUrl.startsWith("grpcs://")) {
    return await runParallelAction(checkGrpcs(url));
  } else {
    // Default to HTTPS if no protocol is specified
    return await runParallelAction(checkHttps(url));
  }
};

/**
 * Transform a list of Kubernetes Ingress resources into a simplified format
 * containing ingress names, ports, protocols, and hosts.
 */
export const transformIngressResources = (
  resources: IngressResource[]
): TransformedIngress[] => {
  const result: TransformedIngress[] = [];

  resources.forEach((resource) => {
    const networkName = resource.metadata.name;
    const protocol =
      resource.metadata.annotations?.[
        "nginx.ingress.kubernetes.io/backend-protocol"
      ];

    // Add null checks for spec.rules and nested properties
    if (resource.spec?.rules && Array.isArray(resource.spec.rules)) {
      resource.spec.rules.forEach((rule) => {
        const host = rule.host;

        if (rule.http?.paths && Array.isArray(rule.http.paths)) {
          rule.http.paths.forEach((path) => {
            if (path.backend?.service?.port?.number) {
              const port = path.backend.service.port.number;

              result.push({
                networkName,
                port,
                protocol,
                host,
              });
            }
          });
        }
      });
    }
  });

  return result;
};

/**
 * Compose addresses for enriched ports based on context and port information
 */
export const composeAddressFromIngress = (
  ports: UnifiedPort[],
  context: K8sApiContext
): UnifiedPort[] => {
  return ports.map((port) => {
    const protocol = port.protocol?.toLocaleLowerCase() || "http";
    const serviceName = (port as any).serviceName;

    // Compose private address: protocol://serviceName.namespace:port
    const privateAddress = serviceName
      ? `${protocol}://${serviceName}.${context.namespace}:${port.number}`
      : undefined;

    // Compose public address: protocols://host (add 's' for secure)
    const publicAddress = port.host ? `${protocol}s://${port.host}` : undefined;

    const enrichedPort = { ...port };

    if (privateAddress) {
      enrichedPort.privateAddress = privateAddress;
    }

    if (publicAddress) {
      enrichedPort.publicAddress = publicAddress;
    }

    return enrichedPort;
  });
};

/**
 * Enrich port objects by scanning ingress information directly
 * and returning a list of EnrichedPort objects with all available information.
 */
export function enrichPortsWithIngress(
  ingressesOrResources: TransformedIngress[] | IngressResource[],
  context?: K8sApiContext
): UnifiedPort[] {
  // Check if we received raw resources or transformed ingresses
  const transformedIngresses =
    Array.isArray(ingressesOrResources) &&
    ingressesOrResources.length > 0 &&
    "metadata" in ingressesOrResources[0]
      ? transformIngressResources(ingressesOrResources as IngressResource[])
      : (ingressesOrResources as TransformedIngress[]);

  const enrichedPorts: UnifiedPort[] = [];

  // Scan all ingress ports and create EnrichedPort objects
  transformedIngresses.forEach((ingress) => {
    if (ingress && typeof ingress.port === "number") {
      const enrichedPort: UnifiedPort = {
        number: ingress.port,
        networkName: ingress.networkName,
        protocol: ingress.protocol,
        host: ingress.host,
      };
      enrichedPorts.push(enrichedPort);
    }
  });

  // If context is provided, compose addresses
  return context
    ? composeAddressFromIngress(enrichedPorts, context)
    : enrichedPorts;
}
