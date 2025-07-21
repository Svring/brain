import type { IngressResource } from "@/lib/k8s/schemas/resource-schemas/ingress-schemas";
import { convertToResourceTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { BUILTIN_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-builtin-resource";

// Converts an IngressResource to node data for IngressNode
export function convertResourceToNode(resource: IngressResource) {
  // Get the first host from the rules array, if available
  const host = resource.spec?.rules?.[0]?.host ?? "";

  return {
    name: resource.metadata.name,
    host,
    target: convertToResourceTarget(resource, BUILTIN_RESOURCES.ingress),
    resource, // Pass full resource for additional data access
  };
}
