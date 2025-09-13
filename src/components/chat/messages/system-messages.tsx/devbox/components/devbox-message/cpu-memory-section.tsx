"use client";

import React from "react";
import { Cpu, MemoryStick } from "lucide-react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useResourceMetricsStatus } from "@/hooks/sealos/resource/use-resource-metrics-status";
import { MonitorChart } from "../../../components/monitor-chart";

interface CpuMemorySectionProps {
  target: CustomResourceTarget;
  onSectionClick: () => void;
}

// CPU/Memory Popover Content Component
export const CpuMemoryPopoverContent: React.FC<{
  target: CustomResourceTarget;
}> = ({ target }) => {
  return (
    <div className="w-full rounded-lg">
      <MonitorChart target={target} />
    </div>
  );
};

export const CpuMemorySection: React.FC<CpuMemorySectionProps> = ({
  target,
  onSectionClick,
}) => {
  const { resource: devboxObject } = useResourceStatus(target);
  const { latestData, isLoading: isMetricsLoading } = useResourceMetricsStatus({
    target,
  });

  // Get real-time usage from metrics
  const cpuUsage = latestData?.cpu || 0;
  const memoryUsage = latestData?.memory || 0;

  return (
    <div
      className="p-2 border rounded-lg cursor-pointer hover:bg-background-secondary transition-colors"
      onClick={onSectionClick}
    >
      <div className="flex gap-2">
        {/* CPU */}
        <div className="flex-1 flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          <div className="flex flex-col">
            <span className="font-medium text-sm">CPU</span>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Load</span>
              <span
                className="text-xs font-mono font-semibold"
                style={{ color: "hsl(var(--chart-1))" }}
              >
                {isMetricsLoading ? "..." : `${cpuUsage.toFixed(1)}%`}
              </span>
            </div>
          </div>
        </div>

        {/* Memory */}
        <div className="flex-1 flex items-center gap-2">
          <MemoryStick
            className="h-5 w-5"
            style={{ color: "hsl(var(--chart-2))" }}
          />
          <div className="flex flex-col">
            <span className="font-medium text-sm">Memory</span>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Load</span>
              <span
                className="text-xs font-mono font-semibold"
                style={{ color: "hsl(var(--chart-2))" }}
              >
                {isMetricsLoading ? "..." : `${memoryUsage.toFixed(1)}%`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CpuMemorySection;
