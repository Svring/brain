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
import { useResourceMetricsStatus } from "@/hooks/sealos/resource/use-resource-metrics-status";

interface NodeMonitorProps {
  resource: {
    name: string;
    kind: string;
    type?: string;
    pods?: Array<{ name: string }>;
  };
}

export default function NodeMonitor({ resource }: NodeMonitorProps) {
  const { sendSystemMessage } = useSendSystemMessageMutation();
  const { color, latestData, monitorData } = useResourceMetricsStatus({
    resource,
  });

  // console.log("monitorData", monitorData);
  // console.log("latestData", latestData);

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
                  ? color
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
