import { LazyLog } from "@melloware/react-logviewer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ExternalLink, FileText, Loader2 } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LogChartProps {
  logsData: any;
  isLoading?: boolean;
}

export const LogChart: React.FC<LogChartProps> = ({
  logsData,
  isLoading = false,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Process logs data into display format
  const allLogs = useMemo(() => {
    if (!logsData) return [];

    const combinedLogs: string[] = [];

    // Handle different payload formats
    if (typeof logsData === "object" && logsData !== null) {
      // Check if it's an array of structured log objects
      if (Array.isArray(logsData)) {
        logsData.forEach((logEntry: any) => {
          if (logEntry._time && logEntry._msg) {
            // Format structured log entry
            const timestamp = new Date(logEntry._time).toLocaleString();
            const podInfo = logEntry.pod ? `[${logEntry.pod}]` : "";
            const containerInfo = logEntry.container
              ? `[${logEntry.container}]`
              : "";
            const streamInfo = logEntry.stream ? `[${logEntry.stream}]` : "";
            combinedLogs.push(
              `${timestamp} ${podInfo}${containerInfo}${streamInfo} ${logEntry._msg}`
            );
          }
        });
      } else if (logsData.data) {
        // Handle the new data structure with pod-specific logs
        Object.keys(logsData.data).forEach((podName) => {
          const podData = logsData.data[podName];
          if (podData?.logs?.runtimeLog) {
            podData.logs.runtimeLog.forEach((runtimeLog: any) => {
              if (runtimeLog.logs && Array.isArray(runtimeLog.logs)) {
                runtimeLog.logs.forEach((logEntry: any) => {
                  if (logEntry.timestamp && logEntry.content) {
                    const timestamp = new Date(
                      logEntry.timestamp
                    ).toLocaleString();
                    const level = logEntry.level ? `[${logEntry.level}]` : "";
                    combinedLogs.push(
                      `${timestamp} [${podName}]${level} ${logEntry.content}`
                    );
                  }
                });
              }
            });
          }
        });
      } else {
        // If logsData has logs structure similar to logsRecord
        Object.keys(logsData).forEach((podName) => {
          const podLogs = logsData[podName];
          if (podLogs?.logs) {
            const lines = podLogs.logs
              .split("\n")
              .filter((line: string) => line.trim());
            lines.forEach((line: string) => {
              combinedLogs.push(`[${podName}] ${line}`);
            });
          } else if (typeof podLogs === "string") {
            // If it's just a string of logs
            const lines = podLogs
              .split("\n")
              .filter((line: string) => line.trim());
            lines.forEach((line: string) => {
              combinedLogs.push(`[${podName}] ${line}`);
            });
          }
        });
      }
    }

    return combinedLogs;
  }, [logsData]);

  // Get first 5 lines for truncated display
  const firstFiveLines = useMemo(() => {
    return allLogs.slice(0, 5);
  }, [allLogs]);

  const hasLogs = allLogs.length > 0;

  const handleLogPanelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("LogChart clicked, hasLogs:", hasLogs);
    if (hasLogs) {
      setIsDialogOpen(true);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
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

  if (!logsData || !hasLogs) {
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
        className={`border rounded-lg p-3 cursor-pointer transition-colors hover:bg-muted/50 w-full ${
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

        <div className="space-y-1 w-full">
          {firstFiveLines.map((line, index) => (
            <div
              key={index}
              className="text-xs font-mono text-muted-foreground truncate w-full"
              title={line}
            >
              {line}
            </div>
          ))}
          {allLogs.length > 5 && (
            <div className="text-xs text-muted-foreground italic w-full">
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

export default LogChart;
