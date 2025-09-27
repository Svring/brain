"use client";

import React, { useState, useMemo } from "react";
import { FileText, ExternalLink, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LazyLog } from "@melloware/react-logviewer";
import { usePods } from "@/hooks/sealos/pod/use-pods";
import { usePodLogs } from "@/hooks/sealos/pod/use-pod-logs";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ResourceLogProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

const LogMessage: React.FC<ResourceLogProps> = ({ target }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPodName, setSelectedPodName] = useState<string | null>(null);

  // Get all pods for the target
  const {
    pods,
    isLoading: isPodsLoading,
    error: podsError,
  } = usePods({ target });

  // Extract pod names
  const podNames = useMemo(() => {
    return pods.map((pod) => pod.name);
  }, [pods]);

  // Get logs for all pods
  const {
    logsRecord,
    isLoading: isLogsLoading,
    error: logsError,
  } = usePodLogs({
    podNames,
    options: {
      tailLines: 100, // Get more lines for better display
      timestamps: true,
    },
    enabled: podNames.length > 0,
  });

  // Combine all logs from all pods
  const allLogs = useMemo(() => {
    const combinedLogs: string[] = [];

    podNames.forEach((podName) => {
      const podLogs = logsRecord[podName];
      if (podLogs?.logs) {
        const lines = podLogs.logs.split("\n").filter((line) => line.trim());
        lines.forEach((line) => {
          combinedLogs.push(`[${podName}] ${line}`);
        });
      }
    });

    return combinedLogs;
  }, [logsRecord, podNames]);

  // Get first 5 lines for truncated display
  const firstFiveLines = useMemo(() => {
    return allLogs.slice(0, 5);
  }, [allLogs]);

  const isLoading = isPodsLoading || isLogsLoading;
  const hasError = podsError || logsError;
  const hasLogs = allLogs.length > 0;

  const handleLogPanelClick = () => {
    if (hasLogs) {
      setIsDialogOpen(true);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedPodName(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 border rounded-lg bg-muted/50">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading logs...
        </span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center p-4 border rounded-lg bg-destructive/10">
        <FileText className="h-4 w-4 text-destructive" />
        <span className="ml-2 text-sm text-destructive">
          Error loading logs
        </span>
      </div>
    );
  }

  if (!hasLogs) {
    return (
      <div className="flex items-center justify-center p-4 border rounded-lg bg-muted/50">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          No logs available
        </span>
      </div>
    );
  }

  return (
    <>
      <div
        className={`border rounded-lg p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
          hasLogs ? "hover:border-primary/50" : "cursor-not-allowed"
        }`}
        onClick={handleLogPanelClick}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Resource Logs</span>
          </div>
          {hasLogs && (
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          )}
        </div>

        <div className="space-y-1">
          {firstFiveLines.map((line, index) => (
            <div
              key={index}
              className="text-xs font-mono text-muted-foreground truncate"
              title={line}
            >
              {line}
            </div>
          ))}
          {allLogs.length > 5 && (
            <div className="text-xs text-muted-foreground italic">
              ... and {allLogs.length - 5} more lines
            </div>
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent
          className="h-[90vh] max-h-none max-w-none w-[90vw] p-1!"
          hideCloseButton={true}
        >
          <VisuallyHidden>
            <DialogHeader>
              <DialogTitle className=""></DialogTitle>
            </DialogHeader>
          </VisuallyHidden>
          <div className="flex-1 min-h-0">
            <div className="border rounded-lg w-full h-full">
              <LazyLog
                text={allLogs.join("\n")}
                follow={false}
                selectableLines={true}
                enableSearch={true}
                caseInsensitive={true}
                lineHeight={20}
                style={{
                  height: "100%",
                  fontSize: "12px",
                  fontFamily:
                    'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LogMessage;
