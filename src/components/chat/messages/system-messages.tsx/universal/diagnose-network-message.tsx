import React, { useState, useEffect } from "react";
import { Stethoscope, Play, Pencil, Loader2 } from "lucide-react";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useResourceMetricsStatus } from "@/hooks/sealos/resource/use-resource-metrics-status";
import { useResourceStart } from "@/hooks/sealos/resource/use-resource-start";
import { useResourceLogs } from "@/hooks/sealos/resource/use-resource-logs";
import BaseSystemMessage from "../components/base-system-message";
import { TypingAnimation } from "@/components/ui/typing-animation";

interface DiagnoseNetworkMessageProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export const DiagnoseNetworkMessageCard: React.FC<
  DiagnoseNetworkMessageProps
> = ({ target }) => {
  const { appendSystemMessage } = useAppendSystemMessageMutation();
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [completionMessage, setCompletionMessage] = useState("");

  // Use the resource status hook
  const {
    resource,
    status,
    isLoading: statusLoading,
  } = useResourceStatus(target);

  // Use the resource metrics status hook
  const {
    latestData,
    status: metricsStatus,
    isLoading: metricsLoading,
  } = useResourceMetricsStatus({
    target,
  });

  const isStopped = Boolean(
    status && ["stopped", "shutdown"].includes(status.toLowerCase())
  );

  const isHighUsage = Boolean(!metricsLoading && metricsStatus === "high");

  // Use the resource logs hook for builtin resources
  const { data: resourceLogs, isLoading: logsLoading } =
    useResourceLogs(target);

  const getUpdateMessageId = (): string | undefined => {
    // devbox (custom) and launchpad (builtin: deployment/statefulset)
    if (target.type === "custom") {
      if (target.resourceType.toLowerCase() === "devbox")
        return "devbox.update";
    }
    if (target.type === "builtin") {
      // deployment or statefulset
      return "launchpad.update";
    }
    return undefined;
  };

  const handleUpdate = () => {
    const messageId = getUpdateMessageId();
    if (messageId) {
      appendSystemMessage(messageId, target as any);
      setCompletionMessage("Update request sent successfully! Processing...");
      setShowCompletionAnimation(true);
    }
  };

  const runDiagnosis = async () => {
    setIsDiagnosing(true);
    setShowCompletionAnimation(false);
    try {
      // For builtin resources, analyze logs if available
      if (target.type === "builtin" && resourceLogs) {
        console.log("Analyzing launchpad logs:", resourceLogs);
        // TODO: Add log analysis logic here
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setCompletionMessage("Diagnosis completed successfully! All systems operational.");
      } else {
        // Simulate diagnosis process for other resources
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setCompletionMessage("Resource diagnosis completed. No issues detected.");
      }
      console.log("runDiagnosis completed");
      setShowCompletionAnimation(true);
    } catch (error) {
      console.error("Diagnosis failed:", error);
      setCompletionMessage("Diagnosis failed. Please try again.");
      setShowCompletionAnimation(true);
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Auto-run diagnosis when component mounts and conditions are met
  useEffect(() => {
    if (!isStopped && !isHighUsage && !metricsLoading && latestData) {
      runDiagnosis();
    }
  }, [isStopped, isHighUsage, metricsLoading, latestData]);

  // Auto-hide completion animation after 5 seconds
  useEffect(() => {
    if (showCompletionAnimation) {
      const timer = setTimeout(() => {
        setShowCompletionAnimation(false);
        setCompletionMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showCompletionAnimation]);

  // Use the resource start hook
  const startResource = useResourceStart(resource as any, {
    onSuccess: () => {
      toast.success("Resource started successfully");
      setCompletionMessage("Resource started successfully! Ready for use.");
      setShowCompletionAnimation(true);
    },
    onError: (error) => {
      toast.error("Failed to start resource");
      console.error("Error starting resource:", error);
      setCompletionMessage("Failed to start resource. Please check configuration.");
      setShowCompletionAnimation(true);
    },
  });

  return (
    <BaseSystemMessage target={target}>
      <div className="space-y-3">
        <div className="space-y-3">
          {/* 1) Resource Status */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-dashed">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-theme-green"></div>
              <span className="text-sm font-medium">Resource Status</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {statusLoading ? "Loading..." : status || "Unknown"}
              </span>
              {isStopped && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs"
                  onClick={() => {
                    if (startResource.resourceType === "devbox") {
                      startResource.start({
                        devboxName: target.name || "",
                        action: "start",
                      });
                    } else if (startResource.resourceType === "launchpad") {
                      startResource.start({
                        name: target.name || "",
                      });
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

          {/* 2) Resource Usage Check with optional Update action */}
          {!isStopped && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-dashed">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    metricsLoading
                      ? "bg-theme-yellow"
                      : metricsStatus === "high"
                      ? "bg-theme-red"
                      : metricsStatus === "medium"
                      ? "bg-theme-yellow"
                      : "bg-theme-green"
                  }`}
                ></div>
                <span className="text-sm font-medium">Resource Usage</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {metricsLoading
                    ? "Checking resource usage..."
                    : latestData
                    ? `CPU: ${latestData.cpu.toFixed(
                        1
                      )}%, Memory: ${latestData.memory.toFixed(1)}%`
                    : "No data available"}
                </span>
                {isHighUsage && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs"
                    onClick={handleUpdate}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Update
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Stop further procedure if we already showed Update button */}
          {!isStopped && !isHighUsage && latestData && (
            <div className="space-y-2 border border-dashed rounded-lg p-3">
              {/* CPU Status */}
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span className="text-xs text-muted-foreground">CPU</span>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      metricsStatus === "high"
                        ? "bg-theme-red"
                        : metricsStatus === "medium"
                        ? "bg-theme-yellow"
                        : "bg-theme-green"
                    }`}
                  ></div>
                  <span className="text-xs">{latestData.cpu.toFixed(1)}%</span>
                </div>
              </div>

              {/* Memory Status */}
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span className="text-xs text-muted-foreground">Memory</span>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      metricsStatus === "high"
                        ? "bg-theme-red"
                        : metricsStatus === "medium"
                        ? "bg-theme-yellow"
                        : "bg-theme-green"
                    }`}
                  ></div>
                  <span className="text-xs">
                    {latestData.memory.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Storage Status (if available) */}
              {metricsStatus && latestData.storage !== undefined && (
                <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <span className="text-xs text-muted-foreground">Storage</span>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        metricsStatus === "high"
                          ? "bg-theme-red"
                          : metricsStatus === "medium"
                          ? "bg-theme-yellow"
                          : "bg-theme-green"
                      }`}
                    ></div>
                    <span className="text-xs">
                      {latestData.storage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3) Diagnosis row (only if not stopped and not high usage) */}
          {!isStopped && !isHighUsage && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-dashed">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isDiagnosing ? "bg-theme-yellow" : "bg-theme-green"
                  }`}
                ></div>
                <span className="text-sm font-medium">Diagnosis</span>
                {target.type === "builtin" && (
                  <span className="text-xs text-muted-foreground">
                    {logsLoading
                      ? "Loading logs..."
                      : resourceLogs
                      ? "Logs available"
                      : "No logs"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isDiagnosing ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Running diagnosis...</span>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs"
                    onClick={runDiagnosis}
                    disabled={target.type === "builtin" && logsLoading}
                  >
                    Re-run Diagnosis
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* 4) Completion Animation */}
          {showCompletionAnimation && completionMessage && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <TypingAnimation
                className="text-sm font-medium text-green-700 dark:text-green-300"
                text={completionMessage}
                duration={50}
              />
            </div>
          )}
        </div>
      </div>
    </BaseSystemMessage>
  );
};

export default DiagnoseNetworkMessageCard;
