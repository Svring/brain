export async function useCostCenterContext(opts: { req: Request }) {
  const authorization = opts.req.headers.get("authorization");
  const xAppToken = opts.req.headers.get("x-app-token");

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
    throw new Error(
      `Invalid kubeconfig: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
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

  return ctx;
}

export type CostCenterContext = Awaited<
  ReturnType<typeof useCostCenterContext>
>;
