import { getMonitorData } from "./launchpad-old-api";
import {
  checkReadyLaunchpad,
  startLaunchpad,
  pauseLaunchpad,
  deleteLaunchpad,
} from "./launchpad-old-api";
import type { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import type { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import type { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { runParallelAction } from "next-server-actions-parallel";
import type { LaunchpadCheckReadyRequest } from "./launchpad-old-api-schemas/req-res-check-ready-schemas";
import {
  createApplication as createLaunchpad,
  updateApplication as updateLaunchpad,
  getApplicationPods,
  getPodsMetrics,
  restartApplication,
} from "./launchpad-open-api";
import type { LaunchpadPodsMetricsRequest } from "./launchpad-open-api-schemas/launchpad-create-schema";
import type { LaunchpadCreateFormData } from "@/schemas/forms/launchpad/launchpad-create-form-schema";
import type { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";
import {
  getLaunchpad as getLaunchpadQuery,
  listLaunchpads as listLaunchpadsQuery,
  getLaunchpadLogs as getLaunchpadLogsQuery,
} from "../launchpad-method/launchpad-query";
import {
  getDeployment,
  listDeployment,
} from "../../deployment/deployment-method/deployment-query";
import {
  getStatefulSet,
  listStatefulSet,
} from "../../statefulset/statefulset-method/statefulset-query";
import type { LaunchpadDeleteRequest } from "./launchpad-old-api-schemas/req-res-delete-schemas";
import type { LaunchpadStartRequest } from "./launchpad-old-api-schemas/req-res-start-schemas";
import type { LaunchpadPauseRequest } from "./launchpad-old-api-schemas/req-res-pause-schemas";

// ===== QUERY OPERATIONS =====

// Launchpad Information
export async function getLaunchpad(
  context: K8sApiContext,
  target: BuiltinResourceTarget
) {
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
}

export async function listLaunchpads(context: K8sApiContext) {
  // Get both deployments and statefulsets
  const [deployments, statefulsets] = await Promise.all([
    listDeployment(context),
    listStatefulSet(context),
  ]);

  // Combine both lists
  return [...deployments, ...statefulsets];
}

export async function getLaunchpadLogs(
  k8sContext: K8sApiContext,
  launchpadContext: SealosApiContext,
  target: BuiltinResourceTarget
) {
  // Use the existing implementation from launchpad-query
  return await getLaunchpadLogsQuery(k8sContext, launchpadContext, target);
}

// Monitor Data Operations
export async function getLaunchpadMonitorData(
  context: SealosApiContext,
  queryKey: string,
  queryName: string,
  step: string
): Promise<any> {
  return await runParallelAction(
    getMonitorData(context, queryKey, queryName, step)
  );
}

export async function getLaunchpadCombinedMonitor(
  context: SealosApiContext,
  queryName: string,
  step: string = "2m"
): Promise<any> {
  const [cpuResult, memoryResult] = await Promise.allSettled([
    getLaunchpadMonitorData(context, "average_cpu", queryName, step),
    getLaunchpadMonitorData(context, "average_memory", queryName, step),
  ]);

  const cpuData =
    cpuResult.status === "fulfilled" ? cpuResult.value : undefined;
  const memoryData =
    memoryResult.status === "fulfilled" ? memoryResult.value : undefined;

  // Import transformCombinedMonitorData here to avoid circular dependency
  const { transformCombinedMonitorData } = await import(
    "@/lib/sealos/sealos-utils"
  );

  return transformCombinedMonitorData({
    cpu: cpuData,
    memory: memoryData,
  });
}

// Check Ready Operations
export async function checkLaunchpadReady(
  request: LaunchpadCheckReadyRequest,
  context: SealosApiContext
): Promise<any> {
  return await runParallelAction(checkReadyLaunchpad(request, context));
}

// Pods and Metrics
export async function getLaunchpadApplicationPods(
  context: SealosApiContext,
  name: string
): Promise<any> {
  return await runParallelAction(getApplicationPods(context, name));
}

export async function getLaunchpadPodsMetrics(
  context: SealosApiContext,
  request: LaunchpadPodsMetricsRequest
): Promise<any> {
  return await runParallelAction(getPodsMetrics(context, request));
}

// ===== MUTATION OPERATIONS =====

// Launchpad Lifecycle Management
export async function createLaunchpadService(
  context: SealosApiContext,
  request: LaunchpadCreateFormData
): Promise<any> {
  return await runParallelAction(createLaunchpad(context, request));
}

export async function updateLaunchpadService(
  context: SealosApiContext,
  request: LaunchpadUpdateFormData
): Promise<any> {
  return await runParallelAction(
    updateLaunchpad(context, request.name!, request)
  );
}

export async function startLaunchpadService(
  request: LaunchpadStartRequest,
  context: SealosApiContext
): Promise<any> {
  return await runParallelAction(startLaunchpad(request, context));
}

export async function pauseLaunchpadService(
  request: LaunchpadPauseRequest,
  context: SealosApiContext
): Promise<any> {
  return await runParallelAction(pauseLaunchpad(request, context));
}

export async function restartLaunchpadService(
  request: LaunchpadStartRequest,
  context: SealosApiContext
): Promise<any> {
  return await runParallelAction(restartApplication(context, request.name!));
}

export async function deleteLaunchpadService(
  request: LaunchpadDeleteRequest,
  context: SealosApiContext
): Promise<any> {
  return await runParallelAction(deleteLaunchpad(request, context));
}

export async function checkReadyLaunchpadService(
  request: LaunchpadCheckReadyRequest,
  context: SealosApiContext
): Promise<any> {
  return await runParallelAction(checkReadyLaunchpad(request, context));
}
