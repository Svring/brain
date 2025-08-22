import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope, Play } from "lucide-react";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSendMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useResourceMetricsStatus } from "@/hooks/sealos/resource/use-resource-metrics-status";
import { useResourceStart } from "@/hooks/sealos/resource/use-resource-start";

interface DiagnoseNetworkMessageProps {
  payload: CustomResourceTarget | (BuiltinResourceTarget & { pod: any[] });
}

export const DiagnoseNetworkMessageCard: React.FC<
  DiagnoseNetworkMessageProps
> = ({ payload }) => {
  const sendMessageMutation = useSendMessageMutation();

  // Use the resource status hook
  const {
    resource,
    status,
    isLoading: statusLoading,
  } = useResourceStatus(payload);

  // Use the resource metrics status hook
  const metricsStatus = useResourceMetricsStatus({
    target: payload,
  });

  // Use the resource start hook
  const startResource = useResourceStart(resource as any, {
    onSuccess: () => {
      toast.success("Resource started successfully");
    },
    onError: (error) => {
      toast.error("Failed to start resource");
      console.error("Error starting resource:", error);
    },
  });

  // Send monitor data message when it's ready
  useEffect(() => {
    if (
      metricsStatus.monitorData &&
      metricsStatus.monitorData.length > 0 &&
      !metricsStatus.isLoading
    ) {
      sendMessageMutation.mutate([
        {
          role: "assistant",
          content: `Network diagnosis completed for ${payload.resourceType} "${
            payload.name
          }". Here are the monitoring results: ${JSON.stringify(
            metricsStatus.monitorData
          )}`,
        },
      ]);
    }
  }, [
    metricsStatus.monitorData,
    metricsStatus.isLoading,
    payload,
    sendMessageMutation,
  ]);

  console.log("metricsStatus", metricsStatus);

  return (
    <Card className="w-full bg-node-background">
      <CardContent className="">
        {/* Header */}
        <div className="">
          <div className="flex items-center gap-3">
            <Stethoscope className="h-5 w-5 text-theme-blue" />
            <h3 className="text-lg font-semibold text-foreground">
              Network Diagnosis
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {payload.resourceType}: {payload.name}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Diagnostic List */}
          <div className="space-y-3">
            <div className="space-y-2">
              {/* Resource Status */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-theme-green"></div>
                  <span className="text-sm font-medium">Resource Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {statusLoading ? "Loading..." : status || "Unknown"}
                  </span>
                  {status &&
                    ["stopped", "shutdown"].includes(status.toLowerCase()) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-xs"
                        onClick={() => {
                          if (startResource.resourceType === "devbox") {
                            startResource.start({
                              devboxName: payload.name || "",
                              action: "start",
                            });
                          } else if (
                            startResource.resourceType === "launchpad"
                          ) {
                            startResource.start({
                              name: payload.name || "",
                            });
                          } else if (startResource.resourceType === "cluster") {
                            startResource.start(payload.name || "");
                          }
                        }}
                        disabled={startResource.isPending}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                    )}
                </div>
              </div>

              {/* Resource Usage Check */}
              {status &&
                !["stopped", "shutdown"].includes(status.toLowerCase()) && (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          metricsStatus.isLoading
                            ? "bg-theme-yellow"
                            : metricsStatus.status === "high"
                            ? "bg-theme-red"
                            : metricsStatus.status === "medium"
                            ? "bg-theme-yellow"
                            : "bg-theme-green"
                        }`}
                      ></div>
                      <span className="text-sm font-medium">
                        Resource Usage
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {metricsStatus.isLoading
                        ? "Checking resource usage..."
                        : metricsStatus.latestData
                        ? `CPU: ${metricsStatus.latestData.cpu.toFixed(
                            1
                          )}%, Memory: ${metricsStatus.latestData.memory.toFixed(
                            1
                          )}%`
                        : "No data available"}
                    </span>
                  </div>
                )}

              {/* Detailed Metrics Status */}
              {status &&
                !["stopped", "shutdown"].includes(status.toLowerCase()) &&
                metricsStatus.latestData && (
                  <div className="space-y-2">
                    {/* CPU Status */}
                    <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <span className="text-xs text-muted-foreground">CPU</span>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            metricsStatus.cpuStatus === "high"
                              ? "bg-theme-red"
                              : metricsStatus.cpuStatus === "medium"
                              ? "bg-theme-yellow"
                              : "bg-theme-green"
                          }`}
                        ></div>
                        <span className="text-xs">
                          {metricsStatus.latestData.cpu.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Memory Status */}
                    <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <span className="text-xs text-muted-foreground">
                        Memory
                      </span>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            metricsStatus.memoryStatus === "high"
                              ? "bg-theme-red"
                              : metricsStatus.memoryStatus === "medium"
                              ? "bg-theme-yellow"
                              : "bg-theme-green"
                          }`}
                        ></div>
                        <span className="text-xs">
                          {metricsStatus.latestData.memory.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Storage Status (if available) */}
                    {metricsStatus.storageStatus &&
                      metricsStatus.latestData.storage !== undefined && (
                        <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                          <span className="text-xs text-muted-foreground">
                            Storage
                          </span>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                metricsStatus.storageStatus === "high"
                                  ? "bg-theme-red"
                                  : metricsStatus.storageStatus === "medium"
                                  ? "bg-theme-yellow"
                                  : "bg-theme-green"
                              }`}
                            ></div>
                            <span className="text-xs">
                              {metricsStatus.latestData.storage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      )}
                  </div>
                )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiagnoseNetworkMessageCard;
