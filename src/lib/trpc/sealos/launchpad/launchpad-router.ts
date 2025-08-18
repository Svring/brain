import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { LaunchpadContext } from "./launchpad-context";
import {
  getLaunchpadMonitorData,
  checkLaunchpadReady,
} from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-api-service";
import { SealosApiContextSchema } from "@/lib/sealos/sealos-api-context-schema";
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
import { createApplication } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api";
import { LaunchpadCreateRequestSchema } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api-schemas/launchpad-create-schema";
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
        sealosContext: SealosApiContextSchema,
      })
    )
    .query(async ({ ctx, input }) => {
      return await getLaunchpadLogs(ctx, input.sealosContext, input.target);
    }),

  checkLaunchpadReady: t.procedure
    .input(
      z.object({
        request: LaunchpadCheckReadyRequestSchema,
        context: SealosApiContextSchema,
      })
    )
    .query(async ({ input }) => {
      return await checkLaunchpadReady(input.request, input.context);
    }),

  getLaunchpadMonitorData: t.procedure
    .input(
      z.object({
        context: SealosApiContextSchema,
        queryKey: z.string(),
        queryName: z.string(),
        step: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await getLaunchpadMonitorData(
        input.context,
        input.queryKey,
        input.queryName,
        input.step
      );
    }),

  getLaunchpadCombinedMonitorData: t.procedure
    .input(
      z.object({
        context: SealosApiContextSchema,
        queryName: z.string(),
        step: z.string().optional().default("2m"),
      })
    )
    .query(async ({ input }) => {
      const [cpuData, memoryData] = await Promise.all([
        getLaunchpadMonitorData(
          input.context,
          "average_cpu",
          input.queryName,
          input.step
        ),
        getLaunchpadMonitorData(
          input.context,
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
        context: SealosApiContextSchema,
      })
    )
    .mutation(async ({ input }) => {
      return await runParallelAction(
        createApplication(input.context, input.request)
      );
    }),

  deleteLaunchpad: t.procedure
    .input(
      z.object({
        request: LaunchpadDeleteRequestSchema,
        context: SealosApiContextSchema,
      })
    )
    .mutation(async ({ input }) => {
      return await runParallelAction(
        deleteLaunchpad(input.request, input.context)
      );
    }),

  pauseLaunchpad: t.procedure
    .input(
      z.object({
        request: LaunchpadPauseRequestSchema,
        context: SealosApiContextSchema,
      })
    )
    .mutation(async ({ input }) => {
      return await runParallelAction(
        pauseLaunchpad(input.request, input.context)
      );
    }),

  startLaunchpad: t.procedure
    .input(
      z.object({
        request: LaunchpadStartRequestSchema,
        context: SealosApiContextSchema,
      })
    )
    .mutation(async ({ input }) => {
      return await runParallelAction(
        startLaunchpad(input.request, input.context)
      );
    }),

  checkReadyLaunchpad: t.procedure
    .input(
      z.object({
        request: LaunchpadCheckReadyRequestSchema,
        context: SealosApiContextSchema,
      })
    )
    .mutation(async ({ input }) => {
      return await runParallelAction(
        checkReadyLaunchpad(input.request, input.context)
      );
    }),
});

export type LaunchpadRouter = typeof launchpadRouter;
