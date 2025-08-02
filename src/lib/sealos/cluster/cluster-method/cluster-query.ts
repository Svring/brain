import { queryOptions } from "@tanstack/react-query";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { SealosApiContext } from "../../sealos-api-context-schema";
import {
  CustomResourceTarget,
  CustomResourceTargetSchema,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { getClusterObject } from "@/lib/algorithm/bridge/bridge-resources/cluster/cluster-bridge-query";
import { listCustomResources } from "@/lib/k8s/k8s-api/k8s-api-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  convertResourceTypeToTarget,
  convertResourceToTarget,
} from "@/lib/k8s/k8s-method/k8s-utils";
import { buildQueryKey } from "@/lib/k8s/k8s-constant/k8s-constant-query-key";
import { getLogFiles, getLog } from "../cluster-api/cluster-old-api";
import { CLUSTER_LOG_TYPES } from "../cluster-constant/cluster-constant-logs";
import { ifSupportLog, processLogData } from "../cluster-utils";
import _ from "lodash";

export const getCluster = async (
  context: K8sApiContext,
  target: CustomResourceTarget
) => {
  // Test the new composeObjectFromTarget function
  const clusterObject = await getClusterObject(context, target);
  return clusterObject;
};

export const listCluster = async (context: K8sApiContext) => {
  const target = CustomResourceTargetSchema.parse(
    convertResourceTypeToTarget("cluster")
  );
  const clusterResourceList = await runParallelAction(
    listCustomResources(context, target)
  );
  const clusterTargetList = clusterResourceList.items.map((item) =>
    CustomResourceTargetSchema.parse(convertResourceToTarget(item))
  );
  return clusterTargetList.map(
    async (target) => await getCluster(context, target)
  );
};

export const getClusterLogFiles = async (
  k8sContext: K8sApiContext,
  clusterContext: SealosApiContext,
  target: CustomResourceTarget
) => {
  const clusterObject = await getCluster(k8sContext, target);
  const { pods = [], type } = clusterObject;
  const logTypes = CLUSTER_LOG_TYPES[type];

  // Check if pods are available
  if (!pods.length) {
    return {
      supported: false,
      message: `No pods available for cluster: ${target.name}`,
      dbType: type,
      reason: "no_pods",
    };
  }

  // Check if log types are supported
  const logSupport = ifSupportLog(type);
  if (!logSupport.supported) {
    return logSupport;
  }

  // Chain log file retrieval and log content fetching
  const processedData = await _.chain(pods)
    .flatMap((pod) =>
      logTypes.map((logType) => ({
        podName: pod.name,
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
          pods.flatMap((pod) =>
            logTypes.map((logType) => ({
              request: runParallelAction(
                getLog(
                  {
                    page: 1,
                    pageSize: 100,
                    podName: pod.name,
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
              metadata: { logType, podName: pod.name, logPath },
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
        pods.map((pod) => pod.name)
      );
    })
    .value();

  return {
    supported: true,
    data: processedData,
  };
};

// ============================================================================
// OPTIONS FUNCTIONS (React Query wrappers)
// ============================================================================

/**
 * Query options for getting a cluster by target
 */
export const getClusterOptions = (
  context: K8sApiContext,
  target: CustomResourceTarget
) =>
  queryOptions({
    queryKey: buildQueryKey.getCluster(context.namespace, target.name!),
    queryFn: async () => await getCluster(context, target),
    enabled:
      !!target.group &&
      !!target.version &&
      !!context.namespace &&
      !!target.plural &&
      !!target.name &&
      !!context.kubeconfig,
  });

/**
 * Query options for listing clusters
 */
export const listClusterOptions = (context: K8sApiContext) =>
  queryOptions({
    queryKey: buildQueryKey.listClusters(context.namespace),
    queryFn: async () => await listCluster(context),
    enabled: !!context.namespace && !!context.kubeconfig,
    staleTime: 1000 * 30,
  });

/**
 * Query options for getting cluster log files
 */
export const getClusterLogFilesOptions = (
  k8sContext: K8sApiContext,
  clusterContext: SealosApiContext,
  target: CustomResourceTarget
) =>
  queryOptions({
    queryKey: buildQueryKey.getClusterLogFiles(
      k8sContext.namespace,
      target.name!
    ),
    queryFn: async () =>
      await getClusterLogFiles(k8sContext, clusterContext, target),
    enabled:
      !!target.group &&
      !!target.version &&
      !!k8sContext.namespace &&
      !!target.plural &&
      !!target.name &&
      !!k8sContext.kubeconfig &&
      !!clusterContext.baseURL,
  });
