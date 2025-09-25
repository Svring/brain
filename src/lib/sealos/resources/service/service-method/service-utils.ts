import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
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
    [key: string]: unknown;
  };
}

export interface TransformedService {
  serviceName: string;
  ports: ServicePort[];
}

export interface UnifiedPort {
  number: number;
  name?: string;
  nodePort?: number;
  protocol?: string;
  targetPort?: number | string;
  serviceName?: string;
  privateAddress?: string;
  publicAddress?: string;
  networkName?: string;
  host?: string;
  privateHost?: string;
  customDomain?: string;
}

// Keep CompletedPort for backward compatibility
export type CompletedPort = UnifiedPort;

/**
 * Transform a list of Kubernetes Service resources into a simplified format
 * containing service names and their ports.
 */
export const transformServiceResources = (
  resources: ServiceResource[]
): TransformedService[] => {
  return resources.map((resource) => ({
    serviceName: resource.metadata.name,
    ports: resource.spec?.ports || [],
  }));
};

/**
 * Compose addresses for completed ports based on context and port information
 */
export const composeAddressFromService = (
  ports: UnifiedPort[],
  context: K8sApiContext
): UnifiedPort[] => {
  return ports.map((port) => {
    const protocol = port.protocol?.toLowerCase() || "http";
    const serviceName = port.serviceName;

    // Compose private host: serviceName.namespace
    const privateHost = serviceName
      ? `${serviceName}.${context.namespace}`
      : undefined;

    // Compose private address: protocol://serviceName.namespace:port
    const privateAddress = privateHost
      ? `${protocol}://${privateHost}:${port.number}`
      : undefined;

    // console.log("privateHost", privateHost);

    // Compose public address: protocol://protocol.transformedRegionUrl:nodePort
    const publicAddress = port.nodePort
      ? `${protocol}://${protocol}.${transformRegionUrl(context.regionUrl)}:${
          port.nodePort
        }`
      : undefined;

    const result = {
      ...port,
      ...(privateHost && { privateHost }),
      ...(privateAddress && { privateAddress }),
      ...(publicAddress && { publicAddress }),
    };

    return result;
  });
};

/**
 * Complete ports information by scanning service ports directly
 * and returning a list of CompletedPort objects with all available information.
 */
export function enrichPortsWithService(
  servicesOrResources: TransformedService[] | ServiceResource[],
  context?: K8sApiContext
): UnifiedPort[] {
  // Check if we received raw resources or transformed services
  const transformedServices =
    Array.isArray(servicesOrResources) &&
    servicesOrResources.length > 0 &&
    "metadata" in servicesOrResources[0]
      ? transformServiceResources(servicesOrResources as ServiceResource[])
      : (servicesOrResources as TransformedService[]);

  const completedPorts: UnifiedPort[] = [];

  // Scan all service ports and create CompletedPort objects
  transformedServices.forEach((service) => {
    if (service.ports && Array.isArray(service.ports)) {
      service.ports.forEach((servicePort) => {
        const completedPort: UnifiedPort = {
          number: servicePort.port,
          name: servicePort.name,
          ...(servicePort.nodePort && { nodePort: servicePort.nodePort }),
          protocol: servicePort.protocol,
          serviceName: service.serviceName,
        };
        completedPorts.push(completedPort);
      });
    }
  });

  // If context and regionUrl are provided, compose addresses
  return context
    ? composeAddressFromService(completedPorts, context)
    : completedPorts;
}
