// app/api/trpc/objectstorage/[trpc]/route.ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { objectStorageRouter } from "@/lib/trpc/sealos/objectstorage/objectstorage-router";
import { useObjectStorageContext } from "@/lib/trpc/sealos/objectstorage/objectstorage-context";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc/objectstorage",
    req,
    router: objectStorageRouter,
    createContext: () => useObjectStorageContext({ req }),
  });

export { handler as GET, handler as POST };
