import React from "react";
import { Cpu, MemoryStick, HardDrive } from "lucide-react";
import NodeMonitor from "@/components/flowgraph/node/components/node-monitor";

type MetricType = "cpu" | "memory" | "storage";

interface MetricRowProps {
  metric: MetricType;
  resource?: any;
  monitorData?: Record<
    string,
    {
      cpu: Array<[string, string]>;
      memory: Array<[string, string]>;
      storage?: Array<[string, string]>;
    }
  >;
  isLoading?: boolean;
  color?: string;
}

export const MetricRow: React.FC<MetricRowProps> = ({
  metric,
  resource,
  monitorData,
  isLoading = false,
  color,
}) => {
  const Icon = metric === "cpu" ? Cpu : metric === "memory" ? MemoryStick : HardDrive;
  const label = metric === "cpu" ? "CPU" : metric === "memory" ? "Memory" : "Storage";
  const defaultColor =
    metric === "cpu"
      ? "hsl(var(--chart-1))"
      : metric === "memory"
      ? "hsl(var(--chart-2))"
      : "hsl(var(--chart-3))";

  const resourceValue = (() => {
    if (!resource) return "N/A";
    if (metric === "cpu") return `${resource.cpu ?? "N/A"}m`;
    if (metric === "memory") return `${resource.memory ?? "N/A"}MB`;
    return resource.storage ?? "N/A";
  })();

  const normalizeMonitorData = (data: Array<[string, string]>): Array<[string, string]> => {
    return data.map(([timestamp, value]) => [timestamp, (parseFloat(value) / 100).toString()]);
  };

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-16 text-xs text-muted-foreground">
          Loading...
        </div>
      );
    }

    if (!monitorData || Object.keys(monitorData).length === 0) {
      return (
        <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
          No {label} data
        </div>
      );
    }

    const podNames = Object.keys(monitorData);
    const firstPod = podNames[0];
    const rawData = (monitorData[firstPod]?.[metric] || []) as Array<[string, string]>;
    const normalizedData = normalizeMonitorData(rawData);

    return (
      <div className="h-32">
        <NodeMonitor data={normalizedData} label={label} color={color || defaultColor} showTimespan={true} />
      </div>
    );
  };

  return (
    <div className="grid grid-cols-5 gap-4 items-center">
      <div className="col-span-1 flex flex-col items-center gap-1 text-center">
        <Icon className="w-4 h-4" />
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className="text-sm font-medium">{resourceValue}</div>
      </div>

      <div className="col-span-4">{renderChart()}</div>
    </div>
  );
};

export default MetricRow;


