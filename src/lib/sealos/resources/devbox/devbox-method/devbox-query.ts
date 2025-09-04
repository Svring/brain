import { queryOptions } from "@tanstack/react-query";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import {
  CustomResourceTarget,
  CustomResourceTargetSchema,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { getDevboxObject } from "@/lib/sealos/services/bridge/bridge-resources/bridge-sealos/devbox/devbox-bridge-query";
import { listCustomResources } from "@/lib/k8s/k8s-api/k8s-api-query";
import { runParallelAction } from "next-server-actions-parallel";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { getSshConnectionInfo } from "@/lib/sealos/resources/devbox/devbox-api/devbox-old-api";
import { DevboxApiContext } from "../devbox-api/devbox-open-api-schemas";
import { getDevboxReleases } from "../devbox-api/devbox-open-api";
import { convertDevboxListToSimplified } from "./devbox-utils";
import { listFolderFiles } from "../devbox-api/devbox-ssh-api";
import type { DevboxSsh } from "../devbox-schemas/devbox-object-schema";
import { getLaunchPadMetrics } from "@/lib/sealos/services/metrics/metrics-api/launchpad-metrics-api-query";
import type { MetricsApiContext } from "@/lib/sealos/services/metrics/schemas/metrics-api-context-schema";
import { extractPodMetricsData } from "@/lib/sealos/services/metrics/metrics-utils";

export const getDevbox = async (
  context: K8sApiContext,
  target: CustomResourceTarget
) => {
  // Test the new composeObjectFromTarget function
  const devboxObject = await getDevboxObject(context, target);
  return devboxObject;
};

export const listDevbox = async (context: K8sApiContext) => {
  const target = CustomResourceTargetSchema.parse(
    convertResourceTypeToTarget("devbox")
  );
  const devboxResourceList = await runParallelAction(
    listCustomResources(context, target)
  );
  return convertDevboxListToSimplified(devboxResourceList.items);
};

export const getDevboxSshInfo = async (
  context: DevboxApiContext,
  target: CustomResourceTarget
) => {
  const sshInfo = await runParallelAction(
    getSshConnectionInfo(context, target.name!)
  );
  return sshInfo.data.token;
};

export const getDevboxReleasesQuery = async (
  context: DevboxApiContext,
  devboxName: string
) => {
  const releases = await runParallelAction(
    getDevboxReleases(devboxName, context)
  );
  return releases;
};

export const listDevboxFolderFilesQuery = async (
  sshConfig: DevboxSsh,
  relativePath: string = ""
) => {
  return await listFolderFiles(sshConfig, relativePath);
};

// ============================================================================
// OPTIONS FUNCTIONS (React Query wrappers)
// ============================================================================

/**
 * Query options for getting a devbox by target
 */
export const getDevboxOptions = (
  context: K8sApiContext,
  target: CustomResourceTarget
) =>
  queryOptions({
    queryKey: ["devbox", target.name],
    queryFn: async () => await getDevbox(context, target),
    enabled:
      !!target.group &&
      !!target.version &&
      !!context.namespace &&
      !!target.plural &&
      !!target.name &&
      !!context.kubeconfig,
  });

/**
 * Query options for listing devboxes
 */
export const listDevboxOptions = (context: K8sApiContext) =>
  queryOptions({
    queryKey: ["devboxes"],
    queryFn: async () => await listDevbox(context),
    enabled: !!context.namespace && !!context.kubeconfig,
    staleTime: 1000 * 30,
  });

/**
 * Query options for getting devbox releases
 */
export const getDevboxReleasesOptions = (
  context: DevboxApiContext,
  devboxName: string
) =>
  queryOptions({
    queryKey: ["devbox", "release", devboxName],
    queryFn: async () => await getDevboxReleasesQuery(context, devboxName),
    enabled: !!devboxName && !!context.baseUrl,
    staleTime: 1000 * 60,
  });

/**
 * Query options for listing devbox folder files
 */
export const listDevboxFolderFilesOptions = (
  sshConfig: DevboxSsh,
  relativePath: string = ""
) =>
  queryOptions({
    queryKey: [
      "devbox",
      "files",
      sshConfig.host,
      sshConfig.workingDir,
      relativePath,
    ],
    queryFn: async () =>
      await listDevboxFolderFilesQuery(sshConfig, relativePath),
    enabled: !!sshConfig.host && !!sshConfig.workingDir,
    staleTime: 1000 * 30, // 30 seconds
  });

// ============================================================================
// DEVOBOX MONITORING OPTIONS FUNCTIONS
// ============================================================================

/**
 * Query options for getting devbox instant monitor data (CPU and memory)
 * Uses launchpad metrics API to query both cpu and memory in the same request
 */
export const getDevboxInstantMonitorOptions = (
  context: MetricsApiContext,
  devboxName: string,
  time?: string
) => {
  const currentTime = time || Math.floor(Date.now() / 1000).toString();

  return queryOptions({
    queryKey: [
      "devbox",
      "monitor",
      "instant",
      context.namespace,
      devboxName,
      currentTime,
    ],
    queryFn: async () => {
      // Query both CPU and memory metrics simultaneously
      const [cpuMetrics, memoryMetrics] = await Promise.all([
        runParallelAction(
          getLaunchPadMetrics(
            {
              namespace: context.namespace,
              type: "cpu",
              launchPadName: devboxName,
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
              launchPadName: devboxName,
              time: currentTime,
            },
            context
          )
        ),
      ]);

      // console.log("cpuMetrics", cpuMetrics);
      // console.log("memoryMetrics", memoryMetrics);

      // Extract values from the metrics response
      const cpuValue = cpuMetrics?.data?.result?.[0]?.value?.[1] || "0";
      const memoryValue = memoryMetrics?.data?.result?.[0]?.value?.[1] || "0";

      // Return simplified format with just the values
      return { cpu: cpuValue, memory: memoryValue };
    },
    enabled: !!context.baseUrl && !!context.namespace && !!devboxName,
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Query options for getting devbox ranged monitor data (CPU and memory over timespan)
 * Uses launchpad metrics API to query both cpu and memory in the same request with time range
 */
export const getDevboxRangedMonitorOptions = (
  context: MetricsApiContext,
  devboxName: string,
  start?: string,
  end?: string,
  step?: string
) => {
  return queryOptions({
    queryKey: [
      "devbox",
      "monitor",
      "ranged",
      context.namespace,
      devboxName,
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
              launchPadName: devboxName,
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
              launchPadName: devboxName,
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
    enabled: !!context.baseUrl && !!context.namespace && !!devboxName,
    staleTime: 1000 * 30, // 30 seconds
  });
};
