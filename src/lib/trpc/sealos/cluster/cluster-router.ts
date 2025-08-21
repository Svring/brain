import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { ClusterContext } from "./cluster-context";
import { getClusterMonitorData } from "@/lib/sealos/resources/cluster/cluster-api/cluster-api-service";
import { transformCombinedMonitorData } from "@/lib/sealos/sealos-utils";
import {
  getCluster,
  getClusterBackupList,
  getClusterLogs,
} from "@/lib/sealos/resources/cluster/cluster-method/cluster-query";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
  startCluster,
  pauseCluster,
} from "@/lib/sealos/resources/cluster/cluster-api/cluster-open-api";

const t = initTRPC.context<ClusterContext>().create();

export const clusterRouter = t.router({
  getCluster: t.procedure
    .input(
      z.object({
        target: CustomResourceTargetSchema,
      })
    )
    .query(async ({ input, ctx }) => {
      return await getCluster(ctx, input.target);
    }),

  getClusterBackupList: t.procedure
    .input(
      z.object({
        target: CustomResourceTargetSchema,
      })
    )
    .query(async ({ input, ctx }) => {
      return await getClusterBackupList(ctx, input.target);
    }),

  getClusterLog: t.procedure
    .input(
      z.object({
        target: CustomResourceTargetSchema,
      })
    )
    .query(async ({ input, ctx }) => {
      return await getClusterLogs(ctx, ctx, input.target);
    }),

  getClusterMonitorData: t.procedure
    .input(
      z.object({
        dbName: z.string(),
        dbType: z.string(),
        queryKey: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      return await getClusterMonitorData(
        ctx,
        input.dbName,
        input.dbType,
        input.queryKey
      );
    }),

  getClusterCombinedMonitorData: t.procedure
    .input(
      z.object({
        dbName: z.string(),
        dbType: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const [cpuResult, memoryResult, diskResult] = await Promise.allSettled([
        getClusterMonitorData(ctx, input.dbName, input.dbType, "cpu"),
        getClusterMonitorData(ctx, input.dbName, input.dbType, "memory"),
        getClusterMonitorData(ctx, input.dbName, input.dbType, "disk"),
      ]);

      // console.log("cpuResult", JSON.stringify(cpuResult, null, 2));
      // console.log("memoryResult", JSON.stringify(memoryResult, null, 2));
      // console.log("diskResult", JSON.stringify(diskResult, null, 2));

      const cpuData =
        cpuResult.status === "fulfilled" ? cpuResult.value : undefined;
      const memoryData =
        memoryResult.status === "fulfilled" ? memoryResult.value : undefined;
      const diskData =
        diskResult.status === "fulfilled" ? diskResult.value : undefined;

      const result = transformCombinedMonitorData({
        cpu: cpuData,
        memory: memoryData,
        storage: diskData,
      });

      // console.log("result", JSON.stringify(result, null, 2));

      return result;
    }),

  startCluster: t.procedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      return await startCluster(input, ctx);
    }),

  pauseCluster: t.procedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      return await pauseCluster(input, ctx);
    }),
});

export type ClusterRouter = typeof clusterRouter;
