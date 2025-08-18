// app/api/trpc/launchpad/[trpc]/route.ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { launchpadRouter } from "@/lib/trpc/sealos/launchpad/launchpad-router";
import { createLaunchpadContext } from "@/lib/trpc/sealos/launchpad/launchpad-context";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc/launchpad",
    req,
    router: launchpadRouter,
    createContext: () => createLaunchpadContext({ req }),
  });

export { handler as GET, handler as POST };
