import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { composeObjectFromTarget } from "../../../bridge-method/bridge-query-utils";
import { getStatefulsetRelatedResources } from "@/lib/sealos/resources/statefulset/statefulset-method/statefulset-query";
import { enrichPortsWithService } from "@/lib/sealos/resources/service/service-method/service-utils";
import { enrichPortsWithIngress } from "@/lib/sealos/resources/ingress/ingress-method/ingress-utils";
import {
  StatefulsetObject,
  StatefulsetObjectSchema,
  Port,
} from "@/lib/sealos/resources/statefulset/statefulset-object-schema";

export const getStatefulSetObject = async (
  context: K8sApiContext,
  target: BuiltinResourceTarget
): Promise<StatefulsetObject> => {
  const statefulSetObject = await composeObjectFromTarget(context, target);
  // console.log("statefulSetObject", statefulSetObject);
  const relatedResources = await getStatefulsetRelatedResources(
    context,
    statefulSetObject.name,
    ["service", "ingress", "pvc"],
    []
  );

  // console.log("relatedResources", relatedResources);

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
  const portMap = new Map<number, any>();

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
      protocol: servicePort.protocol || "TCP",
      serviceName: servicePort.serviceName,
      privateAddress: privateAddress,
      privateHost: servicePort.privateHost,
      nodePort: servicePort.nodePort,
    });
  });

  // Merge ingress information into existing ports or create new entries
  ingressPorts.forEach((ingressPort) => {
    const existingPort = portMap.get(ingressPort.number);
    if (existingPort) {
      // Update existing port with ingress information
      portMap.set(ingressPort.number, {
        ...existingPort,
        networkName: ingressPort.networkName,
        protocol: ingressPort.protocol || existingPort.protocol || "HTTP",
        host: ingressPort.host,
        publicAddress: ingressPort.publicAddress,
      });
    } else {
      // Create new port entry for ingress-only ports
      portMap.set(ingressPort.number, {
        number: ingressPort.number,
        networkName: ingressPort.networkName,
        protocol: ingressPort.protocol || "HTTP",
        host: ingressPort.host,
        publicAddress: ingressPort.publicAddress,
      });
    }
  });

  // Convert map to array
  const mergedPorts = Array.from(portMap.values());

  // Ensure ports array exists and assign merged ports
  statefulSetObject.ports = mergedPorts;

  // console.log("getStatefulSetObject", statefulSetObject);
  return StatefulsetObjectSchema.parse(statefulSetObject);
};
