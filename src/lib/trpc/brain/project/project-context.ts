// trpc/contexts/projectContext.ts
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";

export async function createProjectContext(opts: {
  req: Request;
}): Promise<K8sApiContext> {
  const authorization = opts.req.headers.get("authorization");
  const baseUrl = opts.req.headers.get("baseurl");
  const namespace = opts.req.headers.get("namespace");

  return {
    kubeconfig: decodeURIComponent(authorization as string),
    regionUrl: baseUrl as string,
    namespace: namespace as string,
  };
}

export type ProjectContext = K8sApiContext;
