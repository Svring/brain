"use server";

import axios from "axios";
import https from "https";
import {
	createParallelAction,
	runParallelAction,
} from "next-server-actions-parallel";
import type { ClusterCreateFormData } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { clusterCreateFormSchema } from "@/schemas/forms/cluster/cluster-create-form-schema";
import type { ClusterUpdateFormData } from "@/schemas/forms/cluster/cluster-update-form-schema";
import { clusterUpdateFormSchema } from "@/schemas/forms/cluster/cluster-update-form-schema";
import type {
	ClusterApiContext,
	ClusterForm,
	ClusterVersionsResponse,
	CreateClusterRequest,
	CreateClusterResponse,
	DeleteClusterResponse,
	GetClusterResponse,
	GetLogsDataResponse,
	GetLogsFilesResponse,
	LogClusterType,
	LogType,
	PauseClusterResponse,
	RestartClusterResponse,
	StartClusterResponse,
	UpdateClusterRequest,
	UpdateClusterResponse,
} from "./cluster-open-api-schemas";
import {
	CreateClusterRequestSchema,
	CreateClusterResponseSchema,
	DeleteClusterResponseSchema,
	GetClusterResponseSchema,
	GetLogsDataResponseSchema,
	GetLogsFilesResponseSchema,
	PauseClusterResponseSchema,
	RestartClusterResponseSchema,
	StartClusterResponseSchema,
	UpdateClusterRequestSchema,
	UpdateClusterResponseSchema,
} from "./cluster-open-api-schemas";

// Helper to create axios instance per request
function createClusterApi(context: ClusterApiContext) {
	const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";
	return axios.create({
		baseURL: `http://dbprovider.${context.baseUrl}/api/v1`,
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

// Cluster Management Functions

/**
 * Create a new cluster
 *
 * @example
 * ```typescript
 * // Create a PostgreSQL cluster with minimal configuration
 * const result = await createCluster({
 *   name: "my-postgres",
 *   type: "postgresql",
 *   version: "14.0"
 *   // Uses defaults: terminationPolicy: "Delete", resource: { cpu: "1000m", memory: "1024Mi", storage: "3Gi", replicas: 1 }
 * }, context);
 *
 * // Create a MongoDB cluster with custom resources
 * const result = await createCluster({
 *   terminationPolicy: "WipeOut",
 *   name: "my-mongodb",
 *   type: "mongodb",
 *   version: "6.0",
 *   resource: {
 *     cpu: "2000m",
 *     memory: "4096Mi",
 *     storage: "10Gi",
 *     replicas: 2
 *   }
 * }, context);
 * ```
 */
export const createCluster = createParallelAction(
	async (
		request: ClusterCreateFormData,
		context: ClusterApiContext,
	): Promise<CreateClusterResponse> => {
		// Parse with form schema to get defaults
		const formData = clusterCreateFormSchema.parse(request);
		const api = createClusterApi(context);
		const response = await api.post("/database", formData);

		// Check if response code is not 200-299 range
		if (response.data.code < 200 || response.data.code >= 300) {
			throw new Error(
				`Failed to create cluster: ${
					response.data.message || `HTTP ${response.data.code}`
				}`,
			);
		}

		return response.data;
	},
);

/**
 * Get cluster information by name
 *
 * @example
 * ```typescript
 * // Get information about a specific cluster
 * const cluster = await getCluster("my-postgres", context);
 * console.log(cluster.data.status); // "Running", "Creating", etc.
 * console.log(cluster.data.resource.cpu); // "1000m"
 * ```
 */
export const getCluster = createParallelAction(
	async (clusterName: string, context: ClusterApiContext) => {
		const api = createClusterApi(context);
		const response = await api.get(`/database/${clusterName}`);
		return response.data.data;
	},
);

/**
 * Update cluster resource configuration
 *
 * @example
 * ```typescript
 * // Scale up cluster resources
 * const result = await updateCluster({
 *   name: "my-postgres",
 *   resource: {
 *     cpu: 2,            // Increase from 1 to 2 cores
 *     memory: 2,         // Increase from 1 to 2 GB
 *     storage: 5,        // Increase from 3 to 5 GB
 *     replicas: 2        // Increase from 1 to 2
 *   }
 * }, context);
 *
 * // Scale down cluster resources
 * const result = await updateCluster({
 *   name: "my-postgres",
 *   resource: {
 *     cpu: 0.5,          // Decrease to 0.5 cores
 *     memory: 0.5,       // Decrease to 0.5 GB
 *     storage: 2,        // Decrease to 2 GB
 *     replicas: 1        // Keep at 1
 *   }
 * }, context);
 * ```
 */
export const updateCluster = createParallelAction(
	async (
		formData: ClusterUpdateFormData,
		context: ClusterApiContext,
	): Promise<UpdateClusterResponse> => {
		// Parse with form schema to get defaults and validation
		const validatedFormData = clusterUpdateFormSchema.parse(formData);
		const { name, resource } = validatedFormData;

		if (!resource) {
			throw new Error("Resource configuration is required for cluster update");
		}

		const api = createClusterApi(context);
		const response = await api.patch(`/database/${name}`, { resource });

		// Check if response code is not 200-299 range
		if (response.data.code < 200 || response.data.code >= 300) {
			throw new Error(
				`Failed to update cluster: ${
					response.data.message || `HTTP ${response.data.code}`
				}`,
			);
		}

		return response.data;
	},
);

/**
 * Delete a cluster
 *
 * @example
 * ```typescript
 * // Delete a cluster (will use termination policy from cluster config)
 * const result = await deleteCluster("my-postgres", context);
 *
 * // Check if deletion was successful
 * if (result.code === 200) {
 *   console.log("Cluster deleted successfully");
 * }
 * ```
 */
export const deleteCluster = createParallelAction(
	async (
		clusterName: string,
		context: ClusterApiContext,
	): Promise<DeleteClusterResponse> => {
		const api = createClusterApi(context);
		const response = await api.delete(`/database/${clusterName}`);

		// Check if response code is not 200-299 range
		if (response.data.code < 200 || response.data.code >= 300) {
			throw new Error(
				`Failed to delete cluster: ${
					response.data.message || `HTTP ${response.data.code}`
				}`,
			);
		}

		return DeleteClusterResponseSchema.parse(response.data);
	},
);

/**
 * Start a stopped cluster
 *
 * @example
 * ```typescript
 * // Start a paused/stopped cluster
 * const result = await startCluster("my-postgres", context);
 *
 * // Wait for cluster to be running
 * let cluster = await getCluster("my-postgres", context);
 * while (cluster.data.status !== "Running") {
 *   await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
 *   cluster = await getCluster("my-postgres", context);
 * }
 * ```
 */
export const startCluster = createParallelAction(
	async (
		clusterName: string,
		context: ClusterApiContext,
	): Promise<StartClusterResponse> => {
		const api = createClusterApi(context);
		const response = await api.post(`/database/${clusterName}/start`);

		// Check if response code is not 200-299 range
		if (response.data.code < 200 || response.data.code >= 300) {
			throw new Error(
				`Failed to start cluster: ${
					response.data.message || `HTTP ${response.data.code}`
				}`,
			);
		}

		return StartClusterResponseSchema.parse(response.data);
	},
);

/**
 * Pause/stop a running cluster
 *
 * @example
 * ```typescript
 * // Pause a running cluster to save resources
 * const result = await pauseCluster("my-postgres", context);
 *
 * // Check cluster status after pausing
 * const cluster = await getCluster("my-postgres", context);
 * console.log(cluster.data.status); // Should be "Stopped"
 * ```
 */
export const pauseCluster = createParallelAction(
	async (
		clusterName: string,
		context: ClusterApiContext,
	): Promise<PauseClusterResponse> => {
		const api = createClusterApi(context);
		const response = await api.post(`/database/${clusterName}/pause`);

		// Check if response code is not 200-299 range
		if (response.data.code < 200 || response.data.code >= 300) {
			throw new Error(
				`Failed to pause cluster: ${
					response.data.message || `HTTP ${response.data.code}`
				}`,
			);
		}

		return PauseClusterResponseSchema.parse(response.data);
	},
);

/**
 * Restart a cluster
 *
 * @example
 * ```typescript
 * // Restart a cluster
 * const result = await restartCluster("my-postgres", context);
 *
 * // Wait for cluster to be running after restart
 * let cluster = await getCluster("my-postgres", context);
 * while (cluster.data.status !== "Running") {
 *   await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
 *   cluster = await getCluster("my-postgres", context);
 * }
 * ```
 */
export const restartCluster = createParallelAction(
	async (
		clusterName: string,
		context: ClusterApiContext,
	): Promise<RestartClusterResponse> => {
		const api = createClusterApi(context);
		const response = await api.post(`/database/${clusterName}/restart`);

		// Check if response code is not 200-299 range
		if (response.data.code < 200 || response.data.code >= 300) {
			throw new Error(
				`Failed to restart cluster: ${
					response.data.message || `HTTP ${response.data.code}`
				}`,
			);
		}

		return RestartClusterResponseSchema.parse(response.data);
	},
);

// Log Management Functions

/**
 * Get log data from a cluster pod
 *
 * @example
 * ```typescript
 * // Get runtime logs from a PostgreSQL cluster
 * const logs = await getLogsData({
 *   podName: "my-postgres-0",
 *   dbType: "postgresql",
 *   logType: "runtimeLog",
 *   logPath: "/var/log/postgresql/postgresql-14-main.log",
 *   page: 1,
 *   pageSize: 100
 * }, context);
 *
 * // Process log entries
 * logs.data.logs.forEach(log => {
 *   console.log(`${log.timestamp} [${log.level}] ${log.content}`);
 * });
 *
 * // Check pagination info
 * console.log(`Page ${logs.data.metadata.page} of ${Math.ceil(logs.data.metadata.total / logs.data.metadata.pageSize)}`);
 * ```
 */
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
		context: ClusterApiContext,
	): Promise<GetLogsDataResponse> => {
		const api = createClusterApi(context);
		const response = await api.get("/logs/data", { params });
		return GetLogsDataResponseSchema.parse(response.data);
	},
);

/**
 * Get available log files from a cluster pod
 *
 * @example
 * ```typescript
 * // Get available log files from a MongoDB cluster
 * const logFiles = await getLogsFiles({
 *   podName: "my-mongodb-0",
 *   dbType: "mongodb",
 *   logType: "errorLog"
 * }, context);
 *
 * // List available log files
 * logFiles.data.forEach(file => {
 *   console.log(`${file.name} (${file.size} bytes) - ${file.updateTime}`);
 *   console.log(`Path: ${file.path}`);
 * });
 *
 * // Use file info to get specific log data
 * if (logFiles.data.length > 0) {
 *   const firstFile = logFiles.data[0];
 *   const logs = await getLogsData({
 *     podName: "my-mongodb-0",
 *     dbType: "mongodb",
 *     logType: "errorLog",
 *     logPath: firstFile.path
 *   }, context);
 * }
 * ```
 */
export const getLogsFiles = createParallelAction(
	async (
		params: {
			podName: string;
			dbType: LogClusterType;
			logType: LogType;
		},
		context: ClusterApiContext,
	): Promise<GetLogsFilesResponse> => {
		const api = createClusterApi(context);
		const response = await api.get("/logs/files", { params });
		return GetLogsFilesResponseSchema.parse(response.data);
	},
);

/**
 * Get available cluster versions
 *
 * @example
 * ```typescript
 * // Get all available cluster versions
 * const versions = await getClusterVersions(context);
 *
 * // Access specific cluster versions
 * console.log("PostgreSQL versions:", versions.data.postgresql);
 * console.log("MongoDB versions:", versions.data.mongodb);
 * console.log("Redis versions:", versions.data.redis);
 * ```
 */
export const getClusterVersions = createParallelAction(
	async (context: ClusterApiContext): Promise<ClusterVersionsResponse> => {
		const api = createClusterApi(context);
		const response = await api.get("/database/version/list");
		return response.data;
	},
);

// TODO: Add more cluster management functions as needed:
// - listClusters
// - stopCluster
// - getClusterBackups
// - createClusterBackup
// - deleteClusterBackup
// - restartCluster (implemented)

// Example of additional functions that could be implemented:
/*
export const listClusters = createParallelAction(
  async (context: ClusterApiContext): Promise<any> => {
    const api = createClusterApi(context);
    const response = await api.get("/databases");
    return response.data; // Schema to be defined
  }
);

export const stopCluster = createParallelAction(
  async (
    clusterName: string,
    context: ClusterApiContext
  ): Promise<any> => {
    const api = createClusterApi(context);
    const response = await api.post(`/database/${clusterName}/stop`);
    return response.data; // Schema to be defined
  }
);

export const getClusterBackups = createParallelAction(
  async (
    clusterName: string,
    context: ClusterApiContext
  ): Promise<any> => {
    const api = createClusterApi(context);
    const response = await api.get(`/database/${clusterName}/backups`);
    return response.data; // Schema to be defined
  }
);

export const createClusterBackup = createParallelAction(
  async (
    clusterName: string,
    context: ClusterApiContext
  ): Promise<any> => {
    const api = createClusterApi(context);
    const response = await api.post(`/database/${clusterName}/backup`);
    return response.data; // Schema to be defined
  }
);

export const deleteClusterBackup = createParallelAction(
  async (
    clusterName: string,
    backupName: string,
    context: ClusterApiContext
  ): Promise<any> => {
    const api = createClusterApi(context);
    const response = await api.delete(`/database/${clusterName}/backup/${backupName}`);
    return response.data; // Schema to be defined
  }
);
*/
