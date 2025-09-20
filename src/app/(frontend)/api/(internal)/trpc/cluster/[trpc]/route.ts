// app/api/trpc/cluster/[trpc]/route.ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { clusterRouter } from "@/lib/trpc/sealos/cluster/cluster-trpc-router";
import { useClusterContext } from "@/lib/trpc/sealos/cluster/cluster-trpc-context";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc/cluster",
    req,
    router: clusterRouter,
    createContext: () => useClusterContext({ req }),
  });

export { handler as GET, handler as POST };
