import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { LanggraphContext } from "./langgraph-trpc-context";
import {
  createThread,
  listThreads,
  getThread,
  searchThreads,
  updateThreadState,
  deleteThread,
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
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { metadata } = input;

      // Default supersteps
      const supersteps = [
        {
          updates: [
            {
              values: {},
              asNode: "__input__",
            },
          ],
        },
      ];

      return await createThread({
        metadata: metadata || {},
        supersteps,
      });
    }),

  // Update thread state
  updateState: t.procedure
    .input(
      z.object({
        threadId: z.string(),
        state: z.any(),
      })
    )
    .mutation(async ({ input }) => {
      const { threadId, state } = input;
      return await updateThreadState(threadId, state);
    }),

  // Delete thread
  delete: t.procedure.input(z.string()).mutation(async ({ input }) => {
    return await deleteThread(input);
  }),
});

export type LanggraphRouter = typeof langgraphRouter;
