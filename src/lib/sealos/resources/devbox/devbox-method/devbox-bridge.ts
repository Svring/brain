import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { composeObjectFromTarget } from "@/lib/sealos/services/bridge/bridge-method/bridge-query-utils";
import { getDevboxRelatedResources } from "@/lib/sealos/resources/devbox/devbox-method/devbox-relevance";
import { enrichPortsWithService } from "@/lib/sealos/resources/service/service-method/service-utils";
import { enrichPortsWithIngress } from "@/lib/sealos/resources/ingress/ingress-method/ingress-utils";
import {
  enrichSshWithRegionUrl,
  transformDevboxImage,
} from "@/lib/sealos/resources/devbox/devbox-method/devbox-utils";
import {
  DevboxObjectSchema,
  DevboxPort,
} from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";

export const getDevboxObject = async (
  context: K8sApiContext,
  target: CustomResourceTarget
) => {
  // Test the new composeObjectFromTarget function
  const devboxObject = await composeObjectFromTarget(context, target);
  const relatedResources = await getDevboxRelatedResources(
    context,
    devboxObject.name,
    ["service", "ingress"],
    []
  );

  devboxObject.image = transformDevboxImage(devboxObject.image);

  // Get service ports
  const servicePorts = enrichPortsWithService(
    relatedResources.filter((resource) => resource.kind === "Service") as any[],
    context
  );

  // Get ingress ports
  const ingressPorts = enrichPortsWithIngress(
    relatedResources.filter((resource) => resource.kind === "Ingress") as any[],
    context
  );

  // Create a map of all unique ports from services and ingresses
  const portMap = new Map<number, DevboxPort>();

  // Add all service ports to the map
  servicePorts.forEach((servicePort) => {
    // Use http protocol for TCP ports when constructing private address
    const protocolForAddress =
      servicePort.protocol?.toLowerCase() === "tcp"
        ? "http"
        : servicePort.protocol;
    const privateAddress =
      servicePort.serviceName && servicePort.privateAddress
        ? servicePort.privateAddress.replace(
            /^[^:]+:\/\//,
            `${protocolForAddress}://`
          )
        : servicePort.privateAddress;

    portMap.set(servicePort.number, {
      number: servicePort.number,
      portName: servicePort.name,
      protocol: servicePort.protocol,
      serviceName: servicePort.serviceName,
      privateAddress: privateAddress,
      privateHost: servicePort.privateHost,
      nodePort: servicePort.nodePort,
    } as DevboxPort);
  });

  // Merge ingress information into existing ports or create new entries
  ingressPorts.forEach((ingressPort) => {
    const existingPort = portMap.get(ingressPort.number);
    if (existingPort) {
      // Update existing port with ingress information
      portMap.set(ingressPort.number, {
        ...existingPort,
        networkName: ingressPort.networkName,
        protocol: ingressPort.protocol || existingPort.protocol,
        host: ingressPort.host,
        publicAddress: ingressPort.publicAddress,
      });
    } else {
      // Create new port entry for ingress-only ports
      portMap.set(ingressPort.number, {
        number: ingressPort.number,
        networkName: ingressPort.networkName,
        protocol: ingressPort.protocol,
        host: ingressPort.host,
        publicAddress: ingressPort.publicAddress,
      } as DevboxPort);
    }
  });

  // Convert map to array
  const mergedPorts = Array.from(portMap.values());

  // Ensure ports array exists and assign merged ports
  devboxObject.ports = mergedPorts;

  // console.log("devboxObject.ports", devboxObject.ports);

  devboxObject.ssh = enrichSshWithRegionUrl(devboxObject.ssh, context);

  return DevboxObjectSchema.parse(devboxObject);
};
