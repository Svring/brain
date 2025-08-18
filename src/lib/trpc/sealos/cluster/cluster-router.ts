import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { ClusterContext } from "./cluster-context";
import { getClusterMonitorData } from "@/lib/sealos/resources/cluster/cluster-api/cluster-api-service";
import { SealosApiContextSchema } from "@/lib/sealos/sealos-api-context-schema";

const t = initTRPC.context<ClusterContext>().create();

export const clusterRouter = t.router({
  getClusterMonitorData: t.procedure
    .input(
      z.object({
        context: SealosApiContextSchema,
        dbName: z.string(),
        dbType: z.string(),
        queryKey: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await getClusterMonitorData(
        input.context,
        input.dbName,
        input.dbType,
        input.queryKey
      );
    }),
});

export type ClusterRouter = typeof clusterRouter;
