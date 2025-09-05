import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { DevboxContext } from "./devbox-context";

import {
  DevboxListResponseSchema,
  DevboxCreateRequestSchema,
  DevboxCreateResponseSchema,
  DevboxUpdateRequestSchema,
  DevboxUpdateResponseSchema,
  DevboxDeleteResponseSchema,
  DevboxLifecycleRequestSchema,
  DevboxLifecycleResponseSchema,
  DevboxShutdownRequestSchema,
  DevboxShutdownResponseSchema,
  DevboxRestartRequestSchema,
  DevboxRestartResponseSchema,
  DevboxReleaseRequestSchema,
  DevboxReleaseResponseSchema,
  DevboxReleasesResponseSchema,
  DevboxDeployRequestSchema,
  DevboxDeployResponseSchema,
} from "@/lib/sealos/resources/devbox/devbox-api/devbox-open-api-schemas";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
  getDevboxList,
  createDevbox,
  updateDevbox,
  manageDevboxLifecycle,
  shutdownDevbox,
  restartDevbox,
  deleteDevbox,
  releaseDevbox,
  getDevboxReleases,
  deleteDevboxRelease,
  deployDevbox,
  getDevboxByName,
  getDevbox,
  listDevbox,
  getDevboxSshInfo,
  listDevboxFolderFiles,
  getDevboxMonitorData,
  checkDevboxReady,
} from "@/lib/sealos/resources/devbox/devbox-api/devbox-api-service";
import { transformCombinedMonitorData } from "@/lib/sealos/sealos-utils";
import {
  getOrCreateEnvFile,
  upsertEnvVar,
  deleteEnvVar,
  type EnvVarValue,
} from "@/lib/sealos/services/env/devbox/devbox-env-utils";
import { SSHConfigSchema } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-query-schema";

const t = initTRPC.context<DevboxContext>().create();

// Environment variable schemas
const EnvVarValueSchema = z.object({
  type: z.literal("value"),
  key: z.string(),
  value: z.string(),
});

const EnvVarListResponseSchema = z.array(EnvVarValueSchema);

const UpsertEnvVarRequestSchema = z.object({
  sshConfig: SSHConfigSchema,
  key: z.string(),
  value: z.string(),
});

const DeleteEnvVarRequestSchema = z.object({
  sshConfig: SSHConfigSchema,
  key: z.string(),
});

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

  updateDevbox: t.procedure
    .input(
      z.object({
        devboxName: z.string(),
        request: DevboxUpdateRequestSchema,
      })
    )
    .output(DevboxUpdateResponseSchema)
    .mutation(async ({ ctx, input }) => {
      return await updateDevbox(input.devboxName, input.request, ctx);
    }),

  manageDevboxLifecycle: t.procedure
    .input(DevboxLifecycleRequestSchema)
    .output(DevboxLifecycleResponseSchema)
    .mutation(async ({ ctx, input }) => {
      return await manageDevboxLifecycle(input, ctx);
    }),

  shutdownDevbox: t.procedure
    .input(z.string())
    .output(DevboxShutdownResponseSchema)
    .mutation(async ({ ctx, input }) => {
      return await shutdownDevbox(input, {}, ctx);
    }),

  restartDevbox: t.procedure
    .input(z.string())
    .output(DevboxRestartResponseSchema)
    .mutation(async ({ ctx, input }) => {
      return await restartDevbox(input, {}, ctx);
    }),

  deleteDevbox: t.procedure
    .input(z.string())
    .output(DevboxDeleteResponseSchema)
    .mutation(async ({ ctx, input }) => {
      return await deleteDevbox(input, ctx);
    }),

  // DevBox Release Management
  releaseDevbox: t.procedure
    .input(
      z.object({
        devboxName: z.string().min(1, "DevBox name is required"),
        tag: z.string().min(1, "Release tag is required"),
        releaseDes: z.string().default(""),
      })
    )
    .output(DevboxReleaseResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const { devboxName, ...request } = input;
      return await releaseDevbox(devboxName, request, ctx);
    }),

  getDevboxReleases: t.procedure
    .input(z.string())
    .output(DevboxReleasesResponseSchema)
    .query(async ({ ctx, input }) => {
      return await getDevboxReleases(input, ctx);
    }),

  deleteDevboxRelease: t.procedure
    .input(z.string())
    .output(DevboxReleaseResponseSchema)
    .mutation(async ({ ctx, input }) => {
      return await deleteDevboxRelease(input, ctx);
    }),

  deployDevbox: t.procedure
    .input(
      z.object({
        devboxName: z.string().min(1, "DevBox name is required"),
        tag: z.string().min(1, "Devbox release version tag is required"),
      })
    )
    .output(DevboxDeployResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const { devboxName, tag } = input;
      return await deployDevbox(devboxName, tag, {}, ctx);
    }),

  // K8s Operations
  getDevbox: t.procedure
    .input(CustomResourceTargetSchema)
    .query(async ({ input, ctx }) => {
      return await getDevbox(ctx, input);
    }),

  listDevboxK8s: t.procedure.query(async ({ ctx }) => {
    return await listDevbox(ctx);
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

  getDevboxCombinedMonitorData: t.procedure
    .input(
      z.object({
        devboxName: z.string(),
        step: z.string().optional().default("2m"),
      })
    )
    .query(async ({ input, ctx }) => {
      const [cpuResult, memoryResult] = await Promise.allSettled([
        getDevboxMonitorData(ctx, "average_cpu", input.devboxName, input.step),
        getDevboxMonitorData(
          ctx,
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

      const result = transformCombinedMonitorData({
        cpu: cpuData,
        memory: memoryData,
      });

      // console.log("result", JSON.stringify(result, null, 2));

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

  // Environment Variable Operations
  // getDevboxEnvVars: t.procedure
  //   .input(
  //     z.object({
  //       sshConfig: SSHConfigSchema,
  //     })
  //   )
  //   .output(EnvVarListResponseSchema)
  //   .query(async ({ input }) => {
  //     return await getOrCreateEnvFile(input.sshConfig);
  //   }),

  upsertDevboxEnvVar: t.procedure
    .input(UpsertEnvVarRequestSchema)
    .mutation(async ({ input }) => {
      await upsertEnvVar(input.sshConfig, input.key, input.value);
      return { success: true };
    }),

  deleteDevboxEnvVar: t.procedure
    .input(DeleteEnvVarRequestSchema)
    .mutation(async ({ input }) => {
      await deleteEnvVar(input.sshConfig, input.key);
      return { success: true };
    }),
});

export type DevboxRouter = typeof devboxRouter;
