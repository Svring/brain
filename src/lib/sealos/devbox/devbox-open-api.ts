"use server";

import axios from "axios";
import { createParallelAction } from "next-server-actions-parallel";
import type {
  AppFormConfig,
  CreateAppResponse,
  DeleteAppResponse,
  DevboxApiContext,
  DevboxCreateRequest,
  DevboxCreateResponse,
  DevboxDeleteResponse,
  DevboxDeployRequest,
  DevboxDeployResponse,
  DevboxGetResponse,
  DevboxLifecycleRequest,
  DevboxLifecycleResponse,
  DevboxListResponse,
  DevboxPortCreateRequest,
  DevboxPortCreateResponse,
  DevboxPortRemoveResponse,
  DevboxReleaseRequest,
  DevboxReleaseResponse,
  DevboxReleasesResponse,
  GetAppByNameResponse,
  GetAppPodsResponse,
  GetAppsResponse,
} from "./schemas";
import {
  AppFormConfigSchema,
  CreateAppRequestSchema,
  CreateAppResponseSchema,
  DeleteAppResponseSchema,
  DevboxCreateRequestSchema,
  DevboxCreateResponseSchema,
  DevboxDeleteResponseSchema,
  DevboxDeployRequestSchema,
  DevboxDeployResponseSchema,
  DevboxGetResponseSchema,
  DevboxLifecycleRequestSchema,
  DevboxLifecycleResponseSchema,
  DevboxListResponseSchema,
  DevboxPortCreateRequestSchema,
  DevboxPortCreateResponseSchema,
  DevboxPortRemoveResponseSchema,
  DevboxReleaseRequestSchema,
  DevboxReleaseResponseSchema,
  DevboxReleasesResponseSchema,
  GetAppByNameResponseSchema,
  GetAppPodsResponseSchema,
  GetAppsResponseSchema,
} from "./schemas";

// Helper to create axios instance per request
function createApi(context: DevboxApiContext) {
  return axios.create({
    baseURL: context.baseURL,
    headers: {
      "Content-Type": "application/json",
      ...(context.authorization
        ? { Authorization: context.authorization }
        : {}),
      ...(context.authorizationBearer
        ? { "Authorization-Bearer": context.authorizationBearer }
        : {}),
    },
  });
}

// DevBox Lifecycle Management
export const createDevbox = createParallelAction(
  async (
    request: DevboxCreateRequest,
    context: DevboxApiContext
  ): Promise<DevboxCreateResponse> => {
    const validatedRequest = DevboxCreateRequestSchema.parse(request);
    const api = createApi(context);
    const response = await api.post("/api/v1/DevBox/create", validatedRequest);
    return DevboxCreateResponseSchema.parse(response.data);
  }
);

export const manageDevboxLifecycle = createParallelAction(
  async (
    request: DevboxLifecycleRequest,
    context: DevboxApiContext
  ): Promise<DevboxLifecycleResponse> => {
    const validatedRequest = DevboxLifecycleRequestSchema.parse(request);
    const api = createApi(context);
    const response = await api.post(
      "/api/v1/DevBox/lifecycle",
      validatedRequest
    );
    return DevboxLifecycleResponseSchema.parse(response.data);
  }
);

export const deleteDevbox = createParallelAction(
  async (
    devboxName: string,
    context: DevboxApiContext
  ): Promise<DevboxDeleteResponse> => {
    const api = createApi(context);
    const response = await api.delete("/api/v1/DevBox/delete", {
      params: { devboxName },
    });
    return DevboxDeleteResponseSchema.parse(response.data);
  }
);

// DevBox Release Management
export const releaseDevbox = createParallelAction(
  async (
    request: DevboxReleaseRequest,
    context: DevboxApiContext
  ): Promise<DevboxReleaseResponse> => {
    const validatedRequest = DevboxReleaseRequestSchema.parse(request);
    const api = createApi(context);
    const response = await api.post("/api/v1/DevBox/release", validatedRequest);
    return DevboxReleaseResponseSchema.parse(response.data);
  }
);

export const getDevboxReleases = createParallelAction(
  async (
    devboxName: string,
    context: DevboxApiContext
  ): Promise<DevboxReleasesResponse> => {
    const api = createApi(context);
    const response = await api.get("/api/v1/DevBox/releases", {
      params: { devboxName },
    });
    return DevboxReleasesResponseSchema.parse(response.data);
  }
);

export const deployDevbox = createParallelAction(
  async (
    request: DevboxDeployRequest,
    context: DevboxApiContext
  ): Promise<DevboxDeployResponse> => {
    const validatedRequest = DevboxDeployRequestSchema.parse(request);
    const api = createApi(context);
    const response = await api.post("/api/deployDevbox", validatedRequest);
    return DevboxDeployResponseSchema.parse(response.data);
  }
);

// DevBox Query Operations
export const getDevboxByName = createParallelAction(
  async (
    devboxName: string,
    context: DevboxApiContext
  ): Promise<DevboxGetResponse> => {
    const api = createApi(context);
    const response = await api.get("/api/v1/DevBox/get", {
      params: { devboxName },
    });
    return DevboxGetResponseSchema.parse(response.data);
  }
);

export const getDevboxList = createParallelAction(
  async (context: DevboxApiContext): Promise<DevboxListResponse> => {
    const api = createApi(context);
    const response = await api.get("/api/v1/DevBox/list");
    return DevboxListResponseSchema.parse(response.data);
  }
);

// Port Management
export const createDevboxPort = createParallelAction(
  async (
    request: DevboxPortCreateRequest,
    context: DevboxApiContext
  ): Promise<DevboxPortCreateResponse> => {
    const validatedRequest = DevboxPortCreateRequestSchema.parse(request);
    const api = createApi(context);
    const response = await api.post(
      "/api/v1/DevBox/ports/create",
      validatedRequest
    );
    return DevboxPortCreateResponseSchema.parse(response.data);
  }
);

export const removeDevboxPort = createParallelAction(
  async (
    devboxName: string,
    port: number,
    context: DevboxApiContext
  ): Promise<DevboxPortRemoveResponse> => {
    const api = createApi(context);
    const response = await api.post("/api/v1/DevBox/ports/remove", {
      devboxName,
      port,
    });
    return DevboxPortRemoveResponseSchema.parse(response.data);
  }
);

// Application Management Functions
export const createApp = createParallelAction(
  async (
    appForm: AppFormConfig,
    context: DevboxApiContext
  ): Promise<CreateAppResponse> => {
    const validatedAppForm = AppFormConfigSchema.parse(appForm);
    const validatedRequest = CreateAppRequestSchema.parse({
      appForm: validatedAppForm,
    });
    const api = createApi(context);
    const response = await api.post("/api/v1/createApp", validatedRequest);
    return CreateAppResponseSchema.parse(response.data);
  }
);

export const getApps = createParallelAction(
  async (context: DevboxApiContext): Promise<GetAppsResponse> => {
    const api = createApi(context);
    const response = await api.get("/api/v1/getApps");
    return GetAppsResponseSchema.parse(response.data);
  }
);

export const getAppByName = createParallelAction(
  async (
    appName: string,
    context: DevboxApiContext
  ): Promise<GetAppByNameResponse> => {
    const api = createApi(context);
    const response = await api.get("/api/v1/getAppByAppName", {
      params: { appName },
    });
    return GetAppByNameResponseSchema.parse(response.data);
  }
);

export const deleteApp = createParallelAction(
  async (
    name: string,
    context: DevboxApiContext
  ): Promise<DeleteAppResponse> => {
    const api = createApi(context);
    const response = await api.delete("/api/v1/delAppByName", {
      params: { name },
    });
    return DeleteAppResponseSchema.parse(response.data);
  }
);

export const getAppPods = createParallelAction(
  async (
    name: string,
    context: DevboxApiContext
  ): Promise<GetAppPodsResponse> => {
    const api = createApi(context);
    const response = await api.get("/api/v1/getAppPodsByAppName", {
      params: { name },
    });
    return GetAppPodsResponseSchema.parse(response.data);
  }
);
