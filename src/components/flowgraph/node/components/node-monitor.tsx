"use client";

import React from "react";
import { Activity } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NodeMonitorProps {
  monitorData?: {
    cpu: string;
    memory: string;
    storage?: string;
  };
}

export default function NodeMonitor({ monitorData }: NodeMonitorProps) {
  // Determine icon color based on monitor values
  const getIconColor = () => {
    if (!monitorData) return "text-theme-green";

    const cpuValue = parseFloat(monitorData.cpu);
    const memoryValue = parseFloat(monitorData.memory);
    const storageValue = monitorData.storage
      ? parseFloat(monitorData.storage)
      : 0;

    // Check if any value exceeds 0.9 (90%)
    if (cpuValue > 0.9 || memoryValue > 0.9 || storageValue > 0.9) {
      return "text-theme-red";
    }

    // Check if any value exceeds 0.5 (50%)
    if (cpuValue > 0.5 || memoryValue > 0.5 || storageValue > 0.5) {
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
            }}
          >
            <Activity className={`h-4 w-4 ${getIconColor()}`} />
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="bg-background-secondary rounded-lg p-2"
        >
          <p className="font-medium">View metrics</p>
          {monitorData && (
            <div className="mt-1 text-xs">
              <p>CPU: {monitorData.cpu}</p>
              <p>Memory: {monitorData.memory}</p>
              {monitorData.storage && <p>Storage: {monitorData.storage}</p>}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
