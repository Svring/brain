"use client";

import { runParallelAction } from "next-server-actions-parallel";

// Ingress API functions
import {
  checkHttps,
  checkWss,
  checkGrpcs,
} from "../ingress-api/ingress-api-utils";

import { ProtocolCheckResult } from "../ingress-api/ingress-api-schema";
import { K8sResource } from "../../../k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";

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
  ingressName: string;
  port: number;
  protocol?: string;
  host: string;
}

export interface PortWithNumber {
  number: number;
  [key: string]: any;
}

export interface EnrichedPort extends PortWithNumber {
  ingressName?: string;
  protocol?: string;
  host?: string;
}

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
    const ingressName = resource.metadata.name;
    const protocol =
      resource.metadata.annotations?.[
        "nginx.ingress.kubernetes.io/backend-protocol"
      ];

    resource.spec.rules.forEach((rule) => {
      const host = rule.host;

      rule.http.paths.forEach((path) => {
        const port = path.backend.service.port.number;

        result.push({
          ingressName,
          port,
          protocol,
          host,
        });
      });
    });
  });

  return result;
};

/**
 * Enrich port objects with ingress information by matching port numbers.
 * Overwrites existing properties if they conflict.
 */
export function enrichPortsWithIngress(
  ports: PortWithNumber[],
  ingressesOrResources: TransformedIngress[] | IngressResource[]
): EnrichedPort[] {
  // Check if we received raw resources or transformed ingresses
  const transformedIngresses =
    Array.isArray(ingressesOrResources) &&
    ingressesOrResources.length > 0 &&
    "metadata" in ingressesOrResources[0]
      ? transformIngressResources(ingressesOrResources as IngressResource[])
      : (ingressesOrResources as TransformedIngress[]);

  return ports.map((port) => {
    // Find matching ingress by port number
    const matchingIngress = transformedIngresses.find(
      (ingress) => ingress.port === port.number
    );

    if (matchingIngress) {
      // Merge ingress data into port object, overwriting existing properties
      return {
        ...port,
        ingressName: matchingIngress.ingressName,
        protocol: matchingIngress.protocol,
        host: matchingIngress.host,
      };
    }

    // Return original port if no matching ingress found
    return port;
  });
}
