import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { LanggraphContext } from "./langgraph-context";
import {
  createThread,
  listThreads,
  getThread,
  searchThreads,
} from "@/lib/langgraph/langgraph-api/langgraph-api";

const t = initTRPC.context<LanggraphContext>().create();

export const langgraphRouter = t.router({
  // Thread Management
  createThread: t.procedure
    .input(
      z.object({
        kubeconfig: z.string(),
        projectName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await createThread({
        kubeconfig: input.kubeconfig,
        projectName: input.projectName,
      });
    }),

  listThreads: t.procedure.query(async () => {
    return await listThreads();
  }),

  getThread: t.procedure.input(z.string()).query(async ({ input }) => {
    return await getThread(input);
  }),

  searchThreads: t.procedure
    .input(z.record(z.any()))
    .query(async ({ input }) => {
      return await searchThreads(input);
    }),
});

export type LanggraphRouter = typeof langgraphRouter;
