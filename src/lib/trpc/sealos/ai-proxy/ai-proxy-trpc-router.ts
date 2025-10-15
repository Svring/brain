import { initTRPC } from "@trpc/server";
import { z } from "zod";
import {
	createAiProxyTokenService,
	deleteAiProxyTokenService,
	getAiProxyBillingQuotaService,
	getAiProxyFreeUsageService,
	getAiProxyTokensService,
} from "@/lib/sealos/resources/ai-proxy/ai-proxy-api/ai-proxy-api-service";
import type { AiProxyContext } from "./ai-proxy-trpc-context";

// ===== SCHEMAS =====

// Create Token Schema
const AiProxyCreateTokenRequestSchema = z.object({
	name: z.string(),
});

// Delete Token Schema
const AiProxyDeleteTokenRequestSchema = z.object({
	id: z.number(),
});

const t = initTRPC.context<AiProxyContext>().create();

export const aiProxyRouter = t.router({
	// ===== QUERY PROCEDURES =====

	// Token Listing
	list: t.procedure.input(z.string()).query(async ({ ctx }) => {
		return await getAiProxyTokensService(ctx);
	}),

	// Free Usage Information
	freeUsage: t.procedure
		.output(
			z.object({
				total_limit: z.number(),
				used_today: z.number(),
				remaining_today: z.number(),
				next_reset_time: z.number(),
			}),
		)
		.query(async ({ ctx }) => {
			return await getAiProxyFreeUsageService(ctx);
		}),

	billingQuota: t.procedure
		.input(
			z.object({
				apiToken: z.string(),
			}),
		)
		.output(
			z.object({
				total: z.number(),
				remain: z.number(),
			}),
		)
		.query(async ({ ctx, input }) => {
			return await getAiProxyBillingQuotaService({
				...ctx,
				apiToken: input.apiToken,
			});
		}),

	// ===== MUTATION PROCEDURES =====

	// Token Management
	create: t.procedure
		.input(AiProxyCreateTokenRequestSchema)
		.mutation(async ({ input, ctx }) => {
			return await createAiProxyTokenService(input, ctx);
		}),

	delete: t.procedure
		.input(AiProxyDeleteTokenRequestSchema)
		.mutation(async ({ input, ctx }) => {
			return await deleteAiProxyTokenService(input, ctx);
		}),
});

export type AiProxyRouter = typeof aiProxyRouter;
