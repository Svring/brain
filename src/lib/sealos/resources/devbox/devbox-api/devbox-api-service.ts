import type { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import type { DevboxCreateFormData } from "@/schemas/forms/devbox/devbox-create-form-schema";
import type { DevboxUpdateFormData } from "@/schemas/forms/devbox/devbox-update-form-schema";
import type { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import type { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { getDevboxObject } from "@/lib/sealos/services/bridge/bridge-resources/bridge-sealos/devbox/devbox-bridge-query";
import { listCustomResources } from "@/lib/k8s/k8s-api/k8s-api-query";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { convertDevboxListToSimplified } from "../devbox-method/devbox-utils";
import { runParallelAction } from "next-server-actions-parallel";
import { createSealosApi } from "@/lib/sealos/sealos-utils";

// Inline request schemas
type DevboxReleaseRequest = {
  tag: string;
  releaseDes?: string;
};

// Helper functions using the universal API utility
function createOldDevboxAxios(context: SealosApiContext) {
  return createSealosApi(context, "devbox");
}

function createDevboxAxios(context: SealosApiContext) {
  return createSealosApi(context, "devbox", "v1/devbox");
}

// ===== QUERY OPERATIONS =====

// DevBox Listing & Information
export async function listDevboxes(context: K8sApiContext) {
  const target = CustomResourceTargetSchema.parse(
    convertResourceTypeToTarget("devbox")
  );
  const devboxResourceList = await runParallelAction(
    listCustomResources(context, target)
  );
  return convertDevboxListToSimplified(devboxResourceList.items);
}

export async function getDevbox(
  context: K8sApiContext,
  target: CustomResourceTarget
) {
  return await getDevboxObject(context, target);
}

export async function getDevboxMonitor(
  context: SealosApiContext,
  queryKey: string,
  queryName: string,
  step: string
): Promise<any> {
  const api = createOldDevboxAxios(context);
  const response = await api.get("/monitor/getMonitorData", {
    params: {
      queryKey,
      queryName,
      step,
    },
  });
  return response.data;
}

export async function getDevboxCombinedMonitor(
  context: SealosApiContext,
  devboxName: string,
  step: string = "2m"
): Promise<any> {
  const [cpuResult, memoryResult] = await Promise.allSettled([
    getDevboxMonitor(context, "average_cpu", devboxName, step),
    getDevboxMonitor(context, "average_memory", devboxName, step),
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

export async function checkDevboxReady(
  context: SealosApiContext,
  name: string
): Promise<any> {
  const api = createOldDevboxAxios(context);
  const response = await api.get("/checkReady", {
    params: {
      devboxName: name,
    },
  });
  return response.data.data;
}

// Release Information
export async function getDevboxReleases(
  context: SealosApiContext,
  name: string
): Promise<any> {
  const api = createDevboxAxios(context);
  const response = await api.get(`/${name}/release`);
  return response.data.data;
}

// Templates
export async function getDevboxTemplates(
  context: SealosApiContext
): Promise<any> {
  const api = createDevboxAxios(context);
  const response = await api.get("/templates");
  return response.data.data;
}

// ===== MUTATION OPERATIONS =====

// DevBox Lifecycle Management
export async function createDevbox(
  context: SealosApiContext,
  request: DevboxCreateFormData
): Promise<any> {
  const api = createDevboxAxios(context);
  const response = await api.post("/", request);
  return response.data;
}

export async function updateDevbox(
  context: SealosApiContext,
  name: string,
  request: DevboxUpdateFormData
): Promise<any> {
  const api = createDevboxAxios(context);
  const response = await api.patch(`/${name}`, request);
  return response.data;
}

export async function startDevbox(
  context: SealosApiContext,
  name: string
): Promise<any> {
  const api = createDevboxAxios(context);
  const response = await api.post(`/${name}/start`, {});
  return response.data;
}

export async function pauseDevbox(
  context: SealosApiContext,
  name: string
): Promise<any> {
  const api = createDevboxAxios(context);
  const response = await api.post(`/${name}/pause`, {});
  return response.data;
}

export async function shutdownDevbox(
  context: SealosApiContext,
  name: string
): Promise<any> {
  const api = createDevboxAxios(context);
  const response = await api.post(`/${name}/shutdown`, {});
  return response.data;
}

export async function restartDevbox(
  context: SealosApiContext,
  name: string
): Promise<any> {
  const api = createDevboxAxios(context);
  const response = await api.post(`/${name}/restart`, {});
  return response.data;
}

export async function deleteDevbox(
  context: SealosApiContext,
  name: string
): Promise<any> {
  const api = createDevboxAxios(context);
  const response = await api.delete(`/${name}/delete`);
  return response.data;
}

// Release Management
export async function releaseDevbox(
  context: SealosApiContext,
  name: string,
  tag: string,
  releaseDes?: string
): Promise<any> {
  const api = createDevboxAxios(context);
  const request: DevboxReleaseRequest = {
    tag,
    releaseDes: releaseDes || "",
  };
  const response = await api.post(`/${name}/release`, request);
  return response.data;
}

export async function deleteDevboxRelease(
  context: SealosApiContext,
  releaseName: string
): Promise<any> {
  const api = createOldDevboxAxios(context);
  const response = await api.delete("/delDevboxVersionByName", {
    params: {
      versionName: releaseName,
    },
  });
  return { data: response.data.data };
}

export async function deployDevbox(
  context: SealosApiContext,
  name: string,
  tag: string
): Promise<any> {
  const api = createDevboxAxios(context);
  const response = await api.post(`/${name}/release/${tag}/deploy`, {});
  return response.data;
}

export async function authCname(
  context: SealosApiContext,
  publicDomain: string,
  customDomain: string
): Promise<any> {
  const api = createOldDevboxAxios(context);
  const response = await api.post("/platform/authCname", {
    publicDomain,
    customDomain,
  });
  return response.data;
}
