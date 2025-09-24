import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { LaunchpadContext } from "./launchpad-trpc-context";
import {
  getLaunchpadMonitorData,
  getLaunchpadCombinedMonitor,
  checkLaunchpadReady,
  createLaunchpadService,
  updateLaunchpadService,
  getLaunchpadApplicationPods,
  getLaunchpadPodsMetrics,
  getLaunchpad,
  listLaunchpads,
  getLaunchpadLogs,
  startLaunchpadService,
  pauseLaunchpadService,
  deleteLaunchpadService,
  checkReadyLaunchpadService,
} from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-api-service";
import { LaunchpadCheckReadyRequestSchema } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-old-api-schemas/req-res-check-ready-schemas";
import { BuiltinResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { launchpadCreateFormSchema } from "@/schemas/forms/launchpad/launchpad-create-form-schema";
import { launchpadUpdateFormSchema } from "@/schemas/forms/launchpad/launchpad-update-form-schema";

const t = initTRPC.context<LaunchpadContext>().create();

export const launchpadRouter = t.router({
  // ===== QUERY PROCEDURES =====

  // Launchpad Information
  get: t.procedure
    .input(BuiltinResourceTargetSchema)
    .query(async ({ ctx, input }) => {
      // Try both deployment and statefulset targets
      const deploymentTarget = {
        type: "builtin" as const,
        resourceType: "deployment" as const,
        name: input.name,
      };

      const statefulsetTarget = {
        type: "builtin" as const,
        resourceType: "statefulset" as const,
        name: input.name,
      };

      // Try deployment first, then statefulset if deployment fails
      try {
        return await getLaunchpad(ctx, deploymentTarget);
      } catch (deploymentError) {
        try {
          return await getLaunchpad(ctx, statefulsetTarget);
        } catch (statefulsetError) {
          // Both failed, throw the first error
          throw deploymentError;
        }
      }
    }),

  list: t.procedure
    .input(z.object({ type: z.string().default("launchpad") }))
    .query(async ({ ctx, input }) => {
      return await listLaunchpads(ctx);
    }),

  logs: t.procedure
    .input(BuiltinResourceTargetSchema)
    .query(async ({ ctx, input }) => {
      // Try both deployment and statefulset targets
      const deploymentTarget = {
        type: "builtin" as const,
        resourceType: "deployment" as const,
        name: input.name,
      };

      const statefulsetTarget = {
        type: "builtin" as const,
        resourceType: "statefulset" as const,
        name: input.name,
      };

      // Try deployment first, then statefulset if deployment fails
      try {
        return await getLaunchpadLogs(ctx, ctx, deploymentTarget);
      } catch (deploymentError) {
        try {
          return await getLaunchpadLogs(ctx, ctx, statefulsetTarget);
        } catch (statefulsetError) {
          // Both failed, throw the first error
          throw deploymentError;
        }
      }
    }),

  networkStatus: t.procedure.input(z.string()).query(async ({ input, ctx }) => {
    const response = await checkLaunchpadReady({ name: input }, ctx);
    // console.log("response", response);
    return response;
  }),

  // Monitoring
  monitor: t.procedure
    .input(
      z.object({
        queryName: z.string(),
        step: z.string().optional().default("2m"),
      })
    )
    .query(async ({ input, ctx }) => {
      const { queryName, step } = input;
      return await getLaunchpadCombinedMonitor(ctx, queryName, step);
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
      return await createLaunchpadService(ctx, input);
    }),

  update: t.procedure
    .input(launchpadUpdateFormSchema)
    .mutation(async ({ input, ctx }) => {
      return await updateLaunchpadService(ctx, input);
    }),

  start: t.procedure
    .input(BuiltinResourceTargetSchema)
    .mutation(async ({ input, ctx }) => {
      return await startLaunchpadService({ name: input.name! }, ctx);
    }),

  pause: t.procedure
    .input(BuiltinResourceTargetSchema)
    .mutation(async ({ input, ctx }) => {
      return await pauseLaunchpadService({ name: input.name! }, ctx);
    }),

  delete: t.procedure
    .input(BuiltinResourceTargetSchema)
    .mutation(async ({ input, ctx }) => {
      return await deleteLaunchpadService({ name: input.name! }, ctx);
    }),
});

export type LaunchpadRouter = typeof launchpadRouter;
