import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { LaunchpadContext } from "./launchpad-context";
import { getLaunchpadMonitorData } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-api-service";
import { SealosApiContextSchema } from "@/lib/sealos/sealos-api-context-schema";

const t = initTRPC.context<LaunchpadContext>().create();

export const launchpadRouter = t.router({
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
});

export type LaunchpadRouter = typeof launchpadRouter;
