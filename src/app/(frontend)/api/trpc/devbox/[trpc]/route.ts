// app/api/trpc/devbox/[trpc]/route.ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { devboxRouter } from "@/lib/trpc/sealos/devbox/devbox-router";
import { createDevboxContext } from "@/lib/trpc/sealos/devbox/devbox-context";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc/devbox",
    req,
    router: devboxRouter,
    createContext: () => createDevboxContext({ req }),
  });

export { handler as GET, handler as POST };
