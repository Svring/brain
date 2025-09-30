// app/api/trpc/ai-proxy/[trpc]/route.ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { aiProxyRouter } from "@/lib/trpc/sealos/ai-proxy/ai-proxy-trpc-router";
import { useAiProxyContext } from "@/lib/trpc/sealos/ai-proxy/ai-proxy-trpc-context";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc/ai-proxy",
    req,
    router: aiProxyRouter,
    createContext: () => useAiProxyContext({ req }),
  });

export { handler as GET, handler as POST };
