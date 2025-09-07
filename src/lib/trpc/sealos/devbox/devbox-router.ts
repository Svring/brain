import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { DevboxContext } from "./devbox-context";

import { devboxCreateFormSchema } from "@/schemas/forms/devbox/devbox-create-form-schema";
import { devboxUpdateFormSchema } from "@/schemas/forms/devbox/devbox-update-form-schema";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
  createDevbox,
  updateDevbox,
  startDevbox,
  pauseDevbox,
  shutdownDevbox,
  restartDevbox,
  deleteDevbox,
  releaseDevbox,
  getDevboxReleases,
  deleteDevboxRelease,
  deployDevbox,
  getDevbox,
  listDevboxes,
  getDevboxMonitor,
  checkDevboxReady,
} from "@/lib/sealos/resources/devbox/devbox-api/devbox-api-service";
import { transformCombinedMonitorData } from "@/lib/sealos/sealos-utils";

const t = initTRPC.context<DevboxContext>().create();

export const devboxRouter = t.router({
  // ===== QUERY PROCEDURES =====

  // DevBox Listing & Information
  listDevboxes: t.procedure.query(async ({ ctx }) => {
    return await listDevboxes(ctx);
  }),

  getDevbox: t.procedure
    .input(CustomResourceTargetSchema)
    .query(async ({ input, ctx }) => {
      return await getDevbox(ctx, input);
    }),

  getDevboxMonitor: t.procedure
    .input(
      z.object({
        devboxName: z.string(),
        step: z.string().optional().default("2m"),
      })
    )
    .query(async ({ input, ctx }) => {
      const [cpuResult, memoryResult] = await Promise.allSettled([
        getDevboxMonitor(ctx, "average_cpu", input.devboxName, input.step),
        getDevboxMonitor(ctx, "average_memory", input.devboxName, input.step),
      ]);

      const cpuData =
        cpuResult.status === "fulfilled" ? cpuResult.value : undefined;
      const memoryData =
        memoryResult.status === "fulfilled" ? memoryResult.value : undefined;

      const result = transformCombinedMonitorData({
        cpu: cpuData,
        memory: memoryData,
      });

      return result;
    }),

  checkDevboxReady: t.procedure
    .input(
      z.object({
        devboxName: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      return await checkDevboxReady(ctx, input.devboxName);
    }),

  // Release Information
  getDevboxReleases: t.procedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return await getDevboxReleases(ctx, input);
    }),

  // ===== MUTATION PROCEDURES =====

  // DevBox Lifecycle Management
  createDevbox: t.procedure
    .input(devboxCreateFormSchema)
    .mutation(async ({ ctx, input }) => {
      return await createDevbox(ctx, input);
    }),

  updateDevbox: t.procedure
    .input(
      z.object({
        devboxName: z.string(),
        request: devboxUpdateFormSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await updateDevbox(ctx, input.devboxName, input.request);
    }),

  startDevbox: t.procedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return await startDevbox(ctx, input);
    }),

  pauseDevbox: t.procedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return await pauseDevbox(ctx, input);
    }),

  shutdownDevbox: t.procedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return await shutdownDevbox(ctx, input);
    }),

  restartDevbox: t.procedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return await restartDevbox(ctx, input);
    }),

  deleteDevbox: t.procedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return await deleteDevbox(ctx, input);
    }),

  // Release Management
  releaseDevbox: t.procedure
    .input(
      z.object({
        devboxName: z.string().min(1, "DevBox name is required"),
        tag: z.string().min(1, "Release tag is required"),
        releaseDes: z.string().default(""),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { devboxName, tag, releaseDes } = input;
      return await releaseDevbox(ctx, devboxName, tag, releaseDes);
    }),

  deleteDevboxRelease: t.procedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return await deleteDevboxRelease(ctx, input);
    }),

  deployDevbox: t.procedure
    .input(
      z.object({
        devboxName: z.string().min(1, "DevBox name is required"),
        tag: z.string().min(1, "Devbox release version tag is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { devboxName, tag } = input;
      return await deployDevbox(ctx, devboxName, tag);
    }),
});

export type DevboxRouter = typeof devboxRouter;
