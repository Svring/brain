import React from "react";
import { Badge } from "@/components/ui/badge";
import { Square, Container } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useResourceMetricsStatus } from "@/hooks/sealos/resource/use-resource-metrics-status";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Pod } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { ContainerStatus } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/pod-schemas";
import { inferStatusColor } from "@/lib/sealos/sealos-utils";
import BaseSystemMessage from "@/components/chat/messages/system-messages.tsx/components/base-system-message";
import { CombinedMetricsChart } from "@/components/chat/messages/system-messages.tsx/components/combined-metrics-chart";

interface PodDetailsProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export default function PodDetail({ target: payload }: PodDetailsProps) {
  const {
    resource,
    isLoading: isResourceLoading,
    error,
  } = useResourceStatus(payload);
  const { podMetricsList, isLoading: isMetricsLoading } =
    useResourceMetricsStatus({
      target: payload,
    });

  // Extract pods from resource based on resource type
  const getPodList = (): Pod[] => {
    if (!resource) return [];

    // Handle different resource types
    if ("pods" in resource && resource.pods) {
      return resource.pods as Pod[];
    }

    // For resources that don't have pods, return empty array
    return [];
  };

  const podList = getPodList();
  const isLoading = isResourceLoading || isMetricsLoading;

  // Handle loading state
  if (isLoading) {
    return (
      <BaseSystemMessage
        headerTitle={{
          icon: Container,
          name: "Pod Details",
        }}
      >
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Loading pod details...
          </p>
        </div>
      </BaseSystemMessage>
    );
  }

  // Handle error state
  if (error) {
    return (
      <BaseSystemMessage
        headerTitle={{
          icon: Container,
          name: "Pod Details",
        }}
      >
        <div className="text-center py-4">
          <p className="text-sm text-theme-red">Failed to load pod details</p>
        </div>
      </BaseSystemMessage>
    );
  }

  return (
    <BaseSystemMessage
      headerTitle={{
        icon: Container,
        name: "Pod Details",
      }}
    >
      {podList && podList.length > 0 ? (
        <div className="space-y-6">
          {podList.map((pod, index) => {
            // Find corresponding metrics data for this pod
            const podMetrics = podMetricsList.find(
              (metrics) => metrics.podName === pod.name
            );

            return (
              <div
                key={index}
                className="border border-border-primary rounded-lg p-4 space-y-4"
              >
                {/* Pod Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm">Pod: {pod.name}</h3>
                    <Badge
                      variant="outline"
                      className={inferStatusColor(pod.status, "border")}
                    >
                      {pod.status}
                    </Badge>
                  </div>
                  {pod.upTime && (
                    <span className="text-xs text-muted-foreground">
                      {pod.upTime}
                    </span>
                  )}
                </div>

                {/* Container Squares */}
                {pod.containers && pod.containers.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Containers:
                    </h4>
                    <div className="flex items-center gap-1">
                      {(pod.containers as ContainerStatus[]).map(
                        (container, containerIndex) => {
                          // Determine container status for color
                          let containerStatus = "unknown";
                          if (container.state?.running) {
                            containerStatus = "running";
                          } else if (container.state?.waiting) {
                            containerStatus = "pending";
                          } else if (container.state?.terminated) {
                            containerStatus = "error";
                          }

                          return (
                            <TooltipProvider key={containerIndex}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="group relative">
                                    <Square
                                      className={`h-4 w-4 fill-current ${inferStatusColor(
                                        containerStatus,
                                        "text"
                                      )}`}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  className="bg-background-secondary"
                                >
                                  <div className="text-sm">
                                    <div className="font-medium">
                                      {container.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {containerStatus}
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}

                {/* Metrics Chart */}
                {podMetrics && podMetrics.data && podMetrics.data.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Metrics:
                    </h4>
                    <div className="border rounded-lg p-3">
                      <CombinedMetricsChart
                        data={podMetrics.data}
                        isLoading={false}
                        height="h-32"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Metrics:
                    </h4>
                    <div className="text-center py-4 border rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        No metrics data available for this pod
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">No pods available</p>
        </div>
      )}
    </BaseSystemMessage>
  );
}
