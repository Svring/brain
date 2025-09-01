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
import { DevboxObjectSchema } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";

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

  // Ensure ports array exists
  if (!devboxObject.ports) {
    devboxObject.ports = [];
  }

  // Enrich ports with service information first
  devboxObject.ports = enrichPortsWithService(
    relatedResources.filter((resource) => resource.kind === "Service") as any[],
    context,
    devboxObject.ports
  );

  // Then enrich with ingress information
  devboxObject.ports = enrichPortsWithIngress(
    relatedResources.filter((resource) => resource.kind === "Ingress") as any[],
    context,
    devboxObject.ports
  );

  // console.log("devboxObject.ports", devboxObject.ports);

  devboxObject.ssh = enrichSshWithRegionUrl(devboxObject.ssh, context);

  return DevboxObjectSchema.parse(devboxObject);
};
