import { queryOptions } from "@tanstack/react-query";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import {
  BuiltinResourceTarget,
  BuiltinResourceTargetSchema,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
  getDeployment,
  listDeployment,
} from "../../deployment/deployment-method/deployment-query";
import {
  getStatefulSet,
  listStatefulSet,
} from "../../statefulset/statefulset-method/statefulset-query";
import { getLaunchpadLogs as getLaunchpadLogsApi } from "../launchpad-api/launchpad-old-api";
import {
  QueryLogsRequest,
  QueryLogsRequestSchema,
  QueryLogsResponseSchema,
} from "../launchpad-api/launchpad-old-api-schemas/req-res-query-logs-schemas";
import { runParallelAction } from "next-server-actions-parallel";
import {
  convertResourceTypeToTarget,
  convertResourceToTarget,
} from "@/lib/k8s/k8s-method/k8s-utils";
import { buildQueryKey } from "@/lib/k8s/k8s-constant/k8s-constant-query-key";
import { getLaunchPadMetrics } from "@/lib/sealos/services/metrics/metrics-api/launchpad-metrics-api-query";
import type { MetricsApiContext } from "@/lib/sealos/services/metrics/schemas/metrics-api-context-schema";
import type {
  GetLaunchPadMetricsRequest,
  GetLaunchPadMetricsResponse,
} from "@/lib/sealos/services/metrics/schemas/metrics-query-schema";
import { extractPodMetricsData } from "@/lib/sealos/services/metrics/metrics-utils";

export const getLaunchpad = async (
  context: K8sApiContext,
  target: BuiltinResourceTarget
) => {
  switch (target.resourceType) {
    case "deployment":
      return await getDeployment(context, target);
    case "statefulset":
      return await getStatefulSet(context, target);
    default:
      throw new Error(
        `Resource type ${target.resourceType} is not supported for app queries`
      );
  }
};

export const listLaunchpads = async (context: K8sApiContext) => {
  // Get both deployments and statefulsets
  const [deployments, statefulsets] = await Promise.all([
    listDeployment(context),
    listStatefulSet(context),
  ]);

  // Combine both lists
  return [...deployments, ...statefulsets];
};

export const getLaunchpadLogs = async (
  k8sContext: K8sApiContext,
  sealosContext: SealosApiContext,
  target: BuiltinResourceTarget
) => {
  // Construct the request with only required fields and overrides
  const logRequest = {
    app: target.name!,
    namespace: k8sContext.namespace,
  } as QueryLogsRequest;

  // Validate the request
  const validatedRequest = QueryLogsRequestSchema.parse(logRequest);

  // Query the logs
  const logResponse = await runParallelAction(
    getLaunchpadLogsApi(validatedRequest, sealosContext)
  );

  const parsedLogResponse = QueryLogsResponseSchema.parse(logResponse);

  // Step 1: Split the data string into lines
  const lines = parsedLogResponse.data
    .split("\n")
    .filter((line) => line.trim() !== "");

  // Step 2: Parse each line as a JSON object
  const parsedLogs = lines
    .map((line, _) => {
      return JSON.parse(line);
    })
    .filter((log) => log !== null); // Remove null entries from failed parses

  return parsedLogs;
};

// ============================================================================
// OPTIONS FUNCTIONS (React Query wrappers)
// ============================================================================

/**
 * Query options for getting an app by target
 */
export const getLaunchpadOptions = (
  context: K8sApiContext,
  target: BuiltinResourceTarget
) =>
  queryOptions({
    queryKey: buildQueryKey.getBuiltinResource(
      context.namespace,
      target.resourceType,
      target.name!
    ),
    queryFn: async () => await getLaunchpad(context, target),
    enabled: !!context.namespace && !!target.name && !!context.kubeconfig,
  });

/**
 * Query options for listing apps
 */
export const listLaunchpadOptions = (context: K8sApiContext) =>
  queryOptions({
    queryKey: buildQueryKey.listBuiltinResources(context.namespace, "app"),
    queryFn: async () => await listLaunchpads(context),
    enabled: !!context.namespace && !!context.kubeconfig,
    staleTime: 1000 * 30,
  });

/**
 * Query options for querying app logs
 */
export const getLaunchpadLogsOptions = (
  k8sContext: K8sApiContext,
  sealosContext: SealosApiContext,
  target: BuiltinResourceTarget
) =>
  queryOptions({
    queryKey: ["app", "logs", k8sContext.namespace, target.name],
    queryFn: async () =>
      await getLaunchpadLogs(k8sContext, sealosContext, target),
    enabled: !!k8sContext.namespace && !!target.name && !!k8sContext.kubeconfig,
    staleTime: 1000 * 10, // Logs are more dynamic, shorter stale time
  });

// ============================================================================
// LAUNCHPAD MONITORING OPTIONS FUNCTIONS
// ============================================================================

/**
 * Query options for getting launchpad instant monitor data (CPU and memory)
 * Uses launchpad metrics API to query both cpu and memory in the same request
 */
export const getLaunchpadInstantMonitorOptions = (
  context: MetricsApiContext,
  launchpadName: string,
  time?: string
) => {
  const currentTime = time || Math.floor(Date.now() / 1000).toString();

  return queryOptions({
    queryKey: [
      "launchpad",
      "monitor",
      "instant",
      context.namespace,
      launchpadName,
      currentTime,
    ],
    queryFn: async (): Promise<
      Record<
        string,
        {
          cpu: Array<[string, string]>;
          memory: Array<[string, string]>;
        }
      >
    > => {
      // Query both CPU and memory metrics simultaneously
      const [cpuMetrics, memoryMetrics] = await Promise.all([
        runParallelAction(
          getLaunchPadMetrics(
            {
              namespace: context.namespace,
              type: "cpu",
              launchPadName: launchpadName,
              time: currentTime,
            },
            context
          )
        ),
        runParallelAction(
          getLaunchPadMetrics(
            {
              namespace: context.namespace,
              type: "memory",
              launchPadName: launchpadName,
              time: currentTime,
            },
            context
          )
        ),
      ]);

      // Process and return the pod metrics data directly
      return extractPodMetricsData({
        cpu: cpuMetrics,
        memory: memoryMetrics,
      });
    },
    enabled: !!context.baseURL && !!context.namespace && !!launchpadName,
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Query options for getting launchpad ranged monitor data (CPU and memory over timespan)
 * Uses launchpad metrics API to query both cpu and memory in the same request with time range
 */
export const getLaunchpadRangedMonitorOptions = (
  context: MetricsApiContext,
  launchpadName: string,
  start?: string,
  end?: string,
  step?: string
) => {
  return queryOptions({
    queryKey: [
      "launchpad",
      "monitor",
      "ranged",
      context.namespace,
      launchpadName,
      start,
      end,
      step,
    ],
    queryFn: async (): Promise<
      Record<
        string,
        {
          cpu: Array<[string, string]>;
          memory: Array<[string, string]>;
        }
      >
    > => {
      // Query both CPU and memory metrics simultaneously with time range
      const [cpuMetrics, memoryMetrics] = await Promise.all([
        runParallelAction(
          getLaunchPadMetrics(
            {
              namespace: context.namespace,
              type: "cpu",
              launchPadName: launchpadName,
              start,
              end,
              step,
            },
            context
          )
        ),
        runParallelAction(
          getLaunchPadMetrics(
            {
              namespace: context.namespace,
              type: "memory",
              launchPadName: launchpadName,
              start,
              end,
              step,
            },
            context
          )
        ),
      ]);

      // Process and return the pod metrics data directly
      return extractPodMetricsData({
        cpu: cpuMetrics,
        memory: memoryMetrics,
      });
    },
    enabled: !!context.baseURL && !!context.namespace && !!launchpadName,
    staleTime: 1000 * 30, // 30 seconds
  });
};
