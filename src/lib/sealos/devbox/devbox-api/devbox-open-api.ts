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
} from "../schemas";
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
} from "../schemas";
import https from "https";

// Helper to create axios instance per request
function createDevboxApi(context: DevboxApiContext) {
  const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";
  return axios.create({
    baseURL: `https://devbox.${context.baseURL}/api/v1/DevBox`,
    headers: {
      "Content-Type": "application/json",
      ...(context.authorization
        ? { Authorization: context.authorization }
        : {}),
      ...(context.authorizationBearer
        ? { "Authorization-Bearer": context.authorizationBearer }
        : {}),
    },
    httpsAgent: isDevelopment
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined,
  });
}

// Helper to create axios instance for Application APIs
function createAppApi(context: DevboxApiContext) {
  return axios.create({
    baseURL: `https://devbox.${context.baseURL}/api/v1`,
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
    const api = createDevboxApi(context);
    const response = await api.post("/create", validatedRequest);
    return DevboxCreateResponseSchema.parse(response.data);
  }
);

export const manageDevboxLifecycle = createParallelAction(
  async (
    request: DevboxLifecycleRequest,
    context: DevboxApiContext
  ): Promise<DevboxLifecycleResponse> => {
    const validatedRequest = DevboxLifecycleRequestSchema.parse(request);
    const api = createDevboxApi(context);
    const response = await api.post("/lifecycle", validatedRequest);
    return DevboxLifecycleResponseSchema.parse(response.data);
  }
);

export const deleteDevbox = createParallelAction(
  async (
    devboxName: string,
    context: DevboxApiContext
  ): Promise<DevboxDeleteResponse> => {
    const api = createDevboxApi(context);
    const response = await api.delete("/delete", {
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
    const api = createDevboxApi(context);
    const response = await api.post("/release", validatedRequest);
    return DevboxReleaseResponseSchema.parse(response.data);
  }
);

export const getDevboxReleases = createParallelAction(
  async (
    devboxName: string,
    context: DevboxApiContext
  ): Promise<DevboxReleasesResponse> => {
    const api = createDevboxApi(context);
    const response = await api.get("/releases", {
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
    const api = createDevboxApi(context);
    const response = await api.post("/deployDevbox", validatedRequest);
    return DevboxDeployResponseSchema.parse(response.data);
  }
);

// DevBox Query Operations
export const getDevboxByName = createParallelAction(
  async (
    devboxName: string,
    context: DevboxApiContext
  ): Promise<DevboxGetResponse> => {
    const api = createDevboxApi(context);
    const response = await api.get("/get", {
      params: { devboxName },
    });
    return DevboxGetResponseSchema.parse(response.data);
  }
);

export const getDevboxList = createParallelAction(
  async (context: DevboxApiContext): Promise<DevboxListResponse> => {
    const api = createDevboxApi(context);
    const response = await api.get("/list");
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
    const api = createDevboxApi(context);
    const response = await api.post("/ports/create", validatedRequest);
    return DevboxPortCreateResponseSchema.parse(response.data);
  }
);

export const removeDevboxPort = createParallelAction(
  async (
    devboxName: string,
    port: number,
    context: DevboxApiContext
  ): Promise<DevboxPortRemoveResponse> => {
    const api = createDevboxApi(context);
    const response = await api.post("/ports/remove", {
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
    const api = createAppApi(context);
    const response = await api.post("/createApp", validatedRequest);
    return CreateAppResponseSchema.parse(response.data);
  }
);

export const getApps = createParallelAction(
  async (context: DevboxApiContext): Promise<GetAppsResponse> => {
    const api = createAppApi(context);
    const response = await api.get("/getApps");
    return GetAppsResponseSchema.parse(response.data);
  }
);

export const getAppByName = createParallelAction(
  async (
    appName: string,
    context: DevboxApiContext
  ): Promise<GetAppByNameResponse> => {
    const api = createAppApi(context);
    const response = await api.get("/getAppByAppName", {
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
    const api = createAppApi(context);
    const response = await api.delete("/delAppByName", {
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
    const api = createAppApi(context);
    const response = await api.get("/getAppPodsByAppName", {
      params: { name },
    });
    return GetAppPodsResponseSchema.parse(response.data);
  }
);
