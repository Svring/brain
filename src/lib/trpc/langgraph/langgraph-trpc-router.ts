import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { LanggraphContext } from "./langgraph-trpc-context";
import {
  createThread,
  listThreads,
  getThread,
  searchThreads,
} from "@/lib/langgraph/langgraph-api/langgraph-api";

const t = initTRPC.context<LanggraphContext>().create();

export const langgraphRouter = t.router({
  // ===== QUERY PROCEDURES =====

  // Thread Information
  list: t.procedure.query(async () => {
    return await listThreads();
  }),

  get: t.procedure.input(z.string()).query(async ({ input }) => {
    return await getThread(input);
  }),

  search: t.procedure.input(z.record(z.any())).query(async ({ input }) => {
    const response = await searchThreads(input);
    // console.log("response", response);
    return response;
  }),

  // ===== MUTATION PROCEDURES =====

  // Thread Lifecycle Management
  create: t.procedure
    .input(
      z.object({
        kubeconfig: z.string(),
        projectName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { kubeconfig, projectName } = input;
      return await createThread({
        kubeconfig,
        projectName,
      });
    }),
});

export type LanggraphRouter = typeof langgraphRouter;
