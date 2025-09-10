import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { DevboxContext } from "./devbox-trpc-context";

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
  list: t.procedure.query(async ({ ctx }) => {
    return await listDevboxes(ctx);
  }),

  get: t.procedure
    .input(CustomResourceTargetSchema)
    .query(async ({ input, ctx }) => {
      return await getDevbox(ctx, input);
    }),

  monitor: t.procedure
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

  networkStatus: t.procedure.input(z.string()).query(async ({ input, ctx }) => {
    return await checkDevboxReady(ctx, input);
  }),

  // Release Information
  releases: t.procedure.input(z.string()).query(async ({ ctx, input }) => {
    return await getDevboxReleases(ctx, input);
  }),

  // ===== MUTATION PROCEDURES =====

  // DevBox Lifecycle Management
  create: t.procedure
    .input(devboxCreateFormSchema)
    .mutation(async ({ ctx, input }) => {
      return await createDevbox(ctx, input);
    }),

  update: t.procedure
    .input(
      z.object({
        devboxName: z.string(),
        request: devboxUpdateFormSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await updateDevbox(ctx, input.devboxName, input.request);
    }),

  start: t.procedure.input(z.string()).mutation(async ({ ctx, input }) => {
    return await startDevbox(ctx, input);
  }),

  pause: t.procedure.input(z.string()).mutation(async ({ ctx, input }) => {
    return await pauseDevbox(ctx, input);
  }),

  shutdown: t.procedure.input(z.string()).mutation(async ({ ctx, input }) => {
    return await shutdownDevbox(ctx, input);
  }),

  restart: t.procedure.input(z.string()).mutation(async ({ ctx, input }) => {
    return await restartDevbox(ctx, input);
  }),

  delete: t.procedure.input(z.string()).mutation(async ({ ctx, input }) => {
    return await deleteDevbox(ctx, input);
  }),

  // Release Management
  release: t.procedure
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

  deleteRelease: t.procedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return await deleteDevboxRelease(ctx, input);
    }),

  deploy: t.procedure
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
