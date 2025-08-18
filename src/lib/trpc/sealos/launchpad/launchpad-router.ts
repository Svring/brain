import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { LaunchpadContext } from "./launchpad-context";
import { getLaunchpadMonitorData, checkLaunchpadReady } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-api-service";
import { SealosApiContextSchema } from "@/lib/sealos/sealos-api-context-schema";
import { transformCombinedMonitorData } from "@/lib/sealos/sealos-utils";
import { LaunchpadCheckReadyRequestSchema } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-old-api-schemas/req-res-check-ready-schemas";

const t = initTRPC.context<LaunchpadContext>().create();

export const launchpadRouter = t.router({
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
});

export type LaunchpadRouter = typeof launchpadRouter;
