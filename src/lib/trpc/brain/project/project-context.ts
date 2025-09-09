// trpc/contexts/projectContext.ts
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";

export async function createProjectContext(opts: {
  req: Request;
}): Promise<K8sApiContext & { sealosContext: SealosApiContext }> {
  const kubeconfig = opts.req.headers.get("kubeconfig");
  const regionUrl = opts.req.headers.get("regionUrl");
  const namespace = opts.req.headers.get("namespace");

  const k8sContext: K8sApiContext = {
    kubeconfig: decodeURIComponent(kubeconfig as string),
    regionUrl: regionUrl as string,
    namespace: namespace as string,
  };

  const sealosContext: SealosApiContext = {
    authorization: kubeconfig as string,
    baseUrl: regionUrl as string,
  };

  return {
    ...k8sContext,
    sealosContext,
  };
}

export type ProjectContext = K8sApiContext & {
  sealosContext: SealosApiContext;
};
