import { useMemo } from "react";
import { useResourceMetrics } from "./use-resource-metrics";

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
  resource: {
    name: string;
    kind: string;
    type?: string;
    pods?: Array<{ name: string }>;
  };
  thresholds?: {
    low: number;
    medium: number;
    high: number;
  };
}

const DEFAULT_THRESHOLDS = {
  low: 30,
  medium: 70,
  high: 90,
};

const STATUS_COLORS = {
  low: "text-theme-green",
  medium: "text-theme-yellow",
  high: "text-theme-red",
};

const getStatusForValue = (
  value: number,
  thresholds: typeof DEFAULT_THRESHOLDS
): MetricsStatus => {
  if (value >= thresholds.high) return "high";
  if (value >= thresholds.medium) return "medium";
  return "low";
};

const getOverallStatus = (statuses: MetricsStatus[]): MetricsStatus => {
  if (statuses.includes("high")) return "high";
  if (statuses.includes("medium")) return "medium";
  return "low";
};

export const useResourceMetricsStatus = ({
  resource,
  thresholds = DEFAULT_THRESHOLDS,
}: UseResourceMetricsStatusProps): MetricsStatusResult => {
  const { monitorData, isLoading } = useResourceMetrics(resource);

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
    const cpuStatus = getStatusForValue(latestData.cpu, thresholds);
    const memoryStatus = getStatusForValue(latestData.memory, thresholds);
    const storageStatus =
      latestData.storage !== undefined
        ? getStatusForValue(latestData.storage, thresholds)
        : undefined;

    // Calculate overall status
    const statuses = [cpuStatus, memoryStatus];
    if (storageStatus) statuses.push(storageStatus);

    const overallStatus = getOverallStatus(statuses);

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
  }, [monitorData, thresholds]);
};
