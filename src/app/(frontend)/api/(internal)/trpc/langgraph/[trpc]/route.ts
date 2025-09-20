import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { langgraphRouter } from "@/lib/trpc/langgraph/langgraph-trpc-router";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc/langgraph",
    req,
    router: langgraphRouter,
    createContext: () => {},
  });

export { handler as GET, handler as POST };
