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
			}),
		)
		.mutation(async ({ input }) => {
			const { metadata } = input;

			// Default supersteps
			const supersteps = [
				{
					updates: [
						{
							values: {},
							as_node: "__input__",
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
				values: z.any(),
				asNode: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			const { threadId, values, asNode } = input;
			return await updateThreadState(threadId, values, asNode);
		}),

	// Delete thread
	delete: t.procedure.input(z.string()).mutation(async ({ input }) => {
		return await deleteThread(input);
	}),

	// Patch thread metadata
	patch: t.procedure
		.input(
			z.object({
				threadId: z.string(),
				metadata: z.record(z.any()),
			}),
		)
		.mutation(async ({ input }) => {
			const { threadId, metadata } = input;
			return await patchThread(threadId, metadata);
		}),
});

export type LanggraphRouter = typeof langgraphRouter;
