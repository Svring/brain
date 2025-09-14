"use client";

import React from "react";
import { FileText, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import BaseActionMessage from "@/components/chat/messages/system-messages/components/base-action-message";
import { parseClusterLogFiles } from "@/lib/sealos/resources/cluster/cluster-method/cluster-utils";
import { parseLaunchpadLogFiles } from "@/lib/sealos/resources/launchpad/launchpad-method/launchpad-utils";
// Define the log entry type based on the actual structure from getAllProjectLogs
interface ProjectLogEntry {
  name: string;
  kind: string;
  logs: any;
}

interface ProjectLogsActionMessageProps {
  result: ProjectLogEntry[] | undefined;
}

const getLogStatusIcon = (logs: any) => {
  if (logs.error) {
    return <XCircle className="h-4 w-4 text-red-500" />;
  }
  if (logs.supported === false) {
    return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  }
  return <CheckCircle className="h-4 w-4 text-green-500" />;
};

const getLogStatusText = (logs: any) => {
  if (logs.error) {
    return "error";
  }
  if (logs.supported === false) {
    return "unsupported";
  }
  return "analyzed";
};

const getLogStatusColor = (logs: any) => {
  if (logs.error) {
    return "text-red-500";
  }
  if (logs.supported === false) {
    return "text-yellow-500";
  }
  return "text-green-500";
};

// Process logs to get log files based on resource type
const getLogFiles = (resourceLogs: ProjectLogEntry): string[] => {
  try {
    if (resourceLogs.logs.error || resourceLogs.logs.supported === false) {
      return [];
    }

    const resourceType = resourceLogs.kind.toLowerCase();
    
    if (resourceType === "cluster") {
      return parseClusterLogFiles(resourceLogs.logs);
    } else if (resourceType === "deployment" || resourceType === "statefulset") {
      // Ensure logs is an array for launchpad parsing
      if (Array.isArray(resourceLogs.logs)) {
        return parseLaunchpadLogFiles(resourceLogs.logs);
      }
    }

    return [];
  } catch (error) {
    console.error("Error processing log files:", error);
    return [];
  }
};

export const ProjectLogsActionMessage: React.FC<ProjectLogsActionMessageProps> = ({
  result,
}) => {
  if (!result || result.length === 0) {
    return (
      <BaseActionMessage
        headerTitle={{
          icon: FileText,
          name: "Check All Logs",
        }}
        formId="project-logs-form"
        isSubmitting={false}
        onApply={() => {}}
        applyButtonText="Check Logs"
      >
        <div className="flex flex-col items-center justify-center h-20 text-center">
          <FileText className="h-6 w-6 text-muted-foreground mb-2" />
          <div className="text-xs text-muted-foreground">
            No log files available
          </div>
        </div>
      </BaseActionMessage>
    );
  }

  return (
    <BaseActionMessage
      headerTitle={{
        icon: FileText,
        name: "Check All Logs",
      }}
      formId="project-logs-form"
      isSubmitting={false}
      onApply={() => {}}
      applyButtonText="Check Logs"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">
            Log Files: {result.length}
          </h3>
        </div>

        <div
          className={`space-y-2 ${
            result.length > 5 ? "max-h-48 overflow-y-auto" : ""
          }`}
        >
          {result.slice(0, 5).map((resourceLogs, index) => {
            const logFiles = getLogFiles(resourceLogs);
            const hasLogFiles = logFiles.length > 0;
            
            return (
              <div
                key={index}
                className="border rounded-lg p-3 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium">
                      {resourceLogs.kind}: {resourceLogs.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getLogStatusIcon(resourceLogs.logs)}
                    <span className={`text-xs ${getLogStatusColor(resourceLogs.logs)}`}>
                      {getLogStatusText(resourceLogs.logs)}
                    </span>
                  </div>
                </div>
                
                {/* Log files display */}
                {hasLogFiles ? (
                  <div className="space-y-1">
                    {logFiles.slice(0, 3).map((fileName, fileIndex) => (
                      <div
                        key={fileIndex}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <FileText className="h-3 w-3" />
                        <span className="truncate">{fileName}</span>
                        <CheckCircle className="h-3 w-3 text-green-500 ml-auto" />
                      </div>
                    ))}
                    {logFiles.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        ... and {logFiles.length - 3} more files
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    {resourceLogs.logs.error ? (
                      <div className="text-red-600 bg-red-50 p-2 rounded">
                        {resourceLogs.logs.error}
                      </div>
                    ) : resourceLogs.logs.supported === false ? (
                      <div className="text-yellow-600 bg-yellow-50 p-2 rounded">
                        {resourceLogs.logs.message}
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        No log files available
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          {result.length > 5 && (
            <div className="text-xs text-muted-foreground text-center py-2">
              ... and {result.length - 5} more log files
            </div>
          )}
        </div>
      </div>
    </BaseActionMessage>
  );
};
