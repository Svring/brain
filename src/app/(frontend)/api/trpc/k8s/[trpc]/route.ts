import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { k8sRouter } from "@/lib/trpc/k8s/k8s-router";
import { createK8sContext } from "@/lib/trpc/k8s/k8s-context";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc/k8s",
    req,
    router: k8sRouter,
    createContext: () => createK8sContext({ req }),
  });

export { handler as GET, handler as POST };
