import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useSealosContext } from "@/lib/auth/auth-utils";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "./use-resource-status";
import _ from "lodash";
import { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { LaunchpadObject } from "@/lib/sealos/resources/launchpad/launchpad-object-schema";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";

export type MetricsStatus = "low" | "medium" | "high";

interface MetricsDataPoint {
  timestamp: number;
  readableTime: string;
  cpu: number;
  memory: number;
  storage?: number;
}

interface PodMetricsData {
  podName: string;
  data: MetricsDataPoint[];
}

interface MetricsStatusResult {
  status: MetricsStatus;
  color: string;
  cpuStatus: MetricsStatus;
  memoryStatus: MetricsStatus;
  storageStatus?: MetricsStatus;
  latestData?: MetricsDataPoint;
  monitorData?: MetricsDataPoint[];
  isLoading: boolean;
  podMetricsList: PodMetricsData[];
}

interface UseResourceMetricsStatusProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

const THRESHOLDS = {
  low: 30,
  medium: 75,
  high: 90,
};

const STATUS_COLORS = {
  low: "text-theme-green",
  medium: "text-theme-yellow",
  high: "text-theme-red",
};

const getStatusForValue = (value: number): MetricsStatus => {
  if (value >= THRESHOLDS.high) return "high";
  if (value >= THRESHOLDS.medium) return "medium";
  return "low";
};

const getOverallStatus = (statuses: MetricsStatus[]): MetricsStatus => {
  if (statuses.includes("high")) return "high";
  if (statuses.includes("medium")) return "medium";
  return "low";
};

// Helper function to extract pod names from different resource types
const extractPodNames = (resource: any, resourceType: string): string[] => {
  if (!resource?.pods || !Array.isArray(resource.pods)) {
    return [];
  }

  return resource.pods.map((pod: any) => pod.name).filter(Boolean);
};

export const useResourceMetricsStatus = ({
  target,
}: UseResourceMetricsStatusProps): MetricsStatusResult => {
  const { devbox, cluster, launchpad } = useTRPCClients();

  // Get the resource using useResourceStatus
  const { resource, isLoading: isResourceLoading } = useResourceStatus(target);

  // console.log("resource", resource);

  // Extract all pod names from the resource
  const podNames = useMemo(() => {
    if (!resource) return [];
    return extractPodNames(resource, target.resourceType.toLowerCase());
  }, [resource, target.resourceType]);

  // Fetch monitor data for cluster
  const { data: clusterMonitorData } = useQuery({
    ...cluster.combinedMonitor.queryOptions({
      dbName: target.name || "",
      dbType: (resource as ClusterObject)?.type || "",
    }),
    enabled:
      !isResourceLoading &&
      target.resourceType.toLowerCase() === "cluster" &&
      !!(resource as ClusterObject)?.type,
  });

  // For devbox and launchpad, we'll use a single query approach to avoid hooks violations
  // We'll fetch data for the first pod only and handle multiple pods differently
  const firstPodName = podNames[0];

  // Fetch monitor data for first devbox pod
  const { data: devboxMonitorData, isLoading: isDevboxLoading } = useQuery({
    ...devbox.monitor.queryOptions({
      devboxName: firstPodName || "",
    }),
    enabled:
      !isResourceLoading &&
      target.resourceType.toLowerCase() === "devbox" &&
      !!firstPodName,
  });

  // Fetch monitor data for first launchpad pod
  const { data: launchpadMonitorData, isLoading: isLaunchpadLoading } =
    useQuery({
      ...launchpad.combinedMonitor.queryOptions({
        queryName: firstPodName || "",
      }),
      enabled:
        !isResourceLoading &&
        (target.resourceType.toLowerCase() === "deployment" ||
          target.resourceType.toLowerCase() === "statefulset") &&
        !!firstPodName,
    });

  // Combine all monitor data into a list
  const podMetricsList = useMemo((): PodMetricsData[] => {
    const resourceType = target.resourceType.toLowerCase();

    if (
      resourceType === "devbox" &&
      devboxMonitorData &&
      Array.isArray(devboxMonitorData)
    ) {
      return [{ podName: firstPodName || "devbox", data: devboxMonitorData }];
    } else if (resourceType === "cluster" && _.isObject(clusterMonitorData)) {
      // For cluster, extract data from the first key
      const firstKey = _.first(_.keys(clusterMonitorData));
      const clusterData = firstKey
        ? (_.get(clusterMonitorData, firstKey) as
            | MetricsDataPoint[]
            | undefined)
        : undefined;

      return clusterData && Array.isArray(clusterData)
        ? [{ podName: target.name || "cluster", data: clusterData }]
        : [];
    } else if (
      _.includes(["deployment", "statefulset"], resourceType) &&
      launchpadMonitorData &&
      Array.isArray(launchpadMonitorData)
    ) {
      return [
        { podName: firstPodName || "launchpad", data: launchpadMonitorData },
      ];
    }

    return [];
  }, [
    target.resourceType,
    target.name,
    firstPodName,
    devboxMonitorData,
    clusterMonitorData,
    launchpadMonitorData,
  ]);

  // Determine loading state
  const isLoading = useMemo(() => {
    const resourceType = target.resourceType.toLowerCase();

    if (resourceType === "devbox") {
      return isDevboxLoading;
    } else if (resourceType === "cluster") {
      return !clusterMonitorData;
    } else if (_.includes(["deployment", "statefulset"], resourceType)) {
      return isLaunchpadLoading;
    }

    return false;
  }, [
    target.resourceType,
    isDevboxLoading,
    clusterMonitorData,
    isLaunchpadLoading,
  ]);

  // Calculate overall metrics status from all pods
  return useMemo(() => {
    if (podMetricsList.length === 0) {
      return {
        status: "low",
        color: STATUS_COLORS.low,
        cpuStatus: "low",
        memoryStatus: "low",
        storageStatus: undefined,
        latestData: undefined,
        monitorData: undefined,
        isLoading,
        podMetricsList: [],
      };
    }

    // Aggregate data from all pods
    const allDataPoints: MetricsDataPoint[] = [];
    podMetricsList.forEach((podMetrics) => {
      if (podMetrics.data && Array.isArray(podMetrics.data)) {
        allDataPoints.push(...podMetrics.data);
      }
    });

    if (allDataPoints.length === 0) {
      return {
        status: "low",
        color: STATUS_COLORS.low,
        cpuStatus: "low",
        memoryStatus: "low",
        storageStatus: undefined,
        latestData: undefined,
        monitorData: allDataPoints,
        isLoading,
        podMetricsList,
      };
    }

    // Get the latest data point from all pods combined
    const latestData =
      allDataPoints[allDataPoints.length - 3] ||
      allDataPoints[allDataPoints.length - 1];

    if (!latestData) {
      return {
        status: "low",
        color: STATUS_COLORS.low,
        cpuStatus: "low",
        memoryStatus: "low",
        storageStatus: undefined,
        latestData: undefined,
        monitorData: allDataPoints,
        isLoading,
        podMetricsList,
      };
    }

    // Calculate individual statuses
    const cpuStatus = getStatusForValue(latestData.cpu);
    const memoryStatus = getStatusForValue(latestData.memory);
    const storageStatus =
      latestData.storage !== undefined
        ? getStatusForValue(latestData.storage)
        : undefined;

    // Calculate overall status
    const statuses = [cpuStatus, memoryStatus];
    if (storageStatus) statuses.push(storageStatus);

    const overallStatus = getOverallStatus(statuses);

    // console.log("allDataPoints", allDataPoints);
    // console.log("podMetricsList", podMetricsList);

    return {
      status: overallStatus,
      color: STATUS_COLORS[overallStatus],
      cpuStatus,
      memoryStatus,
      storageStatus,
      latestData,
      monitorData: allDataPoints,
      isLoading,
      podMetricsList,
    };
  }, [podMetricsList, isLoading]);
};
