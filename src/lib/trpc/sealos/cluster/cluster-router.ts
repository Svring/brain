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
  createCluster,
  updateCluster,
  getClusterVersions,
} from "@/lib/sealos/resources/cluster/cluster-api/cluster-open-api";
import {
  CreateClusterRequestSchema,
  CreateClusterResponseSchema,
  UpdateClusterRequestSchema,
  UpdateClusterResponseSchema,
} from "@/lib/sealos/resources/cluster/cluster-api/cluster-open-api-schemas";
import { runParallelAction } from "next-server-actions-parallel";
import { deleteCluster as deleteClusterOld } from "@/lib/sealos/resources/cluster/cluster-api/cluster-old-api";
import {
  ClusterDeleteRequestSchema,
  ClusterDeleteResponseSchema,
} from "@/lib/sealos/resources/cluster/schemas/req-res-schemas/req-res-delete-schemas";

const t = initTRPC.context<ClusterContext>().create();

export const clusterRouter = t.router({
  getCluster: t.procedure
    .input(CustomResourceTargetSchema)
    .query(async ({ input, ctx }) => {
      return await getCluster(ctx, input);
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

  getClusterVersions: t.procedure.query(async ({ ctx }) => {
    return await runParallelAction(getClusterVersions(ctx));
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

  createCluster: t.procedure
    .input(CreateClusterRequestSchema)
    .output(CreateClusterResponseSchema)
    .mutation(async ({ input, ctx }) => {
      return await runParallelAction(createCluster(input, ctx));
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

  updateCluster: t.procedure
    .input(
      z.object({
        clusterName: z.string(),
        request: UpdateClusterRequestSchema,
      })
    )
    .output(UpdateClusterResponseSchema)
    .mutation(async ({ input, ctx }) => {
      return await runParallelAction(
        updateCluster(input.clusterName, input.request, ctx)
      );
    }),

  deleteCluster: t.procedure
    .input(ClusterDeleteRequestSchema)
    .output(ClusterDeleteResponseSchema)
    .mutation(async ({ input, ctx }) => {
      return await runParallelAction(deleteClusterOld(input, ctx));
    }),
});

export type ClusterRouter = typeof clusterRouter;
