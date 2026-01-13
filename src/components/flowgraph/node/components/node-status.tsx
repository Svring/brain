import { Square } from "lucide-react";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAnalyzeStatus } from "@/hooks/copilot/use-analyze-status";
import { usePodEvents } from "@/hooks/sealos/pod/use-pod-events";
import { usePods } from "@/hooks/sealos/pod/use-pods";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import type { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

interface NodeStatusLightProps {
  target: ResourceTarget;
}

export default function NodeStatus({ target }: NodeStatusLightProps) {
  // Fetch resource status and pods
  const { status = "Pending", resource } = useResourceStatus(target);
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

  // Get status analysis hook
  const { analyzeStatus, isStatusReady } = useAnalyzeStatus(target);

  // Map status to colors (using lowercase keys for comparison)
  const statusColors: { [key: string]: string } = {
    running: "fill-theme-green text-theme-green",
    stopped: "fill-theme-purple text-theme-purple",
    stopping: "fill-theme-purple text-theme-purple",
    shutdown: "fill-theme-purple text-theme-purple",
    error: "fill-theme-red text-theme-red",
    abnormal: "fill-theme-red text-theme-red",
    deleting: "fill-theme-yellow text-theme-yellow",
    restarting: "fill-theme-yellow text-theme-yellow",
    pending: "fill-theme-gray text-theme-gray",
  };

  const normalizedStatus = (status || "Pending").toLowerCase();
  const colorClass =
    statusColors[normalizedStatus] || "fill-theme-gray text-theme-gray";
  const displayStatus =
    normalizedStatus === "stopping"
      ? "Pausing"
      : normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);

  const isRunning = normalizedStatus === "running";
  const isPending = normalizedStatus === "pending";

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
