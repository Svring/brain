"use client";

import { K8sResource } from "../../../k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";

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
 * Complete ports information by matching port numbers with service ports
 * and adding additional properties like name, nodePort, protocol, etc.
 */
export function enrichPortsWithService(
  ports: PortInput[],
  servicesOrResources: TransformedService[] | ServiceResource[]
): CompletedPort[] {
  // Check if we received raw resources or transformed services
  const transformedServices =
    Array.isArray(servicesOrResources) &&
    servicesOrResources.length > 0 &&
    "metadata" in servicesOrResources[0]
      ? transformServiceResources(servicesOrResources as ServiceResource[])
      : (servicesOrResources as TransformedService[]);

  return ports.map((portInput) => {
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
}
