import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { projectRouter } from "@/lib/trpc/brain/project/project-trpc-router";
import { createProjectContext } from "@/lib/trpc/brain/project/project-trpc-context";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc/project",
    req,
    router: projectRouter,
    createContext: () => createProjectContext({ req }),
  });

export { handler as GET, handler as POST };
