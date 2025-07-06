import type { IngressResource } from "@/lib/k8s/schemas/resource-schemas/ingress-schemas";

export interface IngressNodeData {
  name: string;
  state: "Running" | "Stopped" | "Unknown";
  address: string;
}

export function convertIngressResourceToNodeData(
  resource: IngressResource
): IngressNodeData {
  const name = resource.metadata.name;

  // Determine state based on ingress status
  let state: "Running" | "Stopped" | "Unknown" = "Unknown";
  let address = "";

  if (
    resource.status?.loadBalancer?.ingress &&
    resource.status.loadBalancer.ingress.length > 0
  ) {
    const ingress = resource.status.loadBalancer.ingress[0];
    address = ingress.ip || ingress.hostname || "";
    state = address ? "Running" : "Unknown";
  } else if (resource.spec?.rules && resource.spec.rules.length > 0) {
    // If rules exist but no load balancer status, check for host
    const rule = resource.spec.rules[0];
    address = rule.host || "";
    state = address ? "Running" : "Unknown";
  }

  // If no address found, try to get from annotations
  if (!address) {
    address =
      resource.metadata.annotations?.[
        "nginx.ingress.kubernetes.io/server-alias"
      ] ||
      resource.metadata.annotations?.[
        "external-dns.alpha.kubernetes.io/hostname"
      ] ||
      "No address";
  }

  return {
    name,
    state,
    address,
  };
}
