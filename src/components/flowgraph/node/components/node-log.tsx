"use client";

import React from "react";
import { NotebookText } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAnalyzeLogs } from "@/hooks/copilot/use-analyze-logs";
import { usePodLogs } from "@/hooks/sealos/pod/use-pod-logs";
import { usePods } from "@/hooks/sealos/pod/use-pods";
import { CircleQuestionMark } from "lucide-react";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface NodeLogProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export default function NodeLog({ target }: NodeLogProps) {
  const { analyzeLogs, isLogsReady } = useAnalyzeLogs(target);

  // Get pods for the target resource
  const { pods } = usePods({ target });
  const podNames = pods.map((pod) => pod.name);

  // Get logs for all pods
  const { logsRecord, isLoading: isLogsLoading } = usePodLogs({
    podNames,
    enabled: podNames.length > 0,
  });

  // console.log("logsRecord", logsRecord);

  const getLogInfo = (podName: string) => {
    const podLogs = logsRecord[podName];
    if (!podLogs) return { hasLogs: false, charCount: 0 };

    const hasLogs = podLogs.logs && podLogs.logs.length > 0;
    const charCount = hasLogs ? podLogs.logs.length : 0;

    return { hasLogs, charCount };
  };

  const hasAnyLogs = pods.some((pod) => {
    const logInfo = getLogInfo(pod.name);
    return logInfo.hasLogs;
  });

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={`p-1 border-2 border-muted-foreground/20 rounded-full transition-colors ${
              isLogsReady
                ? "hover:border-muted-foreground/40 cursor-pointer"
                : "cursor-not-allowed opacity-50"
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isLogsReady) {
                return;
              }
              analyzeLogs();
            }}
            type="button"
            disabled={!isLogsReady}
          >
            <NotebookText
              className={`h-4 w-4 ${
                isLogsReady ? "text-theme-green" : "text-theme-gray"
              }`}
            />
          </button>
        </TooltipTrigger>
        {hasAnyLogs && (
          <TooltipContent
            className="max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              {pods.map((pod, i) => {
                const logInfo = getLogInfo(pod.name);

                return (
                  <div key={i} className="font-mono p-1">
                    <div className="flex items-center">
                      <span className="text-xs font-medium text-gray-300 w-12">
                        pod-{i + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        {logInfo.hasLogs ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-theme-gray">
                              ({logInfo.charCount} chars)
                            </span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (isLogsReady) {
                                  analyzeLogs();
                                }
                              }}
                              disabled={!isLogsReady}
                              className={`transition-colors ${
                                isLogsReady
                                  ? "hover:text-blue-300 cursor-pointer"
                                  : "cursor-not-allowed opacity-50"
                              }`}
                            >
                              <CircleQuestionMark className="h-4 w-4 text-theme-blue" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">no logs</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
