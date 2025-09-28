import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import { useCopy } from "@/hooks/use-copy";

interface StatusChartProps {
  statusData: {
    pods: any[];
    resource: any;
    events: Record<string, any[]>;
  };
  isLoading?: boolean;
}

export const StatusChart: React.FC<StatusChartProps> = ({ 
  statusData, 
  isLoading = false 
}) => {
  const [expandedPods, setExpandedPods] = useState<Set<number>>(new Set());
  const { copyToClipboard, isCopied } = useCopy();

  const displayPods = statusData?.pods || [];
  const displayResource = statusData?.resource || {};
  const displayStatus = displayResource?.status || "Unknown";
  const displayEventsRecord = statusData?.events || {};

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
    const podName = displayPods[podIndex]?.actualName || displayPods[podIndex]?.name;
    const podEvents = displayEventsRecord[podName] || [];
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

  if (isLoading) {
    return (
      <div className="border rounded-lg p-4">
        <div className="text-center py-4 text-gray-500">
          Loading status data...
        </div>
      </div>
    );
  }

  if (!statusData) {
    return (
      <div className="border rounded-lg p-4">
        <div className="text-center py-4 text-muted-foreground">
          No status data available
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 space-y-2">
      {/* Resource Data Analysis Section */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Resource Status Analysis</span>
        <span className="text-xs text-muted-foreground">
          (Status: {displayStatus})
        </span>
      </div>

      {/* Pods Section */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span>Pods Analysis</span>
          <span className="text-xs">({displayPods.length} pods)</span>
        </div>

        {displayPods.length === 0 ? (
          <div className="flex items-center gap-2 p-3 text-center text-muted-foreground border border-dashed rounded">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">No pods found for this resource</span>
          </div>
        ) : (
          displayPods.map((pod: any, podIndex: number) => {
            const podName = pod.actualName || pod.name;
            const podEvents = displayEventsRecord[podName] || [];
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
                    {pod.podName || `pod-${podIndex + 1}`}:
                  </span>
                  <span className="text-sm truncate max-w-64" title={podName}>
                    {podName}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(podName, `pod-${podIndex}`);
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
                  <div className="ml-4">
                    {podEvents.map((event: any, eventIndex: number) => (
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
};

export default StatusChart;
