import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { LaunchpadContext } from "./launchpad-context";
import {
  getLaunchpadMonitorData,
  checkLaunchpadReady,
  createLaunchpadApplication,
  getLaunchpadApplication,
  updateLaunchpadApplication,
  deleteLaunchpadApplication,
  startLaunchpadApplication,
  pauseLaunchpadApplication,
  updateLaunchpadConfigMap,
  createLaunchpadPorts,
  updateLaunchpadPorts,
  deleteLaunchpadPorts,
  updateLaunchpadStorage,
  getLaunchpadApplicationPods,
  getLaunchpadPodsMetrics,
} from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-api-service";
import { transformCombinedMonitorData } from "@/lib/sealos/sealos-utils";
import { LaunchpadCheckReadyRequestSchema } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-old-api-schemas/req-res-check-ready-schemas";
import { BuiltinResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
  getLaunchpad,
  listLaunchpads,
  getLaunchpadLogs,
} from "@/lib/sealos/resources/launchpad/launchpad-method/launchpad-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  deleteLaunchpad,
  pauseLaunchpad,
  startLaunchpad,
  checkReadyLaunchpad,
} from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-old-api";

import {
  LaunchpadCreateRequestSchema,
  LaunchpadPatchRequestSchema,
  LaunchpadConfigMapUpdateRequestSchema,
  LaunchpadPortsUpdateRequestSchema,
  LaunchpadStorageUpdateRequestSchema,
  LaunchpadPortsCreateRequestSchema,
} from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api-schemas/launchpad-create-schema";
import { LaunchpadDeleteRequestSchema } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-old-api-schemas/req-res-delete-schemas";
import { LaunchpadPauseRequestSchema } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-old-api-schemas/req-res-pause-schemas";
import { LaunchpadStartRequestSchema } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-old-api-schemas/req-res-start-schemas";
import { QueryLogsRequestSchema } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-old-api-schemas/req-res-query-logs-schemas";

const t = initTRPC.context<LaunchpadContext>().create();

export const launchpadRouter = t.router({
  // Query Operations
  getLaunchpad: t.procedure
    .input(BuiltinResourceTargetSchema)
    .query(async ({ ctx, input }) => {
      return await getLaunchpad(ctx, input);
    }),

  listLaunchpads: t.procedure.query(async ({ ctx }) => {
    return await listLaunchpads(ctx);
  }),

  getLaunchpadLogs: t.procedure
    .input(
      z.object({
        target: BuiltinResourceTargetSchema,
      })
    )
    .query(async ({ ctx, input }) => {
      return await getLaunchpadLogs(ctx, ctx, input.target);
    }),

  checkLaunchpadReady: t.procedure
    .input(
      z.object({
        launchpadName: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      return await checkLaunchpadReady({ name: input.launchpadName }, ctx);
    }),

  getLaunchpadCombinedMonitorData: t.procedure
    .input(
      z.object({
        queryName: z.string(),
        step: z.string().optional().default("2m"),
      })
    )
    .query(async ({ input, ctx }) => {
      const [cpuData, memoryData] = await Promise.all([
        getLaunchpadMonitorData(
          ctx,
          "average_cpu",
          input.queryName,
          input.step
        ),
        getLaunchpadMonitorData(
          ctx,
          "average_memory",
          input.queryName,
          input.step
        ),
      ]);

      return transformCombinedMonitorData({
        cpu: cpuData,
        memory: memoryData,
      });
    }),

  // Mutation Operations
  createLaunchpad: t.procedure
    .input(
      z.object({
        request: LaunchpadCreateRequestSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await createLaunchpadApplication(ctx, input.request);
    }),

  updateLaunchpad: t.procedure
    .input(
      z.object({
        name: z.string(),
        request: LaunchpadPatchRequestSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await updateLaunchpadApplication(ctx, input.name, input.request);
    }),

  updateLaunchpadConfigMap: t.procedure
    .input(
      z.object({
        name: z.string(),
        request: LaunchpadConfigMapUpdateRequestSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await updateLaunchpadConfigMap(ctx, input.name, input.request);
    }),

  updateLaunchpadPorts: t.procedure
    .input(
      z.object({
        name: z.string(),
        request: LaunchpadPortsUpdateRequestSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await updateLaunchpadPorts(ctx, input.name, input.request);
    }),

  // ============= NEW STANDARDIZED API ENDPOINTS =============

  getLaunchpadApplication: t.procedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      return await getLaunchpadApplication(ctx, input);
    }),

  deleteLaunchpadApplication: t.procedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      return await deleteLaunchpadApplication(ctx, input);
    }),

  startLaunchpadApplication: t.procedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      return await startLaunchpadApplication(ctx, input);
    }),

  pauseLaunchpadApplication: t.procedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      return await pauseLaunchpadApplication(ctx, input);
    }),

  createLaunchpadPorts: t.procedure
    .input(
      z.object({
        name: z.string(),
        request: LaunchpadPortsCreateRequestSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await createLaunchpadPorts(ctx, input.name, input.request);
    }),

  deleteLaunchpadPorts: t.procedure
    .input(
      z.object({
        name: z.string(),
        ports: z.array(z.number()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await deleteLaunchpadPorts(ctx, input.name, input);
    }),

  updateLaunchpadStorage: t.procedure
    .input(
      z.object({
        name: z.string(),
        request: LaunchpadStorageUpdateRequestSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await updateLaunchpadStorage(ctx, input.name, input.request);
    }),

  getLaunchpadPods: t.procedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      return await getLaunchpadApplicationPods(ctx, input);
    }),

  getLaunchpadPodsMetrics: t.procedure
    .input(
      z.object({
        podsName: z.array(z.string()),
      })
    )
    .query(async ({ input, ctx }) => {
      return await getLaunchpadPodsMetrics(ctx, { podsName: input.podsName });
    }),

  deleteLaunchpad: t.procedure
    .input(
      z.object({
        request: LaunchpadDeleteRequestSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await runParallelAction(deleteLaunchpad(input.request, ctx));
    }),

  pauseLaunchpad: t.procedure
    .input(
      z.object({
        request: LaunchpadPauseRequestSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await runParallelAction(pauseLaunchpad(input.request, ctx));
    }),

  startLaunchpad: t.procedure
    .input(
      z.object({
        request: LaunchpadStartRequestSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await runParallelAction(startLaunchpad(input.request, ctx));
    }),

  checkReadyLaunchpad: t.procedure
    .input(
      z.object({
        request: LaunchpadCheckReadyRequestSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await runParallelAction(checkReadyLaunchpad(input.request, ctx));
    }),
});

export type LaunchpadRouter = typeof launchpadRouter;
