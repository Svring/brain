import axios from "axios";
import https from "https";
import type {
  DevboxApiContext,
  DevboxListResponse,
  DevboxCreateRequest,
  DevboxCreateResponse,
  DevboxUpdateRequest,
  DevboxUpdateResponse,
  DevboxDeleteResponse,
  DevboxLifecycleRequest,
  DevboxLifecycleResponse,
  DevboxShutdownRequest,
  DevboxShutdownResponse,
  DevboxRestartRequest,
  DevboxRestartResponse,
  DevboxReleaseRequest,
  DevboxReleaseResponse,
  DevboxReleasesResponse,
  DevboxDeployRequest,
  DevboxDeployResponse,
  DevboxPortCreateRequest,
  DevboxPortCreateResponse,
  DevboxPortRemoveResponse,
} from "./devbox-open-api-schemas";
import {
  DevboxListResponseSchema,
  DevboxCreateResponseSchema,
  DevboxUpdateResponseSchema,
  DevboxDeleteResponseSchema,
  DevboxLifecycleResponseSchema,
  DevboxShutdownResponseSchema,
  DevboxRestartResponseSchema,
  DevboxReleaseResponseSchema,
  DevboxReleasesResponseSchema,
  DevboxDeployResponseSchema,
  DevboxPortCreateResponseSchema,
  DevboxPortRemoveResponseSchema,
} from "./devbox-open-api-schemas";
import type { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import type { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { getDevboxObject } from "@/lib/sealos/services/bridge/bridge-resources/bridge-sealos/devbox/devbox-bridge-query";
import { listCustomResources } from "@/lib/k8s/k8s-api/k8s-api-query";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { convertDevboxListToSimplified } from "../devbox-method/devbox-utils";
import { getSshConnectionInfo } from "./devbox-old-api";
import { getMonitorData } from "./devbox-old-api";
import { checkReady } from "./devbox-old-api";
import { deleteDevboxRelease as deleteDevboxReleaseOld } from "./devbox-old-api";
import { listFolderFiles } from "./devbox-ssh-api";
import type { DevboxSsh } from "../devbox-schemas/devbox-object-schema";
import type { MetricsApiContext } from "@/lib/sealos/services/metrics/schemas/metrics-api-context-schema";
import { getLaunchPadMetrics } from "@/lib/sealos/services/metrics/metrics-api/launchpad-metrics-api-query";
import {
  extractPodMetricsData,
  filterExternalPods,
  convertMetricsTimeToReadable,
} from "@/lib/sealos/services/metrics/metrics-utils";
import { runParallelAction } from "next-server-actions-parallel";

function createHttpsAgent() {
  const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";
  return new https.Agent({
    keepAlive: true,
    rejectUnauthorized: isDevelopment ? false : true,
  });
}

function createDevboxAxios(context: DevboxApiContext) {
  return axios.create({
    baseURL: `https://devbox.${context.baseUrl}/api/v1/DevBox`,
    headers: {
      "Content-Type": "application/json",
      ...(context.authorization
        ? { Authorization: context.authorization }
        : {}),
    },
    httpsAgent: createHttpsAgent(),
  });
}

// DevBox Lifecycle Management
export async function createDevbox(
  request: DevboxCreateRequest,
  context: DevboxApiContext
): Promise<DevboxCreateResponse> {
  const api = createDevboxAxios(context);
  const response = await api.post("/create", request);
  return DevboxCreateResponseSchema.parse(response.data);
}

export async function updateDevbox(
  request: DevboxUpdateRequest,
  context: DevboxApiContext
): Promise<DevboxUpdateResponse> {
  const api = createDevboxAxios(context);
  const response = await api.put("/", request);
  return DevboxUpdateResponseSchema.parse(response.data);
}

export async function manageDevboxLifecycle(
  request: DevboxLifecycleRequest,
  context: DevboxApiContext
): Promise<DevboxLifecycleResponse> {
  const api = createDevboxAxios(context);
  const response = await api.post("/lifecycle", request);
  return DevboxLifecycleResponseSchema.parse(response.data);
}

export async function shutdownDevbox(
  devboxName: string,
  request: DevboxShutdownRequest,
  context: DevboxApiContext
): Promise<DevboxShutdownResponse> {
  const api = createDevboxAxios(context);
  const response = await api.post(`/devbox/${devboxName}/shutdown`, request);
  return DevboxShutdownResponseSchema.parse(response.data);
}

export async function restartDevbox(
  devboxName: string,
  request: DevboxRestartRequest,
  context: DevboxApiContext
): Promise<DevboxRestartResponse> {
  const api = createDevboxAxios(context);
  const response = await api.post(`/devbox/${devboxName}/restart`, request);
  return DevboxRestartResponseSchema.parse(response.data);
}

export async function deleteDevbox(
  devboxName: string,
  context: DevboxApiContext
): Promise<DevboxDeleteResponse> {
  const api = createDevboxAxios(context);
  const response = await api.delete("/delete", {
    params: { devboxName },
  });
  return DevboxDeleteResponseSchema.parse(response.data);
}

// DevBox Release Management
export async function releaseDevbox(
  devboxName: string,
  request: DevboxReleaseRequest,
  context: DevboxApiContext
): Promise<DevboxReleaseResponse> {
  const api = createDevboxAxios(context);
  const response = await api.post(`/devbox/${devboxName}/release`, request);
  return DevboxReleaseResponseSchema.parse(response.data);
}

export async function getDevboxReleases(
  devboxName: string,
  context: DevboxApiContext
): Promise<DevboxReleasesResponse> {
  const api = createDevboxAxios(context);
  const response = await api.get("/releases", {
    params: { devboxName },
  });
  return DevboxReleasesResponseSchema.parse(response.data);
}

export async function deployDevbox(
  devboxName: string,
  tag: string,
  request: DevboxDeployRequest,
  context: DevboxApiContext
): Promise<DevboxDeployResponse> {
  const api = createDevboxAxios(context);
  const response = await api.post(
    `/devbox/${devboxName}/release/${tag}/deploy`,
    request
  );
  return DevboxDeployResponseSchema.parse(response.data);
}

// DevBox Query Operations
export async function getDevboxList(
  context: DevboxApiContext
): Promise<DevboxListResponse> {
  const api = createDevboxAxios(context);
  const response = await api.get("/list");
  return DevboxListResponseSchema.parse(response.data);
}

export async function getDevboxByName(
  devboxName: string,
  context: DevboxApiContext
): Promise<any> {
  const api = createDevboxAxios(context);
  const response = await api.get("/get", {
    params: { devboxName },
  });
  return response.data;
}

// K8s Operations
export async function getDevbox(
  context: K8sApiContext,
  target: CustomResourceTarget
) {
  return await getDevboxObject(context, target);
}

export async function listDevbox(context: K8sApiContext) {
  const target = CustomResourceTargetSchema.parse(
    convertResourceTypeToTarget("devbox")
  );
  const devboxResourceList = await runParallelAction(
    listCustomResources(context, target)
  );
  return convertDevboxListToSimplified(devboxResourceList.items);
}

// SSH Operations
export async function getDevboxSshInfo(
  context: DevboxApiContext,
  target: CustomResourceTarget
) {
  const sshInfo = await runParallelAction(
    getSshConnectionInfo(context, target.name!)
  );
  return sshInfo.data.token;
}

export async function listDevboxFolderFiles(
  sshConfig: DevboxSsh,
  relativePath: string = ""
) {
  return await listFolderFiles(sshConfig, relativePath);
}

// Metrics Operations
export async function getDevboxInstantMonitor(
  context: MetricsApiContext,
  devboxName: string,
  time?: string
) {
  const currentTime = time || Math.floor(Date.now() / 1000).toString();

  const cpuMetrics = await runParallelAction(
    getLaunchPadMetrics(
      {
        namespace: context.namespace,
        type: "cpu",
        launchPadName: devboxName,
        time: currentTime,
      },
      context
    )
  );

  const memoryMetrics = await runParallelAction(
    getLaunchPadMetrics(
      {
        namespace: context.namespace,
        type: "memory",
        launchPadName: devboxName,
        time: currentTime,
      },
      context
    )
  );

  return extractPodMetricsData({
    cpu: cpuMetrics,
    memory: memoryMetrics,
  });
}

export async function getDevboxRangedMonitor(
  context: MetricsApiContext,
  devboxName: string,
  start?: string,
  end?: string,
  step?: string
) {
  const cpuMetrics = await runParallelAction(
    getLaunchPadMetrics(
      {
        namespace: context.namespace,
        type: "cpu",
        launchPadName: devboxName,
        start,
        end,
        step,
      },
      context
    )
  );

  const memoryMetrics = await runParallelAction(
    getLaunchPadMetrics(
      {
        namespace: context.namespace,
        type: "memory",
        launchPadName: devboxName,
        start,
        end,
        step,
      },
      context
    )
  );

  const rawMetricsData = extractPodMetricsData({
    cpu: cpuMetrics,
    memory: memoryMetrics,
  });

  const filteredData = filterExternalPods(rawMetricsData, devboxName);

  // Convert timestamps to readable format for each pod's metrics
  if (filteredData) {
    const processedData: typeof filteredData = {};

    Object.entries(filteredData).forEach(([podName, podData]) => {
      processedData[podName] = {
        cpu: convertMetricsTimeToReadable(podData.cpu, "yyyy/MM/dd HH:mm"),
        memory: convertMetricsTimeToReadable(
          podData.memory,
          "yyyy/MM/dd HH:mm"
        ),
      };
    });

    return processedData;
  }

  return filteredData;
}

// Monitor Data Operations
export async function getDevboxMonitorData(
  context: DevboxApiContext,
  queryKey: string,
  queryName: string,
  step: string
): Promise<any> {
  return await runParallelAction(
    getMonitorData(context, queryKey, queryName, step)
  );
}

// Check Ready Operations
export async function checkDevboxReady(
  context: DevboxApiContext,
  devboxName: string
): Promise<any> {
  return await runParallelAction(checkReady(context, devboxName));
}

// Delete Devbox Release Operations
export async function deleteDevboxRelease(
  versionName: string,
  context: DevboxApiContext
): Promise<any> {
  return await runParallelAction(deleteDevboxReleaseOld(context, versionName));
}
