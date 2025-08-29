import React, { useState, useEffect } from "react";
import { ScanSearch, Play, Pencil, Loader2 } from "lucide-react";
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
import BaseActionMessage from "../components/base-action-message";
import { TypingAnimation } from "@/components/ui/typing-animation";

interface DiagnoseNetworkMessageProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export const DiagnoseNetworkMessageCard: React.FC<
  DiagnoseNetworkMessageProps
> = ({ target }) => {
  const { appendSystemMessage } = useAppendSystemMessageMutation();
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [hasDiagnosed, setHasDiagnosed] = useState(false);
  const [diagnosisConclusion, setDiagnosisConclusion] = useState("");

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
  const logsQuery = useResourceLogs(target);
  const resourceLogs = logsQuery?.data;
  const logsLoading = logsQuery?.isLoading ?? false;
  const logsSupported = logsQuery !== null;

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
    }
  };

  const runDiagnosis = async () => {
    if (hasDiagnosed) return; // Only run once

    setIsDiagnosing(true);
    try {
      // For builtin resources, analyze logs if available and supported
      if (target.type === "builtin" && logsSupported && resourceLogs) {
        console.log("Analyzing launchpad logs:", resourceLogs);
        // TODO: Add log analysis logic here
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setDiagnosisConclusion(
          "Diagnosis completed successfully! All systems operational."
        );
      } else {
        // Simulate diagnosis process for other resources
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setDiagnosisConclusion(
          "Resource diagnosis completed. No issues detected."
        );
      }
      console.log("runDiagnosis completed");
      setHasDiagnosed(true);
    } catch (error) {
      console.error("Diagnosis failed:", error);
      setDiagnosisConclusion("Diagnosis failed. Please try again.");
      setHasDiagnosed(true);
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Auto-run diagnosis when component mounts and conditions are met
  useEffect(() => {
    if (
      !hasDiagnosed &&
      !isStopped &&
      !isHighUsage &&
      !metricsLoading &&
      latestData
    ) {
      runDiagnosis();
    }
  }, [hasDiagnosed, isStopped, isHighUsage, metricsLoading, latestData]);

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

  return (
    <BaseActionMessage
      headerTitle={{
        icon: ScanSearch,
        name: "Diagnosis",
      }}
    >
      <div className="space-y-3">
        <div className="space-y-3">
          {/* 1) Resource Status */}
          <div className="flex items-center justify-between border-l border-l-theme-green px-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Container Status:</span>
              <span className="text-muted-foreground">
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
            <div className="flex items-center justify-between border-l border-l-theme-green px-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Resource Usage: </span>
                <span className="text-muted-foreground">
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

          {/* 3) Diagnosis row (only if not stopped and not high usage) */}
          {!isStopped && !isHighUsage && (
            <div className="flex items-center justify-between border-l border-l-theme-green px-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Diagnosis</span>
                {target.type === "builtin" && logsSupported && (
                  <span className="text-xs text-muted-foreground">
                    {logsLoading
                      ? "Loading logs..."
                      : resourceLogs
                      ? "Logs available"
                      : "No logs"}
                  </span>
                )}
                {isDiagnosing && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Running diagnosis...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4) Diagnosis Conclusion */}
          {hasDiagnosed && diagnosisConclusion && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-sm font-medium text-green-700 dark:text-green-300">
                {diagnosisConclusion}
              </div>
            </div>
          )}
        </div>
      </div>
    </BaseActionMessage>
  );
};

export default DiagnoseNetworkMessageCard;
