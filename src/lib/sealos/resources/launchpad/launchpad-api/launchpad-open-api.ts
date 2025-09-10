"use server";

import axios from "axios";
import { createParallelAction } from "next-server-actions-parallel";
import https from "https";
import { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import { AppControlSuccessResponse } from "./launchpad-open-api-schemas/launchpad-control-schema";
import {
  LaunchpadCreateSuccessResponse,
  LaunchpadGetResponse,
  LaunchpadPatchRequest,
  LaunchpadPatchResponse,
  LaunchpadDeleteResponse,
  LaunchpadGetPodsResponse,
  LaunchpadPodsMetricsRequest,
  LaunchpadPodsMetricsResponse,
  LaunchpadConfigMapUpdateRequest,
  LaunchpadPortsCreateRequest,
  LaunchpadPortsUpdateRequest,
  LaunchpadPortsDeleteRequest,
  LaunchpadStorageUpdateRequest,
} from "./launchpad-open-api-schemas/launchpad-create-schema";
import type { LaunchpadCreateFormData } from "@/schemas/forms/launchpad/launchpad-create-form-schema";
import type { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";

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

// ============= APPLICATION LIFECYCLE MANAGEMENT =============

// POST /api/v1/app - Create a new application
export const createApplication = createParallelAction(
  async (context: SealosApiContext, data: LaunchpadCreateFormData) => {
    const api = createLaunchpadApi(context);
    const response = await api.post<LaunchpadCreateSuccessResponse>(
      "/app",
      data
    );
    return response.data;
  }
);

// GET /api/v1/app/{name} - Get application by name
export const getApplication = createParallelAction(
  async (context: SealosApiContext, name: string) => {
    const api = createLaunchpadApi(context);
    const response = await api.get<LaunchpadGetResponse>(`/app/${name}`);
    return response.data;
  }
);

// PATCH /api/v1/app/{name} - Update application resources
export const updateApplication = createParallelAction(
  async (
    context: SealosApiContext,
    name: string,
    data: LaunchpadUpdateFormData
  ) => {
    const api = createLaunchpadApi(context);
    const response = await api.patch(`/app/${name}`, data);
    return response.data;
  }
);

// DELETE /api/v1/app/{name} - Delete application
export const deleteApplication = createParallelAction(
  async (context: SealosApiContext, name: string) => {
    const api = createLaunchpadApi(context);
    const response = await api.delete<LaunchpadDeleteResponse>(`/app/${name}`);
    return response.data;
  }
);

// ============= APPLICATION CONTROL ENDPOINTS =============

// POST /api/v1/app/{name}/start - Start application
export const startApplication = createParallelAction(
  async (context: SealosApiContext, name: string) => {
    const api = createLaunchpadApi(context);
    const response = await api.post<AppControlSuccessResponse>(
      `/app/${name}/start`
    );
    return response.data;
  }
);

// POST /api/v1/app/{name}/pause - Pause application
export const pauseApplication = createParallelAction(
  async (context: SealosApiContext, name: string) => {
    const api = createLaunchpadApi(context);
    const response = await api.post<AppControlSuccessResponse>(
      `/app/${name}/pause`
    );
    return response.data;
  }
);

// ============= CONFIGMAP MANAGEMENT =============

// PATCH /api/v1/app/{name}/configmap - Update application ConfigMap
export const updateApplicationConfigMap = createParallelAction(
  async (
    context: SealosApiContext,
    name: string,
    data: LaunchpadConfigMapUpdateRequest
  ) => {
    const api = createLaunchpadApi(context);
    const response = await api.patch(`/app/${name}/configmap`, data);
    return response.data;
  }
);

// ============= PORTS MANAGEMENT =============

// POST /api/v1/app/{name}/ports - Create new application ports
export const createApplicationPorts = createParallelAction(
  async (
    context: SealosApiContext,
    name: string,
    data: LaunchpadPortsCreateRequest
  ) => {
    const api = createLaunchpadApi(context);
    const response = await api.post(`/app/${name}/ports`, data);
    return response.data;
  }
);

// PATCH /api/v1/app/{name}/ports - Update existing application ports
export const updateApplicationPorts = createParallelAction(
  async (
    context: SealosApiContext,
    name: string,
    data: LaunchpadPortsUpdateRequest
  ) => {
    const api = createLaunchpadApi(context);
    const response = await api.patch(`/app/${name}/ports`, data);
    return response.data;
  }
);

// DELETE /api/v1/app/{name}/ports - Delete application ports
export const deleteApplicationPorts = createParallelAction(
  async (
    context: SealosApiContext,
    name: string,
    data: LaunchpadPortsDeleteRequest
  ) => {
    const api = createLaunchpadApi(context);
    const response = await api.delete(`/app/${name}/ports`, { data });
    return response.data;
  }
);

// ============= STORAGE MANAGEMENT =============

// PATCH /api/v1/app/{name}/storage - Update application storage
export const updateApplicationStorage = createParallelAction(
  async (
    context: SealosApiContext,
    name: string,
    data: LaunchpadStorageUpdateRequest
  ) => {
    const api = createLaunchpadApi(context);
    const response = await api.patch(`/app/${name}/storage`, data);
    return response.data;
  }
);

// ============= PODS AND METRICS =============

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

// ============= LEGACY ENDPOINTS (DEPRECATED) =============

// @deprecated Use startApplication instead
export const startLaunchpad = createParallelAction(
  async (context: SealosApiContext, name: string) => {
    const api = createLaunchpadApi(context);
    const response = await api.get<AppControlSuccessResponse>("/app/start", {
      params: { name },
    });
    return response.data;
  }
);

// @deprecated Use pauseApplication instead
export const pauseLaunchpad = createParallelAction(
  async (context: SealosApiContext, name: string) => {
    const api = createLaunchpadApi(context);
    const response = await api.get<AppControlSuccessResponse>("/app/pause", {
      params: { name },
    });
    return response.data;
  }
);
