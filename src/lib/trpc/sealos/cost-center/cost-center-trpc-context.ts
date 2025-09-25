export async function useCostCenterContext(opts: { req: Request }) {
  const authorization = opts.req.headers.get("authorization");
  const xAppToken = opts.req.headers.get("x-app-token");
  
  try {
    console.log("[CostCenter][Context][IncomingHeaders]", {
      authorization: authorization
        ? `${String(authorization).slice(0, 32)}...`
        : undefined,
      xAppToken: xAppToken
        ? `${String(xAppToken).slice(0, 32)}...`
        : undefined,
      allHeaders: Object.fromEntries(opts.req.headers.entries()),
    });
  } catch {}
  
  let regionUrl: string;
  let namespace: string;
  let kubeconfig = authorization;

  if (!authorization) {
    throw new Error("Authorization header (kubeconfig) is required");
  }

  try {
    const decodedKubeconfig = decodeURIComponent(authorization);
    const namespaceMatch = decodedKubeconfig.match(/namespace:\s*([^\s\n]+)/);
    const serverMatch = decodedKubeconfig.match(/server:\s*([^\s\n]+)/);
    
    if (!namespaceMatch) {
      throw new Error("Could not extract namespace from kubeconfig");
    }
    namespace = namespaceMatch[1];
    
    if (!serverMatch) {
      throw new Error("Could not extract server from kubeconfig");
    }
    
    const server = serverMatch[1];
    const regionMatch = server.match(/https?:\/\/([^:]+)/);
    if (!regionMatch) {
      throw new Error("Could not extract region from server URL");
    }
    regionUrl = regionMatch[1];
    
  } catch (error) {
    console.error("[CostCenter][Context] Failed to parse kubeconfig:", error);
    throw new Error(`Invalid kubeconfig: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  const ctx = {
    authorization: authorization as string,
    baseUrl: regionUrl,
    kubeconfig: kubeconfig as string,
    namespace: namespace,
    regionUrl: `https://${regionUrl}`,
    regionDomain: regionUrl,
    workspace: namespace,
    internalToken: xAppToken, 
  };

  try {
    console.log("[CostCenter][Context][Derived]", {
      workspace: ctx.workspace,
      regionDomain: ctx.regionDomain,
      kubeconfig: ctx.kubeconfig ? `${String(ctx.kubeconfig).slice(0, 32)}...` : undefined,
      internalToken: ctx.internalToken ? `${String(ctx.internalToken).slice(0, 32)}...` : undefined,
    });
  } catch {}

  return ctx;
}

export type CostCenterContext = Awaited<ReturnType<typeof useCostCenterContext>>;
