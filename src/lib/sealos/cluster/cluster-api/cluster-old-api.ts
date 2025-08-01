"use server";

import axios from "axios";
import { createParallelAction } from "next-server-actions-parallel";
import { ClusterApiContext } from "../schemas/cluster-api-context-schemas";
import {
  ClusterCreateRequest,
  ClusterCreateRequestSchema,
  ClusterCreateResponse,
  ClusterCreateResponseSchema,
} from "../schemas/req-res-schemas/req-res-create-schemas";
import {
  ClusterStartRequest,
  ClusterStartRequestSchema,
  ClusterStartResponse,
  ClusterStartResponseSchema,
} from "../schemas/req-res-schemas/req-res-start-schemas";
import {
  ClusterPauseRequest,
  ClusterPauseRequestSchema,
  ClusterPauseResponse,
  ClusterPauseResponseSchema,
} from "../schemas/req-res-schemas/req-res-pause-schemas";
import {
  ClusterDeleteRequest,
  ClusterDeleteRequestSchema,
  ClusterDeleteResponse,
  ClusterDeleteResponseSchema,
} from "../schemas/req-res-schemas/req-res-delete-schemas";
import {
  GetLogFilesRequest,
  GetLogFilesRequestSchema,
  GetLogFilesResponse,
  GetLogFilesResponseSchema,
} from "../schemas/req-res-schemas/req-res-get-log-files-schemas";
import {
  GetLogRequest,
  GetLogRequestSchema,
  GetLogResponse,
  GetLogResponseSchema,
} from "../schemas/req-res-schemas/req-res-get-log-schemas";
import https from "https";

// Helper to create axios instance per request
function createClusterApi(context: ClusterApiContext) {
  const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";
  return axios.create({
    baseURL: `https://dbprovider.${context.baseURL}/api`,
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

export const createCluster = createParallelAction(
  async (
    request: ClusterCreateRequest,
    context: ClusterApiContext
  ): Promise<ClusterCreateResponse> => {
    const validatedRequest = ClusterCreateRequestSchema.parse(request);
    const api = createClusterApi(context);
    const response = await api.post("/createDB", validatedRequest);
    return ClusterCreateResponseSchema.parse(response.data);
  }
);

export const startCluster = createParallelAction(
  async (
    request: ClusterStartRequest,
    context: ClusterApiContext
  ): Promise<ClusterStartResponse> => {
    const validatedRequest = ClusterStartRequestSchema.parse(request);
    const api = createClusterApi(context);
    const response = await api.post("/startDBByName", validatedRequest);
    return ClusterStartResponseSchema.parse(response.data);
  }
);

export const pauseCluster = createParallelAction(
  async (
    request: ClusterPauseRequest,
    context: ClusterApiContext
  ): Promise<ClusterPauseResponse> => {
    const validatedRequest = ClusterPauseRequestSchema.parse(request);
    const api = createClusterApi(context);
    const response = await api.post("/pauseDBByName", validatedRequest);
    return ClusterPauseResponseSchema.parse(response.data);
  }
);

export const deleteCluster = createParallelAction(
  async (
    request: ClusterDeleteRequest,
    context: ClusterApiContext
  ): Promise<ClusterDeleteResponse> => {
    const validatedRequest = ClusterDeleteRequestSchema.parse(request);
    const api = createClusterApi(context);
    const response = await api.get("/deleteDBByName", {
      params: { name: validatedRequest.name },
    });
    return ClusterDeleteResponseSchema.parse(response.data);
  }
);

export const getLogFiles = createParallelAction(
  async (
    request: GetLogFilesRequest,
    context: ClusterApiContext
  ): Promise<GetLogFilesResponse> => {
    const validatedRequest = GetLogFilesRequestSchema.parse(request);
    const api = createClusterApi(context);
    const response = await api.post("/logs/getFiles", validatedRequest);
    return GetLogFilesResponseSchema.parse(response.data);
  }
);

export const getLog = createParallelAction(
  async (
    request: GetLogRequest,
    context: ClusterApiContext
  ): Promise<GetLogResponse> => {
    const validatedRequest = GetLogRequestSchema.parse(request);
    const api = createClusterApi(context);
    const response = await api.post("/logs/get", validatedRequest);
    console.log("get log response", response.data);
    return GetLogResponseSchema.parse(response.data);
  }
);
