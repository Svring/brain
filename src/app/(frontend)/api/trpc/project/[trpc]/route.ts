import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { projectRouter } from "@/lib/trpc/brain/project/project-router";
import { createProjectContext } from "@/lib/trpc/brain/project/project-context";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc/project",
    req,
    router: projectRouter,
    createContext: () => createProjectContext({ req }),
  });

export { handler as GET, handler as POST };
