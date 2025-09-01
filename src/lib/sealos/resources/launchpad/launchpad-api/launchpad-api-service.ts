import { getMonitorData } from "./launchpad-old-api";
import { checkReadyLaunchpad } from "./launchpad-old-api";
import type { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import { runParallelAction } from "next-server-actions-parallel";
import type { LaunchpadCheckReadyRequest } from "./launchpad-old-api-schemas/req-res-check-ready-schemas";
import {
  createApplication,
  getApplication,
  updateApplication,
  deleteApplication,
  startApplication,
  pauseApplication,
  updateApplicationConfigMap,
  createApplicationPorts,
  updateApplicationPorts,
  deleteApplicationPorts,
  updateApplicationStorage,
  getApplicationPods,
  getPodsMetrics,
} from "./launchpad-open-api";
import type {
  LaunchpadPatchRequest,
  LaunchpadConfigMapUpdateRequest,
  LaunchpadPortsCreateRequest,
  LaunchpadPortsUpdateRequest,
  LaunchpadPortsDeleteRequest,
  LaunchpadStorageUpdateRequest,
  LaunchpadPodsMetricsRequest,
} from "./launchpad-open-api-schemas/launchpad-create-schema";
import type { LaunchpadCreateFormData } from "@/schemas/forms/launchpad/launchpad-create-form-schema";

// ============= LEGACY API OPERATIONS =============

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

// Check Ready Operations
export async function checkLaunchpadReady(
  request: LaunchpadCheckReadyRequest,
  context: SealosApiContext
): Promise<any> {
  return await runParallelAction(checkReadyLaunchpad(request, context));
}

// ============= NEW STANDARDIZED API OPERATIONS =============

// Application Lifecycle Management
export async function createLaunchpadApplication(
  context: SealosApiContext,
  request: LaunchpadCreateFormData
): Promise<any> {
  return await runParallelAction(createApplication(context, request));
}

export async function getLaunchpadApplication(
  context: SealosApiContext,
  name: string
): Promise<any> {
  return await runParallelAction(getApplication(context, name));
}

export async function updateLaunchpadApplication(
  context: SealosApiContext,
  name: string,
  request: LaunchpadPatchRequest
): Promise<any> {
  return await runParallelAction(updateApplication(context, name, request));
}

export async function deleteLaunchpadApplication(
  context: SealosApiContext,
  name: string
): Promise<any> {
  return await runParallelAction(deleteApplication(context, name));
}

// Application Control Operations
export async function startLaunchpadApplication(
  context: SealosApiContext,
  name: string
): Promise<any> {
  return await runParallelAction(startApplication(context, name));
}

export async function pauseLaunchpadApplication(
  context: SealosApiContext,
  name: string
): Promise<any> {
  return await runParallelAction(pauseApplication(context, name));
}

// ConfigMap Management
export async function updateLaunchpadConfigMap(
  context: SealosApiContext,
  name: string,
  request: LaunchpadConfigMapUpdateRequest
): Promise<any> {
  return await runParallelAction(
    updateApplicationConfigMap(context, name, request)
  );
}

// Ports Management
export async function createLaunchpadPorts(
  context: SealosApiContext,
  name: string,
  request: LaunchpadPortsCreateRequest
): Promise<any> {
  return await runParallelAction(
    createApplicationPorts(context, name, request)
  );
}

export async function updateLaunchpadPorts(
  context: SealosApiContext,
  name: string,
  request: LaunchpadPortsUpdateRequest
): Promise<any> {
  return await runParallelAction(
    updateApplicationPorts(context, name, request)
  );
}

export async function deleteLaunchpadPorts(
  context: SealosApiContext,
  name: string,
  request: LaunchpadPortsDeleteRequest
): Promise<any> {
  return await runParallelAction(
    deleteApplicationPorts(context, name, request)
  );
}

// Storage Management
export async function updateLaunchpadStorage(
  context: SealosApiContext,
  name: string,
  request: LaunchpadStorageUpdateRequest
): Promise<any> {
  return await runParallelAction(
    updateApplicationStorage(context, name, request)
  );
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
