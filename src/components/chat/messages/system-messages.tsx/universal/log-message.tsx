"use client";

import React from "react";
import { v4 as uuidv4 } from "uuid";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Loader2, FileText } from "lucide-react";
import { useResourceLogs } from "@/hooks/sealos/resource/use-resource-logs";
import BaseActionMessage from "@/components/chat/messages/system-messages.tsx/components/base-action-message";

interface ResourceLogProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

const ResourceLog: React.FC<ResourceLogProps> = ({ target: payload }) => {
  const logsQuery = useResourceLogs(payload);

  const isLoading = logsQuery?.isLoading || false;
  const logsData = logsQuery?.data;

  const hasLogs = logsData && Object.keys(logsData).length > 0;

  const formatLogsData = (data: any) => {
    if (!data) return "";

    const stringified = JSON.stringify(data, null, 2);
    const lines = stringified.split("\n");

    if (lines.length <= 10) {
      return stringified;
    }

    return lines.slice(0, 10).join("\n") + "\n... (truncated)";
  };

  return (
    <BaseActionMessage
      headerTitle={{
        icon: FileText,
        name: "Resource Logs",
      }}
    >
      <div className="relative bg-background-secondary rounded-xl p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading logs...
            </span>
          </div>
        ) : hasLogs ? (
          <div className="max-h-60 overflow-y-auto">
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words">
              {formatLogsData(logsData)}
            </pre>
          </div>
        ) : (
          <div className="flex items-center justify-center py-4">
            <span className="text-sm text-muted-foreground">
              No logs available
            </span>
          </div>
        )}
      </div>
    </BaseActionMessage>
  );
};

export default ResourceLog;
