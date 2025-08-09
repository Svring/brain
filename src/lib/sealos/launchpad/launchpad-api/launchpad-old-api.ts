"use server";

import axios from "axios";
import { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import { createParallelAction } from "next-server-actions-parallel";
import {
  LaunchpadCreateRequest,
  LaunchpadCreateResponse,
  LaunchpadCreateRequestSchema,
  LaunchpadCreateResponseSchema,
} from "./launchpad-old-api-schemas/req-res-create-schemas";
import {
  LaunchpadPauseRequest,
  LaunchpadPauseResponse,
  LaunchpadPauseRequestSchema,
  LaunchpadPauseResponseSchema,
} from "./launchpad-old-api-schemas/req-res-pause-schemas";
import {
  LaunchpadStartRequest,
  LaunchpadStartResponse,
  LaunchpadStartRequestSchema,
  LaunchpadStartResponseSchema,
} from "./launchpad-old-api-schemas/req-res-start-schemas";
import {
  LaunchpadDeleteRequest,
  LaunchpadDeleteResponse,
  LaunchpadDeleteRequestSchema,
  LaunchpadDeleteResponseSchema,
} from "./launchpad-old-api-schemas/req-res-delete-schemas";
import {
  LaunchpadCheckReadyRequest,
  LaunchpadCheckReadyResponse,
  LaunchpadCheckReadyRequestSchema,
  LaunchpadCheckReadyResponseSchema,
} from "./launchpad-old-api-schemas/req-res-check-ready-schemas";
import {
  QueryLogsRequest,
  QueryLogsResponse,
  QueryLogsRequestSchema,
  QueryLogsResponseSchema,
} from "./launchpad-old-api-schemas/req-res-query-logs-schemas";
import { generateK8sManifests } from "./launchpad-api-utils";
import https from "https";

function createLaunchpadApi(context: SealosApiContext) {
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

export const createLaunchpad = createParallelAction(
  async (
    request: LaunchpadCreateRequest,
    context: SealosApiContext
  ): Promise<LaunchpadCreateResponse> => {
    const validatedRequest = LaunchpadCreateRequestSchema.parse(request);
    const manifests = await generateK8sManifests(validatedRequest);
    const api = createLaunchpadApi(context);
    const response = await api.post("/applyApp", manifests);
    return LaunchpadCreateResponseSchema.parse(response.data);
  }
);

export const pauseLaunchpad = createParallelAction(
  async (
    request: LaunchpadPauseRequest,
    context: SealosApiContext
  ): Promise<LaunchpadPauseResponse> => {
    const validatedRequest = LaunchpadPauseRequestSchema.parse(request);
    const api = createLaunchpadApi(context);
    const response = await api.get("/pauseApp", {
      params: { name: validatedRequest.name },
    });
    return LaunchpadPauseResponseSchema.parse(response.data);
  }
);

export const startLaunchpad = createParallelAction(
  async (
    request: LaunchpadStartRequest,
    context: SealosApiContext
  ): Promise<LaunchpadStartResponse> => {
    const validatedRequest = LaunchpadStartRequestSchema.parse(request);
    const api = createLaunchpadApi(context);
    const response = await api.get("/startApp", {
      params: { name: validatedRequest.name },
    });
    return LaunchpadStartResponseSchema.parse(response.data);
  }
);

export const deleteLaunchpad = createParallelAction(
  async (
    request: LaunchpadDeleteRequest,
    context: SealosApiContext
  ): Promise<LaunchpadDeleteResponse> => {
    const validatedRequest = LaunchpadDeleteRequestSchema.parse(request);
    const api = createLaunchpadApi(context);
    const response = await api.get("/delApp", {
      params: { name: validatedRequest.name },
    });
    return LaunchpadDeleteResponseSchema.parse(response.data);
  }
);

export const checkReadyLaunchpad = createParallelAction(
  async (
    request: LaunchpadCheckReadyRequest,
    context: SealosApiContext
  ): Promise<LaunchpadCheckReadyResponse> => {
    const validatedRequest = LaunchpadCheckReadyRequestSchema.parse(request);
    const api = createLaunchpadApi(context);
    const response = await api.get("/checkReady", {
      params: { name: validatedRequest.name },
    });
    return LaunchpadCheckReadyResponseSchema.parse(response.data);
  }
);

export const getLaunchpadLogs = createParallelAction(
  async (
    request: QueryLogsRequest,
    context: SealosApiContext
  ): Promise<QueryLogsResponse> => {
    const validatedRequest = QueryLogsRequestSchema.parse(request);
    const api = createLaunchpadApi(context);
    const response = await api.post("/log/queryLogs", validatedRequest);
    return QueryLogsResponseSchema.parse(response.data);
  }
);
