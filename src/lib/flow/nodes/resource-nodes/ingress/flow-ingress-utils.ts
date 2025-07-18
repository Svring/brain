import type { IngressResource } from "@/lib/k8s/schemas/resource-schemas/ingress-schemas";
import { convertToResourceTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { BUILTIN_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-builtin-resource";

// Converts an IngressResource to node data for IngressNode
export function convertResourceToNode(resource: IngressResource) {
  // Get the first host from the rules array, if available
  const host = resource.spec?.rules?.[0]?.host ?? "";
  
  // Extract appName from cloud.sealos.io/deploy-on-sealos label
  const appName = resource.metadata?.labels?.["cloud.sealos.io/deploy-on-sealos"];
  
  // Extract devboxName from cloud.sealos.io/devbox-manager label
  const devboxName = resource.metadata?.labels?.["cloud.sealos.io/devbox-manager"];
  
  return {
    name: resource.metadata.name,
    host,
    target: convertToResourceTarget(resource, BUILTIN_RESOURCES.ingress),
    resource, // Pass full resource for additional data access
    appName,
    devboxName,
  };
}
