import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { ClusterContext } from "./cluster-context";
import { getClusterMonitorData } from "@/lib/sealos/resources/cluster/cluster-api/cluster-api-service";
import { SealosApiContextSchema } from "@/lib/sealos/sealos-api-context-schema";
import { transformCombinedMonitorData } from "@/lib/sealos/sealos-utils";

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

  getClusterCombinedMonitorData: t.procedure
    .input(
      z.object({
        context: SealosApiContextSchema,
        dbName: z.string(),
        dbType: z.string(),
      })
    )
    .query(async ({ input }) => {
      const [cpuResult, memoryResult, diskResult] = await Promise.allSettled([
        getClusterMonitorData(input.context, input.dbName, input.dbType, "cpu"),
        getClusterMonitorData(
          input.context,
          input.dbName,
          input.dbType,
          "memory"
        ),
        getClusterMonitorData(
          input.context,
          input.dbName,
          input.dbType,
          "disk"
        ),
      ]);

      // console.log("cpuResult", JSON.stringify(cpuResult, null, 2));
      // console.log("memoryResult", JSON.stringify(memoryResult, null, 2));
      console.log("diskResult", JSON.stringify(diskResult, null, 2));

      const cpuData =
        cpuResult.status === "fulfilled" ? cpuResult.value : undefined;
      const memoryData =
        memoryResult.status === "fulfilled" ? memoryResult.value : undefined;
      const diskData =
        diskResult.status === "fulfilled" ? diskResult.value : undefined;

      return transformCombinedMonitorData({
        cpu: cpuData,
        memory: memoryData,
        storage: diskData,
      });
    }),
});

export type ClusterRouter = typeof clusterRouter;
