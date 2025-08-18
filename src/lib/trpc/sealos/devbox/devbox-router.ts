import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { DevboxContext } from "./devbox-context";

import {
  DevboxListResponseSchema,
  DevboxCreateRequestSchema,
  DevboxCreateResponseSchema,
  DevboxDeleteResponseSchema,
  DevboxLifecycleRequestSchema,
  DevboxLifecycleResponseSchema,
  DevboxReleaseRequestSchema,
  DevboxReleaseResponseSchema,
  DevboxReleasesResponseSchema,
  DevboxDeployRequestSchema,
  DevboxDeployResponseSchema,
  DevboxPortCreateRequestSchema,
  DevboxPortCreateResponseSchema,
  DevboxPortRemoveResponseSchema,
  AppFormConfigSchema,
  CreateAppResponseSchema,
  DeleteAppResponseSchema,
  GetAppsResponseSchema,
  GetAppByNameResponseSchema,
  GetAppPodsResponseSchema,
} from "@/lib/sealos/resources/devbox/devbox-api/devbox-open-api-schemas";
import { K8sApiContextSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
  getDevboxList,
  createDevbox,
  manageDevboxLifecycle,
  deleteDevbox,
  releaseDevbox,
  getDevboxReleases,
  deployDevbox,
  getDevboxByName,
  createDevboxPort,
  removeDevboxPort,
  createApp,
  getApps,
  getAppByName,
  deleteApp,
  getAppPods,
  getDevbox,
  listDevbox,
  getDevboxSshInfo,
  listDevboxFolderFiles,
  getDevboxInstantMonitor,
  getDevboxRangedMonitor,
  getDevboxMonitorData,
  checkDevboxReady,
} from "@/lib/sealos/resources/devbox/devbox-api/devbox-api-service";
import { MetricsApiContextSchema } from "@/lib/sealos/services/metrics/schemas/metrics-api-context-schema";
import { DevboxApiContextSchema } from "@/lib/sealos/resources/devbox/devbox-api/devbox-open-api-schemas";
import { transformCombinedMonitorData } from "@/lib/sealos/sealos-utils";

const t = initTRPC.context<DevboxContext>().create();

export const devboxRouter = t.router({
  // DevBox Lifecycle Management
  listDevboxes: t.procedure
    .output(DevboxListResponseSchema)
    .query(async ({ ctx }) => {
      return await getDevboxList(ctx);
    }),

  createDevbox: t.procedure
    .input(DevboxCreateRequestSchema)
    .output(DevboxCreateResponseSchema)
    .mutation(async ({ ctx, input }) => {
      return await createDevbox(input, ctx);
    }),

  manageDevboxLifecycle: t.procedure
    .input(DevboxLifecycleRequestSchema)
    .output(DevboxLifecycleResponseSchema)
    .mutation(async ({ ctx, input }) => {
      return await manageDevboxLifecycle(input, ctx);
    }),

  deleteDevbox: t.procedure
    .input(z.string())
    .output(DevboxDeleteResponseSchema)
    .mutation(async ({ ctx, input }) => {
      return await deleteDevbox(input, ctx);
    }),

  // DevBox Release Management
  releaseDevbox: t.procedure
    .input(DevboxReleaseRequestSchema)
    .output(DevboxReleaseResponseSchema)
    .mutation(async ({ ctx, input }) => {
      return await releaseDevbox(input, ctx);
    }),

  getDevboxReleases: t.procedure
    .input(z.string())
    .output(DevboxReleasesResponseSchema)
    .query(async ({ ctx, input }) => {
      return await getDevboxReleases(input, ctx);
    }),

  deployDevbox: t.procedure
    .input(DevboxDeployRequestSchema)
    .output(DevboxDeployResponseSchema)
    .mutation(async ({ ctx, input }) => {
      return await deployDevbox(input, ctx);
    }),

  // Port Management
  createDevboxPort: t.procedure
    .input(DevboxPortCreateRequestSchema)
    .output(DevboxPortCreateResponseSchema)
    .mutation(async ({ ctx, input }) => {
      return await createDevboxPort(input, ctx);
    }),

  removeDevboxPort: t.procedure
    .input(z.object({ devboxName: z.string(), port: z.number() }))
    .output(DevboxPortRemoveResponseSchema)
    .mutation(async ({ ctx, input }) => {
      return await removeDevboxPort(input.devboxName, input.port, ctx);
    }),

  // Application Management
  createApp: t.procedure
    .input(AppFormConfigSchema)
    .output(CreateAppResponseSchema)
    .mutation(async ({ ctx, input }) => {
      return await createApp(input, ctx);
    }),

  getApps: t.procedure.output(GetAppsResponseSchema).query(async ({ ctx }) => {
    return await getApps(ctx);
  }),

  getAppByName: t.procedure
    .input(z.string())
    .output(GetAppByNameResponseSchema)
    .query(async ({ ctx, input }) => {
      return await getAppByName(input, ctx);
    }),

  deleteApp: t.procedure
    .input(z.string())
    .output(DeleteAppResponseSchema)
    .mutation(async ({ ctx, input }) => {
      return await deleteApp(input, ctx);
    }),

  getAppPods: t.procedure
    .input(z.string())
    .output(GetAppPodsResponseSchema)
    .query(async ({ ctx, input }) => {
      return await getAppPods(input, ctx);
    }),

  // K8s Operations
  getDevbox: t.procedure
    .input(
      z.object({
        target: CustomResourceTargetSchema,
      })
    )
    .query(async ({ input, ctx }) => {
      return await getDevbox(ctx, input.target);
    }),

  listDevboxK8s: t.procedure
    .input(K8sApiContextSchema)
    .query(async ({ input }) => {
      return await listDevbox(input);
    }),

  // SSH Operations
  getDevboxSshInfo: t.procedure
    .input(
      z.object({
        target: CustomResourceTargetSchema,
      })
    )
    .query(async ({ ctx, input }) => {
      return await getDevboxSshInfo(ctx, input.target);
    }),

  listDevboxFolderFiles: t.procedure
    .input(
      z.object({
        sshConfig: z.object({
          host: z.string(),
          port: z.number(),
          user: z.string(),
          privateKey: z.string().optional(),
          workingDir: z.string(),
        }),
        relativePath: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await listDevboxFolderFiles(input.sshConfig, input.relativePath);
    }),

  // Metrics Operations
  getDevboxInstantMonitor: t.procedure
    .input(
      z.object({
        context: MetricsApiContextSchema,
        devboxName: z.string(),
        time: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await getDevboxInstantMonitor(
        input.context,
        input.devboxName,
        input.time
      );
    }),

  getDevboxRangedMonitor: t.procedure
    .input(
      z.object({
        context: MetricsApiContextSchema,
        devboxName: z.string(),
        start: z.string().optional(),
        end: z.string().optional(),
        step: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await getDevboxRangedMonitor(
        input.context,
        input.devboxName,
        input.start,
        input.end,
        input.step
      );
    }),

  getDevboxMonitorData: t.procedure
    .input(
      z.object({
        context: DevboxApiContextSchema,
        queryKey: z.string(),
        queryName: z.string(),
        step: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await getDevboxMonitorData(
        input.context,
        input.queryKey,
        input.queryName,
        input.step
      );
    }),

  getDevboxCombinedMonitorData: t.procedure
    .input(
      z.object({
        context: DevboxApiContextSchema,
        devboxName: z.string(),
        step: z.string().optional().default("2m"),
      })
    )
    .query(async ({ input }) => {
      const [cpuResult, memoryResult] = await Promise.allSettled([
        getDevboxMonitorData(
          input.context,
          "average_cpu",
          input.devboxName,
          input.step
        ),
        getDevboxMonitorData(
          input.context,
          "average_memory",
          input.devboxName,
          input.step
        ),
      ]);

      // console.log("cpuResult", JSON.stringify(cpuResult, null, 2));
      // console.log("memoryResult", JSON.stringify(memoryResult, null, 2));

      const cpuData =
        cpuResult.status === "fulfilled" ? cpuResult.value : undefined;
      const memoryData =
        memoryResult.status === "fulfilled" ? memoryResult.value : undefined;

      return transformCombinedMonitorData({
        cpu: cpuData,
        memory: memoryData,
      });
    }),

  checkDevboxReady: t.procedure
    .input(
      z.object({
        context: DevboxApiContextSchema,
        devboxName: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await checkDevboxReady(input.context, input.devboxName);
    }),
});

export type DevboxRouter = typeof devboxRouter;
