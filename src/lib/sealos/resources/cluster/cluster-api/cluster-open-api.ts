"use server";

import axios from "axios";
import { createParallelAction } from "next-server-actions-parallel";
import type {
  ClusterApiContext,
  CreateClusterRequest,
  CreateClusterResponse,
  GetClusterResponse,
  UpdateClusterRequest,
  UpdateClusterResponse,
  DeleteClusterResponse,
  StartClusterResponse,
  PauseClusterResponse,
  GetLogsDataResponse,
  GetLogsFilesResponse,
  LogClusterType,
  LogType,
  ClusterForm,
} from "./cluster-open-api-schemas";
import {
  CreateClusterRequestSchema,
  CreateClusterResponseSchema,
  GetClusterResponseSchema,
  UpdateClusterRequestSchema,
  UpdateClusterResponseSchema,
  DeleteClusterResponseSchema,
  StartClusterResponseSchema,
  PauseClusterResponseSchema,
  GetLogsDataResponseSchema,
  GetLogsFilesResponseSchema,
} from "./cluster-open-api-schemas";
import https from "https";

// Helper to create axios instance per request
function createClusterApi(context: ClusterApiContext) {
  const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";
  return axios.create({
    baseURL: `https://cluster.${context.baseURL}/api/v1`,
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

// Cluster Management Functions
export const createCluster = createParallelAction(
  async (
    request: CreateClusterRequest,
    context: ClusterApiContext
  ): Promise<CreateClusterResponse> => {
    const validatedRequest = CreateClusterRequestSchema.parse(request);
    const api = createClusterApi(context);
    const response = await api.post("/database", validatedRequest);
    return CreateClusterResponseSchema.parse(response.data);
  }
);

export const getCluster = createParallelAction(
  async (
    clusterName: string,
    context: ClusterApiContext
  ): Promise<GetClusterResponse> => {
    const api = createClusterApi(context);
    const response = await api.get(`/database/${clusterName}`);
    return GetClusterResponseSchema.parse(response.data);
  }
);

export const updateCluster = createParallelAction(
  async (
    clusterName: string,
    request: UpdateClusterRequest,
    context: ClusterApiContext
  ): Promise<UpdateClusterResponse> => {
    const validatedRequest = UpdateClusterRequestSchema.parse(request);
    const api = createClusterApi(context);
    const response = await api.patch(
      `/database/${clusterName}`,
      validatedRequest
    );
    return UpdateClusterResponseSchema.parse(response.data);
  }
);

export const deleteCluster = createParallelAction(
  async (
    clusterName: string,
    context: ClusterApiContext
  ): Promise<DeleteClusterResponse> => {
    const api = createClusterApi(context);
    const response = await api.delete(`/database/${clusterName}`);
    return DeleteClusterResponseSchema.parse(response.data);
  }
);

export const startCluster = createParallelAction(
  async (
    clusterName: string,
    context: ClusterApiContext
  ): Promise<StartClusterResponse> => {
    const api = createClusterApi(context);
    const response = await api.post(`/database/${clusterName}/start`);
    return StartClusterResponseSchema.parse(response.data);
  }
);

export const pauseCluster = createParallelAction(
  async (
    clusterName: string,
    context: ClusterApiContext
  ): Promise<PauseClusterResponse> => {
    const api = createClusterApi(context);
    const response = await api.post(`/database/${clusterName}/pause`);
    return PauseClusterResponseSchema.parse(response.data);
  }
);

// Log Management Functions
export const getLogsData = createParallelAction(
  async (
    params: {
      podName: string;
      dbType: LogClusterType;
      logType: LogType;
      logPath: string;
      page?: number;
      pageSize?: number;
    },
    context: ClusterApiContext
  ): Promise<GetLogsDataResponse> => {
    const api = createClusterApi(context);
    const response = await api.get("/logs/data", { params });
    return GetLogsDataResponseSchema.parse(response.data);
  }
);

export const getLogsFiles = createParallelAction(
  async (
    params: {
      podName: string;
      dbType: LogClusterType;
      logType: LogType;
    },
    context: ClusterApiContext
  ): Promise<GetLogsFilesResponse> => {
    const api = createClusterApi(context);
    const response = await api.get("/logs/files", { params });
    return GetLogsFilesResponseSchema.parse(response.data);
  }
);

// TODO: Add more cluster management functions as needed:
// - listClusters
// - stopCluster
// - getClusterBackups
// - createClusterBackup
// - deleteClusterBackup

// Example of additional functions that could be implemented:
/*
export const listClusters = createParallelAction(
  async (context: ClusterApiContext): Promise<ListClustersResponse> => {
    const api = createClusterApi(context);
    const response = await api.get("/databases");
    return ListClustersResponseSchema.parse(response.data);
  }
);

export const stopCluster = createParallelAction(
  async (
    clusterName: string,
    context: ClusterApiContext
  ): Promise<StopClusterResponse> => {
    const api = createClusterApi(context);
    const response = await api.post(`/database/${clusterName}/stop`);
    return StopClusterResponseSchema.parse(response.data);
  }
);

export const getClusterBackups = createParallelAction(
  async (
    clusterName: string,
    context: ClusterApiContext
  ): Promise<GetClusterBackupsResponse> => {
    const api = createClusterApi(context);
    const response = await api.get(`/database/${clusterName}/backups`);
    return GetClusterBackupsResponseSchema.parse(response.data);
  }
);

export const createClusterBackup = createParallelAction(
  async (
    clusterName: string,
    context: ClusterApiContext
  ): Promise<CreateClusterBackupResponse> => {
    const api = createClusterApi(context);
    const response = await api.post(`/database/${clusterName}/backup`);
    return CreateClusterBackupResponseSchema.parse(response.data);
  }
);

export const deleteClusterBackup = createParallelAction(
  async (
    clusterName: string,
    backupName: string,
    context: ClusterApiContext
  ): Promise<DeleteClusterBackupResponse> => {
    const api = createClusterApi(context);
    const response = await api.delete(`/database/${clusterName}/backup/${backupName}`);
    return DeleteClusterBackupResponseSchema.parse(response.data);
  }
);
*/
