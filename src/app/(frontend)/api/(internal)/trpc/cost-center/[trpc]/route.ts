// app/api/trpc/cost-center/[trpc]/route.ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { costCenterRouter } from "@/lib/trpc/sealos/cost-center/cost-center-trpc-router";
import { useCostCenterContext } from "@/lib/trpc/sealos/cost-center/cost-center-trpc-context";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc/cost-center",
    req,
    router: costCenterRouter,
    createContext: () => useCostCenterContext({ req }),
  });

export { handler as GET, handler as POST };
