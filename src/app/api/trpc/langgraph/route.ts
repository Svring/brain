import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { langgraphRouter } from "@/lib/trpc/langgraph/langgraph-router";
import { LanggraphContextSchema } from "@/lib/trpc/langgraph/langgraph-context";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc/langgraph",
    req,
    router: langgraphRouter,
    createContext: () => {
      // Create context from request headers or environment
      const apiUrl = process.env["NEXT_PUBLIC_LANGGRAPH_DEPLOYMENT_URL"];
      return LanggraphContextSchema.parse({ apiUrl });
    },
  });

export { handler as GET, handler as POST };
