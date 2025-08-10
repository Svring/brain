"use server";

import axios, { AxiosInstance } from "axios";
import { createParallelAction } from "next-server-actions-parallel";
import {
  AiProxyCreateTokenRequestSchema,
  AiProxyCreateTokenResponseSchema,
  AiProxyCreateTokenRequest,
  AiProxyCreateTokenResponse,
} from "../schemas/req-res-schemas/req-res-create-schemas";
import {
  AiProxyTokenListResponseSchema,
  AiProxyTokenListResponse,
} from "../schemas/req-res-schemas/req-res-list-schemas";
import { AiProxyApiContext } from "../schemas/ai-proxy-api-context";
import https from "https";
import {
  AiProxyDeleteTokenRequestSchema,
  AiProxyDeleteTokenResponseSchema,
  AiProxyDeleteTokenRequest,
  AiProxyDeleteTokenResponse,
} from "../schemas/req-res-schemas/req-res-delete-schemas";

export async function createAiProxyApi(
  context: AiProxyApiContext
): Promise<AxiosInstance> {
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
    const api = await createAiProxyApi(context);
    const response = await api.post("/user/token", validatedRequest);
    return AiProxyCreateTokenResponseSchema.parse(response.data);
  }
);

export const getAiProxyTokens = createParallelAction(
  async (context: AiProxyApiContext): Promise<AiProxyTokenListResponse> => {
    const api = await createAiProxyApi(context);
    const response = await api.get("/user/token", {
      params: { page: 1, perPage: 10 },
    });
    return AiProxyTokenListResponseSchema.parse(response.data);
  }
);

export const deleteAiProxyToken = createParallelAction(
  async (
    request: AiProxyDeleteTokenRequest,
    context: AiProxyApiContext
  ): Promise<AiProxyDeleteTokenResponse> => {
    const validatedRequest = AiProxyDeleteTokenRequestSchema.parse(request);
    const api = await createAiProxyApi(context);
    const response = await api.delete(`/user/token/${validatedRequest.id}`);
    return AiProxyDeleteTokenResponseSchema.parse(response.data);
  }
);
