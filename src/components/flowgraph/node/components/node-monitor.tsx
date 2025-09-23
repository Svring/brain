"use client";

import React from "react";
import { Activity } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useAnalyzeMonitor } from "@/hooks/copilot/use-analyze-monitor";

import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface NodeMonitorProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export default function NodeMonitor({ target }: NodeMonitorProps) {
  const { diagnoseMonitor, color, isMonitorReady } = useAnalyzeMonitor(target);

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`p-1 border-2 border-muted-foreground/20 rounded-full transition-colors ${
              isMonitorReady
                ? "cursor-pointer hover:border-muted-foreground/40"
                : "cursor-not-allowed opacity-50"
            }`}
            onClick={(e) => {
              if (!isMonitorReady) {
                e.stopPropagation();
                return;
              }
              e.stopPropagation();
              diagnoseMonitor();
            }}
          >
            <Activity
              className={`h-4 w-4 ${
                isMonitorReady ? color : "text-theme-gray"
              }`}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="font-medium">
            {isMonitorReady ? "Check Usage" : "No monitor data available"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
