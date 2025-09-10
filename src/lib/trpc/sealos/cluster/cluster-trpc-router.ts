import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { ClusterContext } from "./cluster-trpc-context";
import {
  getClusterMonitorData,
  deleteClusterBackup,
} from "@/lib/sealos/resources/cluster/cluster-api/cluster-api-service";
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
  CreateClusterResponseSchema,
  UpdateClusterRequestSchema,
  UpdateClusterResponseSchema,
} from "@/lib/sealos/resources/cluster/cluster-api/cluster-open-api-schemas";
import { clusterCreateFormSchema } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { runParallelAction } from "next-server-actions-parallel";
import { deleteCluster as deleteClusterOld } from "@/lib/sealos/resources/cluster/cluster-api/cluster-old-api";
import {
  ClusterDeleteRequestSchema,
  ClusterDeleteResponseSchema,
} from "@/lib/sealos/resources/cluster/schemas/req-res-schemas/req-res-delete-schemas";

const t = initTRPC.context<ClusterContext>().create();

export const clusterRouter = t.router({
  // ===== QUERY PROCEDURES =====

  // Cluster Information
  get: t.procedure
    .input(CustomResourceTargetSchema)
    .query(async ({ input, ctx }) => {
      return await getCluster(ctx, input);
    }),

  backups: t.procedure
    .input(CustomResourceTargetSchema)
    .query(async ({ input, ctx }) => {
      return await getClusterBackupList(ctx, input);
    }),

  logs: t.procedure
    .input(CustomResourceTargetSchema)
    .query(async ({ input, ctx }) => {
      return await getClusterLogs(ctx, ctx, input);
    }),

  versions: t.procedure.query(async ({ ctx }) => {
    return await runParallelAction(getClusterVersions(ctx));
  }),

  // Monitoring
  monitor: t.procedure
    .input(
      z.object({
        dbName: z.string(),
        dbType: z.string(),
        queryKey: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { dbName, dbType, queryKey } = input;
      return await getClusterMonitorData(ctx, dbName, dbType, queryKey);
    }),

  combinedMonitor: t.procedure
    .input(
      z.object({
        dbName: z.string(),
        dbType: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { dbName, dbType } = input;

      const [cpuResult, memoryResult, diskResult] = await Promise.allSettled([
        getClusterMonitorData(ctx, dbName, dbType, "cpu"),
        getClusterMonitorData(ctx, dbName, dbType, "memory"),
        getClusterMonitorData(ctx, dbName, dbType, "disk"),
      ]);

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

      return result;
    }),

  // ===== MUTATION PROCEDURES =====

  // Cluster Lifecycle Management
  create: t.procedure
    .input(clusterCreateFormSchema)
    .mutation(async ({ input, ctx }) => {
      return await runParallelAction(createCluster(input, ctx));
    }),

  start: t.procedure.input(z.string()).mutation(async ({ input, ctx }) => {
    return await startCluster(input, ctx);
  }),

  pause: t.procedure.input(z.string()).mutation(async ({ input, ctx }) => {
    return await pauseCluster(input, ctx);
  }),

  update: t.procedure
    .input(
      z.object({
        clusterName: z.string(),
        request: UpdateClusterRequestSchema,
      })
    )
    .output(UpdateClusterResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const { clusterName, request } = input;
      return await runParallelAction(updateCluster(clusterName, request, ctx));
    }),

  delete: t.procedure
    .input(ClusterDeleteRequestSchema)
    .output(ClusterDeleteResponseSchema)
    .mutation(async ({ input, ctx }) => {
      return await runParallelAction(deleteClusterOld(input, ctx));
    }),

  deleteBackup: t.procedure
    .input(
      z.object({
        clusterName: z.string(),
        backupName: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { clusterName, backupName } = input;
      return await deleteClusterBackup(ctx, clusterName, backupName);
    }),
});

export type ClusterRouter = typeof clusterRouter;
