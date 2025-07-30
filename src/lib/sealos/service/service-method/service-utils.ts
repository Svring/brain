"use client";

import { K8sResource } from "../../../k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import { K8sApiContext } from "../../../k8s/k8s-api/k8s-api-schemas/context-schemas";
import { transformRegionUrl } from "@/lib/sealos/sealos-utils";

// Types for service transformation
export interface ServicePort {
  name?: string;
  nodePort?: number;
  port: number;
  protocol: string;
  targetPort: number | string;
}

export interface ServiceResource extends K8sResource {
  spec: {
    ports: ServicePort[];
    [key: string]: any;
  };
}

export interface TransformedService {
  serviceName: string;
  ports: ServicePort[];
}

export interface PortInput {
  number: number;
}

export interface CompletedPort {
  number: number;
  name?: string;
  nodePort?: number;
  protocol?: string;
  targetPort?: number | string;
  serviceName?: string;
  privateAddress?: string;
  publicAddress?: string;
}

/**
 * Transform a list of Kubernetes Service resources into a simplified format
 * containing service names and their ports.
 */
export const transformServiceResources = (
  resources: ServiceResource[]
): TransformedService[] => {
  return resources.map((resource) => ({
    serviceName: resource.metadata.name,
    ports: resource.spec.ports || [],
  }));
};

/**
 * Compose addresses for completed ports based on context and port information
 */
export const composeAddressFromService = (
  ports: CompletedPort[],
  context: K8sApiContext
): CompletedPort[] => {
  return ports.map((port) => {
    const protocol = port.protocol?.toLowerCase() || "http";
    const serviceName = port.serviceName;

    // Compose private address: protocol://serviceName.namespace:port
    const privateAddress = serviceName
      ? `${protocol}://${serviceName}.${context.namespace}:${port.number}`
      : undefined;

    // Compose public address: protocol://protocol.transformedRegionUrl:nodePort
    const publicAddress = port.nodePort
      ? `${protocol}://${protocol}.${transformRegionUrl(context.regionUrl)}:${
          port.nodePort
        }`
      : undefined;

    const result = {
      ...port,
      ...(privateAddress && { privateAddress }),
      ...(publicAddress && { publicAddress }),
    };

    return result;
  });
};

/**
 * Complete ports information by matching port numbers with service ports
 * and adding additional properties like name, nodePort, protocol, etc.
 */
export function enrichPortsWithService(
  ports: PortInput[],
  servicesOrResources: TransformedService[] | ServiceResource[],
  context?: K8sApiContext
): CompletedPort[] {
  // Check if we received raw resources or transformed services
  const transformedServices =
    Array.isArray(servicesOrResources) &&
    servicesOrResources.length > 0 &&
    "metadata" in servicesOrResources[0]
      ? transformServiceResources(servicesOrResources as ServiceResource[])
      : (servicesOrResources as TransformedService[]);

  const completedPorts = ports.map((portInput) => {
    // Find matching service port by port number
    for (const service of transformedServices) {
      const matchingPort = service.ports.find(
        (servicePort) => servicePort.port === portInput.number
      );

      if (matchingPort) {
        return {
          number: portInput.number,
          name: matchingPort.name,
          ...(matchingPort.nodePort && { nodePort: matchingPort.nodePort }),
          protocol: matchingPort.protocol,
          serviceName: service.serviceName,
        };
      }
    }

    // If no matching service port found, return original port with just the number
    return {
      number: portInput.number,
    };
  });

  // If context and regionUrl are provided, compose addresses
  return context
    ? composeAddressFromService(completedPorts, context)
    : completedPorts;
}
