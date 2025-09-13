import { getMonitorData } from "./cluster-old-api";
import type { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import type { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import type { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { runParallelAction } from "next-server-actions-parallel";
import {
  createSealosApi,
  transformCombinedMonitorData,
} from "@/lib/sealos/sealos-utils";
import { getClusterObject } from "@/lib/sealos/services/bridge/bridge-resources/bridge-sealos/cluster/cluster-bridge-query";
import { listCustomResources } from "@/lib/k8s/k8s-api/k8s-api-query";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { convertClusterListToSimplified } from "../cluster-method/cluster-utils";
import { getLogFiles, getLog, getBackupList } from "./cluster-old-api";
import { getClusterVersions } from "./cluster-open-api";
import { CLUSTER_LOG_TYPES } from "../cluster-constant/cluster-constant-logs";
import { ifSupportLog, processLogData } from "../cluster-utils";
import _ from "lodash";
import {
  createCluster as createClusterOld,
  deleteCluster as deleteClusterOld,
} from "./cluster-old-api";
import {
  createCluster,
  updateCluster,
  startCluster,
  pauseCluster,
} from "./cluster-open-api";
import type { ClusterCreateFormData } from "@/schemas/forms/cluster/cluster-create-form-schema";
import type { ClusterUpdateFormData } from "@/schemas/forms/cluster/cluster-update-form-schema";
import type {
  CreateClusterRequest,
  UpdateClusterRequest,
} from "./cluster-open-api-schemas";
import type { ClusterDeleteRequest } from "../schemas/req-res-schemas/req-res-delete-schemas";

// Monitor Data Operations
export async function getClusterMonitorData(
  context: SealosApiContext,
  dbName: string,
  dbType: string,
  queryKey: string
): Promise<any> {
  return await runParallelAction(
    getMonitorData(context, dbName, dbType, queryKey)
  );
}

export async function getCombinedMonitor(
  context: SealosApiContext,
  dbName: string,
  dbType: string
): Promise<any> {
  const [cpuResult, memoryResult, diskResult] = await Promise.allSettled([
    getClusterMonitorData(context, dbName, dbType, "cpu"),
    getClusterMonitorData(context, dbName, dbType, "memory"),
    getClusterMonitorData(context, dbName, dbType, "disk"),
  ]);

  const cpuData =
    cpuResult.status === "fulfilled" ? cpuResult.value : undefined;
  const memoryData =
    memoryResult.status === "fulfilled" ? memoryResult.value : undefined;
  const diskData =
    diskResult.status === "fulfilled" ? diskResult.value : undefined;

  const result = transformCombinedMonitorData({
    cpu: cpuData,
    memory: memoryData,
    storage: diskData,
  });

  return result;
}

// Helper to create axios instance per request using universal utility
function createClusterApi(context: SealosApiContext) {
  return createSealosApi(context, "cluster", "database");
}

// ===== QUERY OPERATIONS =====

// Cluster Information
export async function getCluster(
  context: K8sApiContext,
  target: CustomResourceTarget
) {
  const clusterObject = await getClusterObject(context, target);
  return clusterObject;
}

export async function listClusters(context: K8sApiContext) {
  const target = CustomResourceTargetSchema.parse(
    convertResourceTypeToTarget("cluster")
  );
  const clusterResourceList = await runParallelAction(
    listCustomResources(context, target)
  );
  return convertClusterListToSimplified(clusterResourceList.items);
}

export async function getClusterBackupList(
  clusterContext: SealosApiContext,
  target: CustomResourceTarget
) {
  const backupListResponse = await runParallelAction(
    getBackupList({ dbName: target.name! }, clusterContext)
  );
  return backupListResponse.data.map((item) => {
    return {
      name: item.metadata.name,
      time: item.status?.completionTimestamp,
    };
  });
}

export async function getClusterLogs(
  k8sContext: K8sApiContext,
  clusterContext: SealosApiContext,
  target: CustomResourceTarget
) {
  const clusterObject = await getCluster(k8sContext, target);
  const { pods = [], type } = clusterObject;
  const logTypes = CLUSTER_LOG_TYPES[type as keyof typeof CLUSTER_LOG_TYPES];

  // Check if pods are available
  if (!pods?.length) {
    return {
      supported: false,
      message: `No pods available for cluster: ${target.name}`,
      dbType: type,
      reason: "no_pods",
    };
  }

  // Check if log types are supported
  const logSupport = ifSupportLog(type || "");
  if (!logSupport.supported) {
    return logSupport;
  }

  // Filter out pods without names
  const validPods = pods.filter((pod) => pod.name);

  // Chain log file retrieval and log content fetching
  const processedData = await _.chain(validPods)
    .flatMap((pod) =>
      logTypes.map((logType) => ({
        podName: pod.name!,
        logType: logType as "runtimeLog" | "slowQuery" | "errorLog",
        dbType: type as "redis" | "postgresql" | "mongodb" | "apecloud-mysql",
      }))
    )
    .thru(async (requests) => {
      const logFileResponses = await Promise.all(
        requests.map(({ podName, logType, dbType }) =>
          runParallelAction(
            getLogFiles({ podName, dbType, logType }, clusterContext)
          )
        )
      );

      const logFilePaths = _.chain(logFileResponses)
        .filter((response) => response.code === 200 && !!response.data)
        .flatMap((response) => response.data!)
        .filter((logFile) => !!logFile?.path)
        .map((logFile) => logFile!.path)
        .value();

      const logRequestsWithMetadata = _.chain(logFilePaths)
        .flatMap((logPath) =>
          validPods.flatMap((pod) =>
            logTypes.map((logType) => ({
              request: runParallelAction(
                getLog(
                  {
                    page: 1,
                    pageSize: 100,
                    podName: pod.name!,
                    dbType: type as
                      | "redis"
                      | "postgresql"
                      | "mongodb"
                      | "apecloud-mysql",
                    logType,
                    logPath,
                  },
                  clusterContext
                )
              ),
              metadata: { logType, podName: pod.name!, logPath },
            }))
          )
        )
        .value();

      const logResponses = await Promise.all(
        logRequestsWithMetadata.map((item) => item.request)
      );

      const logResponsesWithMetadata = _.chain(logResponses)
        .map((response, index) => ({
          ...response,
          ...logRequestsWithMetadata[index].metadata,
        }))
        .value();

      return processLogData(
        logFileResponses,
        logResponsesWithMetadata,
        validPods.map((pod) => pod.name!)
      );
    })
    .value();

  return {
    supported: true,
    data: processedData,
  };
}

export async function fetchClusterVersions(context: SealosApiContext) {
  const versionsResponse = await runParallelAction(getClusterVersions(context));
  return versionsResponse;
}

// ===== MUTATION OPERATIONS =====

// Cluster Lifecycle Management
export async function createClusterService(
  input: ClusterCreateFormData,
  context: SealosApiContext
) {
  return await runParallelAction(createCluster(input, context));
}

export async function startClusterService(
  input: CustomResourceTarget,
  context: SealosApiContext
) {
  return await startCluster(input.name!, context);
}

export async function pauseClusterService(
  input: CustomResourceTarget,
  context: SealosApiContext
) {
  return await pauseCluster(input.name!, context);
}

export async function updateClusterService(
  input: ClusterUpdateFormData,
  context: SealosApiContext
) {
  return await runParallelAction(updateCluster(input, context));
}

export async function deleteClusterService(
  input: CustomResourceTarget,
  context: SealosApiContext
) {
  // Create a ClusterDeleteRequest that includes all CustomResourceTarget fields plus name
  const deleteRequest: ClusterDeleteRequest = {
    ...input,
    name: input.name!,
  };
  return await runParallelAction(deleteClusterOld(deleteRequest, context));
}

// Backup Operations
export async function deleteClusterBackup(
  context: SealosApiContext,
  clusterName: string,
  backupName: string
): Promise<any> {
  const api = createClusterApi(context);
  const response = await api.delete(`/${clusterName}/backup/${backupName}`);
  return response.data;
}

export async function createClusterBackup(
  context: SealosApiContext,
  databaseName: string,
  remark?: string
): Promise<any> {
  const api = createClusterApi(context);
  const response = await api.post(`/database/${databaseName}/backup`, {
    remark,
  });
  return response.data;
}

export async function restoreClusterBackup(
  context: SealosApiContext,
  databaseName: string,
  backupName: string
): Promise<any> {
  const api = createClusterApi(context);
  const response = await api.post(
    `/database/${databaseName}/backup/${backupName}/restore`
  );
  return response.data;
}

// Public Access Operations
export async function enableClusterPublicAccess(
  context: SealosApiContext,
  databaseName: string
): Promise<any> {
  const api = createClusterApi(context);
  const response = await api.post(`/database/${databaseName}/enablePublic`);
  return response.data;
}

export async function disableClusterPublicAccess(
  context: SealosApiContext,
  databaseName: string
): Promise<any> {
  const api = createClusterApi(context);
  const response = await api.post(`/database/${databaseName}/disablePublic`);
  return response.data;
}
