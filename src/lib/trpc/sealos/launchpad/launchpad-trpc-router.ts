import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { LaunchpadContext } from "./launchpad-trpc-context";
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
  LaunchpadPatchRequestSchema,
  LaunchpadConfigMapUpdateRequestSchema,
  LaunchpadPortsUpdateRequestSchema,
  LaunchpadStorageUpdateRequestSchema,
  LaunchpadPortsCreateRequestSchema,
} from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api-schemas/launchpad-create-schema";
import { launchpadCreateFormSchema } from "@/schemas/forms/launchpad/launchpad-create-form-schema";
import { launchpadUpdateFormSchema } from "@/schemas/forms/launchpad/launchpad-update-form-schema";
import { LaunchpadDeleteRequestSchema } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-old-api-schemas/req-res-delete-schemas";
import { LaunchpadPauseRequestSchema } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-old-api-schemas/req-res-pause-schemas";
import { LaunchpadStartRequestSchema } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-old-api-schemas/req-res-start-schemas";
import { QueryLogsRequestSchema } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-old-api-schemas/req-res-query-logs-schemas";

const t = initTRPC.context<LaunchpadContext>().create();

export const launchpadRouter = t.router({
  // ===== QUERY PROCEDURES =====

  // Launchpad Information
  get: t.procedure
    .input(BuiltinResourceTargetSchema)
    .query(async ({ ctx, input }) => {
      return await getLaunchpad(ctx, input);
    }),

  list: t.procedure.query(async ({ ctx }) => {
    return await listLaunchpads(ctx);
  }),

  logs: t.procedure
    .input(BuiltinResourceTargetSchema)
    .query(async ({ ctx, input }) => {
      return await getLaunchpadLogs(ctx, ctx, input);
    }),

  networkStatus: t.procedure.input(z.string()).query(async ({ input, ctx }) => {
    return await checkLaunchpadReady({ name: input }, ctx);
  }),

  // Monitoring
  combinedMonitor: t.procedure
    .input(
      z.object({
        queryName: z.string(),
        step: z.string().optional().default("2m"),
      })
    )
    .query(async ({ input, ctx }) => {
      const { queryName, step } = input;

      const [cpuData, memoryData] = await Promise.all([
        getLaunchpadMonitorData(ctx, "average_cpu", queryName, step),
        getLaunchpadMonitorData(ctx, "average_memory", queryName, step),
      ]);

      return transformCombinedMonitorData({
        cpu: cpuData,
        memory: memoryData,
      });
    }),

  getPods: t.procedure.input(z.string()).query(async ({ input, ctx }) => {
    return await getLaunchpadApplicationPods(ctx, input);
  }),

  getPodsMetrics: t.procedure
    .input(
      z.object({
        podsName: z.array(z.string()),
      })
    )
    .query(async ({ input, ctx }) => {
      const { podsName } = input;
      return await getLaunchpadPodsMetrics(ctx, { podsName });
    }),

  // ===== MUTATION PROCEDURES =====

  // Launchpad Lifecycle Management
  create: t.procedure
    .input(launchpadCreateFormSchema)
    .mutation(async ({ input, ctx }) => {
      return await createLaunchpadApplication(ctx, input);
    }),

  update: t.procedure
    .input(
      z.object({
        name: z.string(),
        request: launchpadUpdateFormSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { name, request } = input;
      return await updateLaunchpadApplication(ctx, name, request);
    }),

  start: t.procedure.input(z.string()).mutation(async ({ input, ctx }) => {
    return await runParallelAction(startLaunchpad({ name: input }, ctx));
  }),

  pause: t.procedure.input(z.string()).mutation(async ({ input, ctx }) => {
    return await runParallelAction(pauseLaunchpad({ name: input }, ctx));
  }),

  delete: t.procedure
    .input(LaunchpadDeleteRequestSchema)
    .mutation(async ({ input, ctx }) => {
      return await runParallelAction(deleteLaunchpad(input, ctx));
    }),

  // Network Status Check
  checkReady: t.procedure
    .input(LaunchpadCheckReadyRequestSchema)
    .mutation(async ({ input, ctx }) => {
      return await runParallelAction(checkReadyLaunchpad(input, ctx));
    }),
});

export type LaunchpadRouter = typeof launchpadRouter;
