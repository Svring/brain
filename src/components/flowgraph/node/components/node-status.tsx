import React from "react";
import { Square } from "lucide-react";
import type { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { usePodEvents } from "@/hooks/sealos/pod/use-pod-events";
import { usePods } from "@/hooks/sealos/pod/use-pods";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useAnalyzeStatus } from "@/hooks/copilot/use-analyze-status";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NodeStatusLightProps {
  target: ResourceTarget;
}

export default function NodeStatus({ target }: NodeStatusLightProps) {
  // Fetch resource status and pods
  const { status = "Pending" } = useResourceStatus(target);
  const { pods } = usePods({ target });
  const podTargets = pods
    .map((pod) => convertResourceTypeToTarget("pod", pod.name))
    .filter(
      (
        t
      ): t is {
        type: "builtin";
        resourceType: string;
        name?: string | undefined;
        labelSelector?: string | undefined;
      } => t.type === "builtin"
    );

  // console.log("pods", pods);

  // Fetch pod events
  const { eventsRecord } = usePodEvents({
    podTargets,
    enabled: podTargets.length > 0,
  });

  // Get status analysis hook
  const { analyzeStatus, isStatusReady } = useAnalyzeStatus(target);

  // console.log("eventsRecord", eventsRecord);

  // Determine enhanced status
  const getEnhancedStatus = () => {
    if (!podTargets.length) return status;

    for (const { name } of podTargets) {
      const podEvents = eventsRecord[name!];
      if (!podEvents?.length) continue;

      const hasError = podEvents.some(
        (event) => event.type === "Warning" || /Error|Failed/.test(event.reason)
      );
      if (hasError) return "Error";

      const hasRestart = podEvents.some((event) =>
        /Started|Created/.test(event.reason)
      );
      if (hasRestart && status === "Running") return "Restarting";
    }

    return status;
  };

  const enhancedStatus = getEnhancedStatus();


  // Map status to colors
  const statusColors: { [key: string]: string } = {
    Running: "fill-theme-green text-theme-green",
    Stopped: "fill-theme-purple text-theme-purple",
    Stopping: "fill-theme-purple text-theme-purple",
    Shutdown: "fill-theme-purple text-theme-purple",
    Error: "fill-theme-red text-theme-red",
    Abnormal: "fill-theme-red text-theme-red",
    Deleting: "fill-theme-yellow text-theme-yellow",
    Restarting: "fill-theme-yellow text-theme-yellow",
    Pending: "fill-theme-gray text-theme-gray",
  };

  const colorClass =
    statusColors[enhancedStatus] || "fill-theme-gray text-theme-gray";
  const displayStatus =
    enhancedStatus === "Stopping" ? "Pausing" : enhancedStatus;

  const isRunning = enhancedStatus === "Running";

  if (isRunning) {
    return (
      <div className="flex items-center gap-2">
        <Square className={`h-3 w-3 ${colorClass}`} />
        <span className="text-sm">{displayStatus}</span>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className="flex items-center gap-2 border border-dashed border-transparent hover:border-muted-foreground/50 rounded px-1 py-0.5 transition-colors cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isStatusReady) {
              analyzeStatus();
            }
          }}
        >
          <Square className={`h-3 w-3 ${colorClass}`} />
          <span className="text-sm">{displayStatus}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm">Click to analyze status</p>
      </TooltipContent>
    </Tooltip>
  );
}
