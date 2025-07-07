import type { IngressResource } from "@/lib/k8s/schemas/resource-schemas/ingress-schemas";

// Converts an IngressResource to node data for IngressNode
export function convertResourceToNode(resource: IngressResource) {
  // Get the first host from the rules array, if available
  const host = resource.spec?.rules?.[0]?.host ?? "";
  return {
    name: resource.metadata.name,
    host,
  };
}
