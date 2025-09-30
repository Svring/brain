// trpc/contexts/aiProxyContext.ts
export async function useAiProxyContext(opts: { req: Request }) {
  const regionUrl = opts.req.headers.get("regionUrl");
  const appToken = opts.req.headers.get("appToken");

  return {
    authorization: appToken as string,
    baseUrl: regionUrl as string,
    regionUrl: regionUrl as string,
  };
}

export type AiProxyContext = Awaited<ReturnType<typeof useAiProxyContext>>;
