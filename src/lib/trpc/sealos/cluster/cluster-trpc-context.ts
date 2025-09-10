// trpc/contexts/clusterContext.ts
export async function useClusterContext(opts: { req: Request }) {
  const regionUrl = opts.req.headers.get("regionUrl");
  const namespace = opts.req.headers.get("namespace");
  const kubeconfig = opts.req.headers.get("kubeconfig");

  return {
    authorization: kubeconfig as string,
    baseUrl: regionUrl as string,
    kubeconfig: decodeURIComponent(kubeconfig as string),
    namespace: namespace as string,
    regionUrl: regionUrl as string,
  };
}

export type ClusterContext = Awaited<ReturnType<typeof useClusterContext>>;
