// trpc/contexts/k8sContext.ts
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";

export async function createK8sContext(opts: {
  req: Request;
}): Promise<K8sApiContext> {
  const authorization = opts.req.headers.get("authorization");
  const baseUrl = opts.req.headers.get("baseurl");
  const namespace = opts.req.headers.get("namespace");

  // Decode kubeconfig if it was percent-encoded when sent via headers
  let kubeconfig = (authorization as string) || "";
  try {
    kubeconfig = decodeURIComponent(kubeconfig);
  } catch (_) {
    // ignore decode issues; use raw value
  }

  return {
    kubeconfig,
    regionUrl: baseUrl as string,
    namespace: (namespace as string) || "default",
  };
}

export type K8sContext = K8sApiContext;
