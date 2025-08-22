import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { createSealosContext } from "@/lib/auth/auth-utils";
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

interface MetricsStatusResult {
  status: MetricsStatus;
  color: string;
  cpuStatus: MetricsStatus;
  memoryStatus: MetricsStatus;
  storageStatus?: MetricsStatus;
  latestData?: MetricsDataPoint;
  monitorData?: MetricsDataPoint[];
  isLoading: boolean;
}

interface UseResourceMetricsStatusProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

const THRESHOLDS = {
  low: 30,
  medium: 50,
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

export const useResourceMetricsStatus = ({
  target,
}: UseResourceMetricsStatusProps): MetricsStatusResult => {
  const sealosContext = createSealosContext();
  const { devbox, cluster, launchpad } = useTRPCClients();

  // Get the resource using useResourceStatus
  const { resource, isLoading: isResourceLoading } = useResourceStatus(target);

  // console.log("resource", resource);
  // console.log("isResourceLoading", isResourceLoading);

  // Fetch monitor data based on resource kind
  const { data: devboxMonitorData } = useQuery({
    ...devbox.getDevboxCombinedMonitorData.queryOptions({
      devboxName: (resource as DevboxObject)?.pods?.[0]?.name || "",
    }),
    enabled:
      !isResourceLoading &&
      target.resourceType.toLowerCase() === "devbox" &&
      !!(resource as DevboxObject)?.pods?.[0]?.name,
  });

  // console.log("devboxMonitorData", devboxMonitorData);

  const { data: clusterMonitorData } = useQuery({
    ...cluster.getClusterCombinedMonitorData.queryOptions({
      dbName: target.name || "",
      dbType: (resource as ClusterObject).type,
    }),
    enabled:
      !isResourceLoading && target.resourceType.toLowerCase() === "cluster",
  });

  // console.log("clusterMonitorData", clusterMonitorData);

  const { data: launchpadMonitorData } = useQuery({
    ...launchpad.getLaunchpadCombinedMonitorData.queryOptions({
      queryName: (resource as LaunchpadObject)?.pods?.[0]?.name || "",
    }),
    enabled:
      !isResourceLoading &&
      (target.resourceType.toLowerCase() === "deployment" ||
        target.resourceType.toLowerCase() === "statefulset"),
  });

  // console.log("launchpadMonitorData", launchpadMonitorData);

  // Get the appropriate monitor data based on resource type
  const getMonitorData = (): MetricsDataPoint[] | undefined => {
    const resourceType = target.resourceType.toLowerCase();

    if (resourceType === "devbox") {
      return devboxMonitorData as MetricsDataPoint[] | undefined;
    } else if (resourceType === "cluster" && _.isObject(clusterMonitorData)) {
      // Extract the first key's value from cluster monitor data
      const firstKey = _.first(_.keys(clusterMonitorData));
      return firstKey
        ? (_.get(clusterMonitorData, firstKey) as
            | MetricsDataPoint[]
            | undefined)
        : undefined;
    } else if (_.includes(["deployment", "statefulset"], resourceType)) {
      return launchpadMonitorData as MetricsDataPoint[] | undefined;
    }

    return undefined;
  };

  const monitorData = getMonitorData();

  // Determine loading state
  const isLoading =
    (target.resourceType.toLowerCase() === "devbox" && !devboxMonitorData) ||
    (target.resourceType.toLowerCase() === "cluster" && !clusterMonitorData) ||
    (_.includes(
      ["deployment", "statefulset"],
      target.resourceType.toLowerCase()
    ) &&
      !launchpadMonitorData);

  console.log("monitorData", monitorData);

  return useMemo(() => {
    if (
      !monitorData ||
      !Array.isArray(monitorData) ||
      monitorData.length === 0
    ) {
      return {
        status: "low",
        color: STATUS_COLORS.low,
        cpuStatus: "low",
        memoryStatus: "low",
        storageStatus: undefined,
        latestData: undefined,
        monitorData,
        isLoading,
      };
    }

    // Get the latest data point (using the same logic as in node-monitor.tsx)
    const latestData =
      monitorData[monitorData.length - 3] ||
      monitorData[monitorData.length - 1];

    if (!latestData) {
      return {
        status: "low",
        color: STATUS_COLORS.low,
        cpuStatus: "low",
        memoryStatus: "low",
        storageStatus: undefined,
        latestData: undefined,
        monitorData,
        isLoading,
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

    // console.log("latestData", latestData);

    return {
      status: overallStatus,
      color: STATUS_COLORS[overallStatus],
      cpuStatus,
      memoryStatus,
      storageStatus,
      latestData,
      monitorData,
      isLoading,
    };
  }, [monitorData, isLoading]);
};
