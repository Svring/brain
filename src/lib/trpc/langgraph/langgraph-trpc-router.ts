import { initTRPC } from "@trpc/server";
import { z } from "zod";
import {
	createThread,
	deleteThread,
	getThread,
	listThreads,
	patchThread,
	searchThreads,
	updateThreadState,
} from "@/lib/langgraph/langgraph-api/langgraph-api-service";
import type { LanggraphContext } from "./langgraph-trpc-context";

const t = initTRPC.context<LanggraphContext>().create();

export const langgraphRouter = t.router({
	// ===== QUERY PROCEDURES =====

	// Thread Information
	list: t.procedure.query(async ({ ctx }) => {
		return await listThreads(ctx.kubeconfig);
	}),

	get: t.procedure.input(z.string()).query(async ({ input, ctx }) => {
		return await getThread(input, ctx.kubeconfig);
	}),

	search: t.procedure.input(z.record(z.any())).query(async ({ input, ctx }) => {
		const response = await searchThreads(input, ctx.kubeconfig);
		// console.log("response", response);
		return response;
	}),

	// ===== MUTATION PROCEDURES =====

	// Thread Lifecycle Management
	create: t.procedure
		.input(
			z.object({
				metadata: z.record(z.any()).optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { metadata } = input;

			// Default supersteps
			const supersteps = [
				{
					updates: [
						{
							values: { kubeconfig: ctx.kubeconfig },
							as_node: "entry_node",
						},
					],
				},
			];

			return await createThread({
				metadata: metadata || {},
				supersteps,
				kubeconfig: ctx.kubeconfig,
			});
		}),

	// Update thread state
	updateState: t.procedure
		.input(
			z.object({
				threadId: z.string(),
				values: z.any(),
				asNode: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { threadId, values, asNode } = input;
			return await updateThreadState(threadId, values, asNode, ctx.kubeconfig);
		}),

	// Delete thread
	delete: t.procedure.input(z.string()).mutation(async ({ input, ctx }) => {
		return await deleteThread(input, ctx.kubeconfig);
	}),

	// Patch thread metadata
	patch: t.procedure
		.input(
			z.object({
				threadId: z.string(),
				metadata: z.record(z.any()),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { threadId, metadata } = input;
			return await patchThread(threadId, metadata, ctx.kubeconfig);
		}),
});

export type LanggraphRouter = typeof langgraphRouter;
