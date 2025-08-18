"use server";

import axios from "axios";
import { createParallelAction } from "next-server-actions-parallel";
import https from "https";
import { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import { AppControlSuccessResponse } from "./launchpad-open-api-schemas/launchpad-control-schema";
import {
  LaunchpadCreateRequest,
  LaunchpadCreateSuccessResponse,
  LaunchpadGetResponse,
  LaunchpadPatchRequest,
  LaunchpadPatchResponse,
  LaunchpadDeleteResponse,
  LaunchpadGetPodsResponse,
  LaunchpadPodsMetricsRequest,
  LaunchpadPodsMetricsResponse,
} from "./launchpad-open-api-schemas/launchpad-create-schema";

function createLaunchpadApi(context: SealosApiContext) {
  const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";
  return axios.create({
    baseURL: isDevelopment
      ? `http://applaunchpad.${context.baseUrl}/api/v1`
      : `https://applaunchpad.${context.baseUrl}/api/v1`,
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

export const startLaunchpad = createParallelAction(
  async (context: SealosApiContext, name: string) => {
    const api = createLaunchpadApi(context);
    const response = await api.get<AppControlSuccessResponse>("/app/start", {
      params: { name },
    });
    return response.data;
  }
);

export const pauseLaunchpad = createParallelAction(
  async (context: SealosApiContext, name: string) => {
    const api = createLaunchpadApi(context);
    const response = await api.get<AppControlSuccessResponse>("/app/pause", {
      params: { name },
    });
    return response.data;
  }
);

// ============= NEW STANDARDIZED API ENDPOINTS =============

// POST /api/v1/launchpad - Create a new application
export const createApplication = createParallelAction(
  async (context: SealosApiContext, data: LaunchpadCreateRequest) => {
    const api = createLaunchpadApi(context);
    const response = await api.post<LaunchpadCreateSuccessResponse>(
      "/app",
      data
    );
    return response.data;
  }
);

// GET /api/v1/launchpad/{name} - Get application by name
export const getApplication = createParallelAction(
  async (context: SealosApiContext, name: string) => {
    const api = createLaunchpadApi(context);
    const response = await api.get<LaunchpadGetResponse>(`/app/${name}`);
    return response.data;
  }
);

// PATCH /api/v1/launchpad/{name} - Update application resources
export const updateApplication = createParallelAction(
  async (
    context: SealosApiContext,
    name: string,
    data: LaunchpadPatchRequest
  ) => {
    const api = createLaunchpadApi(context);
    const response = await api.patch<LaunchpadPatchResponse>(
      `/app/${name}`,
      data
    );
    return response.data;
  }
);

// DELETE /api/v1/launchpad/{name} - Delete application
export const deleteApplication = createParallelAction(
  async (context: SealosApiContext, name: string) => {
    const api = createLaunchpadApi(context);
    const response = await api.delete<LaunchpadDeleteResponse>(`/app/${name}`);
    return response.data;
  }
);

// GET /api/v1/launchpad/startApp - Start application
export const startApplication = createParallelAction(
  async (context: SealosApiContext, name: string) => {
    const api = createLaunchpadApi(context);
    const response = await api.get<AppControlSuccessResponse>("/app/startApp", {
      params: { name },
    });
    return response.data;
  }
);

// GET /api/v1/launchpad/pauseApp - Pause application
export const pauseApplication = createParallelAction(
  async (context: SealosApiContext, name: string) => {
    const api = createLaunchpadApi(context);
    const response = await api.get<AppControlSuccessResponse>("/app/pauseApp", {
      params: { name },
    });
    return response.data;
  }
);

// GET /api/v1/pod/getAppPodsByAppName - Get application pods
export const getApplicationPods = createParallelAction(
  async (context: SealosApiContext, name: string) => {
    const api = createLaunchpadApi(context);
    const response = await api.get<LaunchpadGetPodsResponse>(
      "/pod/getAppPodsByAppName",
      {
        params: { name },
      }
    );
    return response.data;
  }
);

// POST /api/v1/pod/getPodsMetrics - Get pods metrics
export const getPodsMetrics = createParallelAction(
  async (context: SealosApiContext, data: LaunchpadPodsMetricsRequest) => {
    const api = createLaunchpadApi(context);
    const response = await api.post<LaunchpadPodsMetricsResponse>(
      "/pod/getPodsMetrics",
      data
    );
    return response.data;
  }
);
