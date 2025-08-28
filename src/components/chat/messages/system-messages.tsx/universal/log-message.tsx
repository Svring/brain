"use client";

import React, { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Button } from "@/components/ui/button";
import { Bot, Loader2, FileText, Sparkles } from "lucide-react";
import { useSendMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useResourceLogs } from "@/hooks/sealos/resource/use-resource-logs";
import BaseActionMessage from "@/components/chat/messages/system-messages.tsx/components/base-action-message";

interface ResourceLogProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

const ResourceLog: React.FC<ResourceLogProps> = ({ target: payload }) => {
  const { data: logsData, isLoading } = useResourceLogs(payload);
  const sendMessageMutation = useSendMessageMutation();

  const handleAnalyze = useCallback(() => {
    if (logsData) {
      sendMessageMutation.mutate([
        {
          role: "user",
          content: `Analyze the logs and tell me what you found. Please provide a detailed analysis of the logs.
            Here are the logs:
            ${JSON.stringify(logsData, null, 2)}`,
        },
      ]);
    }
  }, [logsData, sendMessageMutation]);

  const logsString = logsData
    ? JSON.stringify(logsData, null, 2)
    : "No logs available";
  const lines = logsString.split("\n");
  const truncatedLogs = lines.slice(0, 3).join("\n");
  const hasMoreLines = lines.length > 3;

  return (
    <BaseActionMessage
      headerTitle={{
        icon: FileText,
        name: "Resource Logs",
      }}
      headerSlot={
        <Button
          onClick={handleAnalyze}
          size="sm"
          variant='outline'
          disabled={isLoading || !logsData}
          className="flex items-center gap-2 border border-border-primary brightness-150"
        >
          <Sparkles className="w-3 h-3 text-theme-blue" />
          Analyze
        </Button>
      }
    >
      <div className="relative bg-muted/50 rounded-md p-2 max-h-24 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading logs...</span>
          </div>
        ) : (
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
            {truncatedLogs}
            {hasMoreLines && (
              <span className="text-muted-foreground/60">
                {"\n"}... (truncated)
              </span>
            )}
          </pre>
        )}
      </div>
    </BaseActionMessage>
  );
};

export default ResourceLog;
