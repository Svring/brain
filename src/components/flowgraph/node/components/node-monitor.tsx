"use client";

import React from "react";
import { Activity } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
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

  if (!isMonitorReady) {
    return (
      <div className="p-1 border-2 border-muted-foreground/20 rounded-full cursor-not-allowed opacity-50">
        <Activity className="h-4 w-4 text-theme-gray" />
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="p-1 border-2 border-muted-foreground/20 rounded-full transition-colors cursor-pointer hover:border-muted-foreground/40"
          onClick={(e) => {
            e.stopPropagation();
            diagnoseMonitor();
          }}
        >
          <Activity className={`h-4 w-4 ${color}`} />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm">Click to check usage</p>
      </TooltipContent>
    </Tooltip>
  );
}
