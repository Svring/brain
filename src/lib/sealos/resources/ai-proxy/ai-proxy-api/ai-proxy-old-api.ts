"use server";

import axios, { type AxiosInstance } from "axios";
import https from "https";
import { createParallelAction } from "next-server-actions-parallel";
import type { AiProxyApiContext } from "../schemas/ai-proxy-api-context";
import {
	type AiProxyCreateTokenRequest,
	AiProxyCreateTokenRequestSchema,
	type AiProxyCreateTokenResponse,
	AiProxyCreateTokenResponseSchema,
} from "../schemas/req-res-schemas/req-res-create-schemas";
import {
	type AiProxyDeleteTokenRequest,
	AiProxyDeleteTokenRequestSchema,
	type AiProxyDeleteTokenResponse,
	AiProxyDeleteTokenResponseSchema,
} from "../schemas/req-res-schemas/req-res-delete-schemas";
import {
	type AiProxyTokenListResponse,
	AiProxyTokenListResponseSchema,
} from "../schemas/req-res-schemas/req-res-list-schemas";

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

export const createAiProxyToken = createParallelAction(
	async (
		request: AiProxyCreateTokenRequest,
		context: AiProxyApiContext,
	): Promise<AiProxyCreateTokenResponse> => {
		try {
			const validatedRequest = AiProxyCreateTokenRequestSchema.parse(request);
			// console.log("AI Proxy Token Request:", JSON.stringify(validatedRequest));
			const api = await createAiProxyApi(context);
			const response = await api.post("/user/token", validatedRequest);
			// console.log("AI Proxy Token Response:", JSON.stringify(response.data));
			return AiProxyCreateTokenResponseSchema.parse(response.data);
		} catch (error) {
			console.error("Error creating AI Proxy Token:", JSON.stringify(error));
			throw error;
		}
	},
);

export const getAiProxyTokens = createParallelAction(
	async (
		context: AiProxyApiContext,
	): Promise<AiProxyTokenListResponse["data"]> => {
		try {
			const api = await createAiProxyApi(context);
			const response = await api.get("/user/token", {
				params: { page: 1, perPage: 10 },
			});
			return response.data.data;
		} catch (error) {
			console.error("Error fetching AI Proxy Tokens:", JSON.stringify(error));
			throw error;
		}
	},
);

export const deleteAiProxyToken = createParallelAction(
	async (
		request: AiProxyDeleteTokenRequest,
		context: AiProxyApiContext,
	): Promise<AiProxyDeleteTokenResponse> => {
		const validatedRequest = AiProxyDeleteTokenRequestSchema.parse(request);
		const api = await createAiProxyApi(context);
		const response = await api.delete(`/user/token/${validatedRequest.id}`);
		return AiProxyDeleteTokenResponseSchema.parse(response.data);
	},
);
