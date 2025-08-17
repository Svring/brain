// trpc/contexts/projectContext.ts
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";

export async function createProjectContext(opts: {
  req: Request;
}): Promise<K8sApiContext> {
  const kubeconfig = opts.req.headers.get("kubeconfig");
  const regionUrl = opts.req.headers.get("regionUrl");
  const namespace = opts.req.headers.get("namespace");

  return {
    kubeconfig: decodeURIComponent(kubeconfig as string),
    regionUrl: regionUrl as string,
    namespace: namespace as string,
  };
}

export type ProjectContext = K8sApiContext;
