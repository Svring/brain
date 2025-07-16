"use server";

import axios, { AxiosInstance } from "axios";
import { createParallelAction } from "next-server-actions-parallel";
import {
  AiProxyCreateTokenRequestSchema,
  AiProxyCreateTokenResponseSchema,
  AiProxyCreateTokenRequest,
  AiProxyCreateTokenResponse,
} from "./schemas/req-res-schemas/req-res-create-schemas";
import {
  AiProxyTokenListResponseSchema,
  AiProxyTokenListResponse,
} from "./schemas/req-res-schemas/req-res-list-schemas";
import { AiProxyApiContext } from "./schemas/ai-proxy-api-context";
import https from "https";

export function createAiProxyApi(context: AiProxyApiContext): AxiosInstance {
  const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";
  return axios.create({
    baseURL: `https://aiproxy-web.${context.baseURL}/api`,
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
    context: AiProxyApiContext
  ): Promise<AiProxyCreateTokenResponse> => {
    const validatedRequest = AiProxyCreateTokenRequestSchema.parse(request);
    const api = createAiProxyApi(context);
    const response = await api.post("/token/create", validatedRequest);
    return AiProxyCreateTokenResponseSchema.parse(response.data);
  }
);

export const getAiProxyTokens = createParallelAction(
  async (context: AiProxyApiContext): Promise<AiProxyTokenListResponse> => {
    const api = createAiProxyApi(context);
    const response = await api.get("/user/token", {
      params: { page: 1, perPage: 10 },
    });
    return AiProxyTokenListResponseSchema.parse(response.data);
  }
);
