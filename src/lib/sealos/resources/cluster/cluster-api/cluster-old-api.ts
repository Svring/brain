"use server";

import { createParallelAction } from "next-server-actions-parallel";
import { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import { createSealosApi } from "@/lib/sealos/sealos-utils";
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
import {
  ClusterBackupListRequest,
  ClusterBackupListRequestSchema,
  ClusterBackupListResponse,
  ClusterBackupListResponseSchema,
} from "../schemas/req-res-schemas/req-res-get-backup-list-schemas";
import {
  ClusterBackupDeleteRequest,
  ClusterBackupDeleteRequestSchema,
  ClusterBackupDeleteResponse,
  ClusterBackupDeleteResponseSchema,
} from "../schemas/req-res-schemas/req-res-delete-backup-schemas";

// Helper to create axios instance per request using universal utility
function createClusterApi(context: SealosApiContext) {
  return createSealosApi(context, "cluster");
}

export const createCluster = createParallelAction(
  async (
    request: ClusterCreateRequest,
    context: SealosApiContext
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
    context: SealosApiContext
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
    context: SealosApiContext
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
    context: SealosApiContext
  ): Promise<ClusterDeleteResponse> => {
    try {
      const validatedRequest = ClusterDeleteRequestSchema.parse(request);
      const api = createClusterApi(context);
      const response = await api.get("/delDBByName", {
        params: { name: validatedRequest.name },
      });
      // console.log("delete cluster response", response);
      return ClusterDeleteResponseSchema.parse(response.data);
    } catch (error) {
      console.error("Failed to delete cluster:", JSON.stringify(error));
      throw error;
    }
  }
);

export const getLogFiles = createParallelAction(
  async (
    request: GetLogFilesRequest,
    context: SealosApiContext
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
    context: SealosApiContext
  ): Promise<GetLogResponse> => {
    const validatedRequest = GetLogRequestSchema.parse(request);
    const api = createClusterApi(context);
    const response = await api.post("/logs/get", validatedRequest);
    // console.log("get log response", response.data);
    return GetLogResponseSchema.parse(response.data);
  }
);

export const getBackupList = createParallelAction(
  async (
    request: ClusterBackupListRequest,
    context: SealosApiContext
  ): Promise<ClusterBackupListResponse> => {
    const validatedRequest = ClusterBackupListRequestSchema.parse(request);
    const api = createClusterApi(context);
    const response = await api.get("/backup/getBackupList", {
      params: { dbName: validatedRequest.dbName },
    });
    return ClusterBackupListResponseSchema.parse(response.data);
  }
);

export const deleteBackup = createParallelAction(
  async (
    request: ClusterBackupDeleteRequest,
    context: SealosApiContext
  ): Promise<ClusterBackupDeleteResponse> => {
    const validatedRequest = ClusterBackupDeleteRequestSchema.parse(request);
    const api = createClusterApi(context);
    const response = await api.get("/backup/delBackup", {
      params: { backupName: validatedRequest.backupName },
    });
    return ClusterBackupDeleteResponseSchema.parse(response.data);
  }
);

/**
 * Get monitor data for a cluster
 * @example
 * dbName(cluster name): "ai-postgresql"
 * dbType: "postgresql"
 * queryKey: "cpu" | "memory" | "disk"
 */
export const getMonitorData = createParallelAction(
  async (
    context: SealosApiContext,
    dbName: string,
    dbType: string,
    queryKey: string
  ) => {
    const api = createClusterApi(context);
    const response = await api.get("/monitor/getMonitorData", {
      params: {
        dbName,
        dbType,
        queryKey,
      },
    });
    return response.data;
  }
);
