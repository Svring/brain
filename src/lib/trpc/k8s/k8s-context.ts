// trpc/contexts/k8sContext.ts
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";

export async function createK8sContext(opts: {
  req: Request;
}): Promise<K8sApiContext> {
  const kubeconfig = opts.req.headers.get("kubeconfig");
  const regionUrl = opts.req.headers.get("regionUrl");
  const namespace = opts.req.headers.get("namespace");

  // Decode kubeconfig if it was percent-encoded when sent via headers
  const decodedKubeconfig = decodeURIComponent(kubeconfig as string);

  return {
    kubeconfig: decodedKubeconfig as string,
    regionUrl: regionUrl as string,
    namespace: (namespace as string) || "default",
  };
}

export type K8sContext = K8sApiContext;
