// app/api/trpc/devbox/[trpc]/route.ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { devboxRouter } from "@/lib/trpc/sealos/devbox/devbox-trpc-router";
import { useDevboxContext } from "@/lib/trpc/sealos/devbox/devbox-trpc-context";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc/devbox",
    req,
    router: devboxRouter,
    createContext: () => useDevboxContext({ req }),
  });

export { handler as GET, handler as POST };
