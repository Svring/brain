"use client";

import React from "react";
import { Activity } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useSendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useResourceMetrics } from "@/hooks/sealos/use-resource-metrics";

interface NodeMonitorProps {
  resource: {
    name: string;
    kind: string;
    type?: string;
    pods?: Array<{ name: string }>;
  };
}

export default function NodeMonitor({ resource }: NodeMonitorProps) {
  const { monitorData, isLoading } = useResourceMetrics(resource);
  const { sendSystemMessage } = useSendSystemMessageMutation();

  // console.log("monitorData", monitorData);

  // Get the latest data point for current values
  const latestData =
    monitorData && Array.isArray(monitorData) && monitorData.length > 0
      ? monitorData[monitorData.length - 3]
      : null;

  // console.log("latestData", latestData);

  // Determine icon color based on monitor values
  const getIconColor = () => {
    if (!latestData) return "text-theme-green";

    const cpuValue = latestData.cpu;
    const memoryValue = latestData.memory;
    const storageValue = latestData.storage || 0;

    // Check if any value exceeds 90%
    if (cpuValue > 90 || memoryValue > 90 || storageValue > 90) {
      return "text-theme-red";
    }

    // Check if any value exceeds 50%
    if (cpuValue > 50 || memoryValue > 50 || storageValue > 50) {
      return "text-theme-yellow";
    }

    return "text-theme-green";
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="p-1 border-2 border-muted-foreground/20 rounded-full cursor-pointer hover:border-muted-foreground/40 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              sendSystemMessage({
                type: "info.combinedMetrics",
                payload: resource,
              });
            }}
          >
            <Activity
              className={`h-4 w-4 ${
                monitorData &&
                Array.isArray(monitorData) &&
                monitorData.length > 0
                  ? getIconColor()
                  : "text-theme-gray"
              }`}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="bg-background-secondary rounded-lg p-2"
        >
          <p className="font-medium">View metrics</p>
          {latestData && (
            <div className="mt-1 text-xs">
              <p>CPU: {latestData.cpu.toFixed(2)}%</p>
              <p>Memory: {latestData.memory.toFixed(2)}%</p>
              {latestData.storage !== undefined && (
                <p>Storage: {latestData.storage.toFixed(2)}%</p>
              )}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
