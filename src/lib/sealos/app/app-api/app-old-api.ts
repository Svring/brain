"use server";

import axios from "axios";
import { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import { createParallelAction } from "next-server-actions-parallel";
import {
  AppCreateRequest,
  AppCreateResponse,
  AppCreateRequestSchema,
  AppCreateResponseSchema,
} from "./app-old-api-schemas/req-res-create-schemas";
import {
  AppPauseRequest,
  AppPauseResponse,
  AppPauseRequestSchema,
  AppPauseResponseSchema,
} from "./app-old-api-schemas/req-res-pause-schemas";
import {
  AppStartRequest,
  AppStartResponse,
  AppStartRequestSchema,
  AppStartResponseSchema,
} from "./app-old-api-schemas/req-res-start-schemas";
import {
  AppDeleteRequest,
  AppDeleteResponse,
  AppDeleteRequestSchema,
  AppDeleteResponseSchema,
} from "./app-old-api-schemas/req-res-delete-schemas";
import {
  AppCheckReadyRequest,
  AppCheckReadyResponse,
  AppCheckReadyRequestSchema,
  AppCheckReadyResponseSchema,
} from "./app-old-api-schemas/req-res-check-ready-schemas";
import {
  QueryLogsRequest,
  QueryLogsResponse,
  QueryLogsRequestSchema,
  QueryLogsResponseSchema,
} from "./app-old-api-schemas/req-res-query-logs-schemas";
import { generateK8sManifests } from "./app-api-utils";
import https from "https";

function createAppApi(context: SealosApiContext) {
  const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";
  return axios.create({
    baseURL: `https://applaunchpad.${context.baseURL}/api`,
    headers: {
      "Content-Type": "application/json",
      ...(context.authorization
        ? { Authorization: context.authorization }
        : {}),
    },
    httpsAgent: isDevelopment
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined,
  });
}

export const createApp = createParallelAction(
  async (
    request: AppCreateRequest,
    context: SealosApiContext
  ): Promise<AppCreateResponse> => {
    const validatedRequest = AppCreateRequestSchema.parse(request);
    const manifests = await generateK8sManifests(validatedRequest);
    const api = createAppApi(context);
    const response = await api.post("/applyApp", manifests);
    return AppCreateResponseSchema.parse(response.data);
  }
);

export const pauseApp = createParallelAction(
  async (
    request: AppPauseRequest,
    context: SealosApiContext
  ): Promise<AppPauseResponse> => {
    const validatedRequest = AppPauseRequestSchema.parse(request);
    const api = createAppApi(context);
    const response = await api.get("/pauseApp", {
      params: { appName: validatedRequest.appName },
    });
    return AppPauseResponseSchema.parse(response.data);
  }
);

export const startApp = createParallelAction(
  async (
    request: AppStartRequest,
    context: SealosApiContext
  ): Promise<AppStartResponse> => {
    const validatedRequest = AppStartRequestSchema.parse(request);
    const api = createAppApi(context);
    const response = await api.get("/startApp", {
      params: { appName: validatedRequest.appName },
    });
    return AppStartResponseSchema.parse(response.data);
  }
);

export const deleteApp = createParallelAction(
  async (
    request: AppDeleteRequest,
    context: SealosApiContext
  ): Promise<AppDeleteResponse> => {
    const validatedRequest = AppDeleteRequestSchema.parse(request);
    const api = createAppApi(context);
    const response = await api.get("/delApp", {
      params: { name: validatedRequest.name },
    });
    return AppDeleteResponseSchema.parse(response.data);
  }
);

export const checkReadyApp = createParallelAction(
  async (
    request: AppCheckReadyRequest,
    context: SealosApiContext
  ): Promise<AppCheckReadyResponse> => {
    const validatedRequest = AppCheckReadyRequestSchema.parse(request);
    const api = createAppApi(context);
    const response = await api.get("/checkReady", {
      params: { appName: validatedRequest.appName },
    });
    return AppCheckReadyResponseSchema.parse(response.data);
  }
);

export const queryLogs = createParallelAction(
  async (
    request: QueryLogsRequest,
    context: SealosApiContext
  ): Promise<QueryLogsResponse> => {
    const validatedRequest = QueryLogsRequestSchema.parse(request);
    const api = createAppApi(context);
    const response = await api.post("/log/queryLogs", validatedRequest);
    return QueryLogsResponseSchema.parse(response.data);
  }
);
