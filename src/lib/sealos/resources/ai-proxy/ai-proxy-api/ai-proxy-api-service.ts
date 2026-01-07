"use server";

import axios, { type AxiosInstance } from "axios";
import https from "https";
import { createParallelAction } from "next-server-actions-parallel";
import { z } from "zod";
import type { AiProxyApiContext } from "../schemas/ai-proxy-api-context";

// ===== SCHEMAS =====

// Create Token Schemas
const AiProxyCreateTokenRequestSchema = z.object({
	name: z.string(),
});

const AiProxyCreateTokenResponseSchema = z.object({
	code: z.number(),
	data: z.any(),
	message: z.string(),
});

// Token List Schemas
const AiProxyTokenListResponseSchema = z.object({
	code: z.literal(200),
	data: z.object({
		tokens: z.array(
			z.object({
				key: z.string(),
				name: z.string(),
				group: z.string(),
				subnets: z.any().nullable(),
				models: z.any().nullable(),
				status: z.number(),
				id: z.number(),
				used_amount: z.number(),
				request_count: z.number(),
				quota: z.number(),
				period_quota: z.number(),
				period_type: z.string(),
				period_last_update_amount: z.number(),
				created_at: z.number(),
				period_last_update_time: z.number(),
				expired_at: z.number().optional(),
				accessed_at: z.number(),
			}),
		),
		total: z.number(),
	}),
});

// Free Usage Schemas
const AiProxyFreeUsageResponseSchema = z.object({
	total_limit: z.number(),
	used_today: z.number(),
	remaining_today: z.number(),
	next_reset_time: z.number(),
});

// Billing Quota Schemas
const AiProxyBillingQuotaResponseSchema = z.object({
	total: z.number(),
	remain: z.number(),
});

// Delete Token Schemas
const AiProxyDeleteTokenRequestSchema = z.object({
	id: z.number(),
});

const AiProxyDeleteTokenResponseSchema = z.object({
	code: z.literal(200),
	message: z.literal("Token deleted successfully"),
});

// Update Token Status Schemas
const AiProxyUpdateTokenStatusRequestSchema = z.object({
	id: z.number(),
	status: z.literal(1),
});

const AiProxyUpdateTokenStatusResponseSchema = z.object({
	code: z.number(),
	data: z.any().optional(),
	message: z.string(),
});

// ===== TYPES =====

export type AiProxyCreateTokenRequest = z.infer<
	typeof AiProxyCreateTokenRequestSchema
>;
export type AiProxyCreateTokenResponse = z.infer<
	typeof AiProxyCreateTokenResponseSchema
>;
export type AiProxyTokenListResponse = z.infer<
	typeof AiProxyTokenListResponseSchema
>;
export type AiProxyFreeUsageResponse = z.infer<
	typeof AiProxyFreeUsageResponseSchema
>;
export type AiProxyBillingQuotaResponse = z.infer<
	typeof AiProxyBillingQuotaResponseSchema
>;
export type AiProxyDeleteTokenRequest = z.infer<
	typeof AiProxyDeleteTokenRequestSchema
>;
export type AiProxyDeleteTokenResponse = z.infer<
	typeof AiProxyDeleteTokenResponseSchema
>;
export type AiProxyUpdateTokenStatusRequest = z.infer<
	typeof AiProxyUpdateTokenStatusRequestSchema
>;
export type AiProxyUpdateTokenStatusResponse = z.infer<
	typeof AiProxyUpdateTokenStatusResponseSchema
>;

// ===== API CLIENT CREATION =====

export async function createAiProxyApi(
	context: AiProxyApiContext,
): Promise<AxiosInstance> {
	const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";
	return axios.create({
		baseURL: `http://aiproxy-web.${context.baseUrl}/api`,
		headers: {
			"Content-Type": "application/json",
			...(context?.authorization
				? { Authorization: context.authorization }
				: {}),
		},
		httpsAgent: isDevelopment
			? new https.Agent({ rejectUnauthorized: false })
			: undefined,
	});
}

async function createAiProxyBillingApi(
	context: AiProxyApiContext & { apiToken?: string },
): Promise<AxiosInstance> {
	const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";
	const authToken = context.apiToken || context.authorization;

	return axios.create({
		baseURL: `http://aiproxy.${context.baseUrl}/v1`,
		headers: {
			"Content-Type": "application/json",
			...(authToken ? { Authorization: authToken } : {}),
		},
		httpsAgent: isDevelopment
			? new https.Agent({ rejectUnauthorized: false })
			: undefined,
	});
}

// ===== MUTATION OPERATIONS =====

// Token Management
export async function createAiProxyTokenService(
	request: any,
	context: AiProxyApiContext,
): Promise<AiProxyCreateTokenResponse> {
	try {
		const validatedRequest = AiProxyCreateTokenRequestSchema.parse(request);
		console.log("validatedRequest", validatedRequest);
		console.log("context", context);
		const api = await createAiProxyApi(context);
		const response = await api.post("/user/token", validatedRequest);

		console.log("response", response);

		// Check if the response indicates success
		if (response.data.code === 200) {
			return response.data;
		} else {
			// If the API returns a non-200 code but the request technically succeeded
			// (e.g., token already exists), we can still return success
			if (
				response.data.message?.includes("already exists") ||
				response.data.message?.includes("success")
			) {
				return {
					code: 200,
					data: response.data.data || {},
					message: response.data.message || "Token created successfully",
				};
			}

			// Otherwise, throw an error
			throw new Error(`API Error: ${response.data.message || "Unknown error"}`);
		}
	} catch (error) {
		console.error("Error creating AI Proxy Token:", JSON.stringify(error));
		throw error;
	}
}

export async function deleteAiProxyTokenService(
	request: any,
	context: AiProxyApiContext,
): Promise<AiProxyDeleteTokenResponse> {
	const validatedRequest = AiProxyDeleteTokenRequestSchema.parse(request);
	const api = await createAiProxyApi(context);
	const response = await api.delete(`/user/token/${validatedRequest.id}`);
	return AiProxyDeleteTokenResponseSchema.parse(response.data);
}

export async function updateAiProxyTokenStatusService(
	request: any,
	context: AiProxyApiContext,
): Promise<AiProxyUpdateTokenStatusResponse> {
	const validatedRequest = AiProxyUpdateTokenStatusRequestSchema.parse(request);
	const api = await createAiProxyApi(context);
	const response = await api.post(`/user/token/${validatedRequest.id}`, {
		status: validatedRequest.status,
	});
	return AiProxyUpdateTokenStatusResponseSchema.parse(response.data);
}

// ===== QUERY OPERATIONS =====

// Token Listing
export async function getAiProxyTokensService(
	context: AiProxyApiContext,
): Promise<AiProxyTokenListResponse["data"]> {
	const api = await createAiProxyApi(context);
	const response = await api.get("/user/token", {
		params: { page: 1, perPage: 10 },
	});
	return response.data.data;
}

// Free Usage Information
export async function getAiProxyFreeUsageService(
	context: AiProxyApiContext,
): Promise<AiProxyFreeUsageResponse> {
	const response = await fetch("/api/ai-proxy/free-usage", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			...(context?.authorization
				? { Authorization: context.authorization }
				: {}),
		},
	});

	if (!response.ok) {
		throw new Error(
			`Failed to fetch free usage: ${response.status} ${response.statusText}`,
		);
	}

	const data = await response.json();
	return AiProxyFreeUsageResponseSchema.parse(data);
}

export async function getAiProxyBillingQuotaService(
	context: AiProxyApiContext & { apiToken?: string },
): Promise<AiProxyBillingQuotaResponse> {
	const authToken = context.apiToken || context.authorization;

	if (!authToken) {
		throw new Error("API token is required for billing quota");
	}

	const api = await createAiProxyBillingApi(context);
	const response = await api.get("/dashboard/billing/quota");
	return AiProxyBillingQuotaResponseSchema.parse(response.data);
}
