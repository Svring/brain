// trpc/contexts/devboxContext.ts
export async function createDevboxContext(opts: { req: Request }) {
  const authorization = opts.req.headers.get("authorization");
  const baseUrl = opts.req.headers.get("baseurl");

  return {
    authorization: authorization as string,
    baseUrl: baseUrl as string,
  };
}

export type DevboxContext = Awaited<ReturnType<typeof createDevboxContext>>;
