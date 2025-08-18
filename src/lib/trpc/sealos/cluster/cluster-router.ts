import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { ClusterContext } from "./cluster-context";
import { getClusterMonitorData } from "@/lib/sealos/resources/cluster/cluster-api/cluster-api-service";
import { MetricsApiContextSchema } from "@/lib/sealos/services/metrics/schemas/metrics-api-context-schema";

const t = initTRPC.context<ClusterContext>().create();

export const clusterRouter = t.router({
  getClusterMonitorData: t.procedure
    .input(
      z.object({
        context: MetricsApiContextSchema,
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
