"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Database,
  AlertCircle,
} from "lucide-react";
import { usePodEvents } from "@/hooks/sealos/pod/use-pod-events";
import { usePods } from "@/hooks/sealos/pod/use-pods";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useCopy } from "@/hooks/use-copy";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface AnalyzeStatusMessageProps {
  target: ResourceTarget;
}

export default function AnalyzeStatusMessage({
  target,
}: AnalyzeStatusMessageProps) {
  const [expandedPods, setExpandedPods] = useState<Set<number>>(new Set());
  const { copyToClipboard, isCopied } = useCopy();

  const { pods } = usePods({ target });
  const { resource, status } = useResourceStatus(target);
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

  const { eventsRecord, isLoading: isEventsLoading } = usePodEvents({
    podTargets,
    enabled: podTargets.length > 0,
  });

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getReasonColor = (type: string) => {
    switch (type) {
      case "Warning":
        return "text-theme-yellow";
      case "Normal":
        return "text-theme-green";
      case "Error":
        return "text-theme-red";
      default:
        return "text-theme-gray";
    }
  };

  const togglePodExpansion = (podIndex: number) => {
    const podEvents = eventsRecord[pods[podIndex]?.name] || [];
    if (podEvents.length === 0) return; // Don't allow expansion if no events

    setExpandedPods((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(podIndex)) {
        newSet.delete(podIndex);
      } else {
        newSet.add(podIndex);
      }
      return newSet;
    });
  };

  return (
    <div className="p-2 space-y-2 border rounded-lg">
      {/* Resource Data Analysis Section */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Resource Status Analysis</span>
        <span className="text-xs text-muted-foreground">
          (Status: {status || "Unknown"})
        </span>
      </div>

      {/* Pods Section */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span>Pods Analysis</span>
          <span className="text-xs">({pods.length} pods)</span>
        </div>

        {pods.length === 0 ? (
          <div className="flex items-center gap-2 p-3 text-center text-muted-foreground border border-dashed rounded">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">No pods found for this resource</span>
          </div>
        ) : (
          pods.map((pod, podIndex) => {
            const podEvents = eventsRecord[pod.name] || [];
            const isExpanded = expandedPods.has(podIndex);
            const hasEvents = podEvents.length > 0;

            return (
              <div key={podIndex} className="space-y-1">
                <button
                  onClick={() => togglePodExpansion(podIndex)}
                  disabled={!hasEvents}
                  className={`flex items-center gap-2 w-full text-left ${
                    hasEvents
                      ? "cursor-pointer"
                      : "cursor-not-allowed opacity-50"
                  }`}
                >
                  {hasEvents ? (
                    isExpanded ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )
                  ) : (
                    <ChevronRight className="h-3 w-3 opacity-50" />
                  )}
                  <span className="font-mono text-sm font-medium">
                    pod-{podIndex + 1}:
                  </span>
                  <span className="text-sm truncate max-w-64" title={pod.name}>
                    {pod.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(pod.name, `pod-${podIndex}`);
                    }}
                    className="p-1 rounded cursor-pointer"
                    title="Copy pod name"
                  >
                    {isCopied(`pod-${podIndex}`) ? (
                      <Check className="h-3 w-3 text-theme-green" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                  {hasEvents && (
                    <span className="text-sm text-theme-gray">
                      ({podEvents.length} events)
                    </span>
                  )}
                </button>

                {isExpanded && hasEvents && (
                  <div className="ml-4 ">
                    {podEvents.map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className="p-2 space-y-1 border-b border-dashed"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-mono ${getReasonColor(
                              event.type
                            )}`}
                          >
                            {event.reason}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            (count: {event.count})
                          </span>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {formatTimestamp(event.lastTimestamp)}
                        </div>

                        <div className="text-sm">{event.message}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
