import React from "react";
import { Square, CircleQuestionMark } from "lucide-react";
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

  // Generate pod status list for tooltip
  const getPodStatus = (containerStatuses: any[]) => {
    if (!containerStatuses?.length)
      return { status: "Unknown", isReady: false };

    const allReady = containerStatuses.every((status) => status.ready);
    if (allReady) return { status: "Running", isReady: true };

    const hasWaiting = containerStatuses.some(
      (status) => status.state?.waiting
    );
    if (hasWaiting) return { status: "Waiting", isReady: false };

    const hasTerminated = containerStatuses.some(
      (status) => status.state?.terminated
    );
    if (hasTerminated) return { status: "Terminated", isReady: false };

    return { status: "Unknown", isReady: false };
  };

  const getPodErrorInfo = (containerStatuses: any[]) => {
    if (!containerStatuses?.length) return null;

    const errorContainer = containerStatuses.find(
      (status) =>
        status.state?.waiting?.reason || status.state?.terminated?.reason
    );

    if (!errorContainer) return null;

    const state =
      errorContainer.state?.waiting || errorContainer.state?.terminated;
    return {
      reason: state?.reason || "Unknown",
      message: state?.message || "No error message available",
    };
  };

  const getPodUptime = (containerStatuses: any[]) => {
    if (!containerStatuses?.length) return "N/A";

    const runningContainer = containerStatuses.find(
      (status) => status.state?.running?.startedAt
    );
    if (!runningContainer?.state?.running?.startedAt) return "N/A";

    const startedAt = new Date(runningContainer.state.running.startedAt);
    const now = new Date();
    const uptimeMs = now.getTime() - startedAt.getTime();

    const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status: string, isReady: boolean) => {
    if (!isReady) return "text-red-400";
    switch (status) {
      case "Running":
        return "text-green-400";
      case "Waiting":
        return "text-yellow-400";
      case "Terminated":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  const getUptimeDisplay = (uptime: string, isReady: boolean) => {
    if (!isReady) return "❓";
    return uptime;
  };

  const podErrorDetails = pods.length
    ? pods
        .map((pod, i) => {
          const errorInfo = getPodErrorInfo(pod.containerStatuses);
          if (!errorInfo) return null;

          return `pod-${i + 1} Error:\nReason: ${errorInfo.reason}\nMessage: ${
            errorInfo.message
          }`;
        })
        .filter(Boolean)
        .join("\n\n")
    : "";

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

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2">
          <Square className={`h-3 w-3 ${colorClass}`} />
          <span className="text-sm">{displayStatus}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-2">
          {pods.length ? (
            pods.map((pod, i) => {
              const statusInfo = getPodStatus(pod.containerStatuses);
              const uptime = getPodUptime(pod.containerStatuses);
              const errorInfo = getPodErrorInfo(pod.containerStatuses);
              const statusColor = getStatusColor(
                statusInfo.status,
                statusInfo.isReady
              );
              const uptimeDisplay = getUptimeDisplay(
                uptime,
                statusInfo.isReady
              );

              return (
                <div key={i} className="font-mono p-1">
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-gray-300 w-12">
                      pod-{i + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-medium ${statusColor}`}>
                        {statusInfo.status}
                      </span>
                      {statusInfo.isReady && statusInfo.status === "Running" ? (
                        <span className="text-xs text-gray-400">
                          ({uptimeDisplay})
                        </span>
                      ) : (
                        !statusInfo.isReady &&
                        errorInfo && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (isStatusReady) {
                                analyzeStatus();
                              }
                            }}
                            disabled={!isStatusReady}
                            className={`transition-colors ${
                              isStatusReady
                                ? "hover:text-yellow-300 cursor-pointer"
                                : "cursor-not-allowed opacity-50"
                            }`}
                          >
                            <CircleQuestionMark className="h-4 w-4 text-yellow-400" />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-gray-400">No pods found</div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
