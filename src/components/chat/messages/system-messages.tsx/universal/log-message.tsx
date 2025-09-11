"use client";

import React from "react";
import { v4 as uuidv4 } from "uuid";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Loader2, FileText, CheckCircle } from "lucide-react";
import { useResourceLogs } from "@/hooks/sealos/resource/use-resource-logs";
import BaseSystemMessage from "@/components/chat/messages/system-messages.tsx/components/base-system-message";
import { parseClusterLogFiles } from "@/lib/sealos/resources/cluster/cluster-method/cluster-utils";
import { parseLaunchpadLogFiles } from "@/lib/sealos/resources/launchpad/launchpad-method/launchpad-utils";

interface ResourceLogProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

const ResourceLog: React.FC<ResourceLogProps> = ({ target }) => {
  const logsQuery = useResourceLogs(target);

  const isLoading = logsQuery?.isLoading || false;
  const logsData = logsQuery?.data;

  // Process logs based on resource type
  const getLogFiles = (): string[] => {
    if (!logsData) return [];

    const resourceType = target.resourceType;

    if (resourceType === "cluster") {
      return parseClusterLogFiles(logsData);
    } else if (
      resourceType === "deployment" ||
      resourceType === "statefulset"
    ) {
      // Ensure logsData is an array for launchpad parsing
      if (Array.isArray(logsData)) {
        return parseLaunchpadLogFiles(logsData);
      }
    }

    return [];
  };

  const logFiles = getLogFiles();
  const hasLogFiles = logFiles.length > 0;

  return (
    <BaseSystemMessage
      headerTitle={{
        icon: FileText,
        name: "Resource Logs",
      }}
    >
      <div className="space-y-3">
        {/* {hasLogFiles && (
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              Log Files: {logFiles.length}
            </h3>
          </div>
        )} */}

        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading logs...
            </span>
          </div>
        ) : hasLogFiles ? (
          <div
            className={`space-y-2 ${
              logFiles.length > 5 ? "max-h-48 overflow-y-auto" : ""
            }`}
          >
            {logFiles.slice(0, 5).map((fileName, index) => (
              <div
                key={index}
                className="border rounded-lg p-2 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium truncate">
                      {fileName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-theme-green" />
                    <span className="text-xs text-muted-foreground">
                      analyzed
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {logFiles.length > 5 && (
              <div className="text-xs text-muted-foreground text-center py-2">
                ... and {logFiles.length - 5} more files
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-20 text-center">
            <FileText className="h-6 w-6 text-muted-foreground mb-2" />
            <div className="text-xs text-muted-foreground">
              No log files available
            </div>
          </div>
        )}
      </div>
    </BaseSystemMessage>
  );
};

export default ResourceLog;
