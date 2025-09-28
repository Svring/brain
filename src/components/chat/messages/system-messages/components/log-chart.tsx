import React, { useState, useMemo } from "react";
import { Copy, Check, Eye } from "lucide-react";
import { useCopy } from "@/hooks/use-copy";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LogChartProps {
  logsData: any;
  isLoading?: boolean;
}

export const LogChart: React.FC<LogChartProps> = ({ logsData, isLoading = false }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { copyToClipboard, isCopied } = useCopy();

  // Process logs data into display format
  const allLogs = useMemo(() => {
    if (!logsData) return [];

    const combinedLogs: string[] = [];
    
    // Handle different payload formats
    if (typeof logsData === 'object' && logsData !== null) {
      // If logsData has logs structure similar to logsRecord
      Object.keys(logsData).forEach((podName) => {
        const podLogs = logsData[podName];
        if (podLogs?.logs) {
          const lines = podLogs.logs.split("\n").filter((line: string) => line.trim());
          lines.forEach((line: string) => {
            combinedLogs.push(`[${podName}] ${line}`);
          });
        } else if (typeof podLogs === 'string') {
          // If it's just a string of logs
          const lines = podLogs.split("\n").filter((line: string) => line.trim());
          lines.forEach((line: string) => {
            combinedLogs.push(`[${podName}] ${line}`);
          });
        }
      });
    }
    
    return combinedLogs;
  }, [logsData]);

  // Get first 5 lines for truncated display
  const firstFiveLines = useMemo(() => {
    return allLogs.slice(0, 5);
  }, [allLogs]);

  const hasLogs = allLogs.length > 0;

  const handleLogPanelClick = () => {
    if (hasLogs) {
      setIsDialogOpen(true);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg p-4">
        <div className="text-center py-4 text-gray-500">
          Loading logs...
        </div>
      </div>
    );
  }

  if (!logsData || !hasLogs) {
    return (
      <div className="border rounded-lg p-4">
        <div className="text-center py-4 text-muted-foreground">
          No logs available
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Resource Logs</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogPanelClick}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View All Logs
          </Button>
        </div>

        {/* Truncated logs display */}
        <div className="space-y-1">
          {firstFiveLines.map((line, index) => (
            <div
              key={index}
              className="font-mono text-xs bg-muted p-2 rounded border"
            >
              {line}
            </div>
          ))}
          {allLogs.length > 5 && (
            <div className="text-xs text-muted-foreground text-center py-2">
              ... and {allLogs.length - 5} more lines
            </div>
          )}
        </div>
      </div>

      {/* Full logs dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Resource Logs</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 overflow-y-auto max-h-[60vh]">
            {allLogs.map((line, index) => (
              <div
                key={index}
                className="font-mono text-xs bg-muted p-2 rounded border flex items-center justify-between"
              >
                <span className="flex-1">{line}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(line, `log-${index}`)}
                  className="ml-2 h-6 w-6 p-0"
                >
                  {isCopied(`log-${index}`) ? (
                    <Check className="h-3 w-3 text-theme-green" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LogChart;
