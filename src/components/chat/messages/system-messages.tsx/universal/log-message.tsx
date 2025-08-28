"use client";

import React, { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Button } from "@/components/ui/button";
import { Bot, Loader2, FileText, Sparkles } from "lucide-react";
import {
  useSendMessageMutation,
  useAppendMessagesMutation,
} from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useResourceLogs } from "@/hooks/sealos/resource/use-resource-logs";
import BaseActionMessage from "@/components/chat/messages/system-messages.tsx/components/base-action-message";

interface ResourceLogProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

const ResourceLog: React.FC<ResourceLogProps> = ({ target: payload }) => {
  const { data: logsData, isLoading } = useResourceLogs(payload);
  const sendMessageMutation = useSendMessageMutation();
  const appendMessagesMutation = useAppendMessagesMutation();

  const handleAnalyze = useCallback(() => {
    if (logsData) {
      appendMessagesMutation.mutate(
        [
          {
            role: "system",
            content: `Here are the logs from ${JSON.stringify(
              payload,
              null,
              2
            )}:
            ${JSON.stringify(logsData, null, 2)}`,
          },
        ],
        {
          onSuccess: () => {
            sendMessageMutation.mutate([
              {
                role: "user",
                content: `Analyze the logs and tell me what you found.`,
              },
            ]);
          },
        }
      );
    }
  }, [logsData, appendMessagesMutation, sendMessageMutation, payload]);

  const hasLogs = logsData && Object.keys(logsData).length > 0;

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
          variant="outline"
          disabled={isLoading || !hasLogs}
          className="flex items-center gap-2 border border-border-primary brightness-150"
        >
          <Sparkles className="w-3 h-3 text-theme-blue" />
          Analyze
        </Button>
      }
    >
      <div className="relative bg-background-secondary rounded-xl p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading logs...
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center py-4">
            <span className="text-sm text-muted-foreground">
              {hasLogs ? "Logs available" : "No logs available"}
            </span>
          </div>
        )}
      </div>
    </BaseActionMessage>
  );
};

export default ResourceLog;
