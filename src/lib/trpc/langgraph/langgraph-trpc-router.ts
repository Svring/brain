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
        kubeconfig: z.string(),
        projectName: z.string().optional(),
        resourceTarget: z.any().optional(),
        metadata: z.record(z.any()).optional(),
        supersteps: z
          .array(
            z.object({
              updates: z.array(
                z.object({
                  values: z.record(z.any()),
                  as_node: z.string(),
                })
              ),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { kubeconfig, projectName, resourceTarget, metadata, supersteps } =
        input;

      // Build the metadata object with full names
      const threadMetadata: Record<string, any> = {
        kubeconfig: kubeconfig,
        projectName: projectName,
        resourceTarget: resourceTarget,
        ...metadata, // Merge any additional metadata
      };

      return await createThread({
        metadata: threadMetadata,
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
